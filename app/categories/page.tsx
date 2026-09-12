import { CategoriesDirectoryClient } from "@/components/marketplace/CategoriesDirectoryClient";
import prisma from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Categories & Departments | Fayzee Store Pakistan",
  description:
    "Explore all 18 shopping departments and subcategories on Fayzee Store. Browse electronics, fashion, groceries, and home products from sellers across Pakistan.",
  keywords: [
    "Fayzee Categories",
    "Shop by Category Pakistan",
    "Online Shopping Departments",
    "Electronics",
    "Fashion Pakistan",
    "Home Appliances",
    "Beauty and Personal Care",
  ],
  openGraph: {
    title: "All Categories & Departments | Fayzee Store",
    description:
      "Explore 18 official departments and 150+ subcategories with verified sellers across Pakistan.",
    url: "https://www.fayzee.store/categories",
    siteName: "Fayzee Store",
  },
  alternates: {
    canonical: "https://www.fayzee.store/categories",
  },
};

export const revalidate = 300; // Cache for 5 minutes

export default async function CategoriesPage() {
  // Query live product counts for each category
  const categoriesWithCounts: Record<string, number> = {};

  try {
    const categoriesFromDb = await prisma.category.findMany({
      select: {
        slug: true,
        _count: {
          select: {
            products: {
              where: {
                status: "ACTIVE",
              },
            },
          },
        },
      },
    });

    categoriesFromDb.forEach((cat) => {
      categoriesWithCounts[cat.slug] = cat._count.products;
    });
  } catch (error) {
    console.error("Error loading category counts:", error);
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <CategoriesDirectoryClient categoriesWithCounts={categoriesWithCounts} />
      </div>
    </main>
  );
}
