import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import { deleteCloudinaryAsset, extractCloudinaryPublicId } from "@/services/cloudinaryService";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "SELLER" || !user.sellerProfile) {
      return NextResponse.json({ error: "Unauthorized seller access." }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      where: {
        sellerId: user.sellerProfile.id,
        status: { not: "ARCHIVED" },
      },
      include: {
        category: true,
        subcategory: true,
        productType: true,
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
  let body: any = null;
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

    body = await req.json();
    const {
      title,
      categoryId,
      subcategoryId,
      productTypeId,
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
      attributes,
      variants,
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

    // Optional Subcategory verification
    let validSubcategoryId: string | null = null;
    if (subcategoryId) {
      const subcat = await prisma.subcategory.findFirst({
        where: {
          OR: [{ id: subcategoryId }, { slug: subcategoryId }],
          categoryId: category.id,
        },
      });
      if (subcat) {
        validSubcategoryId = subcat.id;
      }
    }

    // Optional ProductType verification
    let validProductTypeId: string | null = null;
    if (productTypeId) {
      const ptype = await prisma.productType.findFirst({
        where: {
          OR: [{ id: productTypeId }, { slug: productTypeId }],
          ...(validSubcategoryId ? { subcategoryId: validSubcategoryId } : {}),
        },
      });
      if (ptype) {
        validProductTypeId = ptype.id;
      }
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

    // Ensure at least one image is provided, and no more than 8
    if (imageRecords.length === 0) {
      return NextResponse.json(
        { error: "Please upload at least one product image." },
        { status: 400 }
      );
    }

    if (imageRecords.length > 8) {
      return NextResponse.json(
        { error: "A product can have a maximum of 8 images. Please remove excess images." },
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

    // Format attributes
    const formattedAttributes = attributes
      ? typeof attributes === "string"
        ? attributes
        : JSON.stringify(attributes)
      : null;

    // Prepare variants if provided
    const variantRecords: Array<{
      name: string;
      sku: string;
      color?: string | null;
      size?: string | null;
      price: number;
      salePrice?: number | null;
      stockQuantity: number;
      attributes?: string | null;
    }> = [];

    if (Array.isArray(variants) && variants.length > 0) {
      let vCounter = 1;
      variants.forEach((v: any, index: number) => {
        const vPrice = Number(v.price) > 0 ? Number(v.price) : numericPrice;
        const vSalePrice = v.salePrice ? Number(v.salePrice) : numericSalePrice;
        const vStock =
          typeof v.stockQuantity === "number" && !isNaN(v.stockQuantity)
            ? v.stockQuantity
            : Number(stockQuantity) || 0;

        // If size contains multiple comma-separated sizes (e.g. "40, 41, 42, 43, 44" or "S, M, L")
        if (v.size && typeof v.size === "string" && v.size.includes(",")) {
          const splitSizes = v.size
            .split(/[,/]/)
            .map((s: string) => s.trim())
            .filter(Boolean);

          const stockPerSize = Math.max(1, Math.floor(vStock / (splitSizes.length || 1)));

          splitSizes.forEach((singleSize: string) => {
            const vSku = `${sku}-V${vCounter++}`;
            const vName = [v.color?.trim(), `Size ${singleSize}`].filter(Boolean).join(" / ");

            variantRecords.push({
              name: vName,
              sku: vSku,
              color: v.color?.trim() || null,
              size: singleSize,
              price: vPrice,
              salePrice: vSalePrice,
              stockQuantity: stockPerSize,
              attributes: v.attributes
                ? typeof v.attributes === "string"
                  ? v.attributes
                  : JSON.stringify(v.attributes)
                : null,
            });
          });
        } else {
          const vSku = v.sku?.trim() || `${sku}-V${vCounter++}`;
          const vName =
            v.name?.trim() ||
            [v.color?.trim(), v.size?.trim()].filter(Boolean).join(" / ") ||
            `Variant ${index + 1}`;

          variantRecords.push({
            name: vName,
            sku: vSku,
            color: v.color?.trim() || null,
            size: v.size?.trim() || null,
            price: vPrice,
            salePrice: vSalePrice,
            stockQuantity: vStock,
            attributes: v.attributes
              ? typeof v.attributes === "string"
                ? v.attributes
                : JSON.stringify(v.attributes)
              : null,
          });
        }
      });
    }

    const product = await prisma.product.create({
      data: {
        sellerId: sellerProfile.id,
        categoryId: category.id,
        subcategoryId: validSubcategoryId,
        productTypeId: validProductTypeId,
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
        attributes: formattedAttributes,
        images: {
          create: imageRecords,
        },
        ...(variantRecords.length > 0
          ? {
              variants: {
                create: variantRecords,
              },
            }
          : {}),
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
        subcategory: true,
        productType: true,
        variants: true,
      },
    });

    return NextResponse.json({
      message: "Product created successfully.",
      product,
    });
  } catch (error: any) {
    console.error("Create product error:", error);

    // Rollback / cleanup newly submitted Cloudinary images if creation failed
    if (Array.isArray(body?.images)) {
      for (const img of body.images) {
        const url = typeof img === "string" ? img : img?.url;
        if (url) {
          const publicId = extractCloudinaryPublicId(url);
          if (publicId) {
            deleteCloudinaryAsset(publicId).catch(() => {});
          }
        }
      }
    }

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
      include: { images: true },
    });

    if (!product || product.sellerId !== user.sellerProfile.id) {
      return NextResponse.json(
        { error: "Product not found or you do not have permission to delete it." },
        { status: 403 }
      );
    }

    // Check if product or any of its variants are referenced in customer orders
    const [orderItemCount, variantOrderItemCount] = await Promise.all([
      prisma.orderItem.count({ where: { productId } }),
      prisma.orderItem.count({ where: { variant: { productId } } }),
    ]);

    const hasOrders = orderItemCount > 0 || variantOrderItemCount > 0;

    if (hasOrders) {
      // Soft-delete / Archive: Preserve customer order history and financial invoices
      await Promise.all([
        prisma.cartItem.deleteMany({ where: { productId } }),
        prisma.wishlistItem.deleteMany({ where: { productId } }),
        prisma.flashSaleItem.deleteMany({ where: { productId } }),
        prisma.product.update({
          where: { id: productId },
          data: {
            status: "ARCHIVED",
            stockQuantity: 0,
          },
        }),
      ]);

      return NextResponse.json({
        message: "Product has associated customer order history and has been removed from your active store.",
        archived: true,
      });
    }

    // If no orders exist, permanently clean up Cloudinary images and product record
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        const publicId = extractCloudinaryPublicId(img.url);
        if (publicId) {
          await deleteCloudinaryAsset(publicId).catch(() => {});
        }
      }
    }

    await prisma.product.delete({ where: { id: productId } });

    return NextResponse.json({ message: "Product deleted successfully.", deleted: true });
  } catch (error: any) {
    console.error("Error deleting/archiving product:", error);
    return NextResponse.json({ error: error.message || "Failed to delete product." }, { status: 500 });
  }
}
