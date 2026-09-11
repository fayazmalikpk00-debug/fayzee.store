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

export default async function HomePage() {
  const [allProductsData, categories, flashSale, trendingProducts, topSellers] =
    await Promise.all([
      getProducts({ limit: 16, sortBy: "newest" }),
      getCategories(),
      getFlashSaleProducts(),
      getTrendingProducts(8),
      prisma.sellerProfile.findMany({
        where: { status: "APPROVED" },
        take: 4,
        orderBy: { rating: "desc" },
        include: { _count: { select: { products: true } } },
      }),
    ]);

  // AI Top Pick: 1st priority trending, 2nd priority featured, 3rd priority top active product
  const aiTopPick =
    trendingProducts[0] ||
    allProductsData.products.find((p: any) => p.isFeatured) ||
    allProductsData.products[0] ||
    null;

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Promotional Banner with Luxury Visual Showcase */}
      <section className="relative overflow-hidden bg-[#0B0F14] text-white py-10 sm:py-14 md:py-20 border-b border-[#1A222C]">
        {/* Subtle Luxury Pattern Background & Radial Glow */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C8A96B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#C8A96B]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#C8A96B]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Primary Hero Content (Left, 6 cols) */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161F2B] backdrop-blur-md border border-[#C8A96B]/30 text-xs sm:text-sm font-semibold text-[#C8A96B] shadow-xs">
                <Sparkles className="w-4 h-4 text-[#C8A96B] shrink-0 animate-pulse" />
                <span className="text-[#F5F3EE]">Pakistan&apos;s Premier Multi-Vendor Marketplace</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white break-words">
                Shop Smart. <br />
                <span className="bg-gradient-to-r from-[#C8A96B] via-[#E8D9B5] to-[#C8A96B] bg-clip-text text-transparent">
                  Shop Luxury.
                </span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-[#8A8F98] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Explore thousands of verified authentic electronics, designer fashion, beauty, and home appliances directly from certified sellers with 100% genuine guarantees.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1">
                <Link
                  href="/products"
                  className="px-7 py-3.5 bg-[#C8A96B] hover:bg-[#B89858] text-[#0B0F14] font-black text-base rounded-full shadow-[0_4px_20px_rgba(200,169,107,0.35)] transition flex items-center justify-center gap-2 active:scale-98 text-center"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </Link>
                <Link
                  href="/flash-sale"
                  className="px-7 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold text-base rounded-full border border-white/20 backdrop-blur-md transition flex items-center justify-center gap-2 active:scale-98 text-center"
                >
                  <Zap className="w-5 h-5 text-[#C8A96B]" />
                  <span>View Flash Deals</span>
                </Link>
              </div>

              {/* Trust Indicators Strip */}
              <div className="pt-5 border-t border-white/10 grid grid-cols-3 gap-2 sm:gap-4 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#C8A96B]/15 border border-[#C8A96B]/30 flex items-center justify-center text-[#C8A96B] shrink-0 shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">100% Authentic</p>
                    <p className="text-[10px] text-slate-400">Verified Sellers</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#C8A96B]/15 border border-[#C8A96B]/30 flex items-center justify-center text-[#C8A96B] shrink-0 shadow-xs">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Fast Delivery</p>
                    <p className="text-[10px] text-slate-400">Nationwide COD</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#C8A96B]/15 border border-[#C8A96B]/30 flex items-center justify-center text-[#C8A96B] shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">18+ Departments</p>
                    <p className="text-[10px] text-slate-400">Curated Brands</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Visual Banner Showcase (Right, 6 cols) */}
            <div className="lg:col-span-6 w-full">
              <div className="relative group">
                {/* Ambient Golden Glow Backdrop */}
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#C8A96B]/40 via-[#E2C889]/30 to-[#C8A96B]/20 rounded-3xl sm:rounded-[36px] blur-xl opacity-75 group-hover:opacity-100 transition duration-700"></div>

                <div className="relative rounded-3xl sm:rounded-[32px] overflow-hidden border-2 border-[#C8A96B]/50 bg-[#161F2B] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                  <Link href="/products" className="block relative overflow-hidden group">
                    <Image
                      src="/images/hero-banner.jpg"
                      alt="Fayzee Store - Luxury Shopping Experience"
                      width={1280}
                      height={720}
                      priority
                      className="w-full h-[280px] sm:h-[380px] md:h-[430px] lg:h-[450px] object-cover transform group-hover:scale-103 transition duration-700 ease-out"
                    />

                    {/* Gradient Overlay for Sleek Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14]/85 via-[#0B0F14]/20 to-transparent pointer-events-none"></div>

                    {/* Floating Top Badge */}
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B0F14]/85 backdrop-blur-md border border-[#C8A96B]/60 text-[11px] sm:text-xs font-bold text-[#C8A96B] shadow-lg">
                        <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
                        <span>Official Marketplace</span>
                      </span>
                    </div>

                    {/* Floating Bottom Bar */}
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 z-10 flex items-center justify-between pointer-events-none gap-2">
                      <div className="px-3.5 py-2 rounded-2xl bg-[#0B0F14]/90 backdrop-blur-md border border-white/10 shadow-lg">
                        <p className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                          <span>Verified Brands &amp; Gadgets</span>
                        </p>
                        <p className="text-[10px] text-slate-400 hidden sm:block">
                          Electronics • Fashion • Beauty • Home Appliances
                        </p>
                      </div>

                      <span className="pointer-events-auto px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#C8A96B] hover:bg-white text-[#0B0F14] font-black text-xs sm:text-sm shadow-lg transition flex items-center gap-1.5 shrink-0 active:scale-95">
                        <span>Shop Now</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
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
              <h3 className="text-lg font-bold text-[#0B0F14]">No products listed yet</h3>
              <p className="text-sm text-[#8A8F98] max-w-md mx-auto">
                Verified seller products will appear here as soon as they are added to the catalog.
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-block px-5 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-white text-sm font-bold rounded-xl transition shadow-xs border border-[#0B0F14]"
                >
                  Explore Categories
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
