import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// -----------------------------------------------------------------------------
// GET /api/reviews?productId=...
// Fetch approved reviews for a product, breakdown, and check if caller reviewed
// -----------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "productId parameter is required" },
        { status: 400 }
      );
    }

    const sessionUser = await getSessionUser();

    // Fetch approved reviews for this product
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        isApproved: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate rating distribution
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalScore = 0;

    for (const r of reviews) {
      const star = Math.min(5, Math.max(1, r.rating)) as 1 | 2 | 3 | 4 | 5;
      counts[star]++;
      totalScore += r.rating;
    }

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? totalScore / totalReviews : 0;

    // Check if current logged-in user already wrote a review
    const userReview = sessionUser
      ? reviews.find((r) => r.userId === sessionUser.id) || null
      : null;

    // Check if current user is a verified buyer of this product
    let isVerifiedBuyer = false;
    if (sessionUser) {
      const orderItem = await prisma.orderItem.findFirst({
        where: {
          productId,
          order: {
            userId: sessionUser.id,
            status: { notIn: ["CANCELLED", "REFUNDED"] },
          },
        },
      });
      isVerifiedBuyer = !!orderItem;
    }

    return NextResponse.json({
      reviews,
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      breakdown: counts,
      userReview,
      isVerifiedBuyer,
    });
  } catch (error: any) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// -----------------------------------------------------------------------------
// POST /api/reviews
// Submit or update a product review, and recalculate Product & Seller ratings
// -----------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Please sign in to write a review" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId, rating, title, comment } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "Valid productId is required" },
        { status: 400 }
      );
    }

    const numericRating = Math.round(Number(rating));
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5 stars" },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== "string" || comment.trim().length < 5) {
      return NextResponse.json(
        { error: "Review comment must be at least 5 characters long" },
        { status: 400 }
      );
    }

    // Verify that the product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, title: true, sellerId: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if the user has ordered this product
    const orderedItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: sessionUser.id,
          status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
      },
    });
    const isVerifiedPurchase = !!orderedItem;
    const isAdmin = sessionUser.role === "ADMIN" || sessionUser.role === "SUPER_ADMIN";

    // Enforce verified purchase to prevent fake and competitor review spam
    if (!isVerifiedPurchase && !isAdmin) {
      return NextResponse.json(
        { error: "Only verified buyers who have purchased this product can leave a review." },
        { status: 403 }
      );
    }

    // Check if the user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId: sessionUser.id,
      },
    });

    let savedReview;
    if (existingReview) {
      // Update existing review
      savedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: numericRating,
          title: title ? String(title).trim().slice(0, 150) : null,
          comment: comment.trim().slice(0, 2000),
          isVerifiedPurchase: isVerifiedPurchase || existingReview.isVerifiedPurchase,
          isApproved: true,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });
    } else {
      // Create new review
      savedReview = await prisma.review.create({
        data: {
          productId,
          userId: sessionUser.id,
          rating: numericRating,
          title: title ? String(title).trim().slice(0, 150) : null,
          comment: comment.trim().slice(0, 2000),
          isVerifiedPurchase,
          isApproved: true,
        },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });
    }

    // -------------------------------------------------------------------------
    // Recalculate and update Product rating & reviewCount
    // -------------------------------------------------------------------------
    const productAgg = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const newProductRating = parseFloat((productAgg._avg.rating || 0).toFixed(1));
    const newProductReviewCount = productAgg._count.rating || 0;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: newProductRating,
        reviewCount: newProductReviewCount,
      },
    });

    // -------------------------------------------------------------------------
    // Recalculate and update SellerProfile rating & reviewCount
    // -------------------------------------------------------------------------
    let newSellerRating = 0;
    let newSellerReviewCount = 0;

    if (product.sellerId) {
      const sellerAgg = await prisma.review.aggregate({
        where: {
          product: { sellerId: product.sellerId },
          isApproved: true,
        },
        _avg: { rating: true },
        _count: { rating: true },
      });

      newSellerRating = parseFloat((sellerAgg._avg.rating || 0).toFixed(1));
      newSellerReviewCount = sellerAgg._count.rating || 0;

      await prisma.sellerProfile.update({
        where: { id: product.sellerId },
        data: {
          rating: newSellerRating,
          reviewCount: newSellerReviewCount,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: existingReview
        ? "Your review has been updated successfully!"
        : "Thank you! Your review has been published.",
      review: savedReview,
      productRating: newProductRating,
      productReviewCount: newProductReviewCount,
      sellerRating: newSellerRating,
      sellerReviewCount: newSellerReviewCount,
    });
  } catch (error: any) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to submit review. Please try again." },
      { status: 500 }
    );
  }
}
