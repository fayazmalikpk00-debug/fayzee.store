"use client";

import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, Heart, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function WishlistPage() {
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  const handleMoveToCart = async (item: any) => {
    await addToCart(item.productId, undefined, 1);
    setWishlistItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const handleRemove = (id: string) => {
    setWishlistItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-[#DDE2E6]">
        <h1 className="text-2xl sm:text-3xl font-black text-[#1C2A39] flex items-center gap-2">
          <Heart className="w-6 h-6 text-[#DC2626] fill-[#DC2626]" />
          <span>My Wishlist</span>
        </h1>
        <p className="text-xs text-[#777777] mt-1">
          Save your favorite products and purchase when ready
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#DDE2E6] space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-400">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#1C2A39]">Your wishlist is empty</h3>
          <p className="text-xs text-[#777777]">
            Explore our products and tap the heart icon to save products for later.
          </p>
          <Link
            href="/products"
            className="inline-block px-5 py-2.5 bg-[#FF5E00] hover:bg-[#FF8C00] text-white text-xs font-bold rounded-xl transition"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#DDE2E6] p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-44 object-cover rounded-xl bg-[#F7F9FA] mb-3 border border-[#DDE2E6]"
                />
                <Link
                  href={`/products/${item.slug}`}
                  className="text-xs font-bold text-[#1C2A39] hover:text-[#FF5E00] line-clamp-2 transition"
                >
                  {item.title}
                </Link>
                <p className="text-sm font-black text-[#FF5E00] mt-2">
                  {formatPrice(item.price)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#DDE2E6] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleMoveToCart(item)}
                  className="flex-1 py-2 px-3 bg-[#FF5E00] hover:bg-[#FF8C00] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                </button>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-2 text-[#777777] hover:text-[#DC2626] rounded-xl hover:bg-red-50 transition"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
