import { ProductCard } from "@/components/marketplace/ProductCard";
import prisma from "@/lib/db";
import { getBrands, getCategories, getProducts } from "@/services/productService";
import { Filter, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE2E6]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C2A39]">
            {searchQuery ? `Search Results for "${searchQuery}"` : "All Products Catalog"}
          </h1>
          <p className="text-xs text-[#777777] mt-1">
            Showing {products.length} of {total} authentic products
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1C2A39] shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-[#777777]" />
            <span className="hidden sm:inline">Sort By:</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs shrink-0">
            <Link
              href={{ query: { ...searchParams, sort: "newest" } }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                sortBy === "newest" ? "bg-[#FF5E00] text-white" : "bg-white text-[#333333] border border-[#DDE2E6] hover:border-[#FF5E00]"
              }`}
            >
              Newest
            </Link>
            <Link
              href={{ query: { ...searchParams, sort: "price_asc" } }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                sortBy === "price_asc" ? "bg-[#FF5E00] text-white" : "bg-white text-[#333333] border border-[#DDE2E6] hover:border-[#FF5E00]"
              }`}
            >
              Price: Low to High
            </Link>
            <Link
              href={{ query: { ...searchParams, sort: "price_desc" } }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                sortBy === "price_desc" ? "bg-[#FF5E00] text-white" : "bg-white text-[#333333] border border-[#DDE2E6] hover:border-[#FF5E00]"
              }`}
            >
              Price: High to Low
            </Link>
            <Link
              href={{ query: { ...searchParams, sort: "rating" } }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                sortBy === "rating" ? "bg-[#FF5E00] text-white" : "bg-white text-[#333333] border border-[#DDE2E6] hover:border-[#FF5E00]"
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
          <div className="bg-white p-5 rounded-2xl border border-[#DDE2E6] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE2E6]">
              <h3 className="text-sm font-bold text-[#1C2A39] flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-[#FF5E00]" /> Filters
              </h3>
              <Link href="/products" className="text-[11px] text-[#FF5E00] font-semibold hover:text-[#FF8C00] hover:underline">
                Clear All
              </Link>
            </div>

            {/* Categories & Subcategories (3-Tier Hierarchical Drilldown) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase text-[#1C2A39]">Department / Category</h4>
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
                    className="text-[10px] text-[#FF5E00] hover:text-[#FF8C00] hover:underline font-bold"
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
                            ? "bg-orange-50 text-[#FF5E00] font-bold"
                            : "text-[#333333] hover:bg-[#F7F9FA]"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-[10px] opacity-70">({cat._count.products})</span>
                      </Link>

                      {/* Cascading Subcategories if this category is selected */}
                      {isCatSelected && availableSubcategories.length > 0 && (
                        <div className="pl-3 ml-2 border-l-2 border-[#FF5E00] space-y-1 py-1">
                          <div className="text-[10px] font-bold text-[#777777] uppercase tracking-wider mb-1">
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
                                      ? "bg-[#FF5E00] text-white font-bold shadow-xs"
                                      : "text-[#333333] hover:bg-[#F7F9FA]"
                                  }`}
                                >
                                  <span className="truncate">{sub.name}</span>
                                  <span className="text-[9px] opacity-80">({sub._count.products})</span>
                                </Link>

                                {/* Cascading Product Types if this subcategory is selected */}
                                {isSubSelected && availableProductTypes.length > 0 && (
                                  <div className="pl-2 ml-1 border-l-2 border-[#FF8C00] space-y-0.5 py-0.5">
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
                                              ? "bg-[#1C2A39] text-white font-bold"
                                              : "text-[#777777] hover:text-[#FF5E00] hover:bg-[#F7F9FA]"
                                          }`}
                                        >
                                          <span className="truncate">{pt.name}</span>
                                          <span className="text-[9px] opacity-70">
                                            ({pt._count.products})
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
              <h4 className="text-xs font-bold uppercase text-[#1C2A39] mb-2">Brand</h4>
              <div className="space-y-1.5 text-xs max-h-40 overflow-y-auto">
                {brands.map((b) => (
                  <Link
                    key={b.id}
                    href={{ query: { ...searchParams, brand: b.slug } }}
                    className={`block px-2 py-1 rounded-md transition ${
                      brandSlug === b.slug
                        ? "bg-orange-50 text-[#FF5E00] font-bold"
                        : "text-[#333333] hover:bg-[#F7F9FA]"
                    }`}
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Stock Availability */}
            <div className="pt-2 border-t border-[#DDE2E6]">
              <Link
                href={{ query: { ...searchParams, inStock: inStock ? undefined : "true" } }}
                className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium transition ${
                  inStock ? "bg-emerald-50 text-emerald-700 font-bold" : "text-[#333333] hover:bg-[#F7F9FA]"
                }`}
              >
                <span>In Stock Only</span>
                <input type="checkbox" checked={inStock} readOnly className="rounded accent-[#FF5E00]" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Product Cards Grid */}
        <div className="lg:col-span-3 space-y-8">
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#DDE2E6] space-y-4">
              <div className="w-16 h-16 bg-[#F7F9FA] rounded-full flex items-center justify-center mx-auto text-[#777777] border border-[#DDE2E6]">
                🔍
              </div>
              <h3 className="text-base font-bold text-[#1C2A39]">No products found</h3>
              <p className="text-xs text-[#777777] max-w-sm mx-auto">
                We couldn't find any products matching your current filters. Try relaxing your search criteria or ask Fayzee AI.
              </p>
              <Link
                href="/products"
                className="inline-block px-4 py-2 bg-[#FF5E00] hover:bg-[#FF8C00] text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                Reset All Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  slug={product.slug}
                  price={product.price}
                  salePrice={product.salePrice}
                  discountPercent={product.discountPercent}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  image={product.images[0]?.url}
                  category={product.category.name}
                  seller={product.seller}
                  inStock={product.stockQuantity > 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
