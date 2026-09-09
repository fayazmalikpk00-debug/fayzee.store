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

export const dynamic = "force-dynamic";

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
      <section className="relative overflow-hidden bg-[#1C2A39] text-white py-14 sm:py-16 md:py-24 border-b border-[#2A3B4C]">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#FF5E00_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Primary Hero Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-7">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-[#FF8C00] shadow-xs">
                <Sparkles className="w-4 h-4 text-[#FF8C00] shrink-0" />
                <span className="text-white">Powered by Fayzee AI Shopping Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-black tracking-tight leading-[1.08] text-white">
                Shop Smart. <br />
                <span className="text-[#FF5E00]">
                  Shop Easy.
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl leading-relaxed font-normal">
                Explore thousands of verified authentic electronics, footwear, and home appliances directly from certified sellers with 100% genuine guarantees.
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                <Link
                  href="/products"
                  className="px-7 py-3.5 bg-[#FF5E00] hover:bg-[#FF8C00] text-white font-bold text-base sm:text-lg rounded-full shadow-lg shadow-orange-950/30 transition flex items-center gap-2 active:scale-98"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/flash-sale"
                  className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-base sm:text-lg rounded-full border border-white/30 backdrop-blur-md transition flex items-center gap-2 active:scale-98"
                >
                  <Zap className="w-5 h-5 text-[#FF8C00]" />
                  <span>View Flash Deals</span>
                </Link>
              </div>
            </div>

            {/* Hero Interactive Showcase Card */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="p-6 sm:p-7 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-4">
                <div className="flex items-center justify-between text-sm text-slate-200">
                  <span className="font-bold flex items-center gap-1.5 text-white">
                    <Sparkles className="w-4 h-4 text-[#FF5E00]" /> Fayzee AI Top Pick
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md font-bold text-xs">
                    In Stock
                  </span>
                </div>
                {trendingProducts[0] ? (
                  <div className="space-y-4">
                    <img
                      src={
                        trendingProducts[0].images[0]?.url ||
                        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800"
                      }
                      alt={trendingProducts[0].title}
                      className="w-full h-52 object-cover rounded-2xl shadow-md"
                    />
                    <div>
                      <h4 className="font-bold text-white text-lg truncate">
                        {trendingProducts[0].title}
                      </h4>
                      <p className="text-sm text-slate-300 line-clamp-2 mt-1 leading-normal">
                        {trendingProducts[0].shortDescription}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div>
                        <span className="text-xs text-slate-400">Special Price</span>
                        <p className="text-2xl font-black text-[#FF5E00]">
                          Rs. {Math.round(trendingProducts[0].salePrice || trendingProducts[0].price).toLocaleString()}
                        </p>
                      </div>
                      <Link
                        href={`/products/${trendingProducts[0].slug}`}
                        className="px-5 py-2.5 bg-[#FF5E00] hover:bg-[#FF8C00] text-white text-sm font-bold rounded-xl transition shadow-sm"
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-[#FF8C00]">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-white text-lg">Fayzee Catalog Ready</h4>
                    <p className="text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
                      18 marketplace departments configured and ready for official seller product listings.
                    </p>
                    <div className="pt-2 flex justify-center gap-3">
                      <Link
                        href="/products"
                        className="px-5 py-2.5 bg-[#FF5E00] hover:bg-[#FF8C00] text-white text-sm font-bold rounded-xl transition shadow-sm"
                      >
                        Browse Categories
                      </Link>
                      <Link
                        href="/seller/register"
                        className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl border border-white/20 transition"
                      >
                        Become a Seller
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
              <h2 className="text-xl sm:text-2xl font-bold text-[#1C2A39] flex items-center gap-2">
                <span>Browse Categories</span>
              </h2>
              <p className="text-sm text-[#777777]">Shop curated top departments</p>
            </div>
            <Link href="/products" className="text-sm font-bold text-[#FF5E00] hover:text-[#FF8C00] hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group p-4 sm:p-5 bg-white rounded-2xl border border-[#DDE2E6] hover:border-[#FF5E00] hover:shadow-card-hover transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#F7F9FA] overflow-hidden shrink-0 border border-[#DDE2E6]">
                  <img
                    src={cat.image || "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200"}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-bold text-[#1C2A39] group-hover:text-[#FF5E00] truncate transition">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-[#777777] mt-0.5">
                    {cat._count.products} Products
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. Flash Sale Section with Real Countdown */}
        {flashSale && flashSale.items.length > 0 && (
          <section className="p-6 sm:p-8 bg-[#F7F9FA] rounded-3xl border border-[#DDE2E6] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FF5E00] text-white flex items-center justify-center shadow-md animate-pulse shrink-0">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-[#1C2A39]">
                      {flashSale.title}
                    </h2>
                    <span className="px-2.5 py-0.5 bg-[#DC2626] text-white text-xs font-extrabold rounded-md">
                      Limited Stock
                    </span>
                  </div>
                  <p className="text-sm text-[#777777] mt-0.5">
                    {flashSale.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-4 py-2.5 rounded-2xl border border-[#DDE2E6] shadow-xs">
                <span className="text-sm font-bold text-[#1C2A39]">Ends in:</span>
                <FlashCountdown targetDate={flashSale.endTime} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {flashSale.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DDE2E6] hover:border-[#FF5E00] transition shadow-xs flex gap-4"
                >
                  <img
                    src={
                      item.product.images[0]?.url ||
                      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300"
                    }
                    alt={item.product.title}
                    className="w-24 h-24 object-cover rounded-xl shrink-0 bg-[#F7F9FA] border border-[#DDE2E6]"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-sm sm:text-base font-bold text-[#1C2A39] hover:text-[#FF5E00] line-clamp-2 transition leading-snug"
                      >
                        {item.product.title}
                      </Link>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-base sm:text-lg font-black text-[#FF5E00]">
                          Rs. {Math.round(item.discountPrice).toLocaleString()}
                        </span>
                        <span className="text-xs sm:text-sm text-[#777777] line-through">
                          Rs. {Math.round(item.product.price).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 space-y-1">
                      <div className="w-full bg-[#E8EDF2] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#FF5E00] h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (item.soldCount / (item.stockLimit || 1)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-[#777777] font-medium">
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
              <h2 className="text-xl sm:text-2xl font-bold text-[#1C2A39] flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#FF5E00]" />
                <span>Trending Marketplace Picks</span>
              </h2>
              <p className="text-sm text-[#777777]">High-demand products with top customer ratings</p>
            </div>
            <Link href="/products" className="text-sm font-bold text-[#FF5E00] hover:text-[#FF8C00] hover:underline">
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
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#DDE2E6] space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F9FA] text-[#FF5E00] flex items-center justify-center mx-auto border border-[#DDE2E6]">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1C2A39]">No products listed yet</h3>
              <p className="text-sm text-[#777777] max-w-md mx-auto">
                Verified seller products will appear here as soon as they are added to the catalog.
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-block px-5 py-2.5 bg-[#FF5E00] hover:bg-[#FF8C00] text-white text-sm font-bold rounded-xl transition shadow-xs"
                >
                  Explore Categories
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* 5. Verified Top Sellers */}
        <section className="p-6 sm:p-8 bg-[#1C2A39] text-white rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-white">
                <Store className="w-5 h-5 text-[#FF5E00]" />
                <span>Official Stores & Certified Sellers</span>
              </h2>
              <p className="text-sm text-slate-300 mt-0.5">Shop directly from verified brand distributors</p>
            </div>
            <Link
              href="/seller/register"
              className="text-sm font-bold text-[#FF8C00] hover:underline self-start sm:self-auto"
            >
              Apply to Sell on Fayzee →
            </Link>
          </div>

          {topSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {topSellers.map((seller) => (
                <div
                  key={seller.id}
                  className="bg-[#15202B] p-4 sm:p-5 rounded-2xl border border-[#2A3B4C] hover:border-[#FF5E00] transition flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={seller.logoUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100"}
                      alt={seller.storeName}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-[#2A3B4C]"
                    />
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white">{seller.storeName}</h4>
                      <p className="text-xs text-slate-300 mt-0.5">{seller._count.products} Active Listings</p>
                      <span className="inline-flex items-center gap-1 text-xs text-[#FF8C00] font-semibold mt-0.5">
                        ⭐ {seller.rating.toFixed(1)} Rating
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#2A3B4C] flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Official
                    </span>
                    <Link
                      href={`/sellers/${seller.storeSlug}`}
                      className="text-sm text-[#FF8C00] hover:underline font-bold"
                    >
                      Visit Store
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#15202B] rounded-2xl border border-[#2A3B4C] p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-[#FF8C00]">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Certified Sellers & Brand Stores Opening Soon</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Apply today to sell on Fayzee.store and launch your official store to verified buyers nationwide.
              </p>
              <div className="pt-2">
                <Link
                  href="/seller/register"
                  className="inline-block px-5 py-2.5 bg-[#FF5E00] hover:bg-[#FF8C00] text-white text-sm font-bold rounded-xl transition"
                >
                  Apply as Seller
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* 6. Active Coupons Banner */}
        <section className="bg-[#1C2A39] border border-[#2A3B4C] text-white p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5E00]/20 text-xs sm:text-sm font-bold text-[#FF8C00]">
              <Tag className="w-4 h-4 text-[#FF5E00]" />
              <span>Special Voucher Codes</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Save Up to 10% Extra at Checkout!
            </h3>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Apply code <code className="px-2 py-0.5 bg-black/40 rounded font-mono font-bold text-[#FF8C00] border border-white/10">FAYZEE10</code> on orders over Rs. 2,000 or <code className="px-2 py-0.5 bg-black/40 rounded font-mono font-bold text-[#FF8C00] border border-white/10">WELCOME500</code> on your first order.
            </p>
          </div>

          <Link
            href="/products"
            className="px-7 py-3.5 bg-[#FF5E00] hover:bg-[#FF8C00] text-white font-extrabold text-sm sm:text-base rounded-full shadow-md transition shrink-0 active:scale-98"
          >
            Redeem at Checkout
          </Link>
        </section>
      </div>
    </div>
  );
}
