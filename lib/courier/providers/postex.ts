import {
  ConsignmentBookingRequest,
  ConsignmentBookingResult,
  CourierTrackingResult,
  PlatformCourierConfig,
} from "../types";

export class PostExProvider {
  private token: string;
  private isSandbox: boolean;
  private baseUrl = "https://api.postex.pk/services/integration/api";

  constructor(config: PlatformCourierConfig) {
    this.token = config.postexApiToken || process.env.POSTEX_API_TOKEN || "";
    this.isSandbox = config.isSandbox;
  }

  async bookConsignment(req: ConsignmentBookingRequest): Promise<ConsignmentBookingResult> {
    if (!this.token) {
      return {
        success: false,
        provider: "POSTEX",
        trackingNumber: "",
        error: "PostEx API Token is missing. Please configure it in Fayzee Admin Settings.",
      };
    }

    try {
      const payload = {
        cityName: req.consignee.city || "Karachi",
        customerName: req.consignee.name,
        customerPhone: req.consignee.phone,
        deliveryAddress: req.consignee.street,
        invoiceDivision: 1,
        invoicePayment: req.paymentType === "COD" ? Math.round(req.invoicePayment) : 0,
        orderDetail: `${req.itemTitle} (Qty: ${req.quantity}, SKU: ${req.itemSku})`,
        orderRefNumber: `${req.orderNumber}-${req.orderItemId.slice(-4)}`,
        orderType: "Normal",
        transactionNotes: req.orderNotes || `Fayzee Marketplace Order #${req.orderNumber}`,
        items: req.quantity,
        pickupAddress: `${req.pickup.storeName}, ${req.pickup.street}, ${req.pickup.city} (Phone: ${req.pickup.phone})`,
      };

      const response = await fetch(`${this.baseUrl}/order/v1/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: this.token,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && (data.statusCode === "200" || data.dist?.trackingNumber)) {
        const trackingNumber = data.dist?.trackingNumber || data.trackingNumber;
        return {
          success: true,
          provider: "POSTEX",
          trackingNumber,
          courierBookingId: data.dist?.orderId || data.orderId,
          courierStatus: "BOOKED",
          airwayBillUrl: `https://postex.pk/tracking?trackingNumber=${trackingNumber}`,
          pickupDate: new Date().toISOString(),
          message: data.statusMessage || "Order successfully booked with PostEx.",
          rawResponse: data,
        };
      } else {
        return {
          success: false,
          provider: "POSTEX",
          trackingNumber: "",
          error: data.statusMessage || data.message || "PostEx booking failed.",
          rawResponse: data,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        provider: "POSTEX",
        trackingNumber: "",
        error: err.message || "Network error while connecting to PostEx API.",
      };
    }
  }

  async trackConsignment(trackingNumber: string): Promise<CourierTrackingResult> {
    try {
      const response = await fetch(
        `${this.baseUrl}/order/v1/track-order/${encodeURIComponent(trackingNumber)}`,
        {
          headers: { token: this.token },
        }
      );
      const data = await response.json();

      if (response.ok && data.dist) {
        const statusMap: Record<string, any> = {
          "Booked": "BOOKED",
          "Arrived at Warehouse": "IN_TRANSIT",
          "In Transit": "IN_TRANSIT",
          "Out for Delivery": "OUT_FOR_DELIVERY",
          "Delivered": "DELIVERED",
          "Returned": "RETURNED",
        };

        const currentStatus = statusMap[data.dist.orderStatus] || "IN_TRANSIT";

        return {
          success: true,
          provider: "POSTEX",
          trackingNumber,
          currentStatus,
          events: (data.dist.transactionHistory || []).map((h: any) => ({
            status: h.orderStatus,
            description: h.message || h.orderStatus,
            location: h.location,
            timestamp: h.transactionDate || new Date().toISOString(),
          })),
        };
      }

      return {
        success: false,
        provider: "POSTEX",
        trackingNumber,
        currentStatus: "BOOKED",
        events: [],
        error: data.statusMessage || "Consignment tracking details not found.",
      };
    } catch (err: any) {
      return {
        success: false,
        provider: "POSTEX",
        trackingNumber,
        currentStatus: "BOOKED",
        events: [],
        error: err.message,
      };
    }
  }
}
