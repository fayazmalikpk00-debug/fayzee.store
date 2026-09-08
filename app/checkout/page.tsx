"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
  Tag,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, cartSubtotal, cartCount, refreshCart } = useCart();

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Pakistan",
  });

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE_CARD">("COD");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user?.name) {
      setAddress((prev) => ({
        ...prev,
        fullName: user.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const shippingTotal =
    cart?.items?.reduce((acc, item) => acc + (item.product?.shippingFee || 0), 0) || 0;
  const discountAmount = couponApplied ? couponApplied.discount : 0;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingTotal);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const code = couponCode.toUpperCase().trim();
    if (code === "FAYZEE10") {
      const disc = (cartSubtotal * 10) / 100;
      setCouponApplied({ code, discount: Math.min(disc, 3000) });
      setErrorMsg("");
    } else if (code === "WELCOME500") {
      if (cartSubtotal >= 3000) {
        setCouponApplied({ code, discount: 500 });
        setErrorMsg("");
      } else {
        setErrorMsg("Coupon WELCOME500 requires a minimum order of Rs. 3,000.");
      }
    } else {
      setErrorMsg("Invalid or expired coupon code.");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!user) {
      router.push(`/login?redirect=/checkout`);
      return;
    }

    if (!cart || cart.items.length === 0) {
      setErrorMsg("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: address,
          paymentMethod,
          couponCode: couponApplied?.code,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to place order.");
      }

      await refreshCart();
      router.push(`/orders/${data.order.id}?success=true`);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during checkout.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Preparing secure checkout...
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">No Items to Checkout</h2>
        <Link href="/products" className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
      <div className="pb-3 sm:pb-4 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 flex items-center gap-2">
          <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
          <span>Secure Checkout</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review your items, delivery details, and select a verified payment method
        </p>
      </div>

      {!user && (
        <div className="p-3.5 sm:p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>You are checking out as a guest. Log in to save orders to your profile.</span>
          <Link href="/login?redirect=/checkout" className="font-bold underline text-amber-900 shrink-0">
            Sign In Now
          </Link>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 sm:p-4 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Address & Payment Method */}
        <div className="lg:col-span-8 space-y-5 sm:space-y-6">
          {/* Step 1: Shipping Address */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-600 shrink-0" />
              <span>1. Delivery Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="+92 3XX XXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  placeholder="House / Apartment #, Street, Area"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="e.g. Lahore, Karachi, Islamabad"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">State / Province</label>
                <input
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="e.g. Punjab, Sindh, KPK"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-600 shrink-0" />
              <span>2. Payment Method</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Cash On Delivery Option */}
              <div
                onClick={() => setPaymentMethod("COD")}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between min-h-[90px] ${
                  paymentMethod === "COD"
                    ? "border-brand-600 bg-brand-50/50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Cash on Delivery (COD)</span>
                  <input
                    type="radio"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="text-brand-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Pay with physical cash when the courier arrives at your doorstep.
                </p>
              </div>

              {/* Online Payment Option */}
              <div
                onClick={() => setPaymentMethod("ONLINE_CARD")}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between min-h-[90px] ${
                  paymentMethod === "ONLINE_CARD"
                    ? "border-brand-600 bg-brand-50/50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Debit / Credit Card</span>
                  <input
                    type="radio"
                    checked={paymentMethod === "ONLINE_CARD"}
                    onChange={() => setPaymentMethod("ONLINE_CARD")}
                    className="text-brand-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Instant secure payment via Visa, Mastercard, or UnionPay.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Coupon */}
        <div className="lg:col-span-4 space-y-5 sm:space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-5 sm:space-y-6 lg:sticky lg:top-24">
            <h3 className="text-base font-bold text-slate-900 border-b pb-3">
              Order Summary ({cartCount} Items)
            </h3>

            {/* Item list preview */}
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1 -mr-1">
              {cart.items.map((item) => {
                const price =
                  item.variant?.salePrice ??
                  item.variant?.price ??
                  item.product?.salePrice ??
                  item.product?.price ??
                  0;
                return (
                  <div key={item.id} className="flex items-center gap-2.5 text-xs">
                    <img
                      src={
                        item.product.images[0]?.url ||
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100"
                      }
                      alt=""
                      className="w-10 h-10 object-cover rounded-lg bg-slate-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{item.product.title}</p>
                      <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-slate-800 shrink-0">{formatPrice(price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-brand-600 shrink-0" /> Have a Coupon Code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. FAYZEE10"
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 uppercase font-mono min-w-0"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3.5 sm:px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shrink-0 transition"
                >
                  Apply
                </button>
              </div>

              {couponApplied && (
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-700 flex items-center justify-between font-medium">
                  <span>Coupon {couponApplied.code} applied!</span>
                  <span className="font-bold">-{formatPrice(couponApplied.discount)}</span>
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">{formatPrice(cartSubtotal)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-bold">-{formatPrice(couponApplied.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span className="font-bold text-slate-900">
                  {shippingTotal === 0 ? "FREE" : formatPrice(shippingTotal)}
                </span>
              </div>
              <div className="border-t pt-2.5 flex justify-between text-sm font-black text-slate-900">
                <span>Grand Total</span>
                <span className="text-brand-700 text-base">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-3 sm:px-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-1.5 flex-wrap text-center disabled:opacity-50 min-h-[46px]"
            >
              {submitting ? (
                <span>Placing Order...</span>
              ) : (
                <>
                  <span>Confirm Order & Pay {formatPrice(grandTotal)}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </>
              )}
            </button>

            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 justify-center text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Authoritative Server-Validated Pricing</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
