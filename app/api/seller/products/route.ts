import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER" || !user.sellerProfile) {
      return NextResponse.json({ error: "Unauthorized seller access." }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      where: { sellerId: user.sellerProfile.id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
        _count: { select: { reviews: true, orderItems: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER" || !user.sellerProfile) {
      return NextResponse.json({ error: "Unauthorized seller access." }, { status: 403 });
    }

    if (user.sellerProfile.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Your seller account is pending approval by administration." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      categoryId,
      brandId,
      price,
      salePrice,
      stockQuantity,
      description,
      shortDescription,
      imageUrl,
      specifications,
      variants,
    } = body;

    if (!title || !categoryId || !price || !description) {
      return NextResponse.json(
        { error: "Title, Category, Price, and Description are required." },
        { status: 400 }
      );
    }

    const baseSlug = slugify(title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    const sku = `SKU-${Date.now().toString().slice(-6)}`;

    const product = await prisma.product.create({
      data: {
        sellerId: user.sellerProfile.id,
        categoryId,
        brandId: brandId || null,
        title,
        slug: uniqueSlug,
        sku,
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : null,
        discountPercent: salePrice ? Math.round(((price - salePrice) / price) * 100) : 0,
        stockQuantity: Number(stockQuantity) || 0,
        description,
        shortDescription: shortDescription || null,
        specifications: specifications ? JSON.stringify(specifications) : null,
        images: {
          create: [
            {
              url: imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
              alt: title,
              isThumbnail: true,
              sortOrder: 1,
            },
          ],
        },
      },
      include: {
        images: true,
        category: true,
      },
    });

    return NextResponse.json({ message: "Product created successfully.", product });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER" || !user.sellerProfile) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    // STRICT SELLER OWNERSHIP VERIFICATION
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.sellerId !== user.sellerProfile.id) {
      return NextResponse.json(
        { error: "Product not found or you do not have permission to delete it." },
        { status: 403 }
      );
    }

    await prisma.product.delete({ where: { id: productId } });

    return NextResponse.json({ message: "Product deleted successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
