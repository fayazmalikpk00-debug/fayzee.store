import { sendSupportInquiryEmail } from "@/services/emailService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, orderNumber, category, subject, message } = body;

    // Basic validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide your name." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Please enter your message (at least 5 characters)." },
        { status: 400 }
      );
    }

    // Generate unique Ticket ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `TKT-FYZ-${Date.now().toString().slice(-4)}${randomSuffix}`;

    // Dispatch support email
    const dispatchResult = await sendSupportInquiryEmail({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      orderNumber: orderNumber?.trim(),
      category: category?.trim() || "General Inquiry",
      subject: subject?.trim() || "Customer Support Inquiry",
      message: message.trim(),
      ticketId,
    });

    return NextResponse.json({
      success: true,
      ticketId,
      message: "Your inquiry has been received. Our team will respond shortly.",
      isSimulated: dispatchResult.isSimulated,
    });
  } catch (error: any) {
    console.error("Support API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error submitting inquiry." },
      { status: 500 }
    );
  }
}
