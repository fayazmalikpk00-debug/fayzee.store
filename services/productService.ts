import prisma from "../lib/db";

export interface ProductFilterParams {
  categorySlug?: string;
  subcategorySlug?: string;
  productTypeSlug?: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  color?: string;
  size?: string;
  searchQuery?: string;
  sortBy?: "relevance" | "price_asc" | "price_desc" | "newest" | "rating";
  page?: number;
  limit?: number;
}

export async function getProducts(params: ProductFilterParams = {}) {
  const {
    categorySlug,
    subcategorySlug,
    productTypeSlug,
    brandSlug,
    minPrice,
    maxPrice,
    rating,
    inStock,
    color,
    size,
    searchQuery,
    sortBy = "newest",
    page = 1,
    limit = 20,
  } = params;

  const where: any = {
    status: "ACTIVE",
  };

  const andConditions: any[] = [];

  if (searchQuery) {
    andConditions.push({
      OR: [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
        { shortDescription: { contains: searchQuery, mode: "insensitive" } },
        { category: { name: { contains: searchQuery, mode: "insensitive" } } },
        { subcategory: { name: { contains: searchQuery, mode: "insensitive" } } },
        { productType: { name: { contains: searchQuery, mode: "insensitive" } } },
      ],
    });
  }

  if (categorySlug) {
    andConditions.push({
      OR: [
        { category: { slug: categorySlug } },
        { subcategory: { slug: categorySlug } },
        { productType: { slug: categorySlug } },
      ],
    });
  }

  if (subcategorySlug) {
    andConditions.push({
      subcategory: { slug: subcategorySlug },
    });
  }

  if (productTypeSlug) {
    andConditions.push({
      productType: { slug: productTypeSlug },
    });
  }

  if (brandSlug) {
    where.brand = { slug: brandSlug };
  }

  if (color) {
    andConditions.push({
      OR: [
        { variants: { some: { color: { contains: color, mode: "insensitive" } } } },
        { attributes: { contains: color, mode: "insensitive" } },
      ],
    });
  }

  if (size) {
    andConditions.push({
      OR: [
        { variants: { some: { size: { contains: size, mode: "insensitive" } } } },
        { attributes: { contains: size, mode: "insensitive" } },
      ],
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
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
        subcategory: true,
        productType: true,
        variants: { orderBy: { price: "asc" } },
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
      variants: { orderBy: { price: "asc" } },
      category: true,
      subcategory: true,
      productType: true,
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
          _count: {
            select: { followers: true },
          },
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
    where: { isActive: true },
    include: {
      subcategories: {
        where: { isActive: true },
        include: {
          productTypes: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: "asc" },
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

export async function getTrendingProducts(limit = 12) {
  // Return ONLY products explicitly selected by Admin for the Featured / Trending Collection
  return prisma.product.findMany({
    where: { status: "ACTIVE", isTrending: true },
    take: limit,
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      seller: { select: { storeName: true, storeSlug: true } },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { status: "ACTIVE", isFeatured: true },
    take: limit,
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      seller: { select: { storeName: true, storeSlug: true } },
    },
  });
}
