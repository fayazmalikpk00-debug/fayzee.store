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
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-subtle w-full max-w-full">
      {/* 1. Top micro-announcement bar */}
      <div className="bg-fayzee-dark text-slate-300 text-[11px] sm:text-xs py-1.5 px-3 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 truncate">
            <span className="text-amber-400 font-semibold flex items-center gap-1 shrink-0">
              ⚡ Flash Deals Live Now!
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-400">Shop Smart. Shop Easy.</span>
          </div>

          <div className="flex items-center space-x-3 shrink-0 text-[11px]">
            <Link
              href="/seller/register"
              className="hover:text-white transition flex items-center gap-1 text-slate-300"
            >
              <Store className="w-3.5 h-3.5 text-fayzee-cyan shrink-0" />
              <span className="hidden xs:inline sm:inline">Become a Seller</span>
              <span className="xs:hidden sm:hidden">Sell</span>
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/help" className="hover:text-white transition text-slate-300">
              Help
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Navbar Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0 min-w-0" aria-label="FAYZEE Home">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white p-0.5 border border-slate-200/80 shadow-xs flex items-center justify-center group-hover:scale-105 group-hover:shadow-md transition-all shrink-0">
            <img
              src="/logo.png"
              alt="FAYZEE"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors block leading-tight">
              FAYZEE
            </span>
            <span className="hidden sm:block text-[8px] sm:text-[9px] font-bold tracking-wider text-brand-600 uppercase">
              Shop More • Live Better
            </span>
          </div>
        </Link>

        {/* Desktop Global Search Bar */}
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
        <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">
          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="p-2 sm:p-2.5 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-full transition relative flex items-center justify-center min-w-[38px] min-h-[38px]"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
          </Link>

          {/* Cart with dynamic badge */}
          <Link
            href="/cart"
            className="p-2 sm:p-2.5 text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-full transition relative flex items-center justify-center min-w-[38px] min-h-[38px]"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute 0 top-0.5 right-0.5 bg-fayzee-coral text-white text-[10px] font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-sm animate-pulse">
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
                  className="flex items-center gap-1.5 p-1 rounded-full border border-slate-200 hover:border-brand-500 transition focus:outline-none bg-slate-50 min-w-[36px] min-h-[36px]"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center overflow-hidden shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-700 hidden lg:inline max-w-[90px] truncate">
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
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link
                  href="/login"
                  className="px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-brand-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-block px-3.5 py-1.5 text-xs font-semibold bg-fayzee-dark text-white hover:bg-slate-800 rounded-full transition shadow-sm shrink-0"
                >
                  Join
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 md:hidden rounded-lg hover:bg-slate-100 flex items-center justify-center min-w-[38px] min-h-[38px]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 3. Mobile Dedicated Always-Accessible Search Bar (Eliminates hamburger friction) */}
      <div className="px-3 pb-2.5 md:hidden">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, brands, categories..."
            className="w-full pl-9 pr-18 py-2 bg-slate-100/90 focus:bg-white text-xs text-slate-900 rounded-full border border-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition shadow-inner"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold rounded-full shadow-sm transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* 4. Subcategory Quick Bar (Swipeable Horizontal Scroll on Mobile & Desktop) */}
      <div className="border-t border-slate-100 bg-slate-50/90 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-xs font-medium text-slate-600">
          <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto no-scrollbar py-0.5 w-full md:w-auto -mx-1 px-1">
            <Link
              href="/products"
              className="hover:text-brand-600 font-bold text-slate-900 shrink-0 px-2.5 py-1 rounded-full hover:bg-white transition text-xs"
            >
              All Products
            </Link>
            <Link
              href="/category/smartphones-tablets"
              className="hover:text-brand-600 shrink-0 px-2.5 py-1 rounded-full hover:bg-white transition text-xs text-slate-700"
            >
              Smartphones
            </Link>
            <Link
              href="/category/laptops-computers"
              className="hover:text-brand-600 shrink-0 px-2.5 py-1 rounded-full hover:bg-white transition text-xs text-slate-700"
            >
              Laptops
            </Link>
            <Link
              href="/category/audio-headphones"
              className="hover:text-brand-600 shrink-0 px-2.5 py-1 rounded-full hover:bg-white transition text-xs text-slate-700"
            >
              Audio
            </Link>
            <Link
              href="/category/mens-footwear"
              className="hover:text-brand-600 shrink-0 px-2.5 py-1 rounded-full hover:bg-white transition text-xs text-slate-700"
            >
              Footwear
            </Link>
            <Link
              href="/category/home-appliances"
              className="hover:text-brand-600 shrink-0 px-2.5 py-1 rounded-full hover:bg-white transition text-xs text-slate-700"
            >
              Home & Kitchen
            </Link>
            <Link
              href="/flash-sale"
              className="text-fayzee-coral font-extrabold flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full hover:bg-white transition text-xs"
            >
              <span>⚡ Flash Sale</span>
            </Link>
          </div>
          <div className="hidden lg:block shrink-0 font-semibold text-slate-500 text-[11px]">
            Official Brands • Verified Sellers
          </div>
        </div>
      </div>

      {/* 5. Mobile Hamburger Drawer / Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3 shadow-xl animate-in slide-in-from-top-3">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 flex items-center justify-between text-slate-800"
            >
              <span>All Products</span>
              <span className="text-slate-400">→</span>
            </Link>
            <Link
              href="/flash-sale"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-orange-50 text-fayzee-coral font-bold rounded-xl flex items-center justify-between"
            >
              <span>⚡ Flash Sale</span>
              <span>🔥</span>
            </Link>
            <Link
              href="/category/smartphones-tablets"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 text-slate-800"
            >
              Smartphones & Tablets
            </Link>
            <Link
              href="/category/laptops-computers"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 text-slate-800"
            >
              Laptops & Computers
            </Link>
            <Link
              href="/seller/register"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-brand-50 rounded-xl text-brand-700 font-bold"
            >
              🏪 Become a Seller
            </Link>
            <Link
              href="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 text-slate-800"
            >
              Help & FAQs
            </Link>
          </div>

          {!user && (
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 text-center text-xs font-bold text-slate-800 bg-slate-100 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 text-center text-xs font-bold text-white bg-fayzee-dark rounded-xl"
              >
                Join Fayzee
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
