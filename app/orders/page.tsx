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
        <h2 className="text-xl font-bold text-[#0B0F14]">Please Sign In</h2>
        <p className="text-xs text-[#8A8F98]">You need to be logged in to view your orders and track shipments.</p>
        <Link href="/login?redirect=/orders" className="inline-block px-5 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-white rounded-xl text-xs font-bold transition active:scale-98 shadow-sm border border-[#C8A96B]/30">
          Log In to Account
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-[#E8E5DC]">
        <h1 className="text-2xl sm:text-3xl font-black text-[#0B0F14]">Your Orders</h1>
        <p className="text-xs text-[#8A8F98] mt-1">
          Track packages, view receipts, and manage order returns
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#E8E5DC] text-center space-y-4 shadow-card">
          <div className="w-16 h-16 bg-[#F5F3EE] rounded-full flex items-center justify-center mx-auto text-[#8A8F98] border border-[#E8E5DC]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#0B0F14]">No orders placed yet</h3>
          <p className="text-xs text-[#8A8F98] max-w-sm mx-auto">
            Once you make a purchase on Fayzee, you can track its delivery lifecycle right here.
          </p>
          <Link
            href="/products"
            className="inline-block px-5 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] border border-[#C8A96B]/40 text-xs font-bold rounded-xl shadow-card transition active:scale-98"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-[#E8E5DC] p-5 sm:p-6 shadow-card space-y-4 hover:border-[#C8A96B] transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E8E5DC] gap-2">
                <div>
                  <span className="text-xs font-bold text-[#0B0F14]">
                    Order #{order.orderNumber}
                  </span>
                  <p className="text-[11px] text-[#8A8F98]">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                      order.status === "DELIVERED"
                        ? "bg-emerald-100 text-emerald-800"
                        : order.status === "CANCELLED"
                        ? "bg-red-100 text-red-800"
                        : "bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/30"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-xs font-black text-[#0B0F14]">
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
                      className="w-12 h-12 object-cover rounded-lg bg-[#F5F3EE] border border-[#E8E5DC]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[#0B0F14] truncate">{item.title}</h4>
                      <p className="text-[11px] text-[#8A8F98]">
                        Qty: {item.quantity} • {formatPrice(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-[#8A8F98] flex items-center gap-1.5 flex-wrap">
                  <span>Payment:</span>
                  <strong className="text-[#0B0F14]">
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
                  className="text-xs font-bold text-[#C8A96B] hover:text-[#D4B15A] flex items-center gap-1 transition"
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
