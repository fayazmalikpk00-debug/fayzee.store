import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PaymentService, SafepayProvider } from "@/lib/payment";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get("x-sfpy-signature") ||
      req.headers.get("X-SFPY-SIGNATURE") ||
      req.headers.get("x-signature") ||
      "";

    const config = await PaymentService.getConfig();
    const provider = new SafepayProvider({
      apiKey: config.safepayApiKey || undefined,
      apiSecret: config.safepayApiSecret || undefined,
      webhookSecret: config.safepayWebhookSecret || undefined,
      isSandbox: config.isSandbox,
    });

    // Verify HMAC signature
    const isValid = provider.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn("⚠️ Safepay webhook rejected: Invalid signature or secret mismatch.");
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 401 }
      );
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Safepay webhook events: "payment.completed", "tracker.completed", or direct tracker state
    const eventType = payload.event || payload.type || "payment.completed";
    const trackerToken =
      payload.data?.token ||
      payload.data?.tracker?.token ||
      payload.tracker ||
      payload.token;
    const orderId = payload.data?.metadata?.orderId || payload.order_id;
    const isSuccess =
      payload.data?.state === "paid" ||
      payload.state === "paid" ||
      eventType.includes("completed") ||
      eventType.includes("success");

    if (!isSuccess) {
      return NextResponse.json({ message: "Ignored non-success event", eventType });
    }

    // Locate the matching order and payment
    let payment = null;
    if (trackerToken) {
      payment = await prisma.payment.findFirst({
        where: {
          transactionId: {
            contains: trackerToken,
          },
        },
        include: { order: true },
      });
    }

    if (!payment && orderId) {
      payment = await prisma.payment.findFirst({
        where: { orderId },
        include: { order: true },
      });
    }

    if (!payment) {
      console.warn("Safepay webhook: No corresponding payment found for tracker:", trackerToken);
      return NextResponse.json(
        { message: "Webhook received but matching payment record not found." },
        { status: 200 }
      );
    }

    // Update payment and order to PAID
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          gatewayResponse: JSON.stringify({
            ...payload,
            verifiedViaWebhook: true,
            webhookReceivedAt: new Date().toISOString(),
          }),
        },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: "PAID",
        },
      }),
      prisma.notification.create({
        data: {
          userId: payment.order.userId,
          title: "Payment Verified by Bank! 💳🎉",
          message: `Your online payment for Order #${payment.order.orderNumber} has been verified and confirmed.`,
          type: "ORDER",
          link: `/orders/${payment.orderId}`,
        },
      }),
    ]);

    console.log(`✓ Safepay webhook successfully confirmed payment for Order #${payment.order.orderNumber}`);

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and order updated.",
      orderNumber: payment.order.orderNumber,
    });
  } catch (err: any) {
    console.error("Safepay webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
