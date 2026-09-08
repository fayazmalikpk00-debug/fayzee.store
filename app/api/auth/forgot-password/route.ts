import prisma from "@/lib/db";
import { sendPasswordResetEmail } from "@/services/emailService";
import crypto from "crypto";
import { NextResponse } from "next/server";

// In-memory rate limiting map: identifier -> { count, expiresAt }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, limit = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

// Basic regex to validate email address syntax
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown-ip";
    if (!checkRateLimit(`ip:${ip}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!checkRateLimit(`email:${normalizedEmail}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many reset attempts for this email. Please try again later." },
        { status: 429 }
      );
    }

    // Generic response message to prevent email enumeration
    const genericResponse = {
      message: "If an account with that email exists, a password reset link has been sent.",
    };

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true, status: true },
    });

    // If user does not exist or is suspended, return the generic response
    if (!user || user.status === "SUSPENDED") {
      return NextResponse.json(genericResponse, { status: 200 });
    }

    // 1. Invalidate any existing unused reset tokens for this user
    await prisma.passwordReset.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // 2. Generate cryptographically secure random token (32 bytes = 64 hex chars)
    const rawToken = crypto.randomBytes(32).toString("hex");

    // 3. Compute SHA-256 hash for secure database storage
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // 4. Set expiration: 30 minutes from now
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // 5. Store hashed token in database
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // 6. Send email via emailService abstraction (raw token only goes in the reset link)
    await sendPasswordResetEmail({
      to: user.email,
      userName: user.name,
      resetToken: rawToken,
    });

    return NextResponse.json(genericResponse, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request." },
      { status: 500 }
    );
  }
}
