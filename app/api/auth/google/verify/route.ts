import { AUTH_COOKIE_NAME, hashPassword, signToken } from "@/lib/auth";
import prisma from "@/lib/db";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Verifies Google Identity Services (GIS) One-Tap / Popup credential (ID Token)
 * Validates with Google's official token verification endpoint
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json(
        { success: false, error: "Google credential token is required." },
        { status: 400 }
      );
    }

    // 1. Verify token with Google's official tokeninfo endpoint
    const googleVerifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );

    if (!googleVerifyRes.ok) {
      const errText = await googleVerifyRes.text();
      console.error("Google token verification failed:", errText);
      return NextResponse.json(
        { success: false, error: "Invalid Google credential." },
        { status: 401 }
      );
    }

    const payload = await googleVerifyRes.json();
    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email not provided by Google account." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Find or create user in Neon DB
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Create new customer account with random secure password
      const randomPass = crypto.randomBytes(16).toString("hex") + "Aa1!";
      const passwordHash = await hashPassword(randomPass);

      user = await prisma.user.create({
        data: {
          name: name || "FAYZEE Customer",
          email: normalizedEmail,
          passwordHash,
          avatar: picture || null,
          role: "CUSTOMER",
          status: "ACTIVE",
        },
      });
    } else if (picture && !user.avatar) {
      // Update avatar if not present
      await prisma.user.update({
        where: { id: user.id },
        data: { avatar: picture },
      });
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        { success: false, error: "Your account has been suspended." },
        { status: 403 }
      );
    }

    // 3. Issue FAYZEE session JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });

    // 4. Set session cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error("Google One-Tap verify error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to authenticate with Google." },
      { status: 500 }
    );
  }
}
