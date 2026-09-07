"use client";

import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, Heart, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function WishlistPage() {
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<any[]>([
    {
      id: "w-1",
      productId: "clv123",
      title: "Samsung Galaxy S24 Ultra 5G (12GB RAM, 256GB Storage)",
      slug: "samsung-galaxy-s24-ultra-5g-256gb",
      price: 369999,
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400",
      inStock: true,
    },
    {
      id: "w-2",
      productId: "clv124",
      title: "Sony WH-1000XM5 Wireless Industry-Leading Noise Canceling Headphones",
      slug: "sony-wh-1000xm5-wireless-noise-canceling-headphones",
      price: 74999,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
      inStock: true,
    },
  ]);

  const handleMoveToCart = async (item: any) => {
    await addToCart(item.productId, undefined, 1);
    setWishlistItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const handleRemove = (id: string) => {
    setWishlistItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          <span>My Wishlist</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Save your favorite products and purchase when ready
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-400">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500">
            Explore our products and tap the heart icon to save products for later.
          </p>
          <Link
            href="/products"
            className="inline-block px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-44 object-cover rounded-xl bg-slate-50 mb-3"
                />
                <Link
                  href={`/products/${item.slug}`}
                  className="text-xs font-bold text-slate-900 hover:text-brand-600 line-clamp-2"
                >
                  {item.title}
                </Link>
                <p className="text-sm font-black text-brand-700 mt-2">
                  {formatPrice(item.price)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleMoveToCart(item)}
                  className="flex-1 py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                </button>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition"
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
