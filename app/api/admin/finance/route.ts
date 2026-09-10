import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    // Platform Financial Metrics
    const [
      ordersAgg,
      allOrderItems,
      allPayouts,
      financialSetting,
    ] = await Promise.all([
      // Total Gross Customer Collections (paid orders)
      prisma.order.aggregate({
        _sum: { grandTotal: true },
        where: { paymentStatus: "PAID" },
      }),
      // Delivered order items to compute real marketplace commission
      prisma.orderItem.findMany({
        where: {
          fulfillmentStatus: "DELIVERED",
        },
        include: {
          seller: { select: { commissionRate: true } },
        },
      }),
      // Payout records
      prisma.sellerPayout.findMany(),
      // Admin official settings
      prisma.platformFinancialSetting.findFirst(),
    ]);

    const totalPlatformRevenue = ordersAgg._sum.grandTotal || 0;

    // Commission earned on delivered items
    const totalCommissionEarned = allOrderItems.reduce((acc, item) => {
      const rate = item.seller?.commissionRate || 10.0;
      return acc + (item.total * rate) / 100;
    }, 0);

    // Disbursed vs Pending payouts
    const totalDisbursedToSellers = allPayouts
      .filter((p) => p.status === "TRANSFERRED")
      .reduce((acc, p) => acc + p.amount, 0);

    const pendingPayouts = allPayouts.filter((p) => p.status === "PENDING");
    const pendingPayoutsCount = pendingPayouts.length;
    const pendingPayoutsAmount = pendingPayouts.reduce((acc, p) => acc + p.amount, 0);

    // If no setting exists yet, create default
    let settings = financialSetting;
    if (!settings) {
      settings = await prisma.platformFinancialSetting.create({
        data: {
          id: "default",
          defaultCommissionRate: 10.0,
          minPayoutAmount: 1000.0,
          adminBankName: "Habib Bank Limited (HBL)",
          adminAccountTitle: "FAYZEE MARKETPLACE (PVT) LTD",
          adminAccountNumber: "12345678901234",
          adminIban: "PK36HABB0012345678901234",
          adminBranchCode: "0142",
          adminJazzCash: "03001234567",
          adminEasyPaisa: "03451234567",
          payoutInstructions:
            "Official platform settlement and merchant receiving account. Disbursed via 1-Link IBFT / RAAST.",
        },
      });
    }

    return NextResponse.json({
      metrics: {
        totalPlatformRevenue,
        totalCommissionEarned,
        totalDisbursedToSellers,
        pendingPayoutsCount,
        pendingPayoutsAmount,
      },
      settings,
    });
  } catch (error: any) {
    console.error("Error in GET /api/admin/finance:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load admin finance" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const body = await req.json();
    const {
      defaultCommissionRate,
      minPayoutAmount,
      adminBankName,
      adminAccountTitle,
      adminAccountNumber,
      adminIban,
      adminBranchCode,
      adminJazzCash,
      adminEasyPaisa,
      payoutInstructions,
    } = body;

    const updated = await prisma.platformFinancialSetting.upsert({
      where: { id: "default" },
      update: {
        defaultCommissionRate: Number(defaultCommissionRate) || 10.0,
        minPayoutAmount: Number(minPayoutAmount) || 1000.0,
        adminBankName: adminBankName || null,
        adminAccountTitle: adminAccountTitle || null,
        adminAccountNumber: adminAccountNumber || null,
        adminIban: adminIban || null,
        adminBranchCode: adminBranchCode || null,
        adminJazzCash: adminJazzCash || null,
        adminEasyPaisa: adminEasyPaisa || null,
        payoutInstructions: payoutInstructions || null,
      },
      create: {
        id: "default",
        defaultCommissionRate: Number(defaultCommissionRate) || 10.0,
        minPayoutAmount: Number(minPayoutAmount) || 1000.0,
        adminBankName: adminBankName || null,
        adminAccountTitle: adminAccountTitle || null,
        adminAccountNumber: adminAccountNumber || null,
        adminIban: adminIban || null,
        adminBranchCode: adminBranchCode || null,
        adminJazzCash: adminJazzCash || null,
        adminEasyPaisa: adminEasyPaisa || null,
        payoutInstructions: payoutInstructions || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Platform official bank accounts and financial settings updated.",
      settings: updated,
    });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/finance:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update admin financial settings" },
      { status: 500 }
    );
  }
}
