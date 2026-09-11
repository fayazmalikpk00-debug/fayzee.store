import prisma from "@/lib/db";
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
