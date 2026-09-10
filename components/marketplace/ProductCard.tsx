"use client";

import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import { Check, Heart, ShoppingBag, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  discountPercent?: number | null;
  rating: number;
  reviewCount: number;
  image?: string;
  category?: string;
  seller?: {
    storeName: string;
    storeSlug: string;
  };
  inStock?: boolean;
  isFeatured?: boolean;
}

export function ProductCard({
  id,
  title,
  slug,
  price,
  salePrice,
  discountPercent,
  rating,
  reviewCount,
  image,
  category,
  seller,
  inStock = true,
  isFeatured = false,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [sparkleActive, setSparkleActive] = useState(false);

  const displayPrice = salePrice || price;
  const originalPrice = salePrice ? price : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await addToCart(id, undefined, 1);
    if (ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isLiked;
    setIsLiked(nextState);
    if (nextState) {
      setSparkleActive(true);
      setTimeout(() => setSparkleActive(false), 800);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-[#DDE2E6] hover:border-[#FF5E00]/60 hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col overflow-hidden will-change-transform">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-col items-start gap-1.5 pointer-events-none">
        {isFeatured ? (
          <span className="px-2 py-0.5 bg-[#1C2A39]/95 backdrop-blur-xs text-[#FF8C00] text-[10px] font-black rounded-md border border-[#FF5E00]/50 shadow-xs flex items-center gap-1 animate-pulse-glow">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E00] animate-ping"></span>
            Sponsored Ad
          </span>
        ) : null}
        {discountPercent && discountPercent > 0 ? (
          <span className="px-2.5 py-1 bg-[#FF5E00] text-white text-xs font-black rounded-lg shadow-md animate-badge-wiggle inline-flex items-center justify-center">
            -{Math.round(discountPercent)}%
          </span>
        ) : null}
      </div>

      {/* Wishlist toggle */}
      <button
        onClick={handleLikeToggle}
        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/95 backdrop-blur-xs text-slate-400 hover:text-red-500 hover:scale-110 active:scale-75 transition-all duration-200 shadow-xs"
        title="Save to Wishlist"
      >
        <Heart
          className={`w-4 h-4 transition-transform duration-200 ${
            isLiked
              ? "fill-red-500 text-red-500 animate-heart-pop"
              : "hover:scale-110"
          }`}
        />
        {sparkleActive && (
          <span className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <span className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping -top-1" />
            <span className="absolute w-1.5 h-1.5 rounded-full bg-red-400 animate-ping -bottom-1" />
            <span className="absolute w-1.5 h-1.5 rounded-full bg-[#FF5E00] animate-ping -left-1" />
            <span className="absolute w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping -right-1" />
          </span>
        )}
      </button>

      {/* Image container */}
      <Link href={`/products/${slug}`} className="block relative aspect-square bg-[#F7F9FA] overflow-hidden">
        <img
          src={image || "/images/product-placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover object-center group-hover:scale-[1.08] transition-transform duration-500 ease-out"
          loading="lazy"
        />
      </Link>

      {/* Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {seller && (
            <Link
              href={`/sellers/${seller.storeSlug}`}
              className="text-xs font-medium text-[#777777] hover:text-[#FF5E00] truncate block mb-1"
            >
              Store: {seller.storeName}
            </Link>
          )}

          <Link href={`/products/${slug}`} className="block">
            <h3 className="text-sm sm:text-base font-bold text-[#1C2A39] group-hover:text-[#FF5E00] transition line-clamp-2 leading-snug">
              {title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5 sm:mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#333333]">{rating.toFixed(1)}</span>
            <span className="text-xs text-[#777777]">({reviewCount})</span>
          </div>
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-sm sm:text-base md:text-lg font-black text-[#FF5E00] truncate">
              {formatPrice(displayPrice)}
            </div>
            {originalPrice && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm text-[#777777] line-through truncate">
                  {formatPrice(originalPrice)}
                </span>
                {discountPercent && discountPercent > 0 ? (
                  <span className="text-[10px] font-extrabold text-[#FF5E00] bg-[#FF5E00]/10 border border-[#FF5E00]/20 px-1.5 py-0.2 rounded shrink-0">
                    -{Math.round(discountPercent)}%
                  </span>
                ) : null}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 shrink-0 min-w-[34px] min-h-[34px] ${
              added
                ? "bg-emerald-600 text-white shadow-md scale-105"
                : inStock
                ? "bg-[#FF5E00] hover:bg-[#FF8C00] active:scale-90 text-white shadow-xs hover:shadow-md"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
            title={inStock ? "Add to Cart" : "Out of Stock"}
            aria-label={inStock ? "Add to Cart" : "Out of Stock"}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 animate-bounce" />
                <span className="hidden sm:inline">Added!</span>
              </>
            ) : inStock ? (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </>
            ) : (
              <span className="text-xs">Sold Out</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
