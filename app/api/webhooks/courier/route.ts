import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Support multiple courier webhook formats:
    // PostEx format: { trackingNumber, orderStatus, ... }
    // Trax format: { tracking_number, status, ... }
    const trackingNumber =
      body.trackingNumber || body.tracking_number || body.cn || body.consignmentNumber;

    const rawStatus = (
      body.orderStatus ||
      body.status ||
      body.current_status ||
      ""
    ).toLowerCase();

    if (!trackingNumber) {
      return NextResponse.json({ error: "Tracking number not found in webhook payload." }, { status: 400 });
    }

    // Find the order matching this tracking number
    const order = await prisma.order.findFirst({
      where: {
        trackingNumber: {
          contains: trackingNumber,
        },
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found for this tracking number. Acknowledged." });
    }

    let targetOrderStatus = order.status;
    let targetFulfillmentStatus = "SHIPPED";

    if (rawStatus.includes("deliver") || rawStatus.includes("completed")) {
      targetOrderStatus = "DELIVERED";
      targetFulfillmentStatus = "DELIVERED";
    } else if (rawStatus.includes("return") || rawStatus.includes("rto")) {
      targetOrderStatus = "RETURNED";
      targetFulfillmentStatus = "CANCELLED";
    } else if (rawStatus.includes("transit") || rawStatus.includes("picked")) {
      targetOrderStatus = "SHIPPED";
      targetFulfillmentStatus = "SHIPPED";
    }

    // Update order items
    await prisma.orderItem.updateMany({
      where: { orderId: order.id },
      data: { fulfillmentStatus: targetFulfillmentStatus },
    });

    // Update parent order
    const orderUpdate: any = {
      status: targetOrderStatus,
      updatedAt: new Date(),
    };

    // If marked delivered and payment method is COD, mark as PAID
    if (targetOrderStatus === "DELIVERED" && order.paymentMethod === "COD") {
      orderUpdate.paymentStatus = "PAID";
      await prisma.payment.updateMany({
        where: { orderId: order.id },
        data: { status: "PAID", updatedAt: new Date() },
      });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: orderUpdate,
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      updatedStatus: targetOrderStatus,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
