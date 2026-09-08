import { ProductCard } from "@/components/marketplace/ProductCard";
import prisma from "@/lib/db";
import { getProducts } from "@/services/productService";
import { ChevronRight, Filter, Layers, PackageOpen } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const subcategorySlug =
    typeof searchParams?.subcategory === "string"
      ? searchParams.subcategory
      : undefined;
  const productTypeSlug =
    typeof searchParams?.productType === "string"
      ? searchParams.productType
      : undefined;
  const sortBy =
    typeof searchParams?.sort === "string"
      ? (searchParams.sort as any)
      : "newest";
  const page = searchParams?.page ? Number(searchParams.page) : 1;

  // 1. Lookup Category with active subcategories & product types
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      subcategories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          productTypes: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            include: {
              _count: { select: { products: true } },
            },
          },
          _count: { select: { products: true } },
        },
      },
      _count: { select: { products: true } },
    },
  });

  if (!category) {
    notFound();
  }

  // Active subcategory & product type resolution
  const activeSubcategory = subcategorySlug
    ? category.subcategories.find((s) => s.slug === subcategorySlug)
    : null;

  const activeProductType =
    activeSubcategory && productTypeSlug
      ? activeSubcategory.productTypes.find((pt) => pt.slug === productTypeSlug)
      : null;

  // 2. Fetch products for this category/subcategory/productType
  const { products, total, totalPages } = await getProducts({
    categorySlug: category.slug,
    subcategorySlug: activeSubcategory?.slug,
    productTypeSlug: activeProductType?.slug,
    sortBy,
    page,
    limit: 24,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center space-x-1.5 text-xs text-slate-500 overflow-x-auto no-scrollbar py-1"
      >
        <Link href="/" className="hover:text-brand-600 transition shrink-0 font-medium">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link
          href={`/category/${category.slug}`}
          className={`hover:text-brand-600 transition shrink-0 font-medium ${
            !activeSubcategory ? "text-slate-900 font-bold" : ""
          }`}
        >
          {category.name}
        </Link>

        {activeSubcategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link
              href={`/category/${category.slug}?subcategory=${activeSubcategory.slug}`}
              className={`hover:text-brand-600 transition shrink-0 font-medium ${
                !activeProductType ? "text-slate-900 font-bold" : ""
              }`}
            >
              {activeSubcategory.name}
            </Link>
          </>
        )}

        {activeProductType && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-bold shrink-0">
              {activeProductType.name}
            </span>
          </>
        )}
      </nav>

      {/* 2. Category Hero Banner */}
      <div className="bg-[#1C2A39] text-white p-6 sm:p-8 rounded-3xl space-y-3 relative overflow-hidden shadow-sm border border-[#2A3B4C]">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[#FF8C00] text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
              Department
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {category.subcategories.length} Subcategories
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
            {category.name}
            {activeSubcategory && (
              <span className="text-lg sm:text-2xl text-slate-300 font-medium">
                / {activeSubcategory.name}
              </span>
            )}
            {activeProductType && (
              <span className="text-base sm:text-xl text-[#FF8C00] font-normal">
                / {activeProductType.name}
              </span>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {activeSubcategory?.description ||
              category.description ||
              `Discover verified authentic products across ${category.name} with express delivery across Pakistan.`}
          </p>

          <p className="text-xs text-[#FF8C00] font-bold pt-1">
            ⚡ {total} authentic products listed in this section
          </p>
        </div>
      </div>

      {/* 3. Subcategories Filter Pills */}
      {category.subcategories.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1C2A39] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#FF5E00]" />
              <span>Browse Subcategories</span>
            </h3>
            {activeSubcategory && (
              <Link
                href={`/category/${category.slug}`}
                className="text-[11px] font-bold text-[#FF5E00] hover:text-[#FF8C00] hover:underline"
              >
                View All {category.name}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
            <Link
              href={`/category/${category.slug}`}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap shrink-0 ${
                !activeSubcategory
                  ? "bg-[#FF5E00] text-white shadow-xs"
                  : "bg-white border border-[#DDE2E6] text-[#333333] hover:border-[#FF5E00]"
              }`}
            >
              All {category.name} ({category._count.products})
            </Link>

            {category.subcategories.map((sub) => {
              const isSelected = activeSubcategory?.slug === sub.slug;
              return (
                <Link
                  key={sub.id}
                  href={`/category/${category.slug}?subcategory=${sub.slug}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap shrink-0 ${
                    isSelected
                      ? "bg-[#FF5E00] text-white font-bold shadow-xs"
                      : "bg-white border border-[#DDE2E6] text-[#333333] hover:border-[#FF5E00]"
                  }`}
                >
                  {sub.name} ({sub._count.products})
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Product Types Pills (when subcategory is active) */}
      {activeSubcategory && activeSubcategory.productTypes.length > 0 && (
        <div className="p-3.5 bg-[#F7F9FA] rounded-2xl border border-[#DDE2E6] space-y-2">
          <span className="text-[11px] font-bold text-[#1C2A39] uppercase tracking-wider block">
            Specific Product Types in {activeSubcategory.name}:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={`/category/${category.slug}?subcategory=${activeSubcategory.slug}`}
              className={`px-2.5 py-1 rounded-lg text-xs transition ${
                !activeProductType
                  ? "bg-[#1C2A39] text-white font-bold"
                  : "bg-white border border-[#DDE2E6] text-[#333333] hover:border-[#FF5E00]"
              }`}
            >
              All {activeSubcategory.name}
            </Link>
            {activeSubcategory.productTypes.map((pt) => {
              const isSelected = activeProductType?.slug === pt.slug;
              return (
                <Link
                  key={pt.id}
                  href={`/category/${category.slug}?subcategory=${activeSubcategory.slug}&productType=${pt.slug}`}
                  className={`px-2.5 py-1 rounded-lg text-xs transition ${
                    isSelected
                      ? "bg-[#FF5E00] text-white font-bold shadow-xs"
                      : "bg-white border border-[#DDE2E6] text-[#333333] hover:border-[#FF5E00]"
                  }`}
                >
                  {pt.name} ({pt._count.products})
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Products Grid & Empty State */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-[#1C2A39]">
            {activeProductType
              ? `${activeProductType.name} Listings`
              : activeSubcategory
              ? `${activeSubcategory.name} Products`
              : `All ${category.name} Products`}
          </h2>
          <span className="text-xs text-[#777777] font-medium">
            Showing {products.length} of {total} items
          </span>
        </div>

        {products.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-[#DDE2E6] space-y-3 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-[#F7F9FA] text-[#777777] flex items-center justify-center mx-auto border border-[#DDE2E6]">
              <PackageOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#1C2A39]">
              No products found in this section
            </h3>
            <p className="text-xs text-[#777777] max-w-md mx-auto">
              We don&apos;t have any active listings under this specific category filter yet. Check back soon or explore other departments!
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="px-4 py-2 bg-[#FF5E00] hover:bg-[#FF8C00] text-white rounded-xl font-bold text-xs inline-block shadow-sm transition"
              >
                Browse All Marketplace Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
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
                category={category.name}
                seller={product.seller}
                inStock={product.stockQuantity > 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
