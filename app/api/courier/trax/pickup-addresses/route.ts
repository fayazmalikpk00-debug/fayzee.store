import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { CourierService } from "@/services/courierService";

/**
 * GET /api/courier/trax/pickup-addresses
 * Fetch all registered pickup locations from Trax API
 */
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SELLER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const config = await CourierService.getConfig();
    const apiKey = config.traxApiKey || process.env.TRAX_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "Trax API key is not configured.",
        pickup_addresses: [],
      }, { status: 400 });
    }

    const response = await fetch("https://sonic.pk/api/pickup_addresses", {
      method: "GET",
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Trax API responded with status ${response.status}`,
        pickup_addresses: [],
      });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      status: data.status,
      message: data.message || "Pickup addresses fetched successfully.",
      pickup_addresses: data.pickup_addresses || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch Trax pickup addresses." }, { status: 500 });
  }
}

/**
 * POST /api/courier/trax/pickup-addresses
 * Manually or automatically add a new pickup location to Trax
 */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SELLER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const body = await req.json();
    const { person_of_contact, phone_number, email_address, address, city_name, city_id } = body;

    if (!address) {
      return NextResponse.json({ error: "Address is required." }, { status: 400 });
    }

    const config = await CourierService.getConfig();
    const apiKey = config.traxApiKey || process.env.TRAX_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Trax API key is not configured." }, { status: 400 });
    }

    // Resolve city ID if not provided
    let finalCityId = city_id ? Number(city_id) : 271; // Default to Peshawar (271)
    if (!city_id && city_name) {
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
        kasur: 204,
      };
      const cleaned = city_name.toLowerCase().trim();
      if (quickMap[cleaned]) {
        finalCityId = quickMap[cleaned];
      }
    }

    const cleanPhone = (phone_number || user.phone || "03306767357").replace(/[^0-9]/g, "");

    const response = await fetch("https://sonic.pk/api/pickup_address/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({
        person_of_contact: person_of_contact || user.name || "Fayzee Seller",
        phone_number: cleanPhone,
        email_address: email_address || user.email || "support@fayzee.store",
        address: address.trim(),
        city_id: finalCityId,
      }),
    });

    const data = await response.json();

    if (response.ok && data.status === 0 && data.id) {
      return NextResponse.json({
        success: true,
        message: data.message || "Pickup address successfully created on Trax!",
        pickup_address_id: Number(data.id),
      });
    } else {
      const errorMsg =
        data.errors && typeof data.errors === "object"
          ? Object.values(data.errors).flat().join(", ")
          : data.message || "Failed to add pickup address to Trax.";

      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to register pickup address on Trax." }, { status: 500 });
  }
}
