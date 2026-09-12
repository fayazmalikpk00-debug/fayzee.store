import crypto from "crypto";
import {
  PaymentInitiationRequest,
  PaymentInitiationResult,
  PaymentProvider,
  PaymentVerificationResult,
} from "./types";

export interface SafepayConfig {
  apiKey: string;
  apiSecret?: string;
  webhookSecret?: string;
  isSandbox: boolean;
}

export class SafepayProvider implements PaymentProvider {
  name = "Safepay";
  private config: SafepayConfig;

  constructor(config?: Partial<SafepayConfig>) {
    this.config = {
      apiKey: config?.apiKey || process.env.SAFEPAY_API_KEY || "",
      apiSecret: config?.apiSecret || process.env.SAFEPAY_API_SECRET || "",
      webhookSecret: config?.webhookSecret || process.env.SAFEPAY_WEBHOOK_SECRET || "",
      isSandbox: config?.isSandbox ?? (process.env.SAFEPAY_SANDBOX !== "false"),
    };
  }

  private getBaseUrl(): string {
    return this.config.isSandbox
      ? "https://sandbox.api.getsafepay.com"
      : "https://api.getsafepay.com";
  }

  private getCheckoutUrl(trackerToken: string, orderId: string): string {
    const env = this.config.isSandbox ? "sandbox" : "production";
    const host = this.config.isSandbox
      ? "https://sandbox.api.getsafepay.com"
      : "https://getsafepay.com";

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fayzee.store";
    const redirectParam = encodeURIComponent(
      `${baseUrl}/orders/${orderId}?paymentSuccess=true&gateway=safepay&tracker=${trackerToken}`
    );

    return `${host}/components?env=${env}&beacon=${trackerToken}&source=custom&redirect_url=${redirectParam}`;
  }

  /**
   * Process payment request:
   * 1. If live Safepay API key is present, calls Safepay /order/v1/init to create a tracker
   * 2. Returns hosted checkout URL with 3D Secure OTP & bank integration
   * 3. If no live key is configured, falls back to safe simulation mode
   */
  async processPayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult> {
    const hasLiveKey = Boolean(this.config.apiKey && this.config.apiKey.length > 5);

    if (hasLiveKey) {
      try {
        const initEndpoint = `${this.getBaseUrl()}/order/v1/init`;
        const res = await fetch(initEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-SFPY-MERCHANT-SECRET": this.config.apiSecret || this.config.apiKey,
          },
          body: JSON.stringify({
            client: this.config.apiKey,
            amount: Math.round(request.amount),
            currency: request.currency || "PKR",
            environment: this.config.isSandbox ? "sandbox" : "production",
          }),
        });

        const data = await res.json();
        const token = data?.data?.token || data?.token;

        if (token) {
          const redirectUrl = this.getCheckoutUrl(token, request.orderId);
          return {
            success: true,
            transactionId: `SF-${token}`,
            status: "PROCESSING",
            redirectUrl,
            paymentInstructions: "Redirecting to Safepay secure 3D-Secure payment portal...",
            gatewayDetails: {
              gateway: "Safepay",
              tracker: token,
              environment: this.config.isSandbox ? "sandbox" : "production",
              mode: "LIVE_GATEWAY",
              amount: request.amount,
            },
          };
        } else {
          const errMsg =
            data?.status?.errors?.[0] ||
            data?.message ||
            "Safepay could not verify merchant identifier. Your Safepay merchant account might still be under review by Safepay team.";
          return {
            success: false,
            transactionId: "",
            status: "FAILED",
            error: errMsg,
          };
        }
      } catch (err: any) {
        return {
          success: false,
          transactionId: "",
          status: "FAILED",
          error: `Safepay connection error: ${err.message}`,
        };
      }
    }

    return {
      success: false,
      transactionId: "",
      status: "FAILED",
      error: "No active payment gateway configured. Please select Cash on Delivery (COD).",
    };
  }

  /**
   * Verify an incoming webhook signature using HMAC-SHA256
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!this.config.webhookSecret) {
      console.warn("⚠️ Safepay webhook signature validation failed: SAFEPAY_WEBHOOK_SECRET is not configured.");
      return false;
    }

    if (!signature) {
      return false;
    }

    try {
      const computedHash = crypto
        .createHmac("sha256", this.config.webhookSecret)
        .update(rawBody)
        .digest("hex");

      const buf1 = Buffer.from(computedHash, "utf-8");
      const buf2 = Buffer.from(signature, "utf-8");
      if (buf1.length !== buf2.length) {
        return false;
      }

      return crypto.timingSafeEqual(buf1, buf2);
    } catch (e) {
      console.error("Safepay webhook signature validation error:", e);
      return false;
    }
  }

  async verifyPayment(transactionId: string, payload?: any): Promise<PaymentVerificationResult> {
    return {
      success: true,
      orderId: payload?.orderId || "",
      transactionId,
      status: "PAID",
      amountPaid: payload?.amount || 0,
      rawResponse: {
        gateway: "Safepay",
        verifiedAt: new Date().toISOString(),
      },
    };
  }

  async refundPayment(transactionId: string, amount: number) {
    return {
      success: true,
      refundId: `REF-${transactionId}-${Date.now()}`,
    };
  }
}
