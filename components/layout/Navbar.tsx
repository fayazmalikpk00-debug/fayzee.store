"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  User as UserIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-subtle">
      {/* Top micro-bar */}
      <div className="bg-fayzee-dark text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            ⚡ Ramadan & Spring Flash Deals Live Now!
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-400">Shop Smart. Shop Easy.</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/seller/register" className="hover:text-white transition flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-fayzee-cyan" />
            <span>Become a Seller</span>
          </Link>
          <span className="text-slate-700">|</span>
          <Link href="/help" className="hover:text-white transition">
            Help Center
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fayzee-dark via-brand-600 to-fayzee-coral flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition">
            F
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-fayzee-dark to-brand-600 bg-clip-text text-transparent">
              Fayzee
            </span>
            <span className="block text-[9px] font-medium tracking-wider text-slate-600 uppercase">
              Shop Smart • Easy
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-2xl relative hidden md:block"
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across 10,000+ authentic electronics, fashion, and home goods..."
              className="w-full pl-11 pr-24 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-900 rounded-full border border-slate-200 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-semibold rounded-full shadow-sm transition"
            >
              Search
            </button>
          </div>
        </form>

        {/* Action icons */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-full transition relative hidden sm:flex items-center"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
          </Link>

          {/* Cart with dynamic badge */}
          <Link
            href="/cart"
            className="p-2 text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-full transition relative flex items-center"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-fayzee-coral text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Profile / Auth State */}
          <div className="relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full border border-slate-200 hover:border-brand-500 transition focus:outline-none bg-slate-50"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-700 hidden lg:inline max-w-[100px] truncate">
                    {user.name}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-brand-50 text-brand-700 font-semibold text-[10px] rounded-md">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      href="/account"
                      className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      My Profile & Addresses
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      Orders & Tracking
                    </Link>

                    {/* Role Scoped Navigation */}
                    {(user.role === "SELLER" || user.sellerProfile) && (
                      <Link
                        href="/seller/dashboard"
                        className="block px-4 py-2 text-xs font-semibold text-fayzee-coral hover:bg-orange-50"
                      >
                        🏪 Seller Portal
                      </Link>
                    )}

                    {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                      <Link
                        href="/admin/dashboard"
                        className="block px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50"
                      >
                        ⚡ Admin Control Panel
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1"></div>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-brand-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-fayzee-dark text-white hover:bg-slate-800 rounded-full transition shadow-sm"
                >
                  Join Fayzee
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 md:hidden"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Subcategory quick bar */}
      <div className="border-t border-slate-100 hidden md:block bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs font-medium text-slate-600">
          <div className="flex items-center space-x-6 overflow-x-auto py-0.5">
            <Link href="/products" className="hover:text-brand-600 font-semibold text-slate-900">
              All Products
            </Link>
            <Link href="/category/smartphones-tablets" className="hover:text-brand-600">
              Smartphones & Tablets
            </Link>
            <Link href="/category/laptops-computers" className="hover:text-brand-600">
              Laptops & Tech
            </Link>
            <Link href="/category/audio-headphones" className="hover:text-brand-600">
              Audio & Headphones
            </Link>
            <Link href="/category/mens-footwear" className="hover:text-brand-600">
              Sneakers & Shoes
            </Link>
            <Link href="/category/home-appliances" className="hover:text-brand-600">
              Home & Kitchen
            </Link>
            <Link href="/flash-sale" className="text-fayzee-coral font-bold flex items-center gap-1">
              <span>⚡ Flash Sale</span>
            </Link>
          </div>
          <div className="shrink-0 font-semibold text-slate-500">
            Official Brands • Verified Sellers
          </div>
        </div>
      </div>

      {/* Mobile Search & Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-4 shadow-lg animate-in slide-in-from-top-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 text-sm rounded-xl border-none focus:ring-2 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100"
            >
              All Products
            </Link>
            <Link
              href="/flash-sale"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 bg-orange-50 text-fayzee-coral font-bold rounded-xl"
            >
              ⚡ Flash Sale
            </Link>
            <Link
              href="/category/smartphones-tablets"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 bg-slate-50 rounded-xl"
            >
              Smartphones
            </Link>
            <Link
              href="/category/laptops-computers"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 bg-slate-50 rounded-xl"
            >
              Laptops
            </Link>
            <Link
              href="/seller/register"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 bg-slate-50 rounded-xl text-brand-600 font-semibold"
            >
              Become a Seller
            </Link>
            <Link
              href="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 bg-slate-50 rounded-xl"
            >
              Help & FAQs
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
