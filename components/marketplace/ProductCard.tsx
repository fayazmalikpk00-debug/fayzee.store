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
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

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

  return (
    <div className="group relative bg-white rounded-2xl border border-[#DDE2E6] hover:border-[#FF5E00]/50 hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {discountPercent && discountPercent > 0 ? (
          <span className="px-2.5 py-0.5 bg-[#FF5E00] text-white text-xs font-extrabold rounded-md shadow-sm">
            -{discountPercent}%
          </span>
        ) : null}
      </div>

      {/* Wishlist toggle */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsLiked(!isLiked);
        }}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-xs text-slate-400 hover:text-red-500 transition shadow-xs"
        title="Save to Wishlist"
      >
        <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
      </button>

      {/* Image container */}
      <Link href={`/products/${slug}`} className="block relative aspect-square bg-[#F7F9FA] overflow-hidden">
        <img
          src={image || "/images/product-placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
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
              <div className="text-xs sm:text-sm text-[#777777] line-through truncate">
                {formatPrice(originalPrice)}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition shrink-0 min-w-[34px] min-h-[34px] ${
              added
                ? "bg-emerald-600 text-white shadow-xs"
                : inStock
                ? "bg-[#FF5E00] hover:bg-[#FF8C00] text-white shadow-xs"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
            title={inStock ? "Add to Cart" : "Out of Stock"}
            aria-label={inStock ? "Add to Cart" : "Out of Stock"}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Added</span>
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
