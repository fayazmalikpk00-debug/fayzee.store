import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Access denied. Administrator only." }, { status: 403 });
    }

    const [sellers, siteSetting] = await Promise.all([
      prisma.sellerProfile.findMany({
        include: {
          user: { select: { name: true, email: true, phone: true } },
          _count: { select: { products: true, orderItems: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.siteSetting.findFirst(),
    ]);

    const defaultCommissionRate = siteSetting?.defaultCommissionRate ?? 10.0;

    return NextResponse.json({ sellers, defaultCommissionRate });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const body = await req.json();
    const { sellerId, status, rejectionReason, commissionRate } = body;

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID is required." }, { status: 400 });
    }

    const existingSeller = await prisma.sellerProfile.findUnique({
      where: { id: sellerId },
      include: { user: true },
    });

    if (!existingSeller) {
      return NextResponse.json({ error: "Seller profile not found." }, { status: 404 });
    }

    const updateData: any = {};

    // 1. Commission Rate Update
    let commissionUpdated = false;
    let oldRate = existingSeller.commissionRate;
    let newRate = oldRate;
    if (commissionRate !== undefined && commissionRate !== null) {
      newRate = Math.max(0, Math.min(100, Number(commissionRate)));
      updateData.commissionRate = newRate;
      commissionUpdated = true;
    }

    // 2. Status Update
    let statusUpdated = false;
    if (status && status !== existingSeller.status) {
      updateData.status = status;
      updateData.rejectionReason =
        status === "REJECTED" ? rejectionReason || "Identity or documents could not be verified." : null;
      statusUpdated = true;
    }

    if (!commissionUpdated && !statusUpdated) {
      return NextResponse.json({ message: "No changes requested.", seller: existingSeller });
    }

    const updated = await prisma.sellerProfile.update({
      where: { id: sellerId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { products: true, orderItems: true } },
      },
    });

    // Handle Status Update side-effects
    if (statusUpdated) {
      await prisma.sellerApplication.updateMany({
        where: { userId: existingSeller.userId, status: "PENDING" },
        data: {
          status: status === "APPROVED" ? "APPROVED" : status === "REJECTED" ? "REJECTED" : "PENDING",
          rejectionReason: status === "REJECTED" ? rejectionReason : null,
          reviewedBy: user.name || "Admin",
          reviewedAt: new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: `SELLER_STATUS_${status}`,
          targetType: "SELLER",
          targetId: sellerId,
          details: JSON.stringify({
            storeName: updated.storeName,
            newStatus: status,
            reason: rejectionReason || null,
          }),
        },
      });

      const notificationMsg =
        status === "APPROVED"
          ? "Congratulations! Your Fayzee Seller Account & KYC documents have been verified and approved. You can now list products."
          : status === "REJECTED"
          ? `Your seller application was rejected. Reason: ${rejectionReason || "Verification failed"}. Please update your documents.`
          : `Your seller account status was changed to ${status}.`;

      await prisma.notification.create({
        data: {
          userId: existingSeller.userId,
          title: `Seller Account Update: ${status}`,
          message: notificationMsg,
          type: "SELLER",
          link: "/seller/dashboard",
        },
      });
    }

    // Handle Commission Rate side-effects
    if (commissionUpdated) {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "SELLER_COMMISSION_UPDATED",
          targetType: "SELLER",
          targetId: sellerId,
          details: JSON.stringify({
            storeName: updated.storeName,
            oldRate,
            newRate,
          }),
        },
      });

      await prisma.notification.create({
        data: {
          userId: existingSeller.userId,
          title: "Marketplace Commission Rate Updated",
          message: `Your store platform commission rate has been adjusted by administration to ${newRate}%.`,
          type: "SELLER",
          link: "/seller/dashboard",
        },
      });
    }

    return NextResponse.json({
      message: commissionUpdated && statusUpdated
        ? "Seller status and commission rate updated successfully."
        : commissionUpdated
        ? `Seller commission rate set to ${newRate}%.`
        : "Seller status updated successfully.",
      updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Bulk Actions Handler (e.g. Set commission rate for all sellers)
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const body = await req.json();
    const { action, commissionRate } = body;

    if (action === "BULK_UPDATE_COMMISSION") {
      if (commissionRate === undefined || commissionRate === null || isNaN(Number(commissionRate))) {
        return NextResponse.json({ error: "Valid commissionRate percentage is required." }, { status: 400 });
      }

      const rate = Math.max(0, Math.min(100, Number(commissionRate)));

      // 1. Bulk update all existing seller profiles
      const result = await prisma.sellerProfile.updateMany({
        data: { commissionRate: rate },
      });

      // 2. Also keep SiteSetting and PlatformFinancialSetting default in sync
      await Promise.all([
        prisma.siteSetting.upsert({
          where: { id: "default" },
          update: { defaultCommissionRate: rate },
          create: { id: "default", defaultCommissionRate: rate },
        }),
        prisma.platformFinancialSetting.upsert({
          where: { id: "default" },
          update: { defaultCommissionRate: rate },
          create: { id: "default", defaultCommissionRate: rate },
        }),
      ]);

      // 3. Create Audit Log
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "BULK_COMMISSION_RATE_UPDATED",
          targetType: "SELLER",
          details: JSON.stringify({
            newRate: rate,
            sellersUpdated: result.count,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Sabhi ${result.count} sellers ka commission rate kamiyabi se ${rate}% kar diya gaya hai.`,
        count: result.count,
        rate,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
