import {
  ConsignmentBookingRequest,
  ConsignmentBookingResult,
  CourierTrackingResult,
  PlatformCourierConfig,
} from "../types";

export class TraxProvider {
  private apiKey: string;
  private isSandbox: boolean;
  private baseUrl = "https://sonic.pk/api";

  constructor(config: PlatformCourierConfig) {
    this.apiKey = config.traxApiKey || process.env.TRAX_API_KEY || "";
    this.isSandbox = config.isSandbox;
  }

  async bookConsignment(req: ConsignmentBookingRequest): Promise<ConsignmentBookingResult> {
    if (!this.apiKey) {
      return {
        success: false,
        provider: "TRAX",
        trackingNumber: "",
        error: "Trax API Key is missing. Please configure it in Fayzee Admin Settings.",
      };
    }

    try {
      const payload = {
        service_type_id: 1, // Regular Rush Delivery
        delivery_type_id: 1, // Normal Delivery
        customer_name: req.consignee.name,
        customer_phone: req.consignee.phone,
        customer_address: req.consignee.street,
        destination_city_name: req.consignee.city,
        order_id: `${req.orderNumber}-${req.orderItemId.slice(-4)}`,
        order_amount: req.paymentType === "COD" ? Math.round(req.invoicePayment) : 0,
        item_description: `${req.itemTitle} (Qty: ${req.quantity})`,
        pieces_quantity: req.quantity || 1,
        weight: req.weightInKg || 0.5,
        pickup_address: `${req.pickup.storeName}, ${req.pickup.street}, ${req.pickup.city}`,
      };

      const response = await fetch(`${this.baseUrl}/charges_cal_api/packages/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && (data.status === 0 || data.tracking_number)) {
        const trackingNumber = data.tracking_number || String(data.tracking_no);
        return {
          success: true,
          provider: "TRAX",
          trackingNumber,
          courierBookingId: data.package_id || trackingNumber,
          courierStatus: "BOOKED",
          airwayBillUrl: `https://sonic.pk/tracking?tracking_number=${trackingNumber}`,
          pickupDate: new Date().toISOString(),
          message: data.message || "Order successfully booked with Trax Logistics.",
          rawResponse: data,
        };
      } else {
        return {
          success: false,
          provider: "TRAX",
          trackingNumber: "",
          error: data.message || data.error || "Trax booking failed.",
          rawResponse: data,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        provider: "TRAX",
        trackingNumber: "",
        error: err.message || "Network error while connecting to Trax API.",
      };
    }
  }

  async trackConsignment(trackingNumber: string): Promise<CourierTrackingResult> {
    try {
      const response = await fetch(
        `${this.baseUrl}/charges_cal_api/packages/track?tracking_number=${encodeURIComponent(trackingNumber)}`,
        {
          headers: { Authorization: this.apiKey },
        }
      );
      const data = await response.json();

      if (response.ok && data.status === 0) {
        return {
          success: true,
          provider: "TRAX",
          trackingNumber,
          currentStatus: "IN_TRANSIT",
          events: (data.tracking_history || []).map((h: any) => ({
            status: h.status,
            description: h.status_reason || h.status,
            location: h.location,
            timestamp: h.date || new Date().toISOString(),
          })),
        };
      }

      return {
        success: false,
        provider: "TRAX",
        trackingNumber,
        currentStatus: "BOOKED",
        events: [],
        error: data.message || "Trax tracking details not found.",
      };
    } catch (err: any) {
      return {
        success: false,
        provider: "TRAX",
        trackingNumber,
        currentStatus: "BOOKED",
        events: [],
        error: err.message,
      };
    }
  }
}
