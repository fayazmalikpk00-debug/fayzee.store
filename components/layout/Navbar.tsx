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
import { useEffect, useRef, useState } from "react";

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Cart bounce animation state on item add
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const prevCartCountRef = useRef(cartCount);

  useEffect(() => {
    if (cartCount > prevCartCountRef.current) {
      setIsCartBouncing(true);
      const timer = setTimeout(() => setIsCartBouncing(false), 650);
      prevCartCountRef.current = cartCount;
      return () => clearTimeout(timer);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  // Mega Menu State
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>(
    COMPLETE_MARKETPLACE_HIERARCHY[0]?.slug || "electronics"
  );
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const megaMenuContainerRef = useRef<HTMLDivElement>(null);

  // Close mega menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        megaMenuContainerRef.current &&
        !megaMenuContainerRef.current.contains(event.target as Node)
      ) {
        setMegaMenuOpen(false);
      }
    }
    if (megaMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [megaMenuOpen]);

  // Mobile Categories Accordion State
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);

  const activeCategory =
    COMPLETE_MARKETPLACE_HIERARCHY.find((c) => c.slug === activeCategorySlug) ||
    COMPLETE_MARKETPLACE_HIERARCHY[0];

  const handleMouseEnterMega = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
  };

  const handleMouseLeaveMega = () => {
    // Keep open on click, only brief delay if needed
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F14] border-b border-[#1A222C] shadow-subtle w-full max-w-full">
      {/* 1. Top micro-announcement bar */}
      <div className="bg-[#060A0E] text-[#8A8F98] text-xs sm:text-sm py-1.5 px-3 sm:px-6 lg:px-8 border-b border-[#141B22]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 truncate">
            <span className="text-[#C8A96B] font-bold flex items-center gap-1 shrink-0">
              ⚡ Flash Deals Live Now!
            </span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="hidden md:inline text-slate-400">Shop Smart. Shop Easy.</span>
          </div>

          <div className="flex items-center space-x-3 shrink-0 text-xs sm:text-sm">
            <Link
              href="/seller/register"
              className="hover:text-white transition flex items-center gap-1 text-[#8A8F98] hover:text-[#C8A96B] font-medium"
            >
              <Store className="w-4 h-4 text-[#C8A96B] shrink-0" />
              <span className="hidden xs:inline sm:inline">Become a Seller</span>
              <span className="xs:hidden sm:hidden">Sell</span>
            </Link>
            <span className="text-slate-700">|</span>
            <Link href="/help" className="hover:text-white transition text-[#8A8F98] hover:text-[#C8A96B] font-medium">
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
            <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white group-hover:text-[#C8A96B] transition-colors leading-none">
              FAYZEE
            </span>
            <span className="text-[9px] sm:text-[11px] md:text-xs font-bold tracking-wider text-[#C8A96B] uppercase mt-0.5 sm:mt-1 whitespace-nowrap">
              Shop More • Live Better
            </span>
          </div>
        </Link>

        {/* CENTER: Desktop Global Search Bar */}
        <form
          onSubmit={handleSearch}
          className={`flex-1 transition-all duration-300 mx-3 lg:mx-6 relative hidden md:block ${
            isSearchFocused ? "max-w-2xl scale-[1.01]" : "max-w-xl"
          }`}
        >
          <div className="relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
              placeholder="Search across 10,000+ authentic electronics, fashion, and home goods..."
              className={`w-full pl-12 pr-28 py-2.5 sm:py-3 bg-white text-sm sm:text-base text-[#0B0F14] placeholder:text-[#8A8F98] rounded-full border transition-all duration-300 shadow-inner ${
                isSearchFocused
                  ? "border-[#0B0F14] ring-4 ring-[#C8A96B]/25 shadow-lg shadow-[#0B0F14]/10"
                  : "border-[#E8E5DC] hover:border-slate-300"
              }`}
            />
            <Search
              className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                isSearchFocused ? "text-[#C8A96B]" : "text-[#8A8F98]"
              }`}
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2 bg-[#0B0F14] hover:bg-[#1A222C] active:scale-95 text-white border border-[#C8A96B]/40 text-sm font-bold rounded-full shadow-sm transition-all duration-200"
            >
              Search
            </button>
          </div>

          {/* Quick Trending Searches Dropdown */}
          {isSearchFocused && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-[#E8E5DC] shadow-2xl p-3.5 z-50 animate-slide-down">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1 mb-2">
                <span className="flex items-center gap-1 text-[#0B0F14]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
                  <span>Trending Searches</span>
                </span>
                <span className="text-[10px] text-[#8A8F98]">Popular Now</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Samsung Galaxy",
                  "Wireless Earbuds",
                  "Sneakers",
                  "Smart Watch",
                  "Air Fryer",
                  "Gaming Laptops",
                  "Power Bank",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onMouseDown={() => {
                      setSearchQuery(tag);
                      router.push(`/search?q=${encodeURIComponent(tag)}`);
                    }}
                    className="px-2.5 py-1 bg-[#F5F3EE] hover:bg-[#0B0F14] hover:text-[#C8A96B] hover:border-[#C8A96B]/50 border border-[#E8E5DC] text-[#0B0F14] rounded-lg text-xs font-semibold transition-all active:scale-95"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* RIGHT: Profile / Account | Wishlist | Shopping Cart */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {/* 1. Profile / Account */}
          <div className="relative shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-full border border-white/20 hover:border-[#C8A96B] hover:bg-white/10 transition focus:outline-none bg-white/5"
                  title="Profile / Account"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#161F2B] text-[#C8A96B] border border-[#C8A96B]/30 flex items-center justify-center text-xs sm:text-sm font-bold uppercase overflow-hidden shrink-0">
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
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl py-2 border border-[#E8E5DC] z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#E8E5DC]">
                      <p className="text-sm font-bold text-[#0B0F14] truncate">{user.name}</p>
                      <p className="text-xs text-[#8A8F98] truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2.5 py-0.5 bg-[#F5F3EE] text-[#0B0F14] border border-[#E8E5DC] rounded text-xs font-bold uppercase">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-[#0B0F14] hover:bg-[#F5F3EE] font-medium"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-[#0B0F14] hover:bg-[#F5F3EE] font-medium"
                    >
                      My Orders
                    </Link>

                    {user.role === "SELLER" && (
                      <Link
                        href="/seller/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-[#0B0F14] hover:bg-[#F5F3EE] font-bold flex items-center justify-between"
                      >
                        <span>Seller Dashboard</span>
                        <span className="text-[10px] text-[#C8A96B] font-extrabold uppercase">Active</span>
                      </Link>
                    )}

                    {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-[#0B0F14] hover:bg-[#F5F3EE] font-bold"
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
                  className="flex items-center gap-1 p-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-bold text-white hover:text-[#C8A96B] hover:bg-white/10 rounded-full transition"
                  title="Profile / Account"
                >
                  <UserIcon className="w-5 h-5 shrink-0" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-block px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-[#C8A96B] text-[#0B0F14] hover:bg-[#DFBE6E] rounded-full transition shadow-sm shrink-0"
                >
                  Join
                </Link>
              </div>
            )}
          </div>

          {/* 2. Wishlist */}
          <Link
            href="/wishlist"
            className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 text-white hover:text-[#C8A96B] hover:bg-white/10 rounded-full transition relative shrink-0"
            title="Wishlist"
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <span className="hidden xl:inline text-sm font-bold">Wishlist</span>
          </Link>

          {/* 3. Shopping Cart */}
          <Link
            href="/cart"
            className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-2 text-white hover:text-[#C8A96B] hover:bg-white/10 rounded-full transition relative shrink-0"
            title="Shopping Cart"
          >
            <div className={`relative transition-transform duration-300 ${isCartBouncing ? "animate-cart-bounce" : ""}`}>
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              {cartCount > 0 && (
                <span
                  className={`absolute -top-1.5 -right-2 text-[#0B0F14] bg-[#C8A96B] text-[10px] sm:text-xs font-black rounded-full min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 px-1 flex items-center justify-center shadow-md transition-all duration-300 ${
                    isCartBouncing
                      ? "scale-125 bg-emerald-500 text-white shadow-emerald-500/50"
                      : "scale-100"
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden xl:inline text-sm font-bold">Cart</span>
          </Link>

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-white hover:text-[#C8A96B] md:hidden rounded-lg hover:bg-white/10 flex items-center justify-center min-w-[36px] min-h-[36px] shrink-0"
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
            className="w-full pl-10 pr-20 py-2.5 bg-white text-sm text-[#0B0F14] placeholder:text-[#8A8F98] rounded-full border border-[#E8E5DC] focus:border-[#C8A96B] focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/20 transition shadow-inner"
          />
          <Search className="w-4 h-4 text-[#8A8F98] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-3.5 py-1.5 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] border border-[#C8A96B]/40 text-xs font-bold rounded-full shadow-sm transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* 4. Subcategory Quick Bar & All Categories Mega Menu */}
      <div className="relative border-t border-[#1A222C] bg-[#0B0F14] w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-sm font-medium text-white/90">
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto no-scrollbar py-0.5 w-full md:w-auto -mx-1 px-1">
            {/* Mega Menu Toggle Button */}
            <div
              ref={megaMenuContainerRef}
              className="relative shrink-0"
              onMouseEnter={handleMouseEnterMega}
              onMouseLeave={handleMouseLeaveMega}
            >
              <button
                type="button"
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm transition cursor-pointer ${
                  megaMenuOpen
                    ? "bg-[#C8A96B] text-[#0B0F14] shadow-md ring-2 ring-[#C8A96B]/50"
                    : "bg-white/10 text-white hover:bg-white/20 hover:text-[#C8A96B]"
                }`}
                title="Browse All Categories"
              >
                <Layers className="w-4 h-4 text-[#C8A96B]" />
                <span>Categories</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    megaMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Desktop Mega Menu Dropdown */}
              {megaMenuOpen && (
                <div
                  className="hidden md:flex absolute top-full left-0 mt-2 w-[920px] max-w-[90vw] bg-white rounded-3xl shadow-2xl border border-[#E8E5DC] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseEnter={handleMouseEnterMega}
                  onMouseLeave={handleMouseLeaveMega}
                >
                  {/* Left Column: 18 Categories */}
                  <div className="w-64 bg-[#F5F3EE] border-r border-[#E8E5DC] max-h-[500px] overflow-y-auto py-2">
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase text-[#0B0F14]/60 tracking-wider">
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
                              ? "bg-white text-[#0B0F14] font-black shadow-xs border-l-4 border-[#C8A96B]"
                              : "text-[#0B0F14] hover:bg-white/70 hover:text-[#C8A96B] font-medium"
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span className="text-base shrink-0">{cat.icon}</span>
                            <span className="truncate">{cat.name}</span>
                          </span>
                          <ChevronRight
                            className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                              isActive ? "opacity-100 text-[#C8A96B]" : "opacity-0 group-hover:opacity-60"
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
                            <h4 className="text-base font-black text-[#0B0F14]">
                              {activeCategory.name}
                            </h4>
                            <p className="text-[11px] text-[#8A8F98]">
                              {activeCategory.description}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/category/${activeCategory.slug}`}
                          onClick={() => setMegaMenuOpen(false)}
                          className="px-3.5 py-1.5 bg-[#0B0F14] hover:bg-[#1A222C] text-white border border-[#C8A96B]/40 font-bold text-xs rounded-full transition flex items-center gap-1 shrink-0"
                        >
                          <span>Explore All</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#C8A96B]" />
                        </Link>
                      </div>

                      {/* Subcategories Grid */}
                      <div className="grid grid-cols-3 gap-x-4 gap-y-5">
                        {activeCategory.subcategories.map((sub) => (
                          <div key={sub.slug} className="space-y-1.5">
                            <Link
                              href={`/category/${activeCategory.slug}?subcategory=${sub.slug}`}
                              onClick={() => setMegaMenuOpen(false)}
                              className="font-bold text-xs text-[#0B0F14] hover:text-[#C8A96B] transition block leading-snug"
                            >
                              {sub.name}
                            </Link>

                            <ul className="space-y-1">
                              {sub.productTypes.slice(0, 5).map((pt) => (
                                <li key={pt.slug}>
                                  <Link
                                    href={`/products?category=${activeCategory.slug}&subcategory=${sub.slug}&productType=${pt.slug}`}
                                    onClick={() => setMegaMenuOpen(false)}
                                    className="text-[11px] text-[#8A8F98] hover:text-[#0B0F14] hover:bg-[#F5F3EE] rounded px-1 -mx-1 transition block truncate"
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
                                    className="text-[10px] font-bold text-[#C8A96B] hover:underline inline-block mt-0.5"
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
                    <div className="mt-6 pt-3 border-t border-[#E8E5DC] flex items-center justify-between text-xs">
                      <span className="text-[#8A8F98]">
                        Looking for all {activeCategory.name} products?
                      </span>
                      <Link
                        href={`/products?category=${activeCategory.slug}`}
                        onClick={() => setMegaMenuOpen(false)}
                        className="text-[#0B0F14] hover:text-[#C8A96B] font-bold hover:underline"
                      >
                        View Full Department Catalog ({activeCategory.subcategories.length} Subcategories) &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* All Products Link */}
            <Link
              href="/products"
              className="hover:text-[#C8A96B] font-bold text-white shrink-0 px-4 py-1.5 rounded-full hover:bg-white/10 transition text-sm flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4 text-[#C8A96B]" />
              <span>All Products</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Mobile Hamburger Drawer / Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1A222C] bg-[#F5F3EE] p-4 space-y-4 shadow-xl animate-in slide-in-from-top-3 max-h-[80vh] overflow-y-auto">
          {/* Quick Action Cards */}
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-white border border-[#E8E5DC] rounded-xl hover:border-[#C8A96B] flex items-center justify-between text-[#0B0F14]"
            >
              <span className="font-bold">All Products</span>
              <span className="text-slate-400">→</span>
            </Link>
            <Link
              href="/flash-sale"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-[#0B0F14] border border-[#C8A96B]/40 text-[#C8A96B] font-bold rounded-xl flex items-center justify-between"
            >
              <span>⚡ Flash Sale</span>
              <span>🔥</span>
            </Link>
            <Link
              href="/seller/register"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-white border border-[#E8E5DC] hover:border-[#C8A96B] rounded-xl text-[#0B0F14] font-bold"
            >
              🏪 Become a Seller
            </Link>
            <Link
              href="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-white border border-[#E8E5DC] rounded-xl hover:border-[#C8A96B] text-[#0B0F14]"
            >
              Help & FAQs
            </Link>
          </div>

          {/* Mobile All Categories Drilldown Accordion */}
          <div className="border border-[#E8E5DC] rounded-2xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
              className="w-full px-4 py-3 bg-white hover:bg-[#F5F3EE] flex items-center justify-between font-bold text-xs text-[#0B0F14] transition"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C8A96B]" />
                <span>Shop by 18 Departments</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform ${
                  mobileCategoriesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {mobileCategoriesOpen && (
              <div className="p-2 space-y-1 bg-white border-t border-[#E8E5DC] max-h-[360px] overflow-y-auto">
                {COMPLETE_MARKETPLACE_HIERARCHY.map((cat) => {
                  const isExpanded = expandedMobileCat === cat.slug;
                  return (
                    <div key={cat.slug} className="border border-[#E8E5DC] rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between p-2 hover:bg-[#F5F3EE]">
                        <Link
                          href={`/category/${cat.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 text-xs font-bold text-[#0B0F14] flex-1 truncate hover:text-[#C8A96B]"
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
                        <div className="bg-[#F5F3EE] p-2.5 space-y-2 border-t border-[#E8E5DC] text-[11px]">
                          {cat.subcategories.map((sub) => (
                            <div key={sub.slug} className="space-y-1 pl-2 border-l-2 border-[#C8A96B]">
                              <Link
                                href={`/category/${cat.slug}?subcategory=${sub.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="font-bold text-[#0B0F14] hover:text-[#C8A96B] block"
                              >
                                {sub.name}
                              </Link>
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {sub.productTypes.slice(0, 4).map((pt) => (
                                  <Link
                                    key={pt.slug}
                                    href={`/products?category=${cat.slug}&subcategory=${sub.slug}&productType=${pt.slug}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-2 py-0.5 bg-white border border-[#E8E5DC] text-[#8A8F98] hover:text-[#0B0F14] hover:border-[#C8A96B] rounded text-[10px]"
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
            <div className="pt-2 border-t border-[#E8E5DC] flex items-center gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 text-center text-xs font-bold text-[#0B0F14] bg-white border border-[#0B0F14] hover:bg-[#0B0F14] hover:text-white transition rounded-xl"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2.5 text-center text-xs font-bold text-[#0B0F14] bg-[#C8A96B] hover:bg-[#DFBE6E] transition rounded-xl"
              >
                Join Fayzee
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Mobile Categories Modal (when clicking Categories on mobile) */}
      {megaMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-[#F5F3EE] rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border-t border-[#E8E5DC]">
            <div className="p-4 bg-white border-b border-[#E8E5DC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#C8A96B]" />
                <div>
                  <h3 className="font-black text-sm text-[#0B0F14]">All Categories</h3>
                  <p className="text-[11px] text-slate-500">18 Departments Available</p>
                </div>
              </div>
              <button
                onClick={() => setMegaMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-black cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 overflow-y-auto space-y-2 flex-1">
              {COMPLETE_MARKETPLACE_HIERARCHY.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMegaMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E8E5DC] hover:border-[#C8A96B] text-xs font-bold text-[#0B0F14] shadow-xs active:scale-98 transition"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <span className="block text-slate-900">{cat.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {cat.subcategories?.length || 0} subcategories
                      </span>
                    </div>
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#C8A96B]" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
