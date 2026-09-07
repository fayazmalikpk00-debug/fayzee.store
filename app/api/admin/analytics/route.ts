import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const [
      totalOrders,
      ordersAgg,
      totalCustomers,
      totalSellers,
      totalProducts,
      lowStockCount,
      recentOrders,
      topProducts,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { grandTotal: true },
        where: { paymentStatus: "PAID" },
      }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.sellerProfile.count({ where: { status: "APPROVED" } }),
      prisma.product.count(),
      prisma.product.count({ where: { stockQuantity: { lte: 5 } } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.product.findMany({
        take: 5,
        orderBy: { rating: "desc" },
        include: {
          category: { select: { name: true } },
          seller: { select: { storeName: true } },
        },
      }),
      prisma.auditLog.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { name: true, email: true } } },
      }),
    ]);

    const totalRevenue = ordersAgg._sum.grandTotal || 0;

    return NextResponse.json({
      metrics: {
        totalOrders,
        totalRevenue,
        totalCustomers,
        totalSellers,
        totalProducts,
        lowStockCount,
      },
      recentOrders,
      topProducts,
      recentAuditLogs,
    });
  } catch (error: any) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
