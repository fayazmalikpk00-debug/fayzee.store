import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      include: {
        _count: {
          select: {
            followers: true,
            products: true,
            chatConversations: true,
          },
        },
      },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      seller: {
        id: seller.id,
        storeName: seller.storeName,
        storeSlug: seller.storeSlug,
        businessName: seller.businessName,
        description: seller.description,
        logoUrl: seller.logoUrl,
        bannerUrl: seller.bannerUrl,
        phone: seller.phone,
        address: seller.address,
        rating: seller.rating,
        reviewCount: seller.reviewCount,
        status: seller.status,
        followersCount: seller._count.followers,
        productsCount: seller._count.products,
        chatConversationsCount: seller._count.chatConversations,
      },
    });
  } catch (error: any) {
    console.error("GET /api/seller/profile error:", error);
    return NextResponse.json({ error: "Failed to fetch seller profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { logoUrl, bannerUrl, description, phone, address } = body;

    const dataToUpdate: any = {};
    if (typeof logoUrl === "string") dataToUpdate.logoUrl = logoUrl.trim() || null;
    if (typeof bannerUrl === "string") dataToUpdate.bannerUrl = bannerUrl.trim() || null;
    if (typeof description === "string") dataToUpdate.description = description.trim();
    if (typeof phone === "string") dataToUpdate.phone = phone.trim();
    if (typeof address === "string") dataToUpdate.address = address.trim();

    const updated = await prisma.sellerProfile.update({
      where: { id: seller.id },
      data: dataToUpdate,
      include: {
        _count: {
          select: {
            followers: true,
            products: true,
            chatConversations: true,
          },
        },
      },
    });

    try {
      revalidatePath("/seller/dashboard");
      revalidatePath("/sellers/" + updated.storeSlug);
      revalidatePath("/");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({
      message: "Store profile updated successfully!",
      seller: {
        id: updated.id,
        storeName: updated.storeName,
        storeSlug: updated.storeSlug,
        description: updated.description,
        logoUrl: updated.logoUrl,
        bannerUrl: updated.bannerUrl,
        phone: updated.phone,
        address: updated.address,
        followersCount: updated._count.followers,
      },
    });
  } catch (error: any) {
    console.error("PATCH /api/seller/profile error:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
