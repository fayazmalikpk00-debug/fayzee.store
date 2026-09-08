"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { formatPrice } from "@/lib/utils";
import {
  Heart,
  Lock,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading account details...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#1C2A39]">Please Sign In</h2>
        <p className="text-xs text-[#777777]">You must be logged in to view your account dashboard.</p>
        <Link href="/login?redirect=/account" className="inline-block px-5 py-2.5 bg-[#FF5E00] hover:bg-[#FF8C00] text-white rounded-xl text-xs font-bold transition">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-[#DDE2E6]">
        <h1 className="text-2xl sm:text-3xl font-black text-[#1C2A39]">My Account</h1>
        <p className="text-xs text-[#777777] mt-1">
          Manage your personal profile, addresses, and platform roles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#DDE2E6] shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#1C2A39] text-white font-black text-xl flex items-center justify-center shadow-md">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-[#1C2A39] truncate">{user.name}</h3>
              <p className="text-xs text-[#777777] truncate">{user.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-orange-50 text-[#FF5E00] text-[10px] font-bold rounded-md border border-orange-200">
                {user.role}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#DDE2E6] space-y-2 text-xs text-[#333333]">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#777777]" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#777777]" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="w-full py-2.5 text-xs text-red-600 hover:bg-red-50 font-bold rounded-xl border border-red-200 transition"
          >
            Sign Out
          </button>
        </div>

        {/* Quick Navigation Cards */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/orders"
            className="p-5 bg-white rounded-2xl border border-[#DDE2E6] hover:border-[#FF5E00] hover:shadow-card-hover transition space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5E00] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-[#1C2A39] group-hover:text-[#FF5E00] transition text-sm">
              My Orders & Receipts
            </h4>
            <p className="text-xs text-[#777777]">
              View past orders, track shipments, and request returns.
            </p>
          </Link>

          <Link
            href="/wishlist"
            className="p-5 bg-white rounded-2xl border border-[#DDE2E6] hover:border-[#FF5E00] hover:shadow-card-hover transition space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5E00] flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-[#1C2A39] group-hover:text-[#FF5E00] transition text-sm">
              Wishlist & Saved Items
            </h4>
            <p className="text-xs text-[#777777]">
              Browse products you've bookmarked for later.
            </p>
          </Link>

          {/* Role specific link: Seller */}
          {(user.role === "SELLER" || user.sellerProfile) && (
            <Link
              href="/seller/dashboard"
              className="p-5 bg-[#F7F9FA] rounded-2xl border border-[#DDE2E6] hover:border-[#FF5E00] transition space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FF5E00] text-white flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#1C2A39] group-hover:text-[#FF5E00] text-sm">Seller Center Dashboard</h4>
              <p className="text-xs text-[#333333]">
                Manage your store listings, inventory, and order fulfillment.
              </p>
            </Link>
          )}

          {/* Role specific link: Admin */}
          {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <Link
              href="/admin/dashboard"
              className="p-5 bg-[#F7F9FA] rounded-2xl border border-[#DDE2E6] hover:border-[#1C2A39] transition space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1C2A39] text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#1C2A39] text-sm">Admin Control Panel</h4>
              <p className="text-xs text-[#333333]">
                Review seller applications, catalog moderation, and platform revenue.
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
