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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {searchQuery ? `Search Results for "${searchQuery}"` : "All Products Catalog"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {products.length} of {total} authentic products
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Sort By:</span>
          <div className="flex items-center gap-1.5 text-xs">
            <Link
              href={{ query: { ...searchParams, sort: "newest" } }}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                sortBy === "newest" ? "bg-brand-600 text-white" : "bg-white text-slate-700 border hover:bg-slate-50"
              }`}
            >
              Newest
            </Link>
            <Link
              href={{ query: { ...searchParams, sort: "price_asc" } }}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                sortBy === "price_asc" ? "bg-brand-600 text-white" : "bg-white text-slate-700 border hover:bg-slate-50"
              }`}
            >
              Price: Low to High
            </Link>
            <Link
              href={{ query: { ...searchParams, sort: "price_desc" } }}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                sortBy === "price_desc" ? "bg-brand-600 text-white" : "bg-white text-slate-700 border hover:bg-slate-50"
              }`}
            >
              Price: High to Low
            </Link>
            <Link
              href={{ query: { ...searchParams, sort: "rating" } }}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                sortBy === "rating" ? "bg-brand-600 text-white" : "bg-white text-slate-700 border hover:bg-slate-50"
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
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-brand-600" /> Filters
              </h3>
              <Link href="/products" className="text-[11px] text-fayzee-coral font-semibold hover:underline">
                Clear All
              </Link>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-700 mb-2">Category</h4>
              <div className="space-y-1.5 text-xs max-h-44 overflow-y-auto">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={{ query: { ...searchParams, category: cat.slug } }}
                    className={`block px-2 py-1 rounded-md transition ${
                      categorySlug === cat.slug
                        ? "bg-brand-50 text-brand-700 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {cat.name} ({cat._count.products})
                  </Link>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-700 mb-2">Brand</h4>
              <div className="space-y-1.5 text-xs max-h-40 overflow-y-auto">
                {brands.map((b) => (
                  <Link
                    key={b.id}
                    href={{ query: { ...searchParams, brand: b.slug } }}
                    className={`block px-2 py-1 rounded-md transition ${
                      brandSlug === b.slug
                        ? "bg-brand-50 text-brand-700 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Stock Availability */}
            <div className="pt-2 border-t border-slate-100">
              <Link
                href={{ query: { ...searchParams, inStock: inStock ? undefined : "true" } }}
                className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium transition ${
                  inStock ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>In Stock Only</span>
                <input type="checkbox" checked={inStock} readOnly className="rounded text-brand-600" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Product Cards Grid */}
        <div className="lg:col-span-3 space-y-8">
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                🔍
              </div>
              <h3 className="text-base font-bold text-slate-900">No products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn't find any products matching your current filters. Try relaxing your search criteria or ask Fayzee AI.
              </p>
              <Link
                href="/products"
                className="inline-block px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl"
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
