import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { PaymentService } from "@/lib/payment";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id: orderId } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Admin initiated refund";

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payments: true,
        items: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus === "REFUNDED" || order.status === "REFUNDED") {
      return NextResponse.json(
        { error: "This order has already been refunded." },
        { status: 400 }
      );
    }

    // Find the paid transaction
    const paidPayment = order.payments.find((p) => p.status === "PAID") || order.payments[0];

    let refundResult: any = { success: true, refundId: `REF-${order.id}-${Date.now()}` };

    if (order.paymentMethod === "ONLINE_CARD" && paidPayment?.transactionId) {
      const config = await PaymentService.getConfig();
      const provider = PaymentService.getProvider(order.paymentMethod, config);
      refundResult = await provider.refundPayment(
        paidPayment.transactionId,
        order.grandTotal,
        reason
      );

      if (!refundResult.success) {
        return NextResponse.json(
          { error: refundResult.error || "Payment gateway declined the refund request." },
          { status: 400 }
        );
      }
    }

    // Process DB updates atomically: update order, payment, restore stock if applicable
    await prisma.$transaction(async (tx) => {
      // 1. Update order status
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "REFUNDED",
          paymentStatus: "REFUNDED",
          notes: order.notes
            ? `${order.notes} | Refunded on ${new Date().toLocaleDateString()}: ${reason}`
            : `Refunded: ${reason}`,
          updatedAt: new Date(),
        },
      });

      // 2. Update payment record
      if (paidPayment) {
        await tx.payment.update({
          where: { id: paidPayment.id },
          data: {
            status: "REFUNDED",
            gatewayResponse: JSON.stringify({
              ...refundResult,
              refundedBy: user.email,
              refundedAt: new Date().toISOString(),
              reason,
            }),
          },
        });
      }

      // 3. Restore inventory if order items were not already delivered/shipped
      if (order.status !== "DELIVERED") {
        for (const item of order.items) {
          if (item.fulfillmentStatus !== "CANCELLED") {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stockQuantity: { increment: item.quantity } },
              });
            }
            await tx.product.update({
              where: { id: item.productId },
              data: { stockQuantity: { increment: item.quantity } },
            });
          }
        }

        await tx.orderItem.updateMany({
          where: { orderId: order.id },
          data: { fulfillmentStatus: "CANCELLED" },
        });
      }

      // 4. Notify customer
      await tx.notification.create({
        data: {
          userId: order.userId,
          title: "Order Refund Processed 💳",
          message: `Your order #${order.orderNumber} for Rs. ${Math.round(order.grandTotal).toLocaleString()} has been refunded. If paid via Card/Safepay, funds reverse to your issuing bank in 3-5 business days.`,
          type: "ORDER",
          link: `/orders/${order.id}`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Order #${order.orderNumber} has been successfully refunded.`,
      refundId: refundResult.refundId,
    });
  } catch (error: any) {
    console.error("Error in POST /api/admin/orders/[id]/refund:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process refund" },
      { status: 500 }
    );
  }
}
