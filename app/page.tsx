import { FlashCountdown } from "@/components/marketplace/FlashCountdown";
import { ProductCard } from "@/components/marketplace/ProductCard";
import prisma from "@/lib/db";
import {
  getCategories,
  getFeaturedProducts,
  getFlashSaleProducts,
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
import Link from "next/link";

export const revalidate = 60; // ISR cache revalidation every 60s

export default async function HomePage() {
  const [categories, flashSale, trendingProducts, featuredProducts, topSellers] =
    await Promise.all([
      getCategories(),
      getFlashSaleProducts(),
      getTrendingProducts(8),
      getFeaturedProducts(8),
      prisma.sellerProfile.findMany({
        where: { status: "APPROVED" },
        take: 4,
        orderBy: { rating: "desc" },
        include: { _count: { select: { products: true } } },
      }),
    ]);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Promotional Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0B132B] via-[#1C2541] to-[#3A506B] text-white py-12 md:py-20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00B4D8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-fayzee-cyan">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Powered by Fayzee AI Shopping Intelligence</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Shop Smart. <br />
                <span className="bg-gradient-to-r from-fayzee-cyan via-white to-fayzee-coral bg-clip-text text-transparent">
                  Shop Easy.
                </span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
                Explore thousands of verified authentic electronics, footwear, and home appliances directly from certified sellers with 100% genuine guarantees.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/products"
                  className="px-6 py-3 bg-gradient-to-r from-fayzee-coral to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm rounded-full shadow-lg transition flex items-center gap-2"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/flash-sale"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-full border border-white/30 backdrop-blur-md transition flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>View Flash Deals</span>
                </Link>
              </div>
            </div>

            {/* Hero Interactive Showcase Card */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-fayzee-cyan" /> Fayzee AI Top Pick
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                    In Stock
                  </span>
                </div>
                {trendingProducts[0] && (
                  <div className="space-y-3">
                    <img
                      src={
                        trendingProducts[0].images[0]?.url ||
                        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800"
                      }
                      alt={trendingProducts[0].title}
                      className="w-full h-48 object-cover rounded-2xl shadow-md"
                    />
                    <div>
                      <h4 className="font-bold text-white text-base truncate">
                        {trendingProducts[0].title}
                      </h4>
                      <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                        {trendingProducts[0].shortDescription}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div>
                        <span className="text-xs text-slate-400">Special Price</span>
                        <p className="text-lg font-extrabold text-amber-400">
                          Rs. {Math.round(trendingProducts[0].salePrice || trendingProducts[0].price).toLocaleString()}
                        </p>
                      </div>
                      <Link
                        href={`/products/${trendingProducts[0].slug}`}
                        className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition"
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 2. Featured Categories */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>Browse Categories</span>
              </h2>
              <p className="text-xs text-slate-500">Shop curated top departments</p>
            </div>
            <Link href="/products" className="text-xs font-semibold text-brand-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-brand-400 hover:shadow-card-hover transition-all flex items-center gap-3.5"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                  <img
                    src={cat.image || "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200"}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 truncate">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {cat._count.products} Products
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. Flash Sale Section with Real Countdown */}
        {flashSale && flashSale.items.length > 0 && (
          <section className="p-6 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100/50 rounded-3xl border border-orange-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-fayzee-coral text-white flex items-center justify-center shadow-md animate-pulse">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">
                      {flashSale.title}
                    </h2>
                    <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-extrabold rounded-md">
                      Limited Stock
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {flashSale.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-orange-200">
                <span className="text-xs font-semibold text-slate-700">Ends in:</span>
                <FlashCountdown targetDate={flashSale.endTime} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {flashSale.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-2xl border border-orange-200 hover:border-orange-400 transition shadow-sm flex gap-4"
                >
                  <img
                    src={
                      item.product.images[0]?.url ||
                      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300"
                    }
                    alt={item.product.title}
                    className="w-24 h-24 object-cover rounded-xl shrink-0 bg-slate-50"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-xs font-bold text-slate-900 hover:text-brand-600 line-clamp-2"
                      >
                        {item.product.title}
                      </Link>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-black text-fayzee-coral">
                          Rs. {Math.round(item.discountPrice).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          Rs. {Math.round(item.product.price).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-fayzee-coral h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (item.soldCount / (item.stockLimit || 1)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
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

        {/* 4. Trending Products */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-fayzee-coral" />
                <span>Trending Marketplace Picks</span>
              </h2>
              <p className="text-xs text-slate-500">High-demand products with top customer ratings</p>
            </div>
            <Link href="/products" className="text-xs font-semibold text-brand-600 hover:underline">
              See All
            </Link>
          </div>

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
              />
            ))}
          </div>
        </section>

        {/* 5. Verified Top Sellers */}
        <section className="p-6 bg-slate-900 text-white rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <Store className="w-5 h-5 text-fayzee-cyan" />
                <span>Official Stores & Certified Sellers</span>
              </h2>
              <p className="text-xs text-slate-400">Shop directly from verified brand distributors</p>
            </div>
            <Link
              href="/seller/register"
              className="text-xs font-semibold text-amber-400 hover:underline self-start sm:self-auto"
            >
              Apply to Sell on Fayzee →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topSellers.map((seller) => (
              <div
                key={seller.id}
                className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 hover:border-fayzee-cyan transition flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={seller.logoUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100"}
                    alt={seller.storeName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{seller.storeName}</h4>
                    <p className="text-[11px] text-slate-400">{seller._count.products} Active Listings</p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                      ⭐ {seller.rating.toFixed(1)} Rating
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Official
                  </span>
                  <Link
                    href={`/sellers/${seller.storeSlug}`}
                    className="text-xs text-fayzee-cyan hover:underline font-medium"
                  >
                    Visit Store
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Active Coupons Banner */}
        <section className="bg-gradient-to-r from-brand-600 via-indigo-600 to-fayzee-dark text-white p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold">
              <Tag className="w-3.5 h-3.5 text-amber-300" />
              <span>Special Voucher Codes</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Save Up to 10% Extra at Checkout!
            </h3>
            <p className="text-xs text-slate-200">
              Apply code <code className="px-2 py-0.5 bg-black/30 rounded font-mono font-bold text-amber-300">FAYZEE10</code> on orders over Rs. 2,000 or <code className="px-2 py-0.5 bg-black/30 rounded font-mono font-bold text-amber-300">WELCOME500</code> on your first order.
            </p>
          </div>

          <Link
            href="/products"
            className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs rounded-full shadow-md transition shrink-0"
          >
            Redeem at Checkout
          </Link>
        </section>
      </div>
    </div>
  );
}
