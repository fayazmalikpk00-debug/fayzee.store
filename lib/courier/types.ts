export type CourierProviderType = "POSTEX" | "TRAX" | "TCS" | "MOCK";

export interface CourierPickupAddress {
  storeName: string;
  contactPerson: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
}

export interface CourierConsignee {
  name: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
}

export interface ConsignmentBookingRequest {
  orderId: string;
  orderNumber: string;
  orderItemId: string;
  itemTitle: string;
  itemSku: string;
  quantity: number;
  pieces?: number;
  weightInKg?: number;
  orderNotes?: string;
  orderType: "Normal" | "Reverse";
  paymentType: "COD" | "PREPAID";
  invoicePayment: number; // COD amount to collect from customer
  consignee: CourierConsignee;
  pickup: CourierPickupAddress;
}

export interface ConsignmentBookingResult {
  success: boolean;
  provider: CourierProviderType;
  trackingNumber: string; // The official courier Consignment Note (CN)
  courierBookingId?: string;
  courierStatus?: string;
  airwayBillUrl?: string; // Digital barcode / PDF label
  pickupDate?: string;
  message?: string;
  error?: string;
  rawResponse?: any;
}

export interface CourierTrackingEvent {
  status: string;
  description: string;
  location?: string;
  timestamp: string;
}

export interface CourierTrackingResult {
  success: boolean;
  provider: CourierProviderType;
  trackingNumber: string;
  currentStatus: "BOOKED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "RETURNED" | "CANCELLED";
  estimatedDelivery?: string;
  events: CourierTrackingEvent[];
  error?: string;
}

export interface PlatformCourierConfig {
  activeProvider: CourierProviderType;
  isSandbox: boolean;
  postexApiToken?: string | null;
  traxApiKey?: string | null;
  tcsUsername?: string | null;
  tcsPassword?: string | null;
  tcsCostCenterCode?: string | null;
  defaultPickupCity: string;
  webhookSecret?: string | null;
}
