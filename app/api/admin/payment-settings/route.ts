import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PaymentService } from "@/lib/payment";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const config = await PaymentService.getConfig();

    // Mask sensitive keys for frontend display
    const safeConfig = {
      ...config,
      safepayApiKey: config.safepayApiKey
        ? `${config.safepayApiKey.slice(0, 8)}...${config.safepayApiKey.slice(-4)}`
        : "",
      safepayApiSecret: config.safepayApiSecret ? "••••••••••••••••" : "",
      safepayWebhookSecret: config.safepayWebhookSecret
        ? `${config.safepayWebhookSecret.slice(0, 6)}...`
        : "",
      payfastSecuredKey: config.payfastSecuredKey ? "••••••••••••••••" : "",
    };

    // Fetch recent online transactions for audit
    const recentTransactions = await prisma.payment.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            orderNumber: true,
            status: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      config: safeConfig,
      recentTransactions,
      webhookUrl: "https://fayzee.store/api/webhooks/payment/safepay",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const existing = await PaymentService.getConfig();

    // Preserve existing keys if user didn't change masked string
    const safepayApiKey =
      body.safepayApiKey && !body.safepayApiKey.includes("...")
        ? body.safepayApiKey
        : existing.safepayApiKey;

    const safepayApiSecret =
      body.safepayApiSecret && !body.safepayApiSecret.includes("••••")
        ? body.safepayApiSecret
        : existing.safepayApiSecret;

    const safepayWebhookSecret =
      body.safepayWebhookSecret && !body.safepayWebhookSecret.includes("...")
        ? body.safepayWebhookSecret
        : existing.safepayWebhookSecret;

    const payfastSecuredKey =
      body.payfastSecuredKey && !body.payfastSecuredKey.includes("••••")
        ? body.payfastSecuredKey
        : existing.payfastSecuredKey;

    const updated = await PaymentService.saveConfig({
      activeGateway: body.activeGateway || "SAFEPAY",
      isSandbox: Boolean(body.isSandbox),
      safepayApiKey,
      safepayApiSecret,
      safepayWebhookSecret,
      payfastMerchantId:
        body.payfastMerchantId !== undefined
          ? body.payfastMerchantId
          : existing.payfastMerchantId,
      payfastSecuredKey,
      enableCod: body.enableCod !== undefined ? Boolean(body.enableCod) : existing.enableCod,
      enableOnlineCard:
        body.enableOnlineCard !== undefined
          ? Boolean(body.enableOnlineCard)
          : existing.enableOnlineCard,
      enableJazzcash:
        body.enableJazzcash !== undefined
          ? Boolean(body.enableJazzcash)
          : existing.enableJazzcash,
      enableEasypaisa:
        body.enableEasypaisa !== undefined
          ? Boolean(body.enableEasypaisa)
          : existing.enableEasypaisa,
    });

    return NextResponse.json({
      message: "Payment Gateway settings updated successfully!",
      config: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
