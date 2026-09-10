import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const payouts = await prisma.sellerPayout.findMany({
      where,
      orderBy: { requestedAt: "desc" },
      include: {
        seller: {
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            phone: true,
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ payouts });
  } catch (error: any) {
    console.error("Error in GET /api/admin/payouts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load seller payouts" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const body = await req.json();
    const { payoutId, action, adminReference, rejectionReason, notes } = body;

    if (!payoutId || !action) {
      return NextResponse.json(
        { error: "Payout ID and Action (TRANSFER or REJECT) are required." },
        { status: 400 }
      );
    }

    const existingPayout = await prisma.sellerPayout.findUnique({
      where: { id: payoutId },
      include: { seller: true },
    });

    if (!existingPayout) {
      return NextResponse.json({ error: "Payout request not found." }, { status: 404 });
    }

    if (existingPayout.status !== "PENDING") {
      return NextResponse.json(
        { error: `This payout request has already been ${existingPayout.status.toLowerCase()}.` },
        { status: 400 }
      );
    }

    if (action === "TRANSFER") {
      if (!adminReference) {
        return NextResponse.json(
          { error: "Bank Transfer Reference / UTR Number is required." },
          { status: 400 }
        );
      }

      const updated = await prisma.sellerPayout.update({
        where: { id: payoutId },
        data: {
          status: "TRANSFERRED",
          adminReference,
          notes: notes || existingPayout.notes,
          processedAt: new Date(),
          processedBy: user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Payout of Rs. ${updated.amount.toLocaleString()} marked as transferred successfully.`,
        payout: updated,
      });
    } else if (action === "REJECT") {
      const updated = await prisma.sellerPayout.update({
        where: { id: payoutId },
        data: {
          status: "REJECTED",
          rejectionReason: rejectionReason || "Declined by Admin.",
          notes: notes || existingPayout.notes,
          processedAt: new Date(),
          processedBy: user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Payout of Rs. ${updated.amount.toLocaleString()} has been rejected. Funds returned to seller balance.`,
        payout: updated,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Error in PATCH /api/admin/payouts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process payout" },
      { status: 500 }
    );
  }
}
