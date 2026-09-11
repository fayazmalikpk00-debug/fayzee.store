import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: "default" },
    });

    const activeBanners = await prisma.siteBanner.findMany({
      where: { isActive: true },
      orderBy: [{ position: "asc" }, { order: "asc" }, { createdAt: "desc" }],
    });

    // Fallbacks if not yet initialized
    const fallbackSettings = {
      siteName: "FAYZEE",
      siteTagline: "Pakistan's Premier Multi-Vendor Marketplace",
      supportPhone: "03306767357",
      supportEmail: "support@fayzee.store",
      whatsappNumber: "03306767357",
      officeAddress: "Lahore / Peshawar, Pakistan",
      announcementEnabled: true,
      announcementText: "🎉 Special Offer: Enjoy Free Delivery on Orders Over Rs. 3,000! Cash on Delivery Available Nationwide.",
      announcementLink: "/products",
      jazzcashTitle: "Fayaz Ullah",
      jazzcashNumber: "03306767357",
      easypaisaTitle: "Fayaz Ullah",
      easypaisaNumber: "03306767357",
      bankName: "Meezan Bank Limited",
      bankTitle: "FAYZEE STORE",
      bankAccountNumber: "01020304050607",
      bankIban: "PK36MEZN0001020304050607",
      standardShippingFee: 200.0,
      freeShippingThreshold: 3000.0,
      allowNewSellers: true,
      maintenanceMode: false,
    };

    return NextResponse.json({
      settings: settings || fallbackSettings,
      banners: activeBanners || [],
    });
  } catch (err: any) {
    console.error("Public site settings fetch error:", err);
    return NextResponse.json(
      {
        settings: {
          siteName: "FAYZEE",
          supportPhone: "03306767357",
          supportEmail: "support@fayzee.store",
          whatsappNumber: "03306767357",
          announcementEnabled: true,
          announcementText: "🎉 Special Offer: Enjoy Free Delivery on Orders Over Rs. 3,000!",
          jazzcashTitle: "Fayaz Ullah",
          jazzcashNumber: "03306767357",
          easypaisaTitle: "Fayaz Ullah",
          easypaisaNumber: "03306767357",
          standardShippingFee: 200,
          freeShippingThreshold: 3000,
        },
        banners: [],
      },
      { status: 200 }
    );
  }
}
