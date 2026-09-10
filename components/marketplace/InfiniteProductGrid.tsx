"use client";

import { ProductCard } from "@/components/marketplace/ProductCard";
import { ProductSkeletonGrid } from "@/components/marketplace/ProductSkeleton";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export interface InfiniteProductGridProps {
  initialProducts: any[];
  totalCount: number;
  queryParams: Record<string, any>;
}

export function InfiniteProductGrid({
  initialProducts,
  totalCount,
  queryParams,
}: InfiniteProductGridProps) {
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(initialProducts.length < totalCount);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // When filters or initialProducts change from URL navigation, reset state
  useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
    setHasMore(initialProducts.length < totalCount);
  }, [initialProducts, totalCount]);

  const loadMoreProducts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "" && key !== "page") {
          params.set(key, String(val));
        }
      });
      params.set("page", String(nextPage));
      params.set("limit", "12");

      const res = await fetch(`/api/products?${params.toString()}`);
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
          setHasMore(newItems.length >= 12 && products.length + newItems.length < totalCount);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more catalog products:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, isLoadingMore, hasMore, queryParams, products.length, totalCount]);

  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoadingMore) {
          loadMoreProducts();
        }
      },
      { rootMargin: "350px" }
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [loadMoreProducts, hasMore, isLoadingMore]);

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-[#DDE2E6] space-y-4">
        <div className="w-16 h-16 bg-[#F7F9FA] rounded-full flex items-center justify-center mx-auto text-[#777777] border border-[#DDE2E6]">
          🔍
        </div>
        <h3 className="text-base font-bold text-[#1C2A39]">No products found</h3>
        <p className="text-xs text-[#777777] max-w-sm mx-auto">
          We couldn&apos;t find any products matching your current filters. Try relaxing your search criteria or explore other departments.
        </p>
        <Link
          href="/products"
          className="inline-block px-4 py-2 bg-[#FF5E00] hover:bg-[#FF8C00] text-white text-xs font-bold rounded-xl transition shadow-xs"
        >
          Reset All Filters
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            image={product.images?.[0]?.url}
            category={product.category?.name}
            seller={product.seller}
            inStock={product.stockQuantity > 0}
            isFeatured={Boolean(product.isFeatured)}
          />
        ))}
      </div>

      {/* Sentinel for auto-load */}
      <div ref={observerRef} className="h-6 w-full" />

      {/* Loading More Indicator with Daraz Shimmer Skeleton */}
      {isLoadingMore && (
        <div className="space-y-4 pt-2">
          <ProductSkeletonGrid count={3} columns="grid-cols-2 md:grid-cols-3" />
          <div className="py-2 text-center flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#FF5E00]" />
            <span className="text-xs font-bold text-[#777777]">Loading more products...</span>
          </div>
        </div>
      )}

      {/* End of catalog indicator */}
      {!hasMore && products.length > 0 && (
        <div className="pt-6 pb-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F7F9FA] border border-[#DDE2E6] text-xs text-[#777777] font-semibold">
            <span>✓ You have viewed all {products.length} products</span>
          </div>
        </div>
      )}
    </div>
  );
}
