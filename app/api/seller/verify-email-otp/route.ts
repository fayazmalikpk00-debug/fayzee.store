import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendSellerEmailOtp } from "@/services/emailService";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const body = await req.json();
    const { action, email, otp } = body;

    const targetEmail = (email || user.email || "").trim().toLowerCase();
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail);

    if (!isEmailValid) {
      return NextResponse.json(
        { error: "Please provide a valid email address (e.g. merchant@example.com)." },
        { status: 400 }
      );
    }

    // 1. ACTION: SEND EMAIL OTP
    if (action === "SEND_OTP") {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Find or create pending seller application for user
      const existingApp = await prisma.sellerApplication.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });

      if (existingApp) {
        await prisma.sellerApplication.update({
          where: { id: existingApp.id },
          data: {
            email: targetEmail,
            emailOtp: generatedOtp,
            emailOtpExpires: expiresAt,
          },
        });
      } else {
        await prisma.sellerApplication.create({
          data: {
            userId: user.id,
            businessName: "Pending Verification",
            storeName: "Pending Store",
            businessAddress: "Pending",
            cnic: "00000-0000000-0",
            phone: user.phone || "03000000000",
            email: targetEmail,
            emailOtp: generatedOtp,
            emailOtpExpires: expiresAt,
            status: "PENDING",
          },
        });
      }

      // Record in notifications for user
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "FAYZEE Email Verification Code",
          message: `Your 6-digit seller verification code is: ${generatedOtp}. It is valid for 10 minutes.`,
          type: "SYSTEM",
          link: "/seller/register",
        },
      });

      // Dispatch real email via Resend (or simulation fallback)
      const emailResult = await sendSellerEmailOtp({
        to: targetEmail,
        userName: user.name || "Seller Partner",
        otpCode: generatedOtp,
      });

      return NextResponse.json({
        success: true,
        message: `6-digit verification code sent to ${targetEmail}. Please check your inbox.`,
        isSimulated: emailResult.isSimulated || false,
        demoOtp: generatedOtp,
      });
    }

    // 2. ACTION: VERIFY EMAIL OTP
    if (action === "VERIFY_OTP") {
      if (!otp || String(otp).trim().length !== 6) {
        return NextResponse.json({ error: "Please enter a valid 6-digit confirmation code." }, { status: 400 });
      }

      const application = await prisma.sellerApplication.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });

      if (!application || !application.emailOtp) {
        return NextResponse.json(
          { error: "No pending verification code found. Please request a new code." },
          { status: 400 }
        );
      }

      if (application.emailOtpExpires && new Date() > application.emailOtpExpires) {
        return NextResponse.json(
          { error: "Verification code has expired. Please request a new code." },
          { status: 400 }
        );
      }

      if (application.emailOtp !== String(otp).trim()) {
        return NextResponse.json(
          { error: "Incorrect verification code. Please check your email and try again." },
          { status: 400 }
        );
      }

      // Mark verified
      await prisma.sellerApplication.update({
        where: { id: application.id },
        data: {
          isEmailVerified: true,
          emailOtp: null,
          emailOtpExpires: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Email address verified successfully! ✓",
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Seller email OTP verification error:", error);
    return NextResponse.json({ error: error.message || "Failed to process email OTP." }, { status: 500 });
  }
}
