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
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    const payouts = await prisma.sellerPayout.findMany({
      where: { sellerId: seller.id },
      orderBy: { requestedAt: "desc" },
    });

    return NextResponse.json({ payouts });
  } catch (error: any) {
    console.error("Error in GET /api/seller/payouts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load payouts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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
                updatedAt: true,
              },
            },
          },
        },
        payouts: true,
      },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    // Verify receiving details exist
    const hasBankDetails =
      seller.payoutMethod === "BANK_TRANSFER" &&
      seller.bankName &&
      seller.accountTitle &&
      (seller.accountNumber || seller.iban);

    const hasWalletDetails =
      (seller.payoutMethod === "JAZZ_CASH" || seller.payoutMethod === "EASYPAISA") &&
      seller.accountTitle &&
      seller.payoutPhone;

    if (!hasBankDetails && !hasWalletDetails) {
      return NextResponse.json(
        {
          error:
            "Please configure and save your receiving bank account or mobile wallet before requesting a withdrawal.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const amount = Number(body.amount);

    // Min payout setting
    const setting = await prisma.platformFinancialSetting.findFirst();
    const minPayout = setting?.minPayoutAmount || 1000;

    if (isNaN(amount) || amount < minPayout) {
      return NextResponse.json(
        { error: `Minimum withdrawal amount is Rs. ${minPayout.toLocaleString()}` },
        { status: 400 }
      );
    }

    // Calculate available balance with 7-day escrow protection
    const commissionRate = seller.commissionRate || 10.0;
    const ESCROW_HOLD_DAYS = 7;
    const nowTime = Date.now();

    const deliveredItems = seller.orderItems.filter(
      (item) =>
        item.fulfillmentStatus === "DELIVERED" || item.order.status === "DELIVERED"
    );

    // Filter items delivered at least 7 days ago (cleared)
    const clearedItems = deliveredItems.filter((item) => {
      const deliveryTime = new Date(item.updatedAt || item.order.updatedAt).getTime();
      const daysPassed = (nowTime - deliveryTime) / (1000 * 60 * 60 * 24);
      return daysPassed >= ESCROW_HOLD_DAYS;
    });

    // Items currently under 7-day customer return protection
    const escrowItems = deliveredItems.filter((item) => {
      const deliveryTime = new Date(item.updatedAt || item.order.updatedAt).getTime();
      const daysPassed = (nowTime - deliveryTime) / (1000 * 60 * 60 * 24);
      return daysPassed < ESCROW_HOLD_DAYS;
    });

    const clearedGross = clearedItems.reduce((acc, item) => acc + item.total, 0);
    const clearedCommission = (clearedGross * commissionRate) / 100;
    const clearedEarnings = clearedGross - clearedCommission;

    const escrowGross = escrowItems.reduce((acc, item) => acc + item.total, 0);
    const escrowCommission = (escrowGross * commissionRate) / 100;
    const escrowEarnings = escrowGross - escrowCommission;

    const transferredPayouts = seller.payouts
      .filter((p) => p.status === "TRANSFERRED")
      .reduce((acc, p) => acc + p.amount, 0);

    const pendingPayouts = seller.payouts
      .filter((p) => p.status === "PENDING")
      .reduce((acc, p) => acc + p.amount, 0);

    const availableBalance = Math.max(
      0,
      clearedEarnings - transferredPayouts - pendingPayouts
    );

    if (amount > availableBalance) {
      const escrowMsg = escrowEarnings > 0
        ? ` Note: Rs. ${Math.round(escrowEarnings).toLocaleString()} is currently held in 7-day customer warranty/return escrow and will unlock automatically.`
        : "";

      return NextResponse.json(
        {
          error: `Insufficient available balance. You can currently withdraw up to Rs. ${Math.floor(
            availableBalance
          ).toLocaleString()}.${escrowMsg}`,
        },
        { status: 400 }
      );
    }

    // Build snapshot of receiving account
    const snapshotDetails = JSON.stringify({
      payoutMethod: seller.payoutMethod,
      bankName: seller.bankName,
      accountTitle: seller.accountTitle,
      accountNumber: seller.accountNumber,
      iban: seller.iban,
      branchCode: seller.branchCode,
      payoutPhone: seller.payoutPhone,
    });

    const newPayout = await prisma.sellerPayout.create({
      data: {
        sellerId: seller.id,
        amount,
        fee: 0.0,
        netAmount: amount,
        status: "PENDING",
        payoutMethod: seller.payoutMethod,
        payoutDetails: snapshotDetails,
        notes: body.notes || "Seller requested withdrawal",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Withdrawal request for Rs. ${amount.toLocaleString()} submitted successfully.`,
      payout: newPayout,
    });
  } catch (error: any) {
    console.error("Error in POST /api/seller/payouts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit withdrawal request" },
      { status: 500 }
    );
  }
}
