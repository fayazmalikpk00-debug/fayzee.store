import { FlashCountdown } from "@/components/marketplace/FlashCountdown";
import { HomeProductsFeed } from "@/components/marketplace/HomeProductsFeed";
import { ProductCard } from "@/components/marketplace/ProductCard";
import prisma from "@/lib/db";
import {
  getCategories,
  getFeaturedProducts,
  getFlashSaleProducts,
  getProducts,
  getTrendingProducts,
} from "@/services/productService";
import {
  ArrowRight,
  Flame,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [
    allProductsData,
    categories,
    flashSale,
    trendingProducts,
    topSellers,
    explicitFeaturedProduct,
    customHeroBanner,
    siteSettings,
  ] = await Promise.all([
    getProducts({ limit: 16, sortBy: "newest" }),
    getCategories(),
    getFlashSaleProducts(),
    getTrendingProducts(12),
    prisma.sellerProfile.findMany({
      where: { status: "APPROVED" },
      take: 4,
      orderBy: { rating: "desc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.product.findFirst({
      where: { status: "ACTIVE", isFeatured: true },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
        seller: { select: { storeName: true, storeSlug: true } },
      },
      orderBy: [{ updatedAt: "desc" }],
    }),
    prisma.siteBanner.findFirst({
      where: { isActive: true, position: "HERO" },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    prisma.siteSetting.findUnique({
      where: { id: "default" },
    }),
  ]);

  // Hero Fayzee AI Top Pick:
  // Strictly 100% Admin Controlled: ONLY product explicitly designated by Admin (isFeatured = true)
  // ZERO automatic fallback.
  const aiTopPick = explicitFeaturedProduct || null;
  const heroImage = customHeroBanner?.imageUrl || "/images/hero-banner.jpg";

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Full-Width Animated Hero Section with Cinematic Background & Products Showcase */}
      <section className="relative overflow-hidden bg-[#0B0F14] text-white py-12 sm:py-16 md:py-20 border-b border-[#1A222C] min-h-[580px] sm:min-h-[640px] flex items-center">
        {/* Full-Width Animated Background Banner (Bright, Vivid & Full Resolution) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {heroImage.startsWith("/") ? (
            <Image
              src={heroImage}
              alt={customHeroBanner?.title || "Fayzee Store - Luxury Shopping Experience"}
              fill
              priority
              className="object-cover object-center animate-ken-burns will-change-transform opacity-95 sm:opacity-100"
              sizes="100vw"
            />
          ) : (
            <img
              src={heroImage}
              alt={customHeroBanner?.title || "Fayzee Store - Luxury Shopping Experience"}
              className="w-full h-full object-cover object-center animate-ken-burns will-change-transform opacity-95 sm:opacity-100"
            />
          )}

          {/* Soft directional gradient: preserves full image brightness while keeping text legible */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F14]/75 via-[#0B0F14]/30 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14]/80 via-transparent to-black/25"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Primary Hero Content - Clean floating text directly over background */}
            <div className={`${aiTopPick ? "lg:col-span-7" : "lg:col-span-9 max-w-3xl"} space-y-6 sm:space-y-7`}>
              {customHeroBanner?.badge && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-[#C8A96B] text-[#0B0F14] shadow-md uppercase tracking-wider">
                  {customHeroBanner.badge}
                </span>
              )}

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[64px] font-black tracking-tight leading-[1.1] text-white break-words drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">
                {customHeroBanner?.title ? (
                  customHeroBanner.title
                ) : (
                  <>
                    Shop Smart. <br />
                    <span className="bg-gradient-to-r from-[#C8A96B] via-[#FFF2D1] to-[#C8A96B] bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                      Shop Luxury.
                    </span>
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white font-medium max-w-2xl leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                {customHeroBanner?.subtitle ||
                  siteSettings?.siteTagline ||
                  "Explore thousands of verified authentic electronics, footwear, designer apparel, and home appliances directly from certified sellers with 100% genuine guarantees."}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
                <Link
                  href={customHeroBanner?.linkUrl || "/products"}
                  className="px-7 py-3.5 bg-[#C8A96B] hover:bg-[#B89858] text-[#0B0F14] font-black text-base sm:text-lg rounded-full shadow-[0_6px_25px_rgba(200,169,107,0.5)] transition flex items-center justify-center gap-2 active:scale-98 text-center"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </Link>
                <Link
                  href="/flash-sale"
                  className="px-7 py-3.5 bg-black/60 hover:bg-black/80 text-white font-bold text-base sm:text-lg rounded-full border border-white/30 backdrop-blur-md transition flex items-center justify-center gap-2 active:scale-98 text-center shadow-lg"
                >
                  <Zap className="w-5 h-5 text-[#C8A96B]" />
                  <span>View Flash Deals</span>
                </Link>
              </div>
            </div>

            {/* Hero Interactive Products Showcase Card (Right, 5 cols) - Only shown when Admin explicitly designates an AI Top Pick */}
            {aiTopPick && (
              <div className="lg:col-span-5 hidden lg:block">
                <div className="p-6 sm:p-7 rounded-3xl bg-[#161F2B]/85 backdrop-blur-xl border border-[#C8A96B]/40 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-4 animate-float">
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span className="font-bold flex items-center gap-1.5 text-[#F5F3EE]">
                      <Sparkles className="w-4 h-4 text-[#C8A96B]" /> Fayzee AI Top Pick
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md font-bold text-xs ${
                        ((aiTopPick.stockQuantity ?? 1) > 0)
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {((aiTopPick.stockQuantity ?? 1) > 0) ? "In Stock" : "Limited Stock"}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 group/item">
                      <img
                        src={
                          aiTopPick.images[0]?.url ||
                          "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800"
                        }
                        alt={aiTopPick.title}
                        className="w-full h-52 object-cover transform group-hover/item:scale-105 transition duration-500"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#0B0F14]/85 backdrop-blur-md text-[11px] font-bold text-[#C8A96B] border border-[#C8A96B]/40">
                        {aiTopPick.category?.name || "Featured"}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg truncate">
                        {aiTopPick.title}
                      </h4>
                      <p className="text-sm text-[#8A8F98] line-clamp-2 mt-1 leading-normal">
                        {aiTopPick.shortDescription ||
                          aiTopPick.description?.slice(0, 110) ||
                          "Authentic marketplace item with verified seller warranty."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div>
                        <span className="text-xs text-[#8A8F98]">Special Price</span>
                        <p className="text-2xl font-black text-[#C8A96B]">
                          Rs. {Math.round(aiTopPick.salePrice || aiTopPick.price).toLocaleString()}
                        </p>
                      </div>
                      <Link
                        href={`/products/${aiTopPick.slug}`}
                        className="px-5 py-2.5 bg-[#C8A96B] hover:bg-[#B89858] text-[#0B0F14] text-sm font-black rounded-xl transition shadow-md active:scale-95 flex items-center gap-1.5"
                      >
                        <span>View Product</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 2. Trending Products (Top of Homepage) */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B0F14] text-xs font-bold text-[#C8A96B] border border-[#C8A96B]/30 mb-2">
                <Flame className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>Featured Collection</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0B0F14] flex items-center gap-2">
                <span>Trending Marketplace Picks</span>
              </h2>
              <p className="text-sm text-[#8A8F98]">High-demand products with top customer ratings and seller guarantee</p>
            </div>
            <Link href="/products" className="text-sm font-bold text-[#0B0F14] hover:text-[#C8A96B] hover:underline transition">
              See All
            </Link>
          </div>

          {trendingProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {trendingProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  slug={product.slug}
                  price={product.price}
                  salePrice={product.salePrice}
                  discountPercent={product.discountPercent}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  image={product.images[0]?.url}
                  category={product.category.name}
                  seller={product.seller}
                  inStock={product.stockQuantity > 0}
                  isFeatured={Boolean(product.isFeatured)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#E8E5DC] space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-[#0B0F14] text-[#C8A96B] flex items-center justify-center mx-auto border border-[#C8A96B]/30">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0B0F14]">No Products in Featured Collection</h3>
              <p className="text-sm text-[#8A8F98] max-w-md mx-auto">
                Admin can select products from the Admin Dashboard (&quot;Featured &amp; Trending&quot; tab) to spotlight them here.
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-block px-5 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-white text-sm font-bold rounded-xl transition shadow-xs border border-[#0B0F14]"
                >
                  Explore All Products
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* 3. Flash Sale Section with Real Countdown */}
        {flashSale && flashSale.items.length > 0 && (
          <section className="p-6 sm:p-8 bg-white rounded-3xl border border-[#E8E5DC] shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/30 flex items-center justify-center shadow-md animate-pulse-glow shrink-0">
                  <Flame className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-[#0B0F14]">
                      {flashSale.title}
                    </h2>
                    <span className="px-2.5 py-0.5 bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/40 text-xs font-black rounded-md shadow-xs animate-pulse">
                      Limited Stock
                    </span>
                  </div>
                  <p className="text-sm text-[#8A8F98] mt-0.5">
                    {flashSale.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto bg-[#F5F3EE] px-4 py-2.5 rounded-2xl border border-[#E8E5DC] shadow-xs">
                <span className="text-sm font-bold text-[#0B0F14]">Ends in:</span>
                <FlashCountdown targetDate={flashSale.endTime} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {flashSale.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E5DC] hover:border-[#C8A96B] hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 flex gap-4"
                >
                  <img
                    src={
                      item.product.images[0]?.url ||
                      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300"
                    }
                    alt={item.product.title}
                    className="w-24 h-24 object-cover rounded-xl shrink-0 bg-[#F5F3EE] border border-[#E8E5DC]"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-sm sm:text-base font-bold text-[#0B0F14] hover:text-[#C8A96B] line-clamp-2 transition leading-snug"
                      >
                        {item.product.title}
                      </Link>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-base sm:text-lg font-black text-[#0B0F14]">
                          Rs. {Math.round(item.discountPrice).toLocaleString()}
                        </span>
                        <span className="text-xs sm:text-sm text-[#8A8F98] line-through">
                          Rs. {Math.round(item.product.price).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 space-y-1">
                      <div className="w-full bg-[#E8E5DC] rounded-full h-2.5 overflow-hidden shadow-inner">
                        <div
                          className="bg-[#0B0F14] h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              (item.soldCount / (item.stockLimit || 1)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-[#8A8F98] font-medium">
                        <span>Sold: {item.soldCount}</span>
                        <span>Available: {item.stockLimit - item.soldCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. All Products Feed (With on-demand Categories & Infinite Scroll) */}
        <HomeProductsFeed
          initialProducts={allProductsData.products}
          totalCount={allProductsData.total}
          categories={categories}
        />

        {/* 5. Verified Top Sellers */}
        <section className="p-6 sm:p-8 bg-[#0B0F14] text-white rounded-3xl space-y-6 border border-[#1A222C] shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-white">
                <Store className="w-5 h-5 text-[#C8A96B]" />
                <span>Official Stores & Certified Sellers</span>
              </h2>
              <p className="text-sm text-[#8A8F98] mt-0.5">Shop directly from verified brand distributors</p>
            </div>
            <Link
              href="/seller/register"
              className="text-sm font-bold text-[#C8A96B] hover:underline self-start sm:self-auto"
            >
              Apply to Sell on Fayzee →
            </Link>
          </div>

          {topSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {topSellers.map((seller) => (
                <div
                  key={seller.id}
                  className="bg-[#161F2B] p-4 sm:p-5 rounded-2xl border border-[#1A222C] hover:border-[#C8A96B]/60 transition flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={seller.logoUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100"}
                      alt={seller.storeName}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-[#1A222C]"
                    />
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white">{seller.storeName}</h4>
                      <p className="text-xs text-[#8A8F98] mt-0.5">{seller._count.products} Active Listings</p>
                      <span className="inline-flex items-center gap-1 text-xs text-[#C8A96B] font-semibold mt-0.5">
                        ★ {seller.rating.toFixed(1)} Rating
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1A222C] flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Official
                    </span>
                    <Link
                      href={`/sellers/${seller.storeSlug}`}
                      className="text-sm text-[#C8A96B] hover:underline font-bold"
                    >
                      Visit Store
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#161F2B] rounded-2xl border border-[#1A222C] p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-[#C8A96B]">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Certified Sellers & Brand Stores Opening Soon</h3>
              <p className="text-sm text-[#8A8F98] max-w-md mx-auto">
                Apply today to sell on Fayzee.store and launch your official store to verified buyers nationwide.
              </p>
              <div className="pt-2">
                <Link
                  href="/seller/register"
                  className="inline-block px-5 py-2.5 bg-[#C8A96B] hover:bg-[#B89858] text-[#0B0F14] text-sm font-bold rounded-xl transition"
                >
                  Apply as Seller
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* 6. Active Coupons Banner */}
        <section className="bg-[#0B0F14] border border-[#C8A96B]/30 text-white p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161F2B] border border-[#C8A96B]/30 text-xs sm:text-sm font-bold text-[#C8A96B]">
              <Tag className="w-4 h-4 text-[#C8A96B]" />
              <span>Special Voucher Codes</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Save Up to 10% Extra at Checkout!
            </h3>
            <p className="text-sm sm:text-base text-[#8A8F98] leading-relaxed">
              Apply code <code className="px-2 py-0.5 bg-black/60 rounded font-mono font-bold text-[#C8A96B] border border-[#C8A96B]/30">FAYZEE10</code> on orders over Rs. 2,000 or <code className="px-2 py-0.5 bg-black/60 rounded font-mono font-bold text-[#C8A96B] border border-[#C8A96B]/30">WELCOME500</code> on your first order.
            </p>
          </div>

          <Link
            href="/products"
            className="px-7 py-3.5 bg-[#C8A96B] hover:bg-[#B89858] text-[#0B0F14] font-black text-sm sm:text-base rounded-full shadow-md transition shrink-0 active:scale-98"
          >
            Redeem at Checkout
          </Link>
        </section>
      </div>
    </div>
  );
}
