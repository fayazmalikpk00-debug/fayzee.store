import prisma from "@/lib/db";
import { sendSupportTicketReplyEmail } from "@/services/emailService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    console.error("Failed to fetch support tickets:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch support tickets." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, status, adminNotes } = body;

    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: "ticketId is required." },
        { status: 400 }
      );
    }

    const updated = await prisma.supportTicket.update({
      where: { ticketId },
      data: {
        ...(status ? { status } : {}),
        ...(adminNotes !== undefined ? { adminNotes } : {}),
      },
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error: any) {
    console.error("Failed to update support ticket:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update ticket." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, replyMessage, markResolved } = body;

    if (!ticketId || typeof ticketId !== "string") {
      return NextResponse.json(
        { success: false, error: "ticketId is required." },
        { status: 400 }
      );
    }

    if (!replyMessage || typeof replyMessage !== "string" || !replyMessage.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter a reply message." },
        { status: 400 }
      );
    }

    // Find ticket in DB
    const ticket = await prisma.supportTicket.findUnique({
      where: { ticketId },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Support ticket not found." },
        { status: 404 }
      );
    }

    // Dispatch email to customer
    const emailResult = await sendSupportTicketReplyEmail({
      toEmail: ticket.email,
      customerName: ticket.name,
      ticketId: ticket.ticketId,
      subject: ticket.subject,
      replyMessage: replyMessage.trim(),
      originalMessage: ticket.message,
      department: ticket.category,
    });

    // Record note in ticket history with Pakistan timestamp
    const now = new Date();
    const timestampStr = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const replyEntry = `[Admin Reply - ${timestampStr}]:\n${replyMessage.trim()}`;
    const newNotes = ticket.adminNotes
      ? `${ticket.adminNotes}\n\n${replyEntry}`
      : replyEntry;

    const newStatus = markResolved ? "RESOLVED" : (ticket.status === "OPEN" ? "IN_PROGRESS" : ticket.status);

    const updated = await prisma.supportTicket.update({
      where: { ticketId },
      data: {
        adminNotes: newNotes,
        status: newStatus,
      },
    });

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      isSimulated: !!emailResult.isSimulated,
      ticket: updated,
      message: emailResult.isSimulated
        ? "Reply logged to ticket history (email simulated as RESEND_API_KEY is not configured)."
        : `Reply email successfully sent to ${ticket.email}`,
    });
  } catch (error: any) {
    console.error("Failed to reply to support ticket:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process reply." },
      { status: 500 }
    );
  }
}

