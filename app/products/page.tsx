import { InfiniteProductGrid } from "@/components/marketplace/InfiniteProductGrid";
import { ProductCard } from "@/components/marketplace/ProductCard";
import prisma from "@/lib/db";
import { getBrands, getCategories, getProducts } from "@/services/productService";
import { Filter, SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const searchParams = (await props.searchParams) || {};
  const categorySlug = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const subcategorySlug = typeof searchParams.subcategory === "string" ? searchParams.subcategory : undefined;
  const productTypeSlug = typeof searchParams.productType === "string" ? searchParams.productType : undefined;
  const searchQuery = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const rawPage = searchParams.page ? Number(searchParams.page) : 1;
  const page = !isNaN(rawPage) && rawPage > 1 ? rawPage : 1;

  // 1. Robots: Search queries should use noindex, follow
  const isSearch = Boolean(searchQuery && searchQuery.trim().length > 0);
  const robots = isSearch ? { index: false, follow: true } : undefined;

  // 2. Canonical URL construction:
  // - If category exists, canonicalize to /category/<categorySlug>
  // - If category + subcategory exists: /category/<categorySlug>?subcategory=<subcategorySlug>
  // - If productType exists: /category/<categorySlug>?subcategory=<subcategorySlug>&productType=<productTypeSlug>
  // - If no category exists: canonicalize to /products
  // - Strip sort, brand, inStock, minPrice, maxPrice, rating
  // - Strip page=1; only preserve page if page > 1
  let canonicalPath = "/products";
  const query = new URLSearchParams();

  if (categorySlug) {
    canonicalPath = `/category/${categorySlug}`;
    if (subcategorySlug) {
      query.set("subcategory", subcategorySlug);
      if (productTypeSlug) {
        query.set("productType", productTypeSlug);
      }
    }
  }

  if (page > 1) {
    query.set("page", String(page));
  }

  const queryString = query.toString();
  const canonicalUrl = `https://www.fayzee.store${canonicalPath}${queryString ? `?${queryString}` : ""}`;

  let title = "All Products Catalog — Shop Authentic Products | Fayzee";
  let description =
    "Discover and compare products on Fayzee Store. Browse tech, fashion, and lifestyle items from marketplace sellers with nationwide delivery across Pakistan.";

  if (isSearch) {
    title = `Search Results for "${searchQuery}" | Fayzee`;
    description = `Browse products matching "${searchQuery}" on Fayzee Store. Explore available marketplace listings and product choices from online sellers in Pakistan.`;
  } else if (categorySlug) {
    const formattedCat = categorySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    if (subcategorySlug) {
      const formattedSub = subcategorySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      if (productTypeSlug) {
        const formattedPt = productTypeSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        title = `${formattedPt} — ${formattedSub} | Fayzee`;
        description = `Browse ${formattedPt} under ${formattedSub} on Fayzee Store. Explore available marketplace listings and compare choices from online sellers in Pakistan.`;
      } else {
        title = `${formattedSub} — ${formattedCat} | Fayzee`;
        description = `Shop ${formattedSub} in ${formattedCat} on Fayzee Store. Browse available product listings, compare items, and order from marketplace sellers in Pakistan.`;
      }
    } else {
      title = `${formattedCat} Products — Buy Online | Fayzee`;
      description = `Explore ${formattedCat} products on Fayzee Store. Browse available selections, compare prices, and shop online from marketplace sellers across Pakistan.`;
    }
  }

  // Format description cleanly within 120–160 character boundary
  let finalDescription = description.replace(/\s+/g, " ").trim();
  if (finalDescription.length > 160) {
    const sub = finalDescription.slice(0, 160);
    const lastSpace = sub.lastIndexOf(" ");
    finalDescription = (lastSpace > 110 ? sub.slice(0, lastSpace) : sub).replace(/[.,;:\s]+$/, "") + ".";
  }

  if (page > 1) {
    title += ` (Page ${page})`;
  }

  return {
    title,
    description: finalDescription,
    robots,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ProductsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = (await props.searchParams) || {};
  const categorySlug = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const subcategorySlug = typeof searchParams.subcategory === "string" ? searchParams.subcategory : undefined;
  const productTypeSlug = typeof searchParams.productType === "string" ? searchParams.productType : undefined;
  const brandSlug = typeof searchParams.brand === "string" ? searchParams.brand : undefined;
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const rating = searchParams.rating ? Number(searchParams.rating) : undefined;
  const inStock = searchParams.inStock === "true";
  const sortBy = (typeof searchParams.sort === "string" ? searchParams.sort : "newest") as any;
  const searchQuery = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const page = searchParams.page ? Number(searchParams.page) : 1;

  const [{ products, total, totalPages }, categories, brands] = await Promise.all([
    getProducts({
      categorySlug,
      subcategorySlug,
      productTypeSlug,
      brandSlug,
      minPrice,
      maxPrice,
      rating,
      inStock,
      sortBy,
      searchQuery,
      page,
      limit: 12,
    }),
    getCategories(),
    getBrands(),
  ]);

  const selectedCategoryObj = categorySlug
    ? categories.find((c: any) => c.slug === categorySlug)
    : null;
  const availableSubcategories = selectedCategoryObj?.subcategories || [];
  const selectedSubcategoryObj = subcategorySlug
    ? availableSubcategories.find((s: any) => s.slug === subcategorySlug)
    : null;
  const availableProductTypes = selectedSubcategoryObj?.productTypes || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E5DC]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B0F14]">
            {searchQuery ? `Search Results for "${searchQuery}"` : "All Products Catalog"}
          </h1>
          <p className="text-xs text-[#8A8F98] mt-1">
            Showing {products.length} of {total} authentic products
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0B0F14] shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-[#8A8F98]" />
            <span className="hidden sm:inline">Sort By:</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs shrink-0">
            <Link
              href={{ query: { ...searchParams, sort: "newest" } }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                sortBy === "newest"
                  ? "bg-[#0B0F14] text-white border border-[#0B0F14]"
                  : "bg-white text-[#0B0F14] border border-[#E8E5DC] hover:border-[#C8A96B]"
              }`}
            >
              Newest
            </Link>
            <Link
              href={{ query: { ...searchParams, sort: "price_asc" } }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                sortBy === "price_asc"
                  ? "bg-[#0B0F14] text-white border border-[#0B0F14]"
                  : "bg-white text-[#0B0F14] border border-[#E8E5DC] hover:border-[#C8A96B]"
              }`}
            >
              Price: Low to High
            </Link>
            <Link
              href={{ query: { ...searchParams, sort: "price_desc" } }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                sortBy === "price_desc"
                  ? "bg-[#0B0F14] text-white border border-[#0B0F14]"
                  : "bg-white text-[#0B0F14] border border-[#E8E5DC] hover:border-[#C8A96B]"
              }`}
            >
              Price: High to Low
            </Link>
            <Link
              href={{ query: { ...searchParams, sort: "rating" } }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                sortBy === "rating"
                  ? "bg-[#0B0F14] text-white border border-[#0B0F14]"
                  : "bg-white text-[#0B0F14] border border-[#E8E5DC] hover:border-[#C8A96B]"
              }`}
            >
              Top Rated
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid with Filter Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="space-y-6 lg:block">
          <div className="bg-white p-5 rounded-2xl border border-[#E8E5DC] shadow-subtle space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DC]">
              <h3 className="text-sm font-bold text-[#0B0F14] flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-[#C8A96B]" /> Filters
              </h3>
              <Link href="/products" className="text-[11px] text-[#C8A96B] font-bold hover:underline">
                Clear All
              </Link>
            </div>

            {/* Categories & Subcategories (3-Tier Hierarchical Drilldown) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase text-[#0B0F14]">Department / Category</h4>
                {categorySlug && (
                  <Link
                    href={{
                      query: {
                        ...searchParams,
                        category: undefined,
                        subcategory: undefined,
                        productType: undefined,
                      },
                    }}
                    className="text-[10px] text-[#C8A96B] hover:underline font-bold"
                  >
                    Reset
                  </Link>
                )}
              </div>
              <div className="space-y-1 text-xs max-h-56 overflow-y-auto">
                {categories.map((cat) => {
                  const isCatSelected = categorySlug === cat.slug;
                  return (
                    <div key={cat.id} className="space-y-1">
                      <Link
                        href={{
                          query: {
                            ...searchParams,
                            category: cat.slug,
                            subcategory: undefined,
                            productType: undefined,
                            page: 1,
                          },
                        }}
                        className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition ${
                          isCatSelected
                            ? "bg-[#0B0F14] text-[#C8A96B] font-bold"
                            : "text-[#0B0F14] hover:bg-[#F5F3EE]"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-[10px] opacity-70">({cat._count?.products ?? 0})</span>
                      </Link>

                      {/* Cascading Subcategories if this category is selected */}
                      {isCatSelected && availableSubcategories.length > 0 && (
                        <div className="pl-3 ml-2 border-l-2 border-[#C8A96B] space-y-1 py-1">
                          <div className="text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider mb-1">
                            Subcategories
                          </div>
                          {availableSubcategories.map((sub: any) => {
                            const isSubSelected = subcategorySlug === sub.slug;
                            return (
                              <div key={sub.id} className="space-y-1">
                                <Link
                                  href={{
                                    query: {
                                      ...searchParams,
                                      category: cat.slug,
                                      subcategory: sub.slug,
                                      productType: undefined,
                                      page: 1,
                                    },
                                  }}
                                  className={`flex items-center justify-between px-2 py-1 rounded-md text-[11px] transition ${
                                    isSubSelected
                                      ? "bg-[#0B0F14] text-white font-bold shadow-xs border border-[#0B0F14]"
                                      : "text-[#0B0F14] hover:bg-[#F5F3EE]"
                                  }`}
                                >
                                  <span className="truncate">{sub.name}</span>
                                  <span className="text-[9px] opacity-80">({sub._count?.products ?? 0})</span>
                                </Link>

                                {/* Cascading Product Types if this subcategory is selected */}
                                {isSubSelected && availableProductTypes.length > 0 && (
                                  <div className="pl-2 ml-1 border-l-2 border-[#C8A96B]/50 space-y-0.5 py-0.5">
                                    {availableProductTypes.map((pt: any) => {
                                      const isPtSelected = productTypeSlug === pt.slug;
                                      return (
                                        <Link
                                          key={pt.id}
                                          href={{
                                            query: {
                                              ...searchParams,
                                              category: cat.slug,
                                              subcategory: sub.slug,
                                              productType: pt.slug,
                                              page: 1,
                                            },
                                          }}
                                          className={`flex items-center justify-between px-1.5 py-0.5 rounded text-[10px] transition ${
                                            isPtSelected
                                              ? "bg-[#0B0F14] text-[#C8A96B] font-bold"
                                              : "text-[#8A8F98] hover:text-[#0B0F14] hover:bg-[#F5F3EE]"
                                          }`}
                                        >
                                          <span className="truncate">{pt.name}</span>
                                          <span className="text-[9px] opacity-70">
                                            ({pt._count?.products ?? 0})
                                          </span>
                                        </Link>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Brands */}
            <div>
              <h4 className="text-xs font-bold uppercase text-[#0B0F14] mb-2">Brand</h4>
              <div className="space-y-1.5 text-xs max-h-40 overflow-y-auto">
                {brands.map((b) => (
                  <Link
                    key={b.id}
                    href={{ query: { ...searchParams, brand: b.slug } }}
                    className={`block px-2 py-1 rounded-md transition ${
                      brandSlug === b.slug
                        ? "bg-[#0B0F14] text-[#C8A96B] font-bold"
                        : "text-[#0B0F14] hover:bg-[#F5F3EE]"
                    }`}
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Stock Availability */}
            <div className="pt-2 border-t border-[#E8E5DC]">
              <Link
                href={{ query: { ...searchParams, inStock: inStock ? undefined : "true" } }}
                className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium transition ${
                  inStock ? "bg-emerald-50 text-emerald-800 font-bold" : "text-[#0B0F14] hover:bg-[#F5F3EE]"
                }`}
              >
                <span>In Stock Only</span>
                <input type="checkbox" checked={inStock} readOnly className="rounded accent-[#0B0F14]" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Product Cards Grid with Daraz-style Infinite Scroll */}
        <div className="lg:col-span-3">
          <InfiniteProductGrid
            initialProducts={products}
            totalCount={total}
            queryParams={searchParams}
          />
        </div>
      </div>
    </div>
  );
}
