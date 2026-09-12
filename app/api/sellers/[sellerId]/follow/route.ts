import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    const { sellerId } = await params;

    // Find seller by id or storeSlug
    const seller = await prisma.sellerProfile.findFirst({
      where: {
        OR: [{ id: sellerId }, { storeSlug: sellerId }],
      },
      select: {
        id: true,
        storeName: true,
        _count: {
          select: { followers: true },
        },
      },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const sessionUser = await getSessionUser();
    let isFollowing = false;

    if (sessionUser) {
      const follow = await prisma.sellerFollow.findUnique({
        where: {
          userId_sellerId: {
            userId: sessionUser.id,
            sellerId: seller.id,
          },
        },
      });
      isFollowing = !!follow;
    }

    return NextResponse.json({
      sellerId: seller.id,
      isFollowing,
      followerCount: seller._count.followers,
    });
  } catch (error: any) {
    console.error("GET /api/sellers/[sellerId]/follow error:", error);
    return NextResponse.json({ error: "Failed to check follow status" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Please log in to follow this store." },
        { status: 401 }
      );
    }

    const { sellerId } = await params;

    // Find seller by id or storeSlug
    const seller = await prisma.sellerProfile.findFirst({
      where: {
        OR: [{ id: sellerId }, { storeSlug: sellerId }],
      },
      select: {
        id: true,
        userId: true,
        storeName: true,
      },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // A seller cannot follow their own store
    if (seller.userId === sessionUser.id) {
      return NextResponse.json(
        { error: "You cannot follow your own store." },
        { status: 400 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.sellerFollow.findUnique({
      where: {
        userId_sellerId: {
          userId: sessionUser.id,
          sellerId: seller.id,
        },
      },
    });

    let isFollowing = false;

    if (existingFollow) {
      // Unfollow
      await prisma.sellerFollow.delete({
        where: { id: existingFollow.id },
      });
      isFollowing = false;
    } else {
      // Follow
      await prisma.sellerFollow.create({
        data: {
          userId: sessionUser.id,
          sellerId: seller.id,
        },
      });
      isFollowing = true;

      // Create in-app notification for seller
      try {
        await prisma.notification.create({
          data: {
            userId: seller.userId,
            title: "New Store Follower! 🎉",
            message: `${sessionUser.name} started following your store "${seller.storeName}".`,
            type: "SELLER",
            link: "/seller/dashboard",
          },
        });
      } catch (e) {
        console.error("Failed to create follower notification:", e);
      }
    }

    const totalFollowers = await prisma.sellerFollow.count({
      where: { sellerId: seller.id },
    });

    return NextResponse.json({
      isFollowing,
      followerCount: totalFollowers,
      message: isFollowing
        ? `You are now following ${seller.storeName}!`
        : `Unfollowed ${seller.storeName}.`,
    });
  } catch (error: any) {
    console.error("POST /api/sellers/[sellerId]/follow error:", error);
    return NextResponse.json({ error: error.message || "Failed to update follow" }, { status: 500 });
  }
}
