import {
  ConsignmentBookingRequest,
  ConsignmentBookingResult,
  CourierTrackingResult,
  PlatformCourierConfig,
} from "../types";

// In-memory cache for Trax cities
let cachedCities: { id: number; name: string }[] | null = null;
let citiesCacheTimestamp = 0;

export class TraxProvider {
  private apiKey: string;
  private isSandbox: boolean;
  private baseUrl = "https://sonic.pk/api";
  private defaultPickupAddressId: number = 667099;

  constructor(config: PlatformCourierConfig) {
    this.apiKey = config.traxApiKey || process.env.TRAX_API_KEY || "";
    this.isSandbox = config.isSandbox;
    if (process.env.TRAX_PICKUP_ADDRESS_ID) {
      this.defaultPickupAddressId = parseInt(process.env.TRAX_PICKUP_ADDRESS_ID, 10) || 667099;
    }
  }

  /**
   * Helper to resolve Trax numeric City ID from city name
   */
  private async resolveCityId(cityName: string): Promise<number> {
    const cleaned = (cityName || "").trim().toLowerCase();

    // Fast dictionary for major Pakistani cities
    const quickMap: Record<string, number> = {
      karachi: 202,
      lahore: 223,
      islamabad: 174,
      rawalpindi: 288,
      peshawar: 271,
      faisalabad: 144,
      multan: 251,
      gujranwala: 158,
      hyderabad: 172,
      quetta: 283,
      sialkot: 315,
      abbottabad: 101,
      bahawalpur: 110,
      sargodha: 304,
      gujrat: 160,
      sukkur: 326,
      mardan: 242,
      kasur: 204,
    };

    if (quickMap[cleaned]) {
      return quickMap[cleaned];
    }

    try {
      const now = Date.now();
      if (!cachedCities || now - citiesCacheTimestamp > 1000 * 60 * 60 * 12) {
        const res = await fetch(`${this.baseUrl}/cities`, {
          headers: { Authorization: this.apiKey },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.cities)) {
            cachedCities = data.cities.map((c: any) => ({ id: c.id, name: c.name }));
            citiesCacheTimestamp = now;
          }
        }
      }

      if (cachedCities && cachedCities.length > 0) {
        const exact = cachedCities.find(
          (c) => c.name.toLowerCase() === cleaned
        );
        if (exact) return exact.id;

        const partial = cachedCities.find(
          (c) =>
            c.name.toLowerCase().includes(cleaned) ||
            cleaned.includes(c.name.toLowerCase())
        );
        if (partial) return partial.id;
      }
    } catch (e) {
      console.warn("Trax city resolution error:", e);
    }

    // Default fallback to Peshawar (271) or Karachi (202)
    return 271;
  }

  /**
   * Automatically register a seller's shop/house as a pickup address on Trax
   */
  async registerPickupAddress(data: {
    person_of_contact: string;
    phone_number: string;
    email_address: string;
    address: string;
    city_name: string;
  }): Promise<number | null> {
    try {
      const cityId = await this.resolveCityId(data.city_name);
      const cleanPhone = (data.phone_number || "").replace(/[^0-9]/g, "");
      const cleanAddr = (data.address || "").toLowerCase().trim();

      // Check if this address or phone already exists in Trax to avoid duplicate addresses
      try {
        const listRes = await fetch(`${this.baseUrl}/pickup_addresses`, {
          method: "GET",
          headers: { Authorization: this.apiKey },
        });
        if (listRes.ok) {
          const listData = await listRes.json();
          if (Array.isArray(listData?.pickup_addresses)) {
            const existing = listData.pickup_addresses.find((p: any) => {
              const pAddr = (p.address || "").toLowerCase().trim();
              const pPhone = (p.phone_number || "").replace(/[^0-9]/g, "");
              return (
                (pAddr.length > 5 && pAddr === cleanAddr) ||
                (pPhone.length > 7 && pPhone === cleanPhone && p.city?.id === cityId)
              );
            });
            if (existing && existing.id) {
              return Number(existing.id);
            }
          }
        }
      } catch (listErr) {
        console.warn("Trax check existing pickup addresses error:", listErr);
      }

      const response = await fetch(`${this.baseUrl}/pickup_address/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.apiKey,
        },
        body: JSON.stringify({
          person_of_contact: data.person_of_contact || "Fayzee Seller",
          phone_number: cleanPhone || "03306767357",
          email_address: data.email_address || "support@fayzee.store",
          address: data.address,
          city_id: cityId,
        }),
      });

      const resData = await response.json();
      if (response.ok && resData.status === 0 && resData.id) {
        return Number(resData.id);
      }
    } catch (err) {
      console.warn("Trax registerPickupAddress error:", err);
    }
    return null;
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
      // Resolve dynamic seller pickup address:
      // 1. If seller already has traxPickupAddressId
      // 2. If seller has a specific street address, automatically register them on Trax!
      // 3. Fallback to platform default pickup location
      let pickupAddressId = req.pickup.traxPickupAddressId || null;
      if (!pickupAddressId && req.pickup.street && req.pickup.street !== "Seller Store Address, Pakistan") {
        pickupAddressId = await this.registerPickupAddress({
          person_of_contact: req.pickup.contactPerson || req.pickup.storeName,
          phone_number: req.pickup.phone,
          email_address: req.pickup.email || "support@fayzee.store",
          address: req.pickup.street,
          city_name: req.pickup.city || "Peshawar",
        });
      }
      if (!pickupAddressId) {
        pickupAddressId = this.defaultPickupAddressId;
      }

      const cityId = await this.resolveCityId(req.consignee.city);
      const isCod = req.paymentType === "COD";
      const amount = isCod ? Math.round(req.invoicePayment || 0) : 0;
      const cleanPhone = (req.consignee.phone || "").replace(/[^0-9]/g, "");

      const payload = {
        service_type_id: 1, // Regular Rush Delivery
        shipping_mode_id: 1, // Standard Delivery
        pickup_address_id: pickupAddressId,
        consignee_city_id: cityId,
        consignee_name: req.consignee.name || "Customer",
        consignee_address: `${req.consignee.street || ""}, ${req.consignee.city || ""}`.trim(),
        consignee_phone_number_1: cleanPhone || "03306767357",
        order_id: `${req.orderNumber || "FZ"}-${(req.orderItemId || "0000").slice(-4)}`,
        amount: amount,
        payment_mode_id: isCod ? 1 : 2, // 1 = COD, 2 = Prepaid
        item_description: `${req.itemTitle || "E-Commerce Product"} (Qty: ${req.quantity || 1})`.slice(0, 100),
        item_quantity: req.quantity || 1,
        estimated_weight: req.weightInKg || 0.5,
        item_product_type_id: 1,
        item_insurance: 0,
        information_display: 1,
      };

      const response = await fetch(`${this.baseUrl}/shipment/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.status === 0 && data.tracking_number) {
        const trackingNumber = String(data.tracking_number);
        return {
          success: true,
          provider: "TRAX",
          trackingNumber,
          courierBookingId: trackingNumber,
          courierStatus: "BOOKED",
          airwayBillUrl: `https://sonic.pk/tracking?tracking_number=${trackingNumber}`,
          pickupDate: new Date().toISOString(),
          message: data.message || "Order successfully booked with Trax Logistics.",
          rawResponse: data,
        };
      } else {
        const errorMsg =
          data.errors && typeof data.errors === "object"
            ? Object.values(data.errors).flat().join(", ")
            : data.message || "Trax booking failed.";

        return {
          success: false,
          provider: "TRAX",
          trackingNumber: "",
          error: errorMsg,
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
        `${this.baseUrl}/shipment/track?tracking_number=${encodeURIComponent(trackingNumber)}&type=1`,
        {
          headers: { Authorization: this.apiKey },
        }
      );
      const data = await response.json();

      if (response.ok && data.status === 0 && data.details) {
        const details = data.details;
        const history = details.tracking_history || [];
        return {
          success: true,
          provider: "TRAX",
          trackingNumber,
          currentStatus: details.status || "IN_TRANSIT",
          events: history.map((h: any) => ({
            status: h.status || "STATUS_UPDATE",
            description: h.status_reason || h.status || "",
            location: h.location || details.pickup?.origin || "",
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
