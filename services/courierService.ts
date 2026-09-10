import { prisma } from "@/lib/db";
import {
  ConsignmentBookingRequest,
  ConsignmentBookingResult,
  CourierProviderType,
  CourierTrackingResult,
  PlatformCourierConfig,
} from "@/lib/courier/types";
import { PostExProvider } from "@/lib/courier/providers/postex";
import { TraxProvider } from "@/lib/courier/providers/trax";
import { MockCourierProvider } from "@/lib/courier/providers/mock";

export class CourierService {
  /**
   * Fetch active platform courier configuration
   */
  static async getConfig(): Promise<PlatformCourierConfig> {
    try {
      const dbConfig = await prisma.platformCourierSetting.findUnique({
        where: { id: "default" },
      });

      if (dbConfig) {
        return {
          activeProvider: (dbConfig.activeProvider as CourierProviderType) || "POSTEX",
          isSandbox: dbConfig.isSandbox,
          postexApiToken: dbConfig.postexApiToken || process.env.POSTEX_API_TOKEN || null,
          traxApiKey: dbConfig.traxApiKey || process.env.TRAX_API_KEY || null,
          tcsUsername: dbConfig.tcsUsername || process.env.TCS_USERNAME || null,
          tcsPassword: dbConfig.tcsPassword || process.env.TCS_PASSWORD || null,
          tcsCostCenterCode: dbConfig.tcsCostCenterCode || process.env.TCS_COST_CENTER || null,
          defaultPickupCity: dbConfig.defaultPickupCity || "Karachi",
          webhookSecret: dbConfig.webhookSecret || null,
        };
      }
    } catch (err) {
      console.warn("Could not fetch PlatformCourierSetting from DB, using fallback:", err);
    }

    return {
      activeProvider: (process.env.DEFAULT_COURIER as CourierProviderType) || "POSTEX",
      isSandbox: process.env.COURIER_SANDBOX === "false" ? false : true,
      postexApiToken: process.env.POSTEX_API_TOKEN || null,
      traxApiKey: process.env.TRAX_API_KEY || null,
      tcsUsername: process.env.TCS_USERNAME || null,
      tcsPassword: process.env.TCS_PASSWORD || null,
      tcsCostCenterCode: process.env.TCS_COST_CENTER || null,
      defaultPickupCity: "Karachi",
      webhookSecret: process.env.COURIER_WEBHOOK_SECRET || null,
    };
  }

  /**
   * Save or update platform courier configuration
   */
  static async saveConfig(data: Partial<PlatformCourierConfig>) {
    return await prisma.platformCourierSetting.upsert({
      where: { id: "default" },
      update: {
        activeProvider: data.activeProvider || "POSTEX",
        isSandbox: data.isSandbox !== undefined ? data.isSandbox : true,
        postexApiToken: data.postexApiToken ?? null,
        traxApiKey: data.traxApiKey ?? null,
        tcsUsername: data.tcsUsername ?? null,
        tcsPassword: data.tcsPassword ?? null,
        tcsCostCenterCode: data.tcsCostCenterCode ?? null,
        defaultPickupCity: data.defaultPickupCity || "Karachi",
        webhookSecret: data.webhookSecret ?? null,
      },
      create: {
        id: "default",
        activeProvider: data.activeProvider || "POSTEX",
        isSandbox: data.isSandbox !== undefined ? data.isSandbox : true,
        postexApiToken: data.postexApiToken ?? null,
        traxApiKey: data.traxApiKey ?? null,
        tcsUsername: data.tcsUsername ?? null,
        tcsPassword: data.tcsPassword ?? null,
        tcsCostCenterCode: data.tcsCostCenterCode ?? null,
        defaultPickupCity: data.defaultPickupCity || "Karachi",
        webhookSecret: data.webhookSecret ?? null,
      },
    });
  }

  /**
   * Resolve appropriate courier provider instance
   */
  static async getProviderInstance(overrideProvider?: CourierProviderType) {
    const config = await this.getConfig();
    const provider = overrideProvider || config.activeProvider;

    // In sandbox mode or when credentials not set, use Mock provider
    if (config.isSandbox) {
      return new MockCourierProvider(config);
    }

    if (provider === "POSTEX") {
      if (!config.postexApiToken) return new MockCourierProvider(config);
      return new PostExProvider(config);
    }

    if (provider === "TRAX") {
      if (!config.traxApiKey) return new MockCourierProvider(config);
      return new TraxProvider(config);
    }

    return new MockCourierProvider(config);
  }

  /**
   * Book a parcel dispatch with the configured courier service
   */
  static async bookOrderConsignment(
    req: ConsignmentBookingRequest,
    providerType?: CourierProviderType
  ): Promise<ConsignmentBookingResult> {
    const provider = await this.getProviderInstance(providerType);
    const result = await provider.bookConsignment(req);

    if (result.success && result.trackingNumber) {
      // 1. Update OrderItem fulfillment status
      await prisma.orderItem.update({
        where: { id: req.orderItemId },
        data: {
          fulfillmentStatus: "SHIPPED",
        },
      });

      // 2. Update Order parent status & tracking number
      await prisma.order.update({
        where: { id: req.orderId },
        data: {
          status: "SHIPPED",
          trackingNumber: result.trackingNumber,
          updatedAt: new Date(),
        },
      });

      // 3. Notify Customer
      try {
        const order = await prisma.order.findUnique({
          where: { id: req.orderId },
          select: { userId: true },
        });

        if (order?.userId) {
          await prisma.notification.create({
            data: {
              userId: order.userId,
              title: "Order Dispatched via Courier! 🚚",
              message: `Your item "${req.itemTitle}" has been dispatched via ${result.provider}. Tracking CN: ${result.trackingNumber}.`,
              type: "ORDER",
              link: `/orders/${req.orderId}`,
            },
          });
        }
      } catch (notifyErr) {
        console.warn("Failed to create customer notification:", notifyErr);
      }
    }

    return result;
  }

  /**
   * Track consignment across courier APIs
   */
  static async trackConsignment(
    trackingNumber: string,
    providerType?: CourierProviderType
  ): Promise<CourierTrackingResult> {
    const provider = await this.getProviderInstance(providerType);
    return await provider.trackConsignment(trackingNumber);
  }
}
