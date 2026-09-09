"use client";

import { COMPLETE_MARKETPLACE_HIERARCHY } from "@/lib/categoryHierarchy";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import {
  ChevronDown,
  ChevronRight,
  Grid,
  Heart,
  Layers,
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
import { useRef, useState } from "react";

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Mega Menu State
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>(
    COMPLETE_MARKETPLACE_HIERARCHY[0]?.slug || "electronics"
  );
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile Categories Accordion State
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);

  const activeCategory =
    COMPLETE_MARKETPLACE_HIERARCHY.find((c) => c.slug === activeCategorySlug) ||
    COMPLETE_MARKETPLACE_HIERARCHY[0];

  const handleMouseEnterMega = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setMegaMenuOpen(true);
  };

  const handleMouseLeaveMega = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 200);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1C2A39] border-b border-[#243345] shadow-subtle w-full max-w-full">
      {/* 1. Top micro-announcement bar */}
      <div className="bg-[#15202B] text-slate-300 text-xs sm:text-sm py-1.5 px-3 sm:px-6 lg:px-8 border-b border-[#243345]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 truncate">
            <span className="text-[#FF5E00] font-bold flex items-center gap-1 shrink-0">
              ⚡ Flash Deals Live Now!
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-300">Shop Smart. Shop Easy.</span>
          </div>

          <div className="flex items-center space-x-3 shrink-0 text-xs sm:text-sm">
            <Link
              href="/seller/register"
              className="hover:text-white transition flex items-center gap-1 text-slate-300 hover:text-[#FF8C00] font-medium"
            >
              <Store className="w-4 h-4 text-[#FF5E00] shrink-0" />
              <span className="hidden xs:inline sm:inline">Become a Seller</span>
              <span className="xs:hidden sm:hidden">Sell</span>
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/help" className="hover:text-white transition text-slate-300 hover:text-[#FF8C00] font-medium">
              Help
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Navbar Row - LEFT: Branding | CENTER: Search | RIGHT: Profile | Wishlist | Cart */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* LEFT: FAYZEE Branding */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0" aria-label="FAYZEE Home">
          <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-white p-1 border border-white/20 shadow-xs flex items-center justify-center group-hover:scale-105 transition-all shrink-0">
            <img
              src="/logo.png"
              alt="FAYZEE"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white group-hover:text-[#FF8C00] transition-colors leading-none">
              FAYZEE
            </span>
            <span className="text-[9px] sm:text-[11px] md:text-xs font-bold tracking-wider text-[#FF5E00] uppercase mt-0.5 sm:mt-1 whitespace-nowrap">
              Shop More • Live Better
            </span>
          </div>
        </Link>

        {/* CENTER: Desktop Global Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-2xl mx-3 lg:mx-6 relative hidden md:block"
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across 10,000+ authentic electronics, fashion, and home goods..."
              className="w-full pl-12 pr-28 py-2.5 sm:py-3 bg-white text-sm sm:text-base text-[#333333] placeholder:text-slate-400 rounded-full border border-[#DDE2E6] focus:border-[#FF5E00] focus:outline-none focus:ring-4 focus:ring-[#FF5E00]/15 transition shadow-inner"
            />
            <Search className="w-5 h-5 text-[#333333]/70 absolute left-4 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2 bg-[#FF5E00] hover:bg-[#FF8C00] text-white text-sm font-bold rounded-full shadow-sm transition"
            >
              Search
            </button>
          </div>
        </form>

        {/* RIGHT: Profile / Account | Wishlist | Shopping Cart */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {/* 1. Profile / Account */}
          <div className="relative shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-full border border-white/20 hover:border-[#FF5E00] hover:bg-white/10 transition focus:outline-none bg-white/5"
                  title="Profile / Account"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF5E00] text-white flex items-center justify-center text-xs sm:text-sm font-bold uppercase overflow-hidden shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <span className="hidden lg:inline text-sm font-bold text-white pr-1 truncate max-w-[100px]">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-300 hidden lg:block" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl py-2 border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-bold text-[#1C2A39] truncate">{user.name}</p>
                      <p className="text-xs text-[#777777] truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2.5 py-0.5 bg-orange-50 text-[#FF5E00] rounded text-xs font-bold uppercase">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-[#333333] hover:bg-slate-50 font-medium"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-[#333333] hover:bg-slate-50 font-medium"
                    >
                      My Orders
                    </Link>

                    {user.role === "SELLER" && (
                      <Link
                        href="/seller/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-[#FF5E00] hover:bg-orange-50 font-bold"
                      >
                        Seller Dashboard
                      </Link>
                    )}

                    {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-[#1C2A39] hover:bg-slate-100 font-bold"
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1 p-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-bold text-white hover:text-[#FF8C00] hover:bg-white/10 rounded-full transition"
                  title="Profile / Account"
                >
                  <UserIcon className="w-5 h-5 shrink-0" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-block px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-[#FF5E00] text-white hover:bg-[#FF8C00] rounded-full transition shadow-sm shrink-0"
                >
                  Join
                </Link>
              </div>
            )}
          </div>

          {/* 2. Wishlist */}
          <Link
            href="/wishlist"
            className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 text-white hover:text-[#FF8C00] hover:bg-white/10 rounded-full transition relative shrink-0"
            title="Wishlist"
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <span className="hidden xl:inline text-sm font-bold">Wishlist</span>
          </Link>

          {/* 3. Shopping Cart */}
          <Link
            href="/cart"
            className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 text-white hover:text-[#FF8C00] hover:bg-white/10 rounded-full transition relative shrink-0"
            title="Shopping Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#FF5E00] text-white text-[10px] sm:text-xs font-bold rounded-full min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 px-1 flex items-center justify-center shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden xl:inline text-sm font-bold">Cart</span>
          </Link>

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-white hover:text-[#FF8C00] md:hidden rounded-lg hover:bg-white/10 flex items-center justify-center min-w-[36px] min-h-[36px] shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 3. Mobile Dedicated Always-Accessible Search Bar */}
      <div className="px-3 pb-3 md:hidden">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, brands, categories..."
            className="w-full pl-10 pr-20 py-2.5 bg-white text-sm text-[#333333] placeholder:text-slate-400 rounded-full border border-[#DDE2E6] focus:border-[#FF5E00] focus:outline-none focus:ring-2 focus:ring-[#FF5E00]/20 transition shadow-inner"
          />
          <Search className="w-4 h-4 text-[#333333]/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-3.5 py-1.5 bg-[#FF5E00] hover:bg-[#FF8C00] text-white text-xs font-bold rounded-full shadow-sm transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* 4. Subcategory Quick Bar & All Categories Mega Menu (Daraz / Amazon Style) */}
      <div className="relative border-t border-[#243345] bg-[#1C2A39] w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-sm font-medium text-white/90">
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto no-scrollbar py-0.5 w-full md:w-auto -mx-1 px-1">
            {/* Mega Menu Toggle Button */}
            <div
              className="relative shrink-0"
              onMouseEnter={handleMouseEnterMega}
              onMouseLeave={handleMouseLeaveMega}
            >
              <button
                type="button"
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-sm transition ${
                  megaMenuOpen
                    ? "bg-[#FF5E00] text-white shadow-xs"
                    : "bg-white/10 text-white hover:bg-[#FF5E00]"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>All Categories</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    megaMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Desktop Mega Menu Dropdown */}
              {megaMenuOpen && (
                <div
                  className="hidden md:flex absolute top-full left-0 mt-2 w-[920px] max-w-[90vw] bg-white rounded-3xl shadow-2xl border border-[#DDE2E6] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseEnter={handleMouseEnterMega}
                  onMouseLeave={handleMouseLeaveMega}
                >
                  {/* Left Column: 18 Categories */}
                  <div className="w-64 bg-[#F7F9FA] border-r border-[#DDE2E6] max-h-[500px] overflow-y-auto py-2">
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase text-[#1C2A39]/60 tracking-wider">
                      18 Departments
                    </div>
                    {COMPLETE_MARKETPLACE_HIERARCHY.map((cat) => {
                      const isActive = cat.slug === activeCategorySlug;
                      return (
                        <button
                          key={cat.slug}
                          onMouseEnter={() => setActiveCategorySlug(cat.slug)}
                          onClick={() => {
                            router.push(`/category/${cat.slug}`);
                            setMegaMenuOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 flex items-center justify-between text-xs transition group ${
                            isActive
                              ? "bg-white text-[#FF5E00] font-black shadow-xs border-l-4 border-[#FF5E00]"
                              : "text-[#333333] hover:bg-slate-100 hover:text-[#FF8C00] font-medium"
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span className="text-base shrink-0">{cat.icon}</span>
                            <span className="truncate">{cat.name}</span>
                          </span>
                          <ChevronRight
                            className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                              isActive ? "opacity-100 text-[#FF5E00]" : "opacity-0 group-hover:opacity-60"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column: Active Category's Subcategories & Product Types */}
                  <div className="flex-1 p-6 max-h-[500px] overflow-y-auto bg-white flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{activeCategory.icon}</span>
                          <div>
                            <h4 className="text-base font-black text-[#1C2A39]">
                              {activeCategory.name}
                            </h4>
                            <p className="text-[11px] text-[#777777]">
                              {activeCategory.description}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/category/${activeCategory.slug}`}
                          onClick={() => setMegaMenuOpen(false)}
                          className="px-3 py-1 bg-orange-50 hover:bg-orange-100 text-[#FF5E00] font-bold text-xs rounded-full transition flex items-center gap-1 shrink-0"
                        >
                          <span>Explore All</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* Subcategories Grid */}
                      <div className="grid grid-cols-3 gap-x-4 gap-y-5">
                        {activeCategory.subcategories.map((sub) => (
                          <div key={sub.slug} className="space-y-1.5">
                            <Link
                              href={`/category/${activeCategory.slug}?subcategory=${sub.slug}`}
                              onClick={() => setMegaMenuOpen(false)}
                              className="font-bold text-xs text-[#1C2A39] hover:text-[#FF5E00] transition block leading-snug"
                            >
                              {sub.name}
                            </Link>

                            <ul className="space-y-1">
                              {sub.productTypes.slice(0, 5).map((pt) => (
                                <li key={pt.slug}>
                                  <Link
                                    href={`/products?category=${activeCategory.slug}&subcategory=${sub.slug}&productType=${pt.slug}`}
                                    onClick={() => setMegaMenuOpen(false)}
                                    className="text-[11px] text-[#333333] hover:text-[#FF5E00] hover:bg-orange-50/50 rounded px-1 -mx-1 transition block truncate"
                                  >
                                    {pt.name}
                                  </Link>
                                </li>
                              ))}
                              {sub.productTypes.length > 5 && (
                                <li>
                                  <Link
                                    href={`/category/${activeCategory.slug}?subcategory=${sub.slug}`}
                                    onClick={() => setMegaMenuOpen(false)}
                                    className="text-[10px] font-bold text-[#FF5E00] hover:underline inline-block mt-0.5"
                                  >
                                    +{sub.productTypes.length - 5} more...
                                  </Link>
                                </li>
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Promo / Department Link */}
                    <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[#777777]">
                        Looking for all {activeCategory.name} products?
                      </span>
                      <Link
                        href={`/products?category=${activeCategory.slug}`}
                        onClick={() => setMegaMenuOpen(false)}
                        className="text-[#FF5E00] hover:text-[#FF8C00] font-bold hover:underline"
                      >
                        View Full Department Catalog ({activeCategory.subcategories.length} Subcategories) &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Links across major departments */}
            <Link
              href="/products"
              className="hover:text-[#FF8C00] font-bold text-white shrink-0 px-3 py-1 rounded-full hover:bg-white/10 transition text-sm"
            >
              All Products
            </Link>
            <Link
              href="/category/electronics"
              className="hover:text-[#FF8C00] font-medium shrink-0 px-3 py-1 rounded-full hover:bg-white/10 transition text-sm text-white/90"
            >
              Electronics
            </Link>
            <Link
              href="/category/mens-fashion"
              className="hover:text-[#FF8C00] font-medium shrink-0 px-3 py-1 rounded-full hover:bg-white/10 transition text-sm text-white/90"
            >
              Men&apos;s Fashion
            </Link>
            <Link
              href="/category/womens-fashion"
              className="hover:text-[#FF8C00] font-medium shrink-0 px-3 py-1 rounded-full hover:bg-white/10 transition text-sm text-white/90"
            >
              Women&apos;s Fashion
            </Link>
            <Link
              href="/category/home-kitchen"
              className="hover:text-[#FF8C00] font-medium shrink-0 px-3 py-1 rounded-full hover:bg-white/10 transition text-sm text-white/90"
            >
              Home & Kitchen
            </Link>
            <Link
              href="/category/beauty-personal-care"
              className="hover:text-[#FF8C00] font-medium shrink-0 px-3 py-1 rounded-full hover:bg-white/10 transition text-sm text-white/90"
            >
              Beauty
            </Link>
            <Link
              href="/category/groceries-pets"
              className="hover:text-[#FF8C00] font-medium shrink-0 px-3 py-1 rounded-full hover:bg-white/10 transition text-sm text-white/90"
            >
              Groceries
            </Link>
            <Link
              href="/flash-sale"
              className="text-[#FF8C00] hover:text-[#FF5E00] font-bold flex items-center gap-1 shrink-0 px-3 py-1 rounded-full hover:bg-white/10 transition text-sm"
            >
              <span>⚡ Flash Sale</span>
            </Link>
          </div>
          <div className="hidden lg:block shrink-0 font-semibold text-slate-300 text-xs">
            18 Departments • Verified Sellers
          </div>
        </div>
      </div>

      {/* 5. Mobile Hamburger Drawer / Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#243345] bg-[#F7F9FA] p-4 space-y-4 shadow-xl animate-in slide-in-from-top-3 max-h-[80vh] overflow-y-auto">
          {/* Quick Action Cards */}
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-white border border-[#DDE2E6] rounded-xl hover:border-[#FF5E00] flex items-center justify-between text-[#333333]"
            >
              <span className="font-bold">All Products</span>
              <span className="text-slate-400">→</span>
            </Link>
            <Link
              href="/flash-sale"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-orange-50 border border-orange-200 text-[#FF5E00] font-bold rounded-xl flex items-center justify-between"
            >
              <span>⚡ Flash Sale</span>
              <span>🔥</span>
            </Link>
            <Link
              href="/seller/register"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-white border border-[#DDE2E6] hover:border-[#FF5E00] rounded-xl text-[#1C2A39] font-bold"
            >
              🏪 Become a Seller
            </Link>
            <Link
              href="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-white border border-[#DDE2E6] rounded-xl hover:border-[#FF5E00] text-[#333333]"
            >
              Help & FAQs
            </Link>
          </div>

          {/* Mobile All Categories Drilldown Accordion */}
          <div className="border border-[#DDE2E6] rounded-2xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
              className="w-full px-4 py-3 bg-white hover:bg-slate-50 flex items-center justify-between font-bold text-xs text-[#1C2A39] transition"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF5E00]" />
                <span>Shop by 18 Departments</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform ${
                  mobileCategoriesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {mobileCategoriesOpen && (
              <div className="p-2 space-y-1 bg-white border-t border-slate-100 max-h-[360px] overflow-y-auto">
                {COMPLETE_MARKETPLACE_HIERARCHY.map((cat) => {
                  const isExpanded = expandedMobileCat === cat.slug;
                  return (
                    <div key={cat.slug} className="border border-slate-100 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between p-2 hover:bg-slate-50">
                        <Link
                          href={`/category/${cat.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 text-xs font-bold text-[#1C2A39] flex-1 truncate hover:text-[#FF5E00]"
                        >
                          <span className="text-base">{cat.icon}</span>
                          <span className="truncate">{cat.name}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedMobileCat(isExpanded ? null : cat.slug)
                          }
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="bg-[#F7F9FA] p-2.5 space-y-2 border-t border-slate-100 text-[11px]">
                          {cat.subcategories.map((sub) => (
                            <div key={sub.slug} className="space-y-1 pl-2 border-l-2 border-[#FF5E00]">
                              <Link
                                href={`/category/${cat.slug}?subcategory=${sub.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="font-bold text-[#1C2A39] hover:text-[#FF5E00] block"
                              >
                                {sub.name}
                              </Link>
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {sub.productTypes.slice(0, 4).map((pt) => (
                                  <Link
                                    key={pt.slug}
                                    href={`/products?category=${cat.slug}&subcategory=${sub.slug}&productType=${pt.slug}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-2 py-0.5 bg-white border border-[#DDE2E6] text-[#333333] hover:text-[#FF5E00] hover:border-[#FF5E00] rounded text-[10px]"
                                  >
                                    {pt.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {!user && (
            <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 text-center text-xs font-bold text-[#1C2A39] bg-white border border-[#1C2A39] hover:bg-[#1C2A39] hover:text-white transition rounded-xl"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 text-center text-xs font-bold text-white bg-[#FF5E00] hover:bg-[#FF8C00] transition rounded-xl"
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
