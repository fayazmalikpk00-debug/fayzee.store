import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    // Upsert singleton default settings
    const settings = await prisma.siteSetting.upsert({
      where: { id: "default" },
      update: {},
      create: {
        id: "default",
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
        defaultCommissionRate: 10.0,
        allowNewSellers: true,
        maintenanceMode: false,
      },
    });

    return NextResponse.json({ settings });
  } catch (err: any) {
    console.error("Failed to fetch site settings:", err);
    return NextResponse.json({ error: err.message || "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();

    const updated = await prisma.siteSetting.upsert({
      where: { id: "default" },
      update: {
        siteName: body.siteName !== undefined ? String(body.siteName).trim() : undefined,
        siteTagline: body.siteTagline !== undefined ? String(body.siteTagline).trim() : undefined,
        logoUrl: body.logoUrl !== undefined ? (body.logoUrl ? String(body.logoUrl).trim() : null) : undefined,
        faviconUrl: body.faviconUrl !== undefined ? (body.faviconUrl ? String(body.faviconUrl).trim() : null) : undefined,
        supportPhone: body.supportPhone !== undefined ? String(body.supportPhone).trim() : undefined,
        supportEmail: body.supportEmail !== undefined ? String(body.supportEmail).trim() : undefined,
        whatsappNumber: body.whatsappNumber !== undefined ? String(body.whatsappNumber).trim() : undefined,
        officeAddress: body.officeAddress !== undefined ? String(body.officeAddress).trim() : undefined,
        facebookUrl: body.facebookUrl !== undefined ? (body.facebookUrl ? String(body.facebookUrl).trim() : null) : undefined,
        instagramUrl: body.instagramUrl !== undefined ? (body.instagramUrl ? String(body.instagramUrl).trim() : null) : undefined,
        tiktokUrl: body.tiktokUrl !== undefined ? (body.tiktokUrl ? String(body.tiktokUrl).trim() : null) : undefined,
        youtubeUrl: body.youtubeUrl !== undefined ? (body.youtubeUrl ? String(body.youtubeUrl).trim() : null) : undefined,
        announcementEnabled: body.announcementEnabled !== undefined ? Boolean(body.announcementEnabled) : undefined,
        announcementText: body.announcementText !== undefined ? String(body.announcementText).trim() : undefined,
        announcementLink: body.announcementLink !== undefined ? String(body.announcementLink).trim() : undefined,
        jazzcashTitle: body.jazzcashTitle !== undefined ? String(body.jazzcashTitle).trim() : undefined,
        jazzcashNumber: body.jazzcashNumber !== undefined ? String(body.jazzcashNumber).trim() : undefined,
        easypaisaTitle: body.easypaisaTitle !== undefined ? String(body.easypaisaTitle).trim() : undefined,
        easypaisaNumber: body.easypaisaNumber !== undefined ? String(body.easypaisaNumber).trim() : undefined,
        bankName: body.bankName !== undefined ? String(body.bankName).trim() : undefined,
        bankTitle: body.bankTitle !== undefined ? String(body.bankTitle).trim() : undefined,
        bankAccountNumber: body.bankAccountNumber !== undefined ? String(body.bankAccountNumber).trim() : undefined,
        bankIban: body.bankIban !== undefined ? String(body.bankIban).trim() : undefined,
        standardShippingFee: body.standardShippingFee !== undefined ? Number(body.standardShippingFee) : undefined,
        freeShippingThreshold: body.freeShippingThreshold !== undefined ? Number(body.freeShippingThreshold) : undefined,
        defaultCommissionRate: body.defaultCommissionRate !== undefined ? Number(body.defaultCommissionRate) : undefined,
        allowNewSellers: body.allowNewSellers !== undefined ? Boolean(body.allowNewSellers) : undefined,
        maintenanceMode: body.maintenanceMode !== undefined ? Boolean(body.maintenanceMode) : undefined,
        maintenanceMessage: body.maintenanceMessage !== undefined ? String(body.maintenanceMessage).trim() : undefined,
      },
      create: {
        id: "default",
        siteName: body.siteName || "FAYZEE",
        siteTagline: body.siteTagline || "Pakistan's Premier Multi-Vendor Marketplace",
        supportPhone: body.supportPhone || "03306767357",
        supportEmail: body.supportEmail || "support@fayzee.store",
        whatsappNumber: body.whatsappNumber || "03306767357",
        officeAddress: body.officeAddress || "Lahore / Peshawar, Pakistan",
        announcementEnabled: body.announcementEnabled !== undefined ? Boolean(body.announcementEnabled) : true,
        announcementText: body.announcementText || "🎉 Special Offer: Enjoy Free Delivery on Orders Over Rs. 3,000!",
        announcementLink: body.announcementLink || "/products",
        jazzcashTitle: body.jazzcashTitle || "Fayaz Ullah",
        jazzcashNumber: body.jazzcashNumber || "03306767357",
        easypaisaTitle: body.easypaisaTitle || "Fayaz Ullah",
        easypaisaNumber: body.easypaisaNumber || "03306767357",
        bankName: body.bankName || "Meezan Bank Limited",
        bankTitle: body.bankTitle || "FAYZEE STORE",
        bankAccountNumber: body.bankAccountNumber || "01020304050607",
        bankIban: body.bankIban || "PK36MEZN0001020304050607",
        standardShippingFee: Number(body.standardShippingFee ?? 200),
        freeShippingThreshold: Number(body.freeShippingThreshold ?? 3000),
        defaultCommissionRate: Number(body.defaultCommissionRate ?? 10),
        allowNewSellers: body.allowNewSellers !== undefined ? Boolean(body.allowNewSellers) : true,
        maintenanceMode: body.maintenanceMode !== undefined ? Boolean(body.maintenanceMode) : false,
      },
    });

    // Also sync PlatformFinancialSetting if needed
    if (body.defaultCommissionRate !== undefined || body.jazzcashNumber !== undefined || body.easypaisaNumber !== undefined) {
      await prisma.platformFinancialSetting.upsert({
        where: { id: "default" },
        update: {
          defaultCommissionRate: body.defaultCommissionRate !== undefined ? Number(body.defaultCommissionRate) : undefined,
          adminBankName: body.bankName !== undefined ? body.bankName : undefined,
          adminAccountTitle: body.bankTitle !== undefined ? body.bankTitle : undefined,
          adminAccountNumber: body.bankAccountNumber !== undefined ? body.bankAccountNumber : undefined,
          adminIban: body.bankIban !== undefined ? body.bankIban : undefined,
          adminJazzCash: body.jazzcashNumber !== undefined ? body.jazzcashNumber : undefined,
          adminEasyPaisa: body.easypaisaNumber !== undefined ? body.easypaisaNumber : undefined,
        },
        create: {
          id: "default",
          defaultCommissionRate: Number(body.defaultCommissionRate ?? 10),
          adminBankName: body.bankName || null,
          adminAccountTitle: body.bankTitle || null,
          adminAccountNumber: body.bankAccountNumber || null,
          adminIban: body.bankIban || null,
          adminJazzCash: body.jazzcashNumber || null,
          adminEasyPaisa: body.easypaisaNumber || null,
        },
      });
    }

    // Optional: Bulk update ALL existing sellers to the new default commission rate
    let bulkSellersUpdated = 0;
    if (body.applyCommissionToAllSellers && body.defaultCommissionRate !== undefined) {
      const rate = Math.max(0, Math.min(100, Number(body.defaultCommissionRate)));
      const res = await prisma.sellerProfile.updateMany({
        data: { commissionRate: rate },
      });
      bulkSellersUpdated = res.count;

      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "BULK_COMMISSION_RATE_UPDATED",
          targetType: "SELLER",
          details: JSON.stringify({
            newRate: rate,
            sellersUpdated: res.count,
            source: "SITE_SETTINGS_PANEL",
          }),
        },
      });
    }

    return NextResponse.json({
      message: bulkSellersUpdated > 0
        ? `Settings saved & Sabhi ${bulkSellersUpdated} sellers ka commission rate ${Number(body.defaultCommissionRate)}% kar diya gaya!`
        : "Site Settings updated successfully!",
      settings: updated,
      bulkSellersUpdated,
    });
  } catch (err: any) {
    console.error("Failed to update site settings:", err);
    return NextResponse.json({ error: err.message || "Failed to update settings" }, { status: 500 });
  }
}
