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
      return NextResponse.json(
        { error: "Unauthorized: You must be logged in as an authorized seller." },
        { status: 403 }
      );
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
      images,
      imageUrl,
      imageUrls,
      specifications,
    } = body;

    // Field validations
    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Product title is required." }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ error: "Please select a category." }, { status: 400 });
    }

    const numericPrice = Number(price);
    if (!price || isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json({ error: "Please enter a valid price." }, { status: 400 });
    }

    if (!description || !description.trim()) {
      return NextResponse.json({ error: "Product description is required." }, { status: 400 });
    }

    // Verify Category exists in database (lookup by ID or slug)
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id: categoryId }, { slug: categoryId }],
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Please select a valid category from the list." },
        { status: 400 }
      );
    }

    // Verify SellerProfile exists in database
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { id: user.sellerProfile.id },
    });

    if (!sellerProfile) {
      return NextResponse.json(
        { error: "Your seller profile could not be verified. Please log in again." },
        { status: 400 }
      );
    }

    // Optional Brand verification
    let validBrandId: string | null = null;
    if (brandId) {
      const brand = await prisma.brand.findUnique({ where: { id: brandId } });
      if (brand) validBrandId = brand.id;
    }

    // Normalize multiple image inputs
    const imageRecords: Array<{
      url: string;
      alt: string;
      isThumbnail: boolean;
      sortOrder: number;
    }> = [];

    if (Array.isArray(images) && images.length > 0) {
      images.forEach((img: any, idx: number) => {
        const url = typeof img === "string" ? img : img?.url;
        if (url && typeof url === "string" && url.trim()) {
          imageRecords.push({
            url: url.trim(),
            alt: (typeof img === "object" && img?.alt) || title.trim(),
            isThumbnail:
              typeof img === "object" && typeof img?.isThumbnail === "boolean"
                ? img.isThumbnail
                : idx === 0,
            sortOrder:
              typeof img === "object" && typeof img?.sortOrder === "number"
                ? img.sortOrder
                : idx,
          });
        }
      });
    } else if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      imageUrls.forEach((url: string, idx: number) => {
        if (url && typeof url === "string" && url.trim()) {
          imageRecords.push({
            url: url.trim(),
            alt: title.trim(),
            isThumbnail: idx === 0,
            sortOrder: idx,
          });
        }
      });
    } else if (imageUrl && typeof imageUrl === "string" && imageUrl.trim()) {
      imageRecords.push({
        url: imageUrl.trim(),
        alt: title.trim(),
        isThumbnail: true,
        sortOrder: 0,
      });
    }

    // Ensure at least one image is provided
    if (imageRecords.length === 0) {
      return NextResponse.json(
        { error: "Please upload at least one product image." },
        { status: 400 }
      );
    }

    // Guarantee that at least one image is marked as thumbnail
    const hasThumbnail = imageRecords.some((img) => img.isThumbnail);
    if (!hasThumbnail && imageRecords.length > 0) {
      imageRecords[0].isThumbnail = true;
    }

    const baseSlug = slugify(title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    const sku = `SKU-${Date.now().toString().slice(-6)}`;

    const numericSalePrice = salePrice ? Number(salePrice) : null;
    const discountPercent =
      numericSalePrice && numericPrice > 0
        ? Math.max(0, Math.round(((numericPrice - numericSalePrice) / numericPrice) * 100))
        : 0;

    const product = await prisma.product.create({
      data: {
        sellerId: sellerProfile.id,
        categoryId: category.id,
        brandId: validBrandId,
        title: title.trim(),
        slug: uniqueSlug,
        sku,
        price: numericPrice,
        salePrice: numericSalePrice,
        discountPercent,
        stockQuantity: Number(stockQuantity) || 0,
        description: description.trim(),
        shortDescription: shortDescription?.trim() || null,
        specifications: specifications
          ? typeof specifications === "string"
            ? specifications
            : JSON.stringify(specifications)
          : null,
        images: {
          create: imageRecords,
        },
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
      },
    });

    return NextResponse.json({
      message: "Product created successfully.",
      product,
    });
  } catch (error: any) {
    console.error("Create product error:", error);

    // Intercept Prisma foreign key constraint errors
    if (error?.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Failed to link product to the specified category or seller profile. Please verify your selection.",
        },
        { status: 400 }
      );
    }

    // Intercept unique constraint errors (slug / sku collision)
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A product with a similar title or SKU already exists. Please adjust the title." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create product. Please try again." },
      { status: 500 }
    );
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
