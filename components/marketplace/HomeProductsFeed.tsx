"use client";

import { ProductCard } from "@/components/marketplace/ProductCard";
import { ProductSkeletonGrid } from "@/components/marketplace/ProductSkeleton";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Grid,
  Layers,
  Loader2,
  PackageOpen,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  _count?: {
    products: number;
  };
}

export interface HomeProductsFeedProps {
  initialProducts: any[];
  totalCount: number;
  categories: CategoryItem[];
}

export function HomeProductsFeed({
  initialProducts,
  totalCount,
  categories,
}: HomeProductsFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [showCategoriesGrid, setShowCategoriesGrid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Infinite Scroll State
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(totalCount);
  const [hasMore, setHasMore] = useState<boolean>(initialProducts.length < totalCount);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Horizontal Slider state for Categories
  const catsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollCatLeft, setCanScrollCatLeft] = useState(false);
  const [canScrollCatRight, setCanScrollCatRight] = useState(false);

  const checkCatScroll = useCallback(() => {
    if (catsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = catsScrollRef.current;
      setCanScrollCatLeft(scrollLeft > 6);
      setCanScrollCatRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  }, []);

  useEffect(() => {
    checkCatScroll();
    const handleResize = () => checkCatScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkCatScroll, categories]);

  const handleCatScroll = (direction: "left" | "right") => {
    if (catsScrollRef.current) {
      const offset = direction === "left" ? -260 : 260;
      catsScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
      setTimeout(checkCatScroll, 350);
    }
  };

  const loadMoreProducts = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const url =
        selectedCategory === "all"
          ? `/api/products?page=${nextPage}&limit=16`
          : `/api/products?category=${encodeURIComponent(selectedCategory)}&page=${nextPage}&limit=16`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const newItems = data.products || [];
        if (newItems.length > 0) {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const unique = newItems.filter((p: any) => !existingIds.has(p.id));
            return [...prev, ...unique];
          });
          setPage(nextPage);
          if (data.total !== undefined) setTotal(data.total);
          setHasMore(newItems.length >= 16 && (products.length + newItems.length < (data.total || total)));
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more products:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, isLoading, isLoadingMore, hasMore, selectedCategory, products.length, total]);

  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          loadMoreProducts();
        }
      },
      { rootMargin: "350px" }
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [loadMoreProducts, hasMore, isLoading, isLoadingMore]);

  const handleCategorySelect = async (slug: string) => {
    if (selectedCategory === slug) return;
    setSelectedCategory(slug);
    setPage(1);

    if (slug === "all") {
      setProducts(initialProducts);
      setTotal(totalCount);
      setHasMore(initialProducts.length < totalCount);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/products?category=${encodeURIComponent(slug)}&page=1&limit=16`);
      if (res.ok) {
        const data = await res.json();
        const newItems = data.products || [];
        setProducts(newItems);
        const catTotal = data.total ?? newItems.length;
        setTotal(catTotal);
        setHasMore(newItems.length >= 16 && newItems.length < catTotal);
      }
    } catch (err) {
      console.error("Failed to load category products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);

  return (
    <section className="space-y-6" id="all-products">
      {/* 1. Section Header with Live Title & On-Demand Categories Button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E8E5DC]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B0F14] text-xs font-bold text-[#C8A96B] border border-[#C8A96B]/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Marketplace Catalog</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0B0F14] flex items-center gap-2.5">
            <span>All Products</span>
            <span className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full bg-[#F5F3EE] text-[#0B0F14] border border-[#E8E5DC]">
              {selectedCategory === "all" ? `${totalCount} items` : `${products.length} items`}
            </span>
          </h2>
          <p className="text-sm text-[#8A8F98] mt-1">
            Browse authentic electronics, fashion, appliances, and footwear directly from verified sellers
          </p>
        </div>

        {/* Action Controls: Toggle Categories & View All Catalog */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowCategoriesGrid((prev) => !prev)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs ${
              showCategoriesGrid
                ? "bg-[#0B0F14] text-white"
                : "bg-white text-[#0B0F14] border border-[#E8E5DC] hover:border-[#0B0F14]"
            }`}
          >
            <Grid className="w-4 h-4 text-[#C8A96B]" />
            <span>{showCategoriesGrid ? "Hide Categories" : `Browse Categories (${categories.length})`}</span>
            {showCategoriesGrid ? (
              <ChevronUp className="w-4 h-4 text-[#C8A96B]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#8A8F98]" />
            )}
          </button>

          <Link
            href="/products"
            className="px-4 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-white text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs border border-[#0B0F14]"
          >
            <span>Full Catalog</span>
            <ArrowRight className="w-4 h-4 text-[#C8A96B]" />
          </Link>
        </div>
      </div>

      {/* 2. On-Demand Expandable Category Grid (Shown ONLY when user clicks) */}
      {showCategoriesGrid && (
        <div className="p-5 sm:p-6 bg-[#F5F3EE] rounded-3xl border border-[#E8E5DC] shadow-inner space-y-4 animate-slide-down">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#C8A96B]" />
              <h3 className="text-base sm:text-lg font-black text-[#0B0F14]">
                Select a Department to Filter Products
              </h3>
            </div>
            <button
              onClick={() => setShowCategoriesGrid(false)}
              className="text-xs text-[#8A8F98] hover:text-[#0B0F14] flex items-center gap-1 font-semibold transition"
            >
              <X className="w-3.5 h-3.5" /> Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    handleCategorySelect(cat.slug);
                    setShowCategoriesGrid(false);
                  }}
                  className={`group p-3 rounded-2xl border text-left transition-all flex flex-col items-center text-center gap-2 ${
                    isSelected
                      ? "bg-[#0B0F14] border-[#0B0F14] text-white shadow-md"
                      : "bg-white border-[#E8E5DC] hover:border-[#C8A96B] hover:shadow-card-hover text-[#0B0F14]"
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F5F3EE] overflow-hidden shrink-0 border border-[#E8E5DC]">
                    <img
                      src={cat.image || "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=150"}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                  </div>
                  <div className="min-w-0 w-full">
                    <p
                      className={`text-xs font-bold truncate transition ${
                        isSelected ? "text-[#C8A96B]" : "group-hover:text-[#C8A96B]"
                      }`}
                    >
                      {cat.name}
                    </p>
                    <span
                      className={`text-[11px] block mt-0.5 ${
                        isSelected ? "text-slate-300" : "text-[#8A8F98]"
                      }`}
                    >
                      {cat._count?.products || 0} items
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Quick Horizontal Category Filter Pills with Slide Controls */}
      <div className="relative group/cats">
        {/* Left Slide Button */}
        {canScrollCatLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pr-3 bg-gradient-to-r from-[#FAF9F6] via-[#FAF9F6]/90 to-transparent pointer-events-none">
            <button
              type="button"
              onClick={() => handleCatScroll("left")}
              className="pointer-events-auto w-8 h-8 rounded-full bg-white border border-[#E8E5DC] text-[#0B0F14] shadow-md hover:bg-[#0B0F14] hover:text-[#C8A96B] hover:border-[#0B0F14] flex items-center justify-center transition active:scale-90"
              title="Slide Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        <div
          ref={catsScrollRef}
          onScroll={checkCatScroll}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1 pt-1 px-1"
        >
          <button
            type="button"
            onClick={() => handleCategorySelect("all")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-2xs flex items-center gap-1.5 shrink-0 ${
              selectedCategory === "all"
                ? "bg-[#0B0F14] text-white shadow-md border border-[#0B0F14]"
                : "bg-white text-[#0B0F14] border border-[#E8E5DC] hover:border-[#0B0F14]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>All Products</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedCategory === "all" ? "bg-white/20 text-[#C8A96B]" : "bg-[#F5F3EE] text-[#0B0F14]"
              }`}
            >
              {totalCount}
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.slug)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shadow-2xs flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? "bg-[#0B0F14] text-[#C8A96B] shadow-md font-bold border border-[#0B0F14]"
                    : "bg-white text-[#0B0F14] border border-[#E8E5DC] hover:border-[#0B0F14]"
                }`}
              >
                <span>{cat.name}</span>
                {cat._count?.products !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected ? "bg-white/10 text-[#C8A96B]" : "bg-[#F5F3EE] text-[#8A8F98]"
                    }`}
                  >
                    {cat._count.products}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Slide Button */}
        {canScrollCatRight && (
          <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pl-3 bg-gradient-to-l from-[#FAF9F6] via-[#FAF9F6]/90 to-transparent pointer-events-none">
            <button
              type="button"
              onClick={() => handleCatScroll("right")}
              className="pointer-events-auto w-8 h-8 rounded-full bg-white border border-[#E8E5DC] text-[#0B0F14] shadow-md hover:bg-[#0B0F14] hover:text-[#C8A96B] hover:border-[#0B0F14] flex items-center justify-center transition active:scale-90"
              title="Slide Right to View More Categories"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 4. Active Category Indicator (If filtered) */}
      {selectedCategory !== "all" && activeCategoryObj && (
        <div className="flex items-center justify-between bg-white border border-[#E8E5DC] px-4 py-2 rounded-xl text-xs sm:text-sm text-[#0B0F14] shadow-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="text-[#8A8F98]">Filtered by:</span>
            <span className="font-black text-[#0B0F14]">{activeCategoryObj.name}</span>
            <span className="text-xs text-[#8A8F98]">({products.length} products found)</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/category/${activeCategoryObj.slug}`}
              className="text-xs font-bold text-[#0B0F14] hover:text-[#C8A96B] hover:underline transition"
            >
              Open Category Page →
            </Link>
            <button
              type="button"
              onClick={() => handleCategorySelect("all")}
              className="text-xs text-red-600 font-bold hover:underline ml-2"
            >
              Reset Filter
            </button>
          </div>
        </div>
      )}

      {/* 5. Products Grid or Loading State */}
      {isLoading ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0B0F14] pb-1">
            <Loader2 className="w-4 h-4 animate-spin text-[#C8A96B]" />
            <span>Fetching department products...</span>
          </div>
          <ProductSkeletonGrid count={8} />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
              image={product.images?.[0]?.url}
              category={product.category?.name}
              seller={product.seller}
              inStock={product.stockQuantity > 0}
              isFeatured={Boolean(product.isFeatured)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#E8E5DC] space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#0B0F14] text-[#C8A96B] flex items-center justify-center mx-auto border border-[#C8A96B]/30">
            <PackageOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#0B0F14]">No products in this category</h3>
          <p className="text-sm text-[#8A8F98] max-w-md mx-auto">
            We haven't listed items in this category yet. Check back soon or explore our other departments.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleCategorySelect("all")}
              className="inline-block px-5 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-white text-sm font-bold rounded-xl transition shadow-xs border border-[#0B0F14]"
            >
              Show All Products
            </button>
          </div>
        </div>
      )}

      {/* Sentinel for Infinite Scroll */}
      <div ref={observerRef} className="h-6 w-full" />

      {/* Loading More Indicator with Daraz Shimmer Skeleton */}
      {isLoadingMore && (
        <div className="space-y-4 pt-2">
          <ProductSkeletonGrid count={4} />
          <div className="py-2 text-center flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#C8A96B]" />
            <span className="text-xs font-bold text-[#8A8F98]">Loading more items...</span>
          </div>
        </div>
      )}

      {/* End of Catalog Indicator */}
      {!hasMore && products.length > 0 && (
        <div className="pt-4 pb-2 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#E8E5DC] text-xs text-[#8A8F98] font-semibold">
            <span>✓ You have viewed all {products.length} products</span>
          </div>
        </div>
      )}

      {/* 6. Bottom Banner: View Full Catalog */}
      <div className="pt-4 flex justify-center">
        <Link
          href="/products"
          className="px-8 py-3.5 bg-white hover:bg-[#F5F3EE] text-[#0B0F14] border-2 border-[#E8E5DC] hover:border-[#0B0F14] font-extrabold text-sm sm:text-base rounded-2xl transition-all shadow-xs flex items-center gap-2 group"
        >
          <span>Explore All {totalCount} Marketplace Products</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200 text-[#C8A96B]" />
        </Link>
      </div>
    </section>
  );
}
