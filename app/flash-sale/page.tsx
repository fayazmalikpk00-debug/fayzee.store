import { FlashCountdown } from "@/components/marketplace/FlashCountdown";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { getFlashSaleProducts } from "@/services/productService";
import { Flame, Zap } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FlashSalePage() {
  const flashSale = await getFlashSaleProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden bg-[#1C2A39] text-white p-8 sm:p-12 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#2A3B4C]">
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-black uppercase tracking-wider text-[#FF5E00] border border-white/10">
            <Flame className="w-4 h-4 text-[#FF5E00] animate-bounce" />
            <span>Exclusive Flash Deals</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            ⚡ Super Flash Sale
          </h1>
          <p className="text-xs sm:text-sm text-[#E8EDF2] max-w-xl">
            Limited stock flash deals up to 35% off on flagship tech and lifestyle brands.
          </p>
        </div>

        {flashSale && (
          <div className="bg-[#15202B]/90 backdrop-blur-md p-5 rounded-3xl border border-[#2A3B4C] text-center space-y-2">
            <span className="text-xs text-[#FF8C00] font-bold uppercase tracking-wider block">
              Sale Concludes In:
            </span>
            <FlashCountdown targetDate={flashSale.endTime} />
          </div>
        )}
      </div>

      {/* Flash Sale Product Grid */}
      {!flashSale || flashSale.items.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-[#DDE2E6] space-y-3">
          <p className="text-sm font-bold text-[#1C2A39]">No active flash sale right now.</p>
          <p className="text-xs text-[#777777]">Check back soon or explore our general catalog.</p>
          <Link href="/products" className="inline-block px-4 py-2 bg-[#FF5E00] hover:bg-[#FF8C00] text-white text-xs font-bold rounded-xl transition">
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {flashSale.items.map((item) => (
            <ProductCard
              key={item.id}
              id={item.product.id}
              title={item.product.title}
              slug={item.product.slug}
              price={item.product.price}
              salePrice={item.discountPrice}
              discountPercent={Math.round(
                ((item.product.price - item.discountPrice) / item.product.price) * 100
              )}
              rating={item.product.rating}
              reviewCount={item.product.reviewCount}
              image={item.product.images[0]?.url}
              category={item.product.category.name}
              inStock={item.stockLimit - item.soldCount > 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
