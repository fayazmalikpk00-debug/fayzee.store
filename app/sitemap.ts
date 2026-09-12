import type { MetadataRoute } from "next";
import prisma from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.fayzee.store";

  // 1. Important public static marketplace pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/flash-sale`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/seller/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/return-refund-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/ownership-statement`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // 2. Fetch active products, categories, and approved sellers dynamically
  let productRoutes: MetadataRoute.Sitemap = [];
  let taxonomyRoutes: MetadataRoute.Sitemap = [];
  let sellerRoutes: MetadataRoute.Sitemap = [];

  try {
    const [products, categories, sellers] = await Promise.all([
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: {
          slug: true,
          updatedAt: true,
          subcategories: {
            where: {
              isActive: true,
              products: {
                some: {
                  status: "ACTIVE",
                },
              },
            },
            select: {
              slug: true,
              updatedAt: true,
              productTypes: {
                where: {
                  isActive: true,
                  products: {
                    some: {
                      status: "ACTIVE",
                    },
                  },
                },
                select: { slug: true, updatedAt: true },
              },
            },
          },
        },
      }),
      prisma.sellerProfile.findMany({
        where: { status: "APPROVED" },
        select: { storeSlug: true, updatedAt: true },
      }),
    ]);

    taxonomyRoutes = [];

    for (const cat of categories) {
      taxonomyRoutes.push({
        url: `${baseUrl}/category/${cat.slug}`,
        lastModified: cat.updatedAt,
        changeFrequency: "daily",
        priority: 0.8,
      });

      for (const sub of cat.subcategories) {
        taxonomyRoutes.push({
          url: `${baseUrl}/category/${cat.slug}?subcategory=${sub.slug}`,
          lastModified: sub.updatedAt,
          changeFrequency: "daily",
          priority: 0.7,
        });

        for (const pt of sub.productTypes) {
          taxonomyRoutes.push({
            url: `${baseUrl}/category/${cat.slug}?subcategory=${sub.slug}&productType=${pt.slug}`,
            lastModified: pt.updatedAt,
            changeFrequency: "weekly",
            priority: 0.6,
          });
        }
      }
    }

    productRoutes = products.map((prod) => ({
      url: `${baseUrl}/products/${prod.slug}`,
      lastModified: prod.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    sellerRoutes = sellers.map((seller) => ({
      url: `${baseUrl}/sellers/${seller.storeSlug}`,
      lastModified: seller.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Failed to generate dynamic sitemap entries from database:", error);
  }

  return [
    ...staticRoutes,
    ...taxonomyRoutes,
    ...productRoutes,
    ...sellerRoutes,
  ];
}
