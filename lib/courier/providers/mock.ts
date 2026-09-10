import {
  ConsignmentBookingRequest,
  ConsignmentBookingResult,
  CourierTrackingResult,
  PlatformCourierConfig,
} from "../types";

export class MockCourierProvider {
  private config: PlatformCourierConfig;

  constructor(config: PlatformCourierConfig) {
    this.config = config;
  }

  async bookConsignment(req: ConsignmentBookingRequest): Promise<ConsignmentBookingResult> {
    const provider = this.config.activeProvider || "POSTEX";
    const prefix = provider === "TRAX" ? "TRX" : provider === "TCS" ? "TCS" : "PEX";
    const randomDigits = Math.floor(1000000 + Math.random() * 9000000);
    const trackingNumber = `${prefix}-${randomDigits}`;

    return {
      success: true,
      provider,
      trackingNumber,
      courierBookingId: `BKG-${Date.now()}`,
      courierStatus: "BOOKED",
      airwayBillUrl: `https://fayzee.store/api/courier/awb/${trackingNumber}`,
      pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      message: `[Sandbox Mode] Consignment booked with ${provider}. Automated pickup scheduled from seller: ${req.pickup.storeName}.`,
      rawResponse: {
        mode: "SANDBOX_SIMULATION",
        provider,
        consignmentNumber: trackingNumber,
        codAmount: req.invoicePayment,
        consigneeCity: req.consignee.city,
        pickupAddress: `${req.pickup.storeName}, ${req.pickup.street}, ${req.pickup.city}`,
      },
    };
  }

  async trackConsignment(trackingNumber: string): Promise<CourierTrackingResult> {
    const provider = this.config.activeProvider || "POSTEX";
    const now = new Date();

    return {
      success: true,
      provider,
      trackingNumber,
      currentStatus: "IN_TRANSIT",
      estimatedDelivery: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-PK", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      events: [
        {
          status: "Order Dispatched",
          description: `Consignment booked via ${provider}. Pickup scheduled from seller store.`,
          location: "Seller Warehouse",
          timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
        },
        {
          status: "Picked Up by Courier",
          description: "Rider received parcel and assigned to departure sorting facility.",
          location: "Regional Hub",
          timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        },
        {
          status: "In Transit",
          description: "Package is on route to customer destination city.",
          location: "Central Transit Hub",
          timestamp: now.toISOString(),
        },
      ],
    };
  }
}
