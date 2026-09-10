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
        className="flex items-center space-x-1.5 text-xs text-[#8A8F98] overflow-x-auto no-scrollbar py-1"
      >
        <Link href="/" className="hover:text-[#0B0F14] transition shrink-0 font-medium">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#8A8F98]/60 shrink-0" />
        <Link
          href={`/category/${category.slug}`}
          className={`hover:text-[#0B0F14] transition shrink-0 font-medium ${
            !activeSubcategory ? "text-[#0B0F14] font-bold" : ""
          }`}
        >
          {category.name}
        </Link>

        {activeSubcategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-[#8A8F98]/60 shrink-0" />
            <Link
              href={`/category/${category.slug}?subcategory=${activeSubcategory.slug}`}
              className={`hover:text-[#0B0F14] transition shrink-0 font-medium ${
                !activeProductType ? "text-[#0B0F14] font-bold" : ""
              }`}
            >
              {activeSubcategory.name}
            </Link>
          </>
        )}

        {activeProductType && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-[#8A8F98]/60 shrink-0" />
            <span className="text-[#0B0F14] font-bold shrink-0">
              {activeProductType.name}
            </span>
          </>
        )}
      </nav>

      {/* 2. Category Hero Banner */}
      <div className="bg-[#0B0F14] text-white p-6 sm:p-8 rounded-3xl space-y-3 relative overflow-hidden shadow-card border border-[#1A222C]">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[#C8A96B] text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs border border-[#C8A96B]/20">
              Department
            </span>
            <span className="text-xs text-[#8A8F98] font-medium">
              {category.subcategories.length} Subcategories
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
            {category.name}
            {activeSubcategory && (
              <span className="text-lg sm:text-2xl text-[#8A8F98] font-medium">
                / {activeSubcategory.name}
              </span>
            )}
            {activeProductType && (
              <span className="text-base sm:text-xl text-[#C8A96B] font-normal">
                / {activeProductType.name}
              </span>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-[#8A8F98] max-w-2xl leading-relaxed">
            {activeSubcategory?.description ||
              category.description ||
              `Discover verified authentic products across ${category.name} with express delivery across Pakistan.`}
          </p>

          <p className="text-xs text-[#C8A96B] font-bold pt-1">
            ⚡ {total} authentic products listed in this section
          </p>
        </div>
      </div>

      {/* 3. Subcategories Filter Pills */}
      {category.subcategories.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#0B0F14] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span>Browse Subcategories</span>
            </h3>
            {activeSubcategory && (
              <Link
                href={`/category/${category.slug}`}
                className="text-[11px] font-bold text-[#C8A96B] hover:text-[#D4B15A] hover:underline"
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
                  ? "bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/50 shadow-xs"
                  : "bg-white border border-[#E8E5DC] text-[#0B0F14] hover:border-[#0B0F14]"
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
                      ? "bg-[#0B0F14] text-[#C8A96B] font-bold border border-[#C8A96B]/50 shadow-xs"
                      : "bg-white border border-[#E8E5DC] text-[#0B0F14] hover:border-[#0B0F14]"
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
        <div className="p-3.5 bg-white rounded-2xl border border-[#E8E5DC] space-y-2 shadow-xs">
          <span className="text-[11px] font-bold text-[#0B0F14] uppercase tracking-wider block">
            Specific Product Types in {activeSubcategory.name}:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={`/category/${category.slug}?subcategory=${activeSubcategory.slug}`}
              className={`px-2.5 py-1 rounded-lg text-xs transition ${
                !activeProductType
                  ? "bg-[#0B0F14] text-[#C8A96B] font-bold border border-[#C8A96B]/40"
                  : "bg-[#F5F3EE] border border-[#E8E5DC] text-[#0B0F14] hover:border-[#0B0F14]"
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
                      ? "bg-[#0B0F14] text-[#C8A96B] font-bold border border-[#C8A96B]/40 shadow-xs"
                      : "bg-[#F5F3EE] border border-[#E8E5DC] text-[#0B0F14] hover:border-[#0B0F14]"
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
          <h2 className="text-base sm:text-lg font-bold text-[#0B0F14]">
            {activeProductType
              ? `${activeProductType.name} Listings`
              : activeSubcategory
              ? `${activeSubcategory.name} Products`
              : `All ${category.name} Products`}
          </h2>
          <span className="text-xs text-[#8A8F98] font-medium">
            Showing {products.length} of {total} items
          </span>
        </div>

        {products.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-[#E8E5DC] space-y-3 shadow-card">
            <div className="w-14 h-14 rounded-2xl bg-[#F5F3EE] text-[#8A8F98] flex items-center justify-center mx-auto border border-[#E8E5DC]">
              <PackageOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#0B0F14]">
              No products found in this section
            </h3>
            <p className="text-xs text-[#8A8F98] max-w-md mx-auto">
              We don&apos;t have any active listings under this specific category filter yet. Check back soon or explore other departments!
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="px-4 py-2 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] border border-[#C8A96B]/40 rounded-xl font-bold text-xs inline-block shadow-sm transition"
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
