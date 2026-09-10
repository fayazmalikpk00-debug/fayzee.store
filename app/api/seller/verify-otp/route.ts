import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const body = await req.json();
    const { action, phone, otp } = body;

    // Validate phone number format (Pakistani numbers)
    const cleanedPhone = phone?.replace(/[\s-]/g, "") || "";
    const isValidPakistaniPhone = /^((\+92)|(0092)|(92)|0)?3\d{9}$/.test(cleanedPhone);

    if (!isValidPakistaniPhone) {
      return NextResponse.json(
        { error: "Invalid Pakistani mobile number. Must be like 03001234567 or +923001234567." },
        { status: 400 }
      );
    }

    // 1. ACTION: SEND OTP
    if (action === "SEND_OTP") {
      // Generate 6-digit code
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
            phone: cleanedPhone,
            phoneOtp: generatedOtp,
            phoneOtpExpires: expiresAt,
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
            phone: cleanedPhone,
            phoneOtp: generatedOtp,
            phoneOtpExpires: expiresAt,
            status: "PENDING",
          },
        });
      }

      // Record in notifications for user
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "FAYZEE Verification Code",
          message: `Your 6-digit seller verification code is: ${generatedOtp}. It is valid for 10 minutes.`,
          type: "SYSTEM",
          link: "/seller/register",
        },
      });

      return NextResponse.json({
        success: true,
        message: `6-digit verification code sent to ${cleanedPhone}.`,
        // In dev / sandbox, return demoOtp so user can verify immediately
        demoOtp: generatedOtp,
      });
    }

    // 2. ACTION: VERIFY OTP
    if (action === "VERIFY_OTP") {
      if (!otp || String(otp).trim().length !== 6) {
        return NextResponse.json({ error: "Please enter a valid 6-digit code." }, { status: 400 });
      }

      const application = await prisma.sellerApplication.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });

      if (!application || !application.phoneOtp) {
        return NextResponse.json(
          { error: "No pending verification code found. Please request a new code." },
          { status: 400 }
        );
      }

      if (application.phoneOtpExpires && new Date() > application.phoneOtpExpires) {
        return NextResponse.json(
          { error: "Verification code has expired. Please request a new code." },
          { status: 400 }
        );
      }

      if (application.phoneOtp !== String(otp).trim()) {
        return NextResponse.json(
          { error: "Incorrect verification code. Please check and try again." },
          { status: 400 }
        );
      }

      // Mark verified
      await prisma.sellerApplication.update({
        where: { id: application.id },
        data: {
          isPhoneVerified: true,
          phoneOtp: null,
          phoneOtpExpires: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Mobile phone number verified successfully!",
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json({ error: error.message || "Failed to process OTP." }, { status: 500 });
  }
}
