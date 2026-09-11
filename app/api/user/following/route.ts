import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const follows = await prisma.sellerFollow.findMany({
      where: { userId: sessionUser.id },
      include: {
        seller: {
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            logoUrl: true,
            bannerUrl: true,
            rating: true,
            reviewCount: true,
            _count: { select: { products: true, followers: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      following: follows.map((f) => ({
        id: f.id,
        followedAt: f.createdAt,
        seller: {
          ...f.seller,
          productsCount: f.seller._count.products,
          followersCount: f.seller._count.followers,
        },
      })),
    });
  } catch (error: any) {
    console.error("GET /api/user/following error:", error);
    return NextResponse.json({ error: "Failed to fetch followed stores" }, { status: 500 });
  }
}
