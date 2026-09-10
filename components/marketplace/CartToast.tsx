"use client";

import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, CheckCircle2, ShoppingBag, X } from "lucide-react";
import Link from "next/link";

export function CartToast() {
  const { toastItem, dismissToast } = useCart();

  if (!toastItem) return null;

  return (
    <div className="fixed top-20 sm:top-24 right-3 sm:right-6 z-50 max-w-sm w-[calc(100vw-24px)] sm:w-96 animate-toast-slide">
      <div className="bg-[#1C2A39]/95 backdrop-blur-xl border border-white/20 text-white rounded-2xl p-3.5 shadow-2xl flex items-center gap-3">
        {/* Thumbnail */}
        <div className="w-12 h-12 rounded-xl bg-white/10 overflow-hidden shrink-0 border border-white/10 relative">
          {toastItem.image ? (
            <img
              src={toastItem.image}
              alt={toastItem.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Added to Cart!</span>
          </div>
          <p className="text-xs font-bold text-white truncate mt-0.5">
            {toastItem.title}
          </p>
          <p className="text-xs font-extrabold text-[#FF5E00] mt-0.5">
            {formatPrice(toastItem.price)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href="/cart"
            onClick={dismissToast}
            className="px-3 py-1.5 bg-[#FF5E00] hover:bg-[#FF8C00] active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1 shrink-0"
          >
            <span>Cart</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={dismissToast}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
