"use client";

import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cart, cartCount, cartSubtotal, updateQuantity, removeItem, clearCart, loading } = useCart();

  const shippingTotal =
    cart?.items?.reduce((acc, item) => acc + (item.product?.shippingFee || 0), 0) || 0;
  const grandTotal = cartSubtotal + shippingTotal;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-xs text-[#8A8F98]">Loading your shopping cart...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center space-y-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#0B0F14] rounded-full flex items-center justify-center mx-auto text-[#C8A96B] border border-[#C8A96B]/20 shadow-md">
          <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#0B0F14]">Your Cart is Empty</h1>
        <p className="text-xs text-[#8A8F98] max-w-sm mx-auto">
          Explore our verified luxury tech, apparel, and lifestyle selections to add items to your cart.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B0F14] hover:bg-[#1A222C] text-white font-bold text-xs rounded-full shadow-md transition active:scale-98 border border-[#0B0F14]"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4 text-[#C8A96B]" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#E8E5DC] gap-2">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0B0F14] truncate">
            Shopping Cart
          </h1>
          <p className="text-xs text-[#8A8F98] mt-0.5">
            {cartCount} item{cartCount > 1 ? "s" : ""} selected for checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline flex items-center gap-1 shrink-0 p-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" /> <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-3 sm:space-y-4">
          {cart.items.map((item) => {
            const price =
              item.variant?.salePrice ??
              item.variant?.price ??
              item.product?.salePrice ??
              item.product?.price ??
              0;
            const lineTotal = price * item.quantity;

            return (
              <div
                key={item.id}
                className="p-3.5 sm:p-5 bg-white rounded-2xl border border-[#E8E5DC] shadow-subtle hover:border-[#C8A96B]/40 transition flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
              >
                {/* Mobile Top Row: Image & Info */}
                <div className="flex items-start gap-3 w-full sm:w-auto flex-1 min-w-0">
                  <img
                    src={
                      item.product?.images[0]?.url ||
                      "/images/product-placeholder.svg"
                    }
                    alt={item.product.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shrink-0 bg-[#F5F3EE] border border-[#E8E5DC]"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        {item.product.seller && (
                          <span className="text-[10px] font-bold text-[#8A8F98] block uppercase truncate">
                            Seller: {item.product.seller.storeName}
                          </span>
                        )}
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="text-xs sm:text-sm font-bold text-[#0B0F14] hover:text-[#C8A96B] line-clamp-2 leading-snug transition"
                        >
                          {item.product.title}
                        </Link>
                      </div>

                      {/* Remove button on mobile top-right */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="sm:hidden p-1.5 text-[#8A8F98] hover:text-red-500 transition shrink-0"
                        title="Remove Item"
                        aria-label="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.variant && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {item.variant.size && (
                          <span className="px-2 py-0.5 bg-[#0B0F14] border border-[#C8A96B]/30 text-[#C8A96B] text-[10px] font-black rounded-md flex items-center gap-1">
                            <span>Size:</span>
                            <span>{item.variant.size}</span>
                          </span>
                        )}
                        {item.variant.color && (
                          <span className="px-2 py-0.5 bg-[#F5F3EE] border border-[#E8E5DC] text-[#0B0F14] text-[10px] font-bold rounded-md flex items-center gap-1">
                            <span>Color:</span>
                            <span>{item.variant.color}</span>
                          </span>
                        )}
                        {!item.variant.size && !item.variant.color && (
                          <span className="px-2 py-0.5 bg-[#F5F3EE] border border-[#E8E5DC] text-[#0B0F14] text-[10px] font-semibold rounded-md truncate max-w-full">
                            Variant: {item.variant.name}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-xs font-black text-[#0B0F14] mt-1">
                      {formatPrice(price)}
                    </div>
                  </div>
                </div>

                {/* Bottom Row on Mobile / Right Column on Desktop: Quantity & Total */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-2 sm:gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8E5DC]">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-[#E8E5DC] rounded-xl bg-[#F5F3EE]">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 text-[#0B0F14] hover:text-[#C8A96B] min-w-[34px] min-h-[34px] flex items-center justify-center transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2.5 text-xs font-bold text-[#0B0F14] min-w-[24px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 text-[#0B0F14] hover:text-[#C8A96B] min-w-[34px] min-h-[34px] flex items-center justify-center transition"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line total and desktop remove icon */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-[#0B0F14]">
                      {formatPrice(lineTotal)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="hidden sm:block p-1 text-[#8A8F98] hover:text-red-500 transition"
                      title="Remove Item"
                      aria-label="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Checkout Card */}
        <div className="lg:col-span-4">
          <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#E8E5DC] shadow-subtle space-y-5 sm:space-y-6 lg:sticky lg:top-24">
            <h3 className="text-base font-bold text-[#0B0F14] border-b border-[#E8E5DC] pb-3">Order Summary</h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-[#8A8F98]">
                <span>Subtotal ({cartCount} items)</span>
                <span className="font-bold text-[#0B0F14]">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-[#8A8F98]">
                <span>Estimated Shipping</span>
                <span className="font-bold text-[#0B0F14]">
                  {shippingTotal === 0 ? "FREE" : formatPrice(shippingTotal)}
                </span>
              </div>
              <div className="flex justify-between text-[#8A8F98]">
                <span>Sales Tax</span>
                <span className="font-bold text-emerald-600">Included</span>
              </div>
              <div className="border-t border-[#E8E5DC] pt-3 flex justify-between text-sm font-black text-[#0B0F14]">
                <span>Total Amount</span>
                <span className="text-[#0B0F14] text-base">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-3.5 px-4 bg-[#0B0F14] hover:bg-[#1A222C] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 min-h-[46px] active:scale-98 border border-[#0B0F14]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-[#C8A96B]" />
            </Link>

            <div className="flex items-center gap-2 text-[11px] text-[#8A8F98] pt-2 border-t border-[#E8E5DC]">
              <ShieldCheck className="w-4 h-4 text-[#C8A96B] shrink-0" />
              <span>Safe & Secure 256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
