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
        <h2 className="text-xl font-bold text-[#0B0F14]">Please Sign In</h2>
        <p className="text-xs text-[#8A8F98]">You must be logged in to view your account dashboard.</p>
        <Link href="/login?redirect=/account" className="inline-block px-5 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-white rounded-xl text-xs font-bold transition shadow-sm border border-[#C8A96B]/30">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-[#E8E5DC]">
        <h1 className="text-2xl sm:text-3xl font-black text-[#0B0F14]">My Account</h1>
        <p className="text-xs text-[#8A8F98] mt-1">
          Manage your personal profile, addresses, and platform roles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8E5DC] shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#0B0F14] text-[#C8A96B] font-black text-xl flex items-center justify-center shadow-md border border-[#C8A96B]/30">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-[#0B0F14] truncate">{user.name}</h3>
              <p className="text-xs text-[#8A8F98] truncate">{user.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-[#0B0F14] text-[#C8A96B] text-[10px] font-bold rounded-md border border-[#C8A96B]/30">
                {user.role}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E8E5DC] space-y-2 text-xs text-[#0B0F14]">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#8A8F98]" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#8A8F98]" />
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
            className="p-5 bg-white rounded-2xl border border-[#E8E5DC] hover:border-[#C8A96B] hover:shadow-card-hover transition space-y-2 group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0B0F14] text-[#C8A96B] flex items-center justify-center border border-[#C8A96B]/20">
              <Package className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-[#0B0F14] group-hover:text-[#C8A96B] transition text-sm">
              My Orders & Receipts
            </h4>
            <p className="text-xs text-[#8A8F98]">
              View past orders, track shipments, and request returns.
            </p>
          </Link>

          <Link
            href="/wishlist"
            className="p-5 bg-white rounded-2xl border border-[#E8E5DC] hover:border-[#C8A96B] hover:shadow-card-hover transition space-y-2 group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0B0F14] text-[#C8A96B] flex items-center justify-center border border-[#C8A96B]/20">
              <Heart className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-[#0B0F14] group-hover:text-[#C8A96B] transition text-sm">
              Wishlist & Saved Items
            </h4>
            <p className="text-xs text-[#8A8F98]">
              Browse products you've bookmarked for later.
            </p>
          </Link>

          <Link
            href="/account/following"
            className="p-5 bg-white rounded-2xl border border-[#E8E5DC] hover:border-[#C8A96B] hover:shadow-card-hover transition space-y-2 group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0B0F14] text-[#C8A96B] flex items-center justify-center border border-[#C8A96B]/20">
              <Store className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-[#0B0F14] group-hover:text-[#C8A96B] transition text-sm">
              Followed Stores & Seller Chats
            </h4>
            <p className="text-xs text-[#8A8F98]">
              View your favorite brands and direct messages with sellers.
            </p>
          </Link>

          {/* Role specific link: Seller */}
          {(user.role === "SELLER" || user.sellerProfile) && (
            <Link
              href="/seller/dashboard"
              className="p-5 bg-white rounded-2xl border border-[#E8E5DC] hover:border-[#C8A96B] transition space-y-2 group shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0B0F14] text-[#C8A96B] flex items-center justify-center border border-[#C8A96B]/20">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#0B0F14] group-hover:text-[#C8A96B] text-sm">Seller Center Dashboard</h4>
              <p className="text-xs text-[#8A8F98]">
                Manage your store listings, inventory, and order fulfillment.
              </p>
            </Link>
          )}

          {/* Role specific link: Admin */}
          {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <Link
              href="/admin/dashboard"
              className="p-5 bg-white rounded-2xl border border-[#E8E5DC] hover:border-[#0B0F14] transition space-y-2 group shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0B0F14] text-[#C8A96B] flex items-center justify-center border border-[#C8A96B]/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#0B0F14] text-sm">Admin Control Panel</h4>
              <p className="text-xs text-[#8A8F98]">
                Review seller applications, catalog moderation, and platform revenue.
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
