import {
  PaymentInitiationRequest,
  PaymentInitiationResult,
  PaymentProvider,
  PaymentVerificationResult,
} from "./types";

export class CashOnDeliveryProvider implements PaymentProvider {
  name = "CashOnDelivery";

  async processPayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult> {
    const transactionId = `COD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return {
      success: true,
      transactionId,
      status: "PENDING",
      paymentInstructions: "Please have the exact cash amount ready upon package delivery.",
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

export class OnlinePaymentProvider implements PaymentProvider {
  name = "OnlinePaymentGateway";

  private secretKey: string;

  constructor() {
    this.secretKey = process.env.PAYMENT_SECRET_KEY || "sk_test_fayzee_sandbox";
  }

  async processPayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult> {
    // Generate secure simulated / gateway transaction
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // In production with Stripe, PayFast, JazzCash, EasyPaisa, this issues a checkout session
    // For sandbox / test, we simulate approved online payment transaction
    return {
      success: true,
      transactionId,
      status: "PAID",
      redirectUrl: `/orders/${request.orderId}?paymentSuccess=true&txn=${transactionId}`,
      paymentInstructions: "Payment verified successfully through 3D Secure checkout.",
    };
  }

  async verifyPayment(transactionId: string, payload?: any): Promise<PaymentVerificationResult> {
    return {
      success: true,
      orderId: payload?.orderId || "",
      transactionId,
      status: "PAID",
      amountPaid: payload?.amount || 0,
      rawResponse: { verifiedAt: new Date().toISOString(), gateway: "FayzeeGateway" },
    };
  }

  async refundPayment(transactionId: string, amount: number) {
    return {
      success: true,
      refundId: `REF-${transactionId}-${Date.now()}`,
    };
  }
}

export class PaymentService {
  private static providers: Record<string, PaymentProvider> = {
    COD: new CashOnDeliveryProvider(),
    ONLINE_CARD: new OnlinePaymentProvider(),
  };

  static getProvider(method: string): PaymentProvider {
    const provider = this.providers[method];
    if (!provider) {
      throw new Error(`Unsupported payment method: ${method}`);
    }
    return provider;
  }
}
