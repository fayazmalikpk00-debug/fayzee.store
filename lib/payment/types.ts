export type PaymentMethodType = "COD" | "ONLINE_CARD" | "WALLET";

export type PaymentStatusType =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export interface PaymentInitiationRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  returnUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitiationResult {
  success: boolean;
  transactionId: string;
  status: PaymentStatusType;
  redirectUrl?: string;
  paymentInstructions?: string;
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
