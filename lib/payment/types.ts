export type PaymentMethodType =
  | "COD"
  | "ONLINE_CARD"
  | "JAZZ_CASH"
  | "EASYPAISA"
  | "WALLET";

export type PaymentStatusType =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export interface PaymentDetailsPayload {
  method: PaymentMethodType;
  // Credit / Debit Card Details
  cardNumber?: string;
  cardHolder?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardBrand?: string;
  cardLast4?: string;
  // Mobile Wallets (JazzCash / EasyPaisa)
  walletPhone?: string;
  walletCnicLast6?: string;
  transactionId?: string;
  tid?: string;
  // 3D Secure / OTP Authorization
  otpCode?: string;
  authCode?: string;
}

export interface PaymentInitiationRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  returnUrl?: string;
  paymentDetails?: PaymentDetailsPayload;
  metadata?: Record<string, any>;
}

export interface PaymentInitiationResult {
  success: boolean;
  transactionId: string;
  status: PaymentStatusType;
  redirectUrl?: string;
  paymentInstructions?: string;
  gatewayDetails?: Record<string, any>;
  error?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  orderId: string;
  transactionId: string;
  status: PaymentStatusType;
  amountPaid: number;
  rawResponse?: any;
  error?: string;
}

export interface PaymentProvider {
  name: string;
  processPayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult>;
  verifyPayment(transactionId: string, payload?: any): Promise<PaymentVerificationResult>;
  refundPayment(transactionId: string, amount: number): Promise<{ success: boolean; refundId?: string; error?: string }>;
}

