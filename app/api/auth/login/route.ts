import { AUTH_COOKIE_NAME, signToken, verifyPassword } from "@/lib/auth";
import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// In-memory brute-force protection map: identifier -> { attempts, resetTime }
const loginAttemptsMap = new Map<string, { attempts: number; resetTime: number }>();

function checkLoginRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; remainingAttempts: number } {
  const now = Date.now();
  const record = loginAttemptsMap.get(key);

  if (!record || now > record.resetTime) {
    return { allowed: true, remainingAttempts: maxAttempts };
  }

  if (record.attempts >= maxAttempts) {
    return { allowed: false, remainingAttempts: 0 };
  }

  return { allowed: true, remainingAttempts: maxAttempts - record.attempts };
}

function recordFailedLoginAttempt(key: string, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const record = loginAttemptsMap.get(key);
  if (!record || now > record.resetTime) {
    loginAttemptsMap.set(key, { attempts: 1, resetTime: now + windowMs });
  } else {
    record.attempts += 1;
  }
}

function clearLoginAttempts(key: string) {
  loginAttemptsMap.delete(key);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";
    const ipKey = `ip:${ip}`;
    const emailKey = `email:${normalizedEmail}`;

    // Rate limit check: Max 10 attempts per IP, Max 5 per email in 15 minutes
    const ipCheck = checkLoginRateLimit(ipKey, 10, 15 * 60 * 1000);
    const emailCheck = checkLoginRateLimit(emailKey, 5, 15 * 60 * 1000);

    if (!ipCheck.allowed || !emailCheck.allowed) {
      return NextResponse.json(
        { error: "Too many failed login attempts. For security reasons, please try again after 15 minutes." },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        sellerProfile: {
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      recordFailedLoginAttempt(ipKey);
      recordFailedLoginAttempt(emailKey);
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "Your account has been suspended. Please contact customer support." },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      recordFailedLoginAttempt(ipKey);
      recordFailedLoginAttempt(emailKey);
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Clear failed attempts on successful login
    clearLoginAttempts(ipKey);
    clearLoginAttempts(emailKey);

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        sellerProfile: user.sellerProfile,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
