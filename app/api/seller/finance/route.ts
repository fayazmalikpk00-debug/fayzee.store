import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      include: {
        orderItems: {
          include: {
            order: {
              select: {
                status: true,
                paymentStatus: true,
                paymentMethod: true,
                createdAt: true,
              },
            },
          },
        },
        payouts: {
          orderBy: { requestedAt: "desc" },
        },
      },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    const commissionRate = seller.commissionRate || 10.0;

    // Filter valid (non-cancelled) items
    const nonCancelledItems = seller.orderItems.filter(
      (item) => item.fulfillmentStatus !== "CANCELLED" && item.order.status !== "CANCELLED"
    );

    // Total gross sales
    const totalSales = nonCancelledItems.reduce((acc, item) => acc + item.total, 0);

    // Platform commission across all sales
    const totalCommission = (totalSales * commissionRate) / 100;

    // Items delivered (cleared funds)
    const deliveredItems = nonCancelledItems.filter(
      (item) => item.fulfillmentStatus === "DELIVERED" || item.order.status === "DELIVERED"
    );
    const deliveredGross = deliveredItems.reduce((acc, item) => acc + item.total, 0);
    const deliveredCommission = (deliveredGross * commissionRate) / 100;
    const netDeliveredEarnings = deliveredGross - deliveredCommission;

    // Items in progress (pending, processing, shipped)
    const pendingItems = nonCancelledItems.filter(
      (item) => item.fulfillmentStatus !== "DELIVERED" && item.order.status !== "DELIVERED"
    );
    const pendingGross = pendingItems.reduce((acc, item) => acc + item.total, 0);
    const pendingCommission = (pendingGross * commissionRate) / 100;
    const pendingEarnings = pendingGross - pendingCommission;

    // Payouts calculations
    const transferredPayouts = seller.payouts
      .filter((p) => p.status === "TRANSFERRED")
      .reduce((acc, p) => acc + p.amount, 0);

    const pendingPayouts = seller.payouts
      .filter((p) => p.status === "PENDING")
      .reduce((acc, p) => acc + p.amount, 0);

    // Available balance = cleared earnings - already transferred - locked in pending payout request
    const availableBalance = Math.max(0, netDeliveredEarnings - transferredPayouts - pendingPayouts);

    return NextResponse.json({
      summary: {
        totalSales,
        commissionRate,
        totalCommission,
        netDeliveredEarnings,
        pendingEarnings,
        transferredPayouts,
        pendingPayouts,
        availableBalance,
        totalOrdersCount: nonCancelledItems.length,
        deliveredOrdersCount: deliveredItems.length,
      },
      receivingAccount: {
        bankName: seller.bankName || "",
        accountTitle: seller.accountTitle || "",
        accountNumber: seller.accountNumber || "",
        iban: seller.iban || "",
        branchCode: seller.branchCode || "",
        payoutMethod: seller.payoutMethod || "BANK_TRANSFER",
        payoutPhone: seller.payoutPhone || "",
      },
      recentPayouts: seller.payouts.slice(0, 10),
    });
  } catch (error: any) {
    console.error("Error in GET /api/seller/finance:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load finance details" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      bankName,
      accountTitle,
      accountNumber,
      iban,
      branchCode,
      payoutMethod,
      payoutPhone,
    } = body;

    // Validate based on payout method
    if (payoutMethod === "BANK_TRANSFER") {
      if (!bankName || !accountTitle || (!accountNumber && !iban)) {
        return NextResponse.json(
          { error: "Bank Name, Account Title, and Account Number or IBAN are required." },
          { status: 400 }
        );
      }
    } else if (payoutMethod === "JAZZ_CASH" || payoutMethod === "EASYPAISA") {
      if (!accountTitle || !payoutPhone || payoutPhone.length < 11) {
        return NextResponse.json(
          { error: "Account Title and a valid 11-digit mobile number are required." },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.sellerProfile.update({
      where: { id: seller.id },
      data: {
        bankName: bankName || null,
        accountTitle: accountTitle || null,
        accountNumber: accountNumber || null,
        iban: iban || null,
        branchCode: branchCode || null,
        payoutMethod: payoutMethod || "BANK_TRANSFER",
        payoutPhone: payoutPhone || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payout receiving details saved successfully.",
      receivingAccount: {
        bankName: updated.bankName,
        accountTitle: updated.accountTitle,
        accountNumber: updated.accountNumber,
        iban: updated.iban,
        branchCode: updated.branchCode,
        payoutMethod: updated.payoutMethod,
        payoutPhone: updated.payoutPhone,
      },
    });
  } catch (error: any) {
    console.error("Error in PUT /api/seller/finance:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update receiving account" },
      { status: 500 }
    );
  }
}
