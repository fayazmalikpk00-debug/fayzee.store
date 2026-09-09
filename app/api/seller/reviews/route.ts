import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// -----------------------------------------------------------------------------
// GET /api/seller/reviews
// Fetches all customer reviews across the authenticated seller's catalog
// -----------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "SELLER" && sessionUser.role !== "ADMIN" && sessionUser.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized. Seller account required." },
        { status: 403 }
      );
    }

    if (!sessionUser.sellerProfile?.id) {
      return NextResponse.json(
        { error: "Seller profile not found." },
        { status: 404 }
      );
    }

    const sellerId = sessionUser.sellerProfile.id;

    // Fetch all reviews for products owned by this seller
    const reviews = await prisma.review.findMany({
      where: {
        product: { sellerId },
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: {
              take: 1,
              orderBy: [{ isThumbnail: "desc" }, { sortOrder: "asc" }],
              select: { url: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Rating breakdown for this seller
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalScore = 0;

    for (const r of reviews) {
      const star = Math.min(5, Math.max(1, r.rating)) as 1 | 2 | 3 | 4 | 5;
      counts[star]++;
      totalScore += r.rating;
    }

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? totalScore / totalReviews : 0;

    return NextResponse.json({
      reviews,
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      breakdown: counts,
    });
  } catch (error: any) {
    console.error("GET /api/seller/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch seller reviews" },
      { status: 500 }
    );
  }
}

// -----------------------------------------------------------------------------
// POST /api/seller/reviews
// Allows seller to post or update a public sellerResponse to a review
// -----------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== "SELLER" && sessionUser.role !== "ADMIN" && sessionUser.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized. Seller account required." },
        { status: 403 }
      );
    }

    if (!sessionUser.sellerProfile?.id) {
      return NextResponse.json(
        { error: "Seller profile not found." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { reviewId, sellerResponse } = body;

    if (!reviewId || typeof reviewId !== "string") {
      return NextResponse.json(
        { error: "Valid reviewId is required" },
        { status: 400 }
      );
    }

    if (!sellerResponse || typeof sellerResponse !== "string" || sellerResponse.trim().length < 2) {
      return NextResponse.json(
        { error: "Response must be at least 2 characters long" },
        { status: 400 }
      );
    }

    // Verify the review belongs to a product owned by this seller
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        product: { select: { sellerId: true } },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    if (review.product.sellerId !== sessionUser.sellerProfile.id && sessionUser.role !== "ADMIN" && sessionUser.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "You can only respond to reviews on your own products" },
        { status: 403 }
      );
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        sellerResponse: sellerResponse.trim().slice(0, 1000),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Seller response submitted successfully!",
      review: updated,
    });
  } catch (error: any) {
    console.error("POST /api/seller/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to submit seller response" },
      { status: 500 }
    );
  }
}
