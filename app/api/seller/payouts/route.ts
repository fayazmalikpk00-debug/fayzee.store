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

    // Calculate available balance
    const commissionRate = seller.commissionRate || 10.0;
    const deliveredItems = seller.orderItems.filter(
      (item) =>
        item.fulfillmentStatus === "DELIVERED" || item.order.status === "DELIVERED"
    );
    const deliveredGross = deliveredItems.reduce((acc, item) => acc + item.total, 0);
    const deliveredCommission = (deliveredGross * commissionRate) / 100;
    const netDeliveredEarnings = deliveredGross - deliveredCommission;

    const transferredPayouts = seller.payouts
      .filter((p) => p.status === "TRANSFERRED")
      .reduce((acc, p) => acc + p.amount, 0);

    const pendingPayouts = seller.payouts
      .filter((p) => p.status === "PENDING")
      .reduce((acc, p) => acc + p.amount, 0);

    const availableBalance = Math.max(
      0,
      netDeliveredEarnings - transferredPayouts - pendingPayouts
    );

    if (amount > availableBalance) {
      return NextResponse.json(
        {
          error: `Insufficient available balance. You can withdraw up to Rs. ${Math.floor(
            availableBalance
          ).toLocaleString()}`,
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
