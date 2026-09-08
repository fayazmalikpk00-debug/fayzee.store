import { AUTH_COOKIE_NAME, hashPassword } from "@/lib/auth";
import prisma from "@/lib/db";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, newPassword } = body;

    // 1. Basic validation
    if (!token || typeof token !== "string" || token.trim().length === 0) {
      return NextResponse.json(
        { error: "A valid reset token is required." },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "New password is required." },
        { status: 400 }
      );
    }

    // 2. Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasNumber) {
      return NextResponse.json(
        { error: "Password must contain at least one letter and one number." },
        { status: 400 }
      );
    }

    // 3. Hash incoming raw token to find database record
    const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");

    // 4. Lookup token in database
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: { id: true, email: true, status: true },
        },
      },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: "Invalid or expired password reset link. Please request a new one." },
        { status: 400 }
      );
    }

    // 5. Check if already used
    if (resetRecord.usedAt !== null) {
      return NextResponse.json(
        { error: "This reset link has already been used. Please request a new one." },
        { status: 400 }
      );
    }

    // 6. Check if expired
    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json(
        { error: "This password reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // 7. Check if user account is suspended
    if (resetRecord.user.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "Your account has been suspended. Please contact customer support." },
        { status: 403 }
      );
    }

    // 8. Hash new password with bcrypt
    const passwordHash = await hashPassword(newPassword);

    // 9. Execute atomic database update in transaction
    await prisma.$transaction(async (tx) => {
      // Update user password
      await tx.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      });

      // Mark token as used
      await tx.passwordReset.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      });

      // Invalidate any other pending reset tokens for this user
      await tx.passwordReset.updateMany({
        where: {
          userId: resetRecord.userId,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      });
    });

    // 10. Clear any active session cookie to force fresh login with new password
    cookies().set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return NextResponse.json(
      { message: "Your password has been successfully reset. You can now log in with your new password." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while resetting your password." },
      { status: 500 }
    );
  }
}
