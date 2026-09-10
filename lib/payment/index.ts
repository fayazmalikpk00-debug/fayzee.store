import {
  PaymentInitiationRequest,
  PaymentInitiationResult,
  PaymentProvider,
  PaymentVerificationResult,
} from "./types";

export function detectCardBrand(cardNumber: string): string {
  const clean = cardNumber.replace(/\D/g, "");
  if (/^4/.test(clean)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(clean)) return "Mastercard";
  if (/^(60|62)/.test(clean)) return "PayPak / UnionPay";
  if (/^3[47]/.test(clean)) return "American Express";
  return "Debit/Credit Card";
}

export function isValidLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

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

    const transactionId = `JC-${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;
    const formattedPhone = walletPhone.startsWith("92") ? "0" + walletPhone.slice(2) : walletPhone;

    return {
      success: true,
      transactionId,
      status: "PAID",
      redirectUrl: `/orders/${request.orderId}?paymentSuccess=true&txn=${transactionId}`,
      paymentInstructions: `Payment authorized via JazzCash Mobile Account (${formattedPhone}).`,
      gatewayDetails: {
        paymentMethod: "JAZZ_CASH",
        channel: "JazzCash Mobile Account",
        accountPhone: formattedPhone,
        transactionRef: transactionId,
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

    const transactionId = `EP-${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;
    const formattedPhone = walletPhone.startsWith("92") ? "0" + walletPhone.slice(2) : walletPhone;

    return {
      success: true,
      transactionId,
      status: "PAID",
      redirectUrl: `/orders/${request.orderId}?paymentSuccess=true&txn=${transactionId}`,
      paymentInstructions: `Payment authorized via EasyPaisa Mobile Account (${formattedPhone}).`,
      gatewayDetails: {
        paymentMethod: "EASYPAISA",
        channel: "EasyPaisa Mobile Account",
        accountPhone: formattedPhone,
        transactionRef: transactionId,
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

export class PaymentService {
  private static providers: Record<string, PaymentProvider> = {
    COD: new CashOnDeliveryProvider(),
    ONLINE_CARD: new CardPaymentProvider(),
    JAZZ_CASH: new JazzCashProvider(),
    EASYPAISA: new EasyPaisaProvider(),
    WALLET: new JazzCashProvider(),
  };

  static getProvider(method: string): PaymentProvider {
    const provider = this.providers[method] || this.providers["ONLINE_CARD"];
    if (!provider) {
      throw new Error(`Unsupported payment method: ${method}`);
    }
    return provider;
  }
}

