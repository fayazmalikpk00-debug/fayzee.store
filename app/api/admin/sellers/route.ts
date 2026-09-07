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
    const { sellerId, status } = body;

    if (!sellerId || !status) {
      return NextResponse.json({ error: "Seller ID and status are required." }, { status: 400 });
    }

    const updated = await prisma.sellerProfile.update({
      where: { id: sellerId },
      data: { status },
      include: { user: true },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: `SELLER_STATUS_${status}`,
        targetType: "SELLER",
        targetId: sellerId,
        details: JSON.stringify({ storeName: updated.storeName, newStatus: status }),
      },
    });

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: updated.userId,
        title: `Seller Account Update: ${status}`,
        message:
          status === "APPROVED"
            ? "Congratulations! Your Fayzee Seller Account has been approved. You can now list products."
            : `Your seller account status was changed to ${status}.`,
        type: "SELLER",
        link: "/seller/dashboard",
      },
    });

    return NextResponse.json({ message: "Seller status updated successfully.", updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
