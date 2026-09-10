"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { formatDate, formatPrice } from "@/lib/utils";
import { ArrowRight, CheckCircle2, Clock, Package, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.orders) setOrders(data.orders);
      } catch (e) {
        console.error("Failed to load orders", e);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchOrders();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading your order history...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#1C2A39]">Please Sign In</h2>
        <p className="text-xs text-[#777777]">You need to be logged in to view your orders and track shipments.</p>
        <Link href="/login?redirect=/orders" className="inline-block px-4 py-2 bg-[#FF5E00] hover:bg-[#FF8C00] text-white rounded-xl text-xs font-bold transition active:scale-98">
          Log In to Account
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-[#DDE2E6]">
        <h1 className="text-2xl sm:text-3xl font-black text-[#1C2A39]">Your Orders</h1>
        <p className="text-xs text-[#777777] mt-1">
          Track packages, view receipts, and manage order returns
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#DDE2E6] text-center space-y-4">
          <div className="w-16 h-16 bg-[#F7F9FA] rounded-full flex items-center justify-center mx-auto text-[#777777] border border-[#DDE2E6]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#1C2A39]">No orders placed yet</h3>
          <p className="text-xs text-[#777777] max-w-sm mx-auto">
            Once you make a purchase on Fayzee, you can track its delivery lifecycle right here.
          </p>
          <Link
            href="/products"
            className="inline-block px-5 py-2.5 bg-[#FF5E00] hover:bg-[#FF8C00] text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-98"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-[#DDE2E6] p-5 sm:p-6 shadow-xs space-y-4 hover:border-[#FF5E00] transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#DDE2E6] gap-2">
                <div>
                  <span className="text-xs font-bold text-[#1C2A39]">
                    Order #{order.orderNumber}
                  </span>
                  <p className="text-[11px] text-[#777777]">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                      order.status === "DELIVERED"
                        ? "bg-emerald-100 text-emerald-700"
                        : order.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-xs font-black text-[#1C2A39]">
                    {formatPrice(order.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-2">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <img
                      src={
                        item.product.images[0]?.url ||
                        "/images/product-placeholder.svg"
                      }
                      alt=""
                      className="w-12 h-12 object-cover rounded-lg bg-[#F7F9FA] border border-[#DDE2E6]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[#1C2A39] truncate">{item.title}</h4>
                      <p className="text-[11px] text-[#777777]">
                        Qty: {item.quantity} • {formatPrice(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-[#777777] flex items-center gap-1.5 flex-wrap">
                  <span>Payment:</span>
                  <strong className="text-[#1C2A39]">
                    {order.paymentMethod === "COD"
                      ? "Cash on Delivery"
                      : order.paymentMethod === "ONLINE_CARD"
                      ? "Card (3D Secure)"
                      : order.paymentMethod === "JAZZ_CASH"
                      ? "JazzCash"
                      : order.paymentMethod === "EASYPAISA"
                      ? "EasyPaisa"
                      : order.paymentMethod}
                  </strong>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      order.paymentStatus === "PAID"
                        ? "bg-emerald-100 text-emerald-800"
                        : order.paymentStatus === "CANCELLED"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {order.paymentStatus === "PAID" ? "✓ Paid" : order.paymentStatus}
                  </span>
                </span>
                <Link
                  href={`/orders/${order.id}`}
                  className="text-xs font-bold text-[#FF5E00] hover:text-[#FF8C00] flex items-center gap-1 transition"
                >
                  <span>Track & View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
