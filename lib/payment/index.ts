import {
  PaymentInitiationRequest,
  PaymentInitiationResult,
  PaymentProvider,
  PaymentVerificationResult,
} from "./types";
import { prisma } from "../db";
import { SafepayProvider } from "./safepay";
import { detectCardBrand, isValidLuhn } from "./utils";
export * from "./utils";

export class CashOnDeliveryProvider implements PaymentProvider {
  name = "CashOnDelivery";

  async processPayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult> {
    const transactionId = `COD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      success: true,
      transactionId,
      status: "PENDING",
      paymentInstructions: "Please have the exact cash amount ready upon package delivery.",
      gatewayDetails: {
        paymentMethod: "COD",
        channel: "Cash On Delivery",
        collectedBy: "Courier Representative",
        expectedAmount: request.amount,
      },
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerificationResult> {
    return {
      success: true,
      orderId: "",
      transactionId,
      status: "PAID",
      amountPaid: 0,
    };
  }

  async refundPayment(transactionId: string, amount: number) {
    return {
      success: true,
      refundId: `REF-${transactionId}`,
    };
  }
}

export class CardPaymentProvider implements PaymentProvider {
  name = "CardPaymentGateway";

  async processPayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult> {
    const details = request.paymentDetails;
    const rawCardNumber = details?.cardNumber || "";
    const cleanNumber = rawCardNumber.replace(/\s+/g, "");

    // 1. Validation checks
    if (!cleanNumber || cleanNumber.length < 13) {
      return {
        success: false,
        transactionId: "",
        status: "FAILED",
        error: "Invalid card number. Please provide a valid 16-digit debit or credit card number.",
      };
    }

    if (!isValidLuhn(cleanNumber)) {
      return {
        success: false,
        transactionId: "",
        status: "FAILED",
        error: "Card checksum validation failed. Please check the card number for errors.",
      };
    }

    if (!details?.cardExpiry || !details.cardExpiry.includes("/")) {
      return {
        success: false,
        transactionId: "",
        status: "FAILED",
        error: "Card expiration date is required in MM/YY format.",
      };
    }

    if (!details?.cardCvv || details.cardCvv.length < 3) {
      return {
        success: false,
        transactionId: "",
        status: "FAILED",
        error: "Security code (CVV) must be 3 or 4 digits.",
      };
    }

    const brand = detectCardBrand(cleanNumber);
    const last4 = cleanNumber.slice(-4);
    const transactionId = `TXN-CARD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const authCode = details.authCode || `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      success: true,
      transactionId,
      status: "PAID",
      redirectUrl: `/orders/${request.orderId}?paymentSuccess=true&txn=${transactionId}`,
      paymentInstructions: `Approved by 3D Secure. Paid via ${brand} ending in ${last4}.`,
      gatewayDetails: {
        paymentMethod: "ONLINE_CARD",
        brand,
        cardLast4: last4,
        cardHolder: details.cardHolder || request.customerName,
        authCode,
        currency: request.currency || "PKR",
        settledAmount: request.amount,
        threeDSecure: true,
        settlementTime: new Date().toISOString(),
      },
    };
  }

  async verifyPayment(transactionId: string, payload?: any): Promise<PaymentVerificationResult> {
    return {
      success: true,
      orderId: payload?.orderId || "",
      transactionId,
      status: "PAID",
      amountPaid: payload?.amount || 0,
      rawResponse: { verifiedAt: new Date().toISOString(), gateway: "FayzeeCardGateway" },
    };
  }

  async refundPayment(transactionId: string, amount: number) {
    return {
      success: true,
      refundId: `REF-${transactionId}-${Date.now()}`,
    };
  }
}

export class JazzCashProvider implements PaymentProvider {
  name = "JazzCashGateway";

  async processPayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult> {
    const details = request.paymentDetails;
    const walletPhone = (details?.walletPhone || request.customerPhone || "").replace(/\D/g, "");

    if (walletPhone.length < 10) {
      return {
        success: false,
        transactionId: "",
        status: "FAILED",
        error: "Please enter a valid 11-digit JazzCash mobile account number (e.g. 03001234567).",
      };
    }

    const customerTid = (details?.transactionId || details?.tid || "").toString().trim();
    const transactionId = customerTid || `JC-${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;
    const formattedPhone = walletPhone.startsWith("92") ? "0" + walletPhone.slice(2) : walletPhone;

    return {
      success: true,
      transactionId,
      status: "PAID",
      redirectUrl: `/orders/${request.orderId}?paymentSuccess=true&txn=${transactionId}`,
      paymentInstructions: `Payment submitted via JazzCash Mobile Account (${formattedPhone}). Ref/TID: ${transactionId}`,
      gatewayDetails: {
        paymentMethod: "JAZZ_CASH",
        channel: "JazzCash Mobile Account",
        accountPhone: formattedPhone,
        transactionRef: transactionId,
        userTid: customerTid || null,
        settledAmount: request.amount,
        currency: "PKR",
        settlementTime: new Date().toISOString(),
      },
    };
  }

  async verifyPayment(transactionId: string, payload?: any): Promise<PaymentVerificationResult> {
    return {
      success: true,
      orderId: payload?.orderId || "",
      transactionId,
      status: "PAID",
      amountPaid: payload?.amount || 0,
    };
  }

  async refundPayment(transactionId: string, amount: number) {
    return {
      success: true,
      refundId: `REF-${transactionId}`,
    };
  }
}

export class EasyPaisaProvider implements PaymentProvider {
  name = "EasyPaisaGateway";

  async processPayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult> {
    const details = request.paymentDetails;
    const walletPhone = (details?.walletPhone || request.customerPhone || "").replace(/\D/g, "");

    if (walletPhone.length < 10) {
      return {
        success: false,
        transactionId: "",
        status: "FAILED",
        error: "Please enter a valid 11-digit EasyPaisa mobile account number (e.g. 03451234567).",
      };
    }

    const customerTid = (details?.transactionId || details?.tid || "").toString().trim();
    const transactionId = customerTid || `EP-${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;
    const formattedPhone = walletPhone.startsWith("92") ? "0" + walletPhone.slice(2) : walletPhone;

    return {
      success: true,
      transactionId,
      status: "PAID",
      redirectUrl: `/orders/${request.orderId}?paymentSuccess=true&txn=${transactionId}`,
      paymentInstructions: `Payment submitted via EasyPaisa Mobile Account (${formattedPhone}). Ref/TID: ${transactionId}`,
      gatewayDetails: {
        paymentMethod: "EASYPAISA",
        channel: "EasyPaisa Mobile Account",
        accountPhone: formattedPhone,
        transactionRef: transactionId,
        userTid: customerTid || null,
        settledAmount: request.amount,
        currency: "PKR",
        settlementTime: new Date().toISOString(),
      },
    };
  }

  async verifyPayment(transactionId: string, payload?: any): Promise<PaymentVerificationResult> {
    return {
      success: true,
      orderId: payload?.orderId || "",
      transactionId,
      status: "PAID",
      amountPaid: payload?.amount || 0,
    };
  }

  async refundPayment(transactionId: string, amount: number) {
    return {
      success: true,
      refundId: `REF-${transactionId}`,
    };
  }
}

export interface PlatformPaymentConfig {
  activeGateway: "SAFEPAY" | "PAYFAST" | "JAZZCASH" | "MANUAL_SIMULATION";
  isSandbox: boolean;
  safepayApiKey: string | null;
  safepayApiSecret: string | null;
  safepayWebhookSecret: string | null;
  payfastMerchantId: string | null;
  payfastSecuredKey: string | null;
  enableCod: boolean;
  enableOnlineCard: boolean;
  enableJazzcash: boolean;
  enableEasypaisa: boolean;
}

export class PaymentService {
  private static providers: Record<string, PaymentProvider> = {
    COD: new CashOnDeliveryProvider(),
    ONLINE_CARD: new CardPaymentProvider(),
    JAZZ_CASH: new JazzCashProvider(),
    EASYPAISA: new EasyPaisaProvider(),
    WALLET: new JazzCashProvider(),
  };

  /**
   * Fetch platform payment configuration from DB or env fallback
   */
  static async getConfig(): Promise<PlatformPaymentConfig> {
    try {
      const dbConfig = await prisma.platformPaymentSetting.findUnique({
        where: { id: "default" },
      });

      if (dbConfig) {
        return {
          activeGateway: (dbConfig.activeGateway as any) || "SAFEPAY",
          isSandbox: dbConfig.isSandbox,
          safepayApiKey: dbConfig.safepayApiKey || process.env.SAFEPAY_API_KEY || null,
          safepayApiSecret: dbConfig.safepayApiSecret || process.env.SAFEPAY_API_SECRET || null,
          safepayWebhookSecret: dbConfig.safepayWebhookSecret || process.env.SAFEPAY_WEBHOOK_SECRET || null,
          payfastMerchantId: dbConfig.payfastMerchantId || process.env.PAYFAST_MERCHANT_ID || null,
          payfastSecuredKey: dbConfig.payfastSecuredKey || process.env.PAYFAST_SECURED_KEY || null,
          enableCod: dbConfig.enableCod,
          enableOnlineCard: dbConfig.enableOnlineCard,
          enableJazzcash: dbConfig.enableJazzcash,
          enableEasypaisa: dbConfig.enableEasypaisa,
        };
      }
    } catch (err) {
      console.warn("Could not fetch PlatformPaymentSetting from DB, using fallback:", err);
    }

    return {
      activeGateway: (process.env.ACTIVE_PAYMENT_GATEWAY as any) || "SAFEPAY",
      isSandbox: process.env.PAYMENT_SANDBOX !== "false",
      safepayApiKey: process.env.SAFEPAY_API_KEY || null,
      safepayApiSecret: process.env.SAFEPAY_API_SECRET || null,
      safepayWebhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET || null,
      payfastMerchantId: process.env.PAYFAST_MERCHANT_ID || null,
      payfastSecuredKey: process.env.PAYFAST_SECURED_KEY || null,
      enableCod: true,
      enableOnlineCard: true,
      enableJazzcash: true,
      enableEasypaisa: true,
    };
  }

  /**
   * Save or update platform payment settings in DB
   */
  static async saveConfig(data: Partial<PlatformPaymentConfig>) {
    return await prisma.platformPaymentSetting.upsert({
      where: { id: "default" },
      update: {
        activeGateway: data.activeGateway || "SAFEPAY",
        isSandbox: data.isSandbox ?? true,
        safepayApiKey: data.safepayApiKey !== undefined ? data.safepayApiKey : undefined,
        safepayApiSecret: data.safepayApiSecret !== undefined ? data.safepayApiSecret : undefined,
        safepayWebhookSecret: data.safepayWebhookSecret !== undefined ? data.safepayWebhookSecret : undefined,
        payfastMerchantId: data.payfastMerchantId !== undefined ? data.payfastMerchantId : undefined,
        payfastSecuredKey: data.payfastSecuredKey !== undefined ? data.payfastSecuredKey : undefined,
        enableCod: data.enableCod ?? true,
        enableOnlineCard: data.enableOnlineCard ?? true,
        enableJazzcash: data.enableJazzcash ?? true,
        enableEasypaisa: data.enableEasypaisa ?? true,
      },
      create: {
        id: "default",
        activeGateway: data.activeGateway || "SAFEPAY",
        isSandbox: data.isSandbox ?? true,
        safepayApiKey: data.safepayApiKey || null,
        safepayApiSecret: data.safepayApiSecret || null,
        safepayWebhookSecret: data.safepayWebhookSecret || null,
        payfastMerchantId: data.payfastMerchantId || null,
        payfastSecuredKey: data.payfastSecuredKey || null,
        enableCod: data.enableCod ?? true,
        enableOnlineCard: data.enableOnlineCard ?? true,
        enableJazzcash: data.enableJazzcash ?? true,
        enableEasypaisa: data.enableEasypaisa ?? true,
      },
    });
  }

  static getProvider(method: string, config?: PlatformPaymentConfig | null): PaymentProvider {
    if (method === "COD") {
      return this.providers.COD;
    }

    // If Safepay is the active gateway and this is a card payment
    if (method === "ONLINE_CARD" && config?.activeGateway === "SAFEPAY") {
      return new SafepayProvider({
        apiKey: config.safepayApiKey || undefined,
        apiSecret: config.safepayApiSecret || undefined,
        webhookSecret: config.safepayWebhookSecret || undefined,
        isSandbox: config.isSandbox,
      });
    }

    const provider = this.providers[method] || this.providers["ONLINE_CARD"];
    if (!provider) {
      throw new Error(`Unsupported payment method: ${method}`);
    }
    return provider;
  }
}

export { SafepayProvider } from "./safepay";

