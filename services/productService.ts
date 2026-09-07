import prisma from "@/lib/db";

export interface ProductFilterParams {
  categorySlug?: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  searchQuery?: string;
  sortBy?: "relevance" | "price_asc" | "price_desc" | "newest" | "rating";
  page?: number;
  limit?: number;
}

export async function getProducts(params: ProductFilterParams = {}) {
  const {
    categorySlug,
    brandSlug,
    minPrice,
    maxPrice,
    rating,
    inStock,
    searchQuery,
    sortBy = "newest",
    page = 1,
    limit = 20,
  } = params;

  const where: any = {
    status: "ACTIVE",
  };

  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery } },
      { description: { contains: searchQuery } },
      { shortDescription: { contains: searchQuery } },
    ];
  }

  if (categorySlug) {
    where.category = {
      OR: [
        { slug: categorySlug },
        { parent: { slug: categorySlug } },
      ],
    };
  }

  if (brandSlug) {
    where.brand = { slug: brandSlug };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (rating !== undefined) {
    where.rating = { gte: rating };
  }

  if (inStock) {
    where.stockQuantity = { gt: 0 };
  }

  let orderBy: any = { createdAt: "desc" };
  if (sortBy === "price_asc") orderBy = { price: "asc" };
  else if (sortBy === "price_desc") orderBy = { price: "desc" };
  else if (sortBy === "rating") orderBy = { rating: "desc" };
  else if (sortBy === "newest") orderBy = { createdAt: "desc" };

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
        brand: true,
        seller: {
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            rating: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      category: true,
      brand: true,
      seller: {
        select: {
          id: true,
          storeName: true,
          storeSlug: true,
          description: true,
          rating: true,
          reviewCount: true,
          logoUrl: true,
        },
      },
      reviews: {
        where: { isApproved: true },
        include: {
          user: { select: { name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    include: {
      children: {
        where: { isActive: true },
        include: {
          _count: { select: { products: true } },
        },
      },
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getBrands() {
  return prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function getFlashSaleProducts() {
  const now = new Date();
  const flashSale = await prisma.flashSale.findFirst({
    where: {
      isActive: true,
      startTime: { lte: now },
      endTime: { gte: now },
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
              category: true,
            },
          },
        },
      },
    },
  });

  return flashSale;
}

export async function getTrendingProducts(limit = 8) {
  return prisma.product.findMany({
    where: { status: "ACTIVE", isTrending: true },
    take: limit,
    include: {
      images: true,
      category: true,
      seller: { select: { storeName: true, storeSlug: true } },
    },
    orderBy: { rating: "desc" },
  });
}

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { status: "ACTIVE", isFeatured: true },
    take: limit,
    include: {
      images: true,
      category: true,
      seller: { select: { storeName: true, storeSlug: true } },
    },
  });
}
