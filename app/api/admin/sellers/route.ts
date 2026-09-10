import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Access denied. Administrator only." }, { status: 403 });
    }

    const sellers = await prisma.sellerProfile.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        _count: { select: { products: true, orderItems: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sellers });
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
    const { sellerId, status, rejectionReason } = body;

    if (!sellerId || !status) {
      return NextResponse.json({ error: "Seller ID and status are required." }, { status: 400 });
    }

    const updated = await prisma.sellerProfile.update({
      where: { id: sellerId },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason || "Identity or documents could not be verified." : null,
      },
      include: { user: true },
    });

    // Also update any pending sellerApplication
    await prisma.sellerApplication.updateMany({
      where: { userId: updated.userId, status: "PENDING" },
      data: {
        status: status === "APPROVED" ? "APPROVED" : status === "REJECTED" ? "REJECTED" : "PENDING",
        rejectionReason: status === "REJECTED" ? rejectionReason : null,
        reviewedBy: user.name || "Admin",
        reviewedAt: new Date(),
      },
    });

    // Create Audit Log
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

    // Notify seller
    const notificationMsg =
      status === "APPROVED"
        ? "Congratulations! Your Fayzee Seller Account & KYC documents have been verified and approved. You can now list products."
        : status === "REJECTED"
        ? `Your seller application was rejected. Reason: ${rejectionReason || "Verification failed"}. Please update your documents.`
        : `Your seller account status was changed to ${status}.`;

    await prisma.notification.create({
      data: {
        userId: updated.userId,
        title: `Seller Account Update: ${status}`,
        message: notificationMsg,
        type: "SELLER",
        link: "/seller/dashboard",
      },
    });

    return NextResponse.json({ message: "Seller status updated successfully.", updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
