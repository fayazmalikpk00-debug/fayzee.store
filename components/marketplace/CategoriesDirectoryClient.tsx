"use client";

import { COMPLETE_MARKETPLACE_HIERARCHY } from "@/lib/categoryHierarchy";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Layers,
  Search,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface CategoryData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  productCount: number;
  subcategories: {
    name: string;
    slug: string;
    productTypesCount: number;
  }[];
}

const CATEGORY_META: Record<
  string,
  {
    emoji: string;
    accentColor: string;
    group: string;
  }
> = {
  electronics: { emoji: "📱", accentColor: "#3B82F6", group: "Tech & Gadgets" },
  "mens-fashion": { emoji: "👔", accentColor: "#C8A96B", group: "Fashion & Apparel" },
  "womens-fashion": { emoji: "👗", accentColor: "#EC4899", group: "Fashion & Apparel" },
  "kids-babies": { emoji: "👶", accentColor: "#06B6D4", group: "Family & Kids" },
  "beauty-personal-care": { emoji: "💄", accentColor: "#F43F5E", group: "Beauty & Grooming" },
  "home-living": { emoji: "🛋️", accentColor: "#10B981", group: "Home & Lifestyle" },
  "home-appliances": { emoji: "🍳", accentColor: "#F97316", group: "Home & Lifestyle" },
  "grocery-food": { emoji: "🍎", accentColor: "#22C55E", group: "Daily Essentials" },
  "sports-fitness": { emoji: "⚽", accentColor: "#8B5CF6", group: "Sports & Fitness" },
  automotive: { emoji: "🚗", accentColor: "#64748B", group: "Motors & Hardware" },
  "books-stationery": { emoji: "📚", accentColor: "#6366F1", group: "Education & Office" },
  "tools-hardware": { emoji: "🔧", accentColor: "#EAB308", group: "Motors & Hardware" },
  "pet-supplies": { emoji: "🐾", accentColor: "#14B8A6", group: "Daily Essentials" },
  "travel-luggage": { emoji: "🧳", accentColor: "#0EA5E9", group: "Lifestyle & Travel" },
  "office-business": { emoji: "💼", accentColor: "#475569", group: "Education & Office" },
  "garden-outdoor": { emoji: "🌿", accentColor: "#16A34A", group: "Home & Lifestyle" },
  "fashion-accessories": { emoji: "⌚", accentColor: "#D97706", group: "Fashion & Apparel" },
  other: { emoji: "📦", accentColor: "#94A3B8", group: "Specialty" },
};

export function CategoriesDirectoryClient({
  categoriesWithCounts,
}: {
  categoriesWithCounts?: Record<string, number>;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  // Merge authoritative hierarchy with live product counts
  const categoriesList: CategoryData[] = useMemo(() => {
    return COMPLETE_MARKETPLACE_HIERARCHY.map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      image: cat.image,
      productCount: categoriesWithCounts?.[cat.slug] || 0,
      subcategories: cat.subcategories.map((sub) => ({
        name: sub.name,
        slug: sub.slug,
        productTypesCount: sub.productTypes.length,
      })),
    }));
  }, [categoriesWithCounts]);

  // Unique groups for quick filtering
  const filterGroups = useMemo(() => {
    const groups = new Set<string>();
    Object.values(CATEGORY_META).forEach((meta) => groups.add(meta.group));
    return ["all", ...Array.from(groups)];
  }, []);

  // Filtered categories based on search and group
  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return categoriesList.filter((cat) => {
      const meta = CATEGORY_META[cat.slug] || { group: "General" };
      const matchesGroup = selectedGroup === "all" || meta.group === selectedGroup;

      if (!matchesGroup) return false;
      if (!query) return true;

      const matchesName = cat.name.toLowerCase().includes(query);
      const matchesDesc = cat.description.toLowerCase().includes(query);
      const matchesSub = cat.subcategories.some((s) =>
        s.name.toLowerCase().includes(query)
      );

      return matchesName || matchesDesc || matchesSub;
    });
  }, [categoriesList, searchQuery, selectedGroup]);

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F14] via-[#161F2B] to-[#0B0F14] text-white p-6 sm:p-10 lg:p-12 border border-[#C8A96B]/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-[#C8A96B]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C8A96B]/15 border border-[#C8A96B]/30 text-[#C8A96B] text-xs font-black uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Marketplace Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Explore All <span className="text-[#C8A96B]">18 Departments</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Discover thousands of authentic products across verified sellers in Pakistan.
            From high-end tech & smartphones to designer fashion, daily groceries, and home essentials.
          </p>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-2 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C8A96B]" />
              <span>18 Curated Departments</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C8A96B]" />
              <span>150+ Specialized Subcategories</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C8A96B]" />
              <span>100% Verified Sellers</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="relative z-10 mt-8 max-w-xl">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category, subcategory, or item (e.g. Shoes, iPhone, Makeup)..."
              className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-white/10 text-white placeholder:text-slate-400 border border-white/20 focus:border-[#C8A96B] focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30 transition text-sm font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 px-2 py-1 text-xs font-bold text-slate-400 hover:text-white bg-white/10 rounded-lg transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Group Filter Pills */}
      <section className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {filterGroups.map((group) => {
          const isSelected = selectedGroup === group;
          const label = group === "all" ? "All Departments (18)" : group;
          return (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                isSelected
                  ? "bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B] shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {label}
            </button>
          );
        })}
      </section>

      {/* 3. Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          Showing <strong className="text-slate-900">{filteredCategories.length}</strong> of 18 departments
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-[#C8A96B] font-bold hover:underline"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Browse All Products Catalog &rarr;</span>
        </Link>
      </div>

      {/* 4. Categories Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => {
          const meta = CATEGORY_META[cat.slug] || {
            emoji: "📦",
            accentColor: "#C8A96B",
            group: "Department",
          };

          return (
            <div
              key={cat.slug}
              className="group relative bg-white rounded-3xl border border-[#E8E5DC] hover:border-[#C8A96B] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Top Banner Image with Gradient Overlay */}
              <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Group Badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold">
                  {meta.group}
                </div>

                {/* Category Icon & Title floating over banner */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-2xl shrink-0 border border-slate-100 group-hover:scale-110 transition-transform">
                    {meta.emoji}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-black text-lg text-white truncate drop-shadow-md">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-[#C8A96B] font-semibold">
                      {cat.subcategories.length} Subcategories
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>

                {/* Popular Subcategories Pills */}
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                    Popular Sections
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories.slice(0, 4).map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`/category/${cat.slug}?subcategory=${sub.slug}`}
                        className="px-2.5 py-1 rounded-xl bg-[#F5F3EE] hover:bg-[#C8A96B]/15 text-[#0B0F14] hover:text-[#0B0F14] text-[11px] font-medium transition border border-transparent hover:border-[#C8A96B]/40"
                      >
                        {sub.name}
                      </Link>
                    ))}
                    {cat.subcategories.length > 4 && (
                      <Link
                        href={`/category/${cat.slug}`}
                        className="px-2 py-1 rounded-xl bg-slate-100 text-slate-500 text-[10px] font-bold hover:bg-slate-200 transition"
                      >
                        +{cat.subcategories.length - 4} more
                      </Link>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    {cat.productCount > 0 ? (
                      <span className="text-emerald-600 font-bold">
                        {cat.productCount} product{cat.productCount > 1 ? "s" : ""} live
                      </span>
                    ) : (
                      "Catalog Available"
                    )}
                  </span>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0B0F14] hover:bg-[#161F2B] text-white hover:text-[#C8A96B] text-xs font-bold transition-all shadow-xs group-hover:gap-2"
                  >
                    <span>Explore Department</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#C8A96B]" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 5. Empty State if no categories match search */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E5DC] p-8 max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-2xl">
            🔍
          </div>
          <h3 className="text-lg font-black text-slate-900">No departments match &ldquo;{searchQuery}&rdquo;</h3>
          <p className="text-xs text-slate-500">
            Try searching with broader terms like &ldquo;Electronics&rdquo;, &ldquo;Fashion&rdquo;, or &ldquo;Kitchen&rdquo;.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedGroup("all");
            }}
            className="px-5 py-2 rounded-full bg-[#0B0F14] text-[#C8A96B] font-bold text-xs hover:bg-black transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 6. Bottom Call to Action */}
      <section className="rounded-3xl bg-[#F5F3EE] border border-[#E8E5DC] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-black text-lg text-[#0B0F14]">
            Can&apos;t find what you&apos;re looking for?
          </h3>
          <p className="text-xs text-slate-600">
            Browse our complete live marketplace inventory across all sellers in Pakistan.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/products"
            className="px-6 py-3 rounded-full bg-[#0B0F14] hover:bg-[#161F2B] text-white font-bold text-xs flex items-center gap-2 transition shadow-md"
          >
            <ShoppingBag className="w-4 h-4 text-[#C8A96B]" />
            <span>All Products Catalog</span>
          </Link>
          <Link
            href="/flash-sale"
            className="px-5 py-3 rounded-full bg-white hover:bg-slate-100 text-[#0B0F14] font-bold text-xs border border-[#E8E5DC] transition"
          >
            ⚡ Flash Deals
          </Link>
        </div>
      </section>
    </div>
  );
}
