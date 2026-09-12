import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // 1. Verify Webhook Authentication
    const expectedSecret =
      process.env.COURIER_WEBHOOK_SECRET || process.env.PAYMENT_WEBHOOK_SECRET;

    const authHeader = req.headers.get("authorization") || "";
    const bearerToken = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : "";
    const headerSecret =
      req.headers.get("x-courier-secret") ||
      req.headers.get("x-webhook-secret") ||
      req.headers.get("x-api-key") ||
      bearerToken;

    const url = new URL(req.url);
    const querySecret = url.searchParams.get("secret") || url.searchParams.get("token") || "";

    const providedSecret = headerSecret || querySecret;

    if (expectedSecret) {
      if (!providedSecret || !safeCompare(providedSecret, expectedSecret)) {
        console.warn("⚠️ Unauthorized courier webhook request rejected: Secret mismatch or missing.");
        return NextResponse.json(
          { error: "Unauthorized: Invalid or missing webhook secret." },
          { status: 401 }
        );
      }
    } else if (process.env.NODE_ENV === "production") {
      console.error("🚨 CRITICAL: Courier webhook rejected in production because COURIER_WEBHOOK_SECRET is not configured.");
      return NextResponse.json(
        { error: "Courier webhook secret is not configured on the server." },
        { status: 401 }
      );
    } else {
      console.warn("⚠️ Courier webhook: Running in development mode without COURIER_WEBHOOK_SECRET set.");
    }

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
