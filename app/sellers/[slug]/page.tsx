import { ProductCard } from "@/components/marketplace/ProductCard";
import prisma from "@/lib/db";
import { ShieldCheck, Star, Store } from "lucide-react";
import { notFound } from "next/navigation";

export default async function SellerStorePage({
  params,
}: {
  params: { slug: string };
}) {
  const seller = await prisma.sellerProfile.findUnique({
    where: { storeSlug: params.slug },
    include: {
      products: {
        where: { status: "ACTIVE" },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          category: true,
        },
      },
    },
  });

  if (!seller) {
    notFound();
  }

  // Fetch reviews across all products of this seller
  const sellerReviews = await prisma.review.findMany({
    where: {
      product: { sellerId: seller.id },
      isApproved: true,
    },
    include: {
      user: { select: { name: true, avatar: true } },
      product: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Store Banner & Profile Header */}
      <div className="relative rounded-3xl overflow-hidden bg-[#1C2A39] text-white shadow-md border border-[#2A3B4C]">
        <div className="h-44 sm:h-56 w-full relative">
          <img
            src={
              seller.bannerUrl ||
              "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400"
            }
            alt={seller.storeName}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C2A39] via-[#1C2A39]/60 to-transparent" />
        </div>

        <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="flex items-end gap-4">
            <img
              src={
                seller.logoUrl ||
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200"
              }
              alt={seller.storeName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-[#1C2A39] shadow-xl bg-[#15202B] shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black text-white">
                  {seller.storeName}
                </h1>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-md flex items-center gap-1 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" /> Official
                </span>
              </div>
              <p className="text-xs text-[#E8EDF2] max-w-xl line-clamp-2">
                {seller.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-xs self-stretch sm:self-auto justify-around">
            <div className="text-center">
              <span className="text-[#FF8C00] font-extrabold flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 fill-[#FF8C00]" /> {seller.rating.toFixed(1)}
              </span>
              <span className="text-[10px] text-white/70 block">({seller.reviewCount} Ratings)</span>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="text-center">
              <span className="font-extrabold text-white">{seller.products.length}</span>
              <span className="text-[10px] text-white/70 block">Products</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Products Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#1C2A39] flex items-center gap-2">
          <Store className="w-5 h-5 text-[#FF5E00]" />
          <span>All Products by {seller.storeName}</span>
        </h2>

        {seller.products.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-[#DDE2E6]">
            <p className="text-xs text-[#777777]">This seller does not have any active products listed right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {seller.products.map((product) => (
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
                seller={{ storeName: seller.storeName, storeSlug: seller.storeSlug }}
                inStock={product.stockQuantity > 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Store Customer Reviews Section */}
      <div className="bg-white rounded-3xl border border-[#DDE2E6] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDE2E6] pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#1C2A39] flex items-center gap-2">
              <Star className="w-5 h-5 text-[#FF8C00] fill-[#FF8C00]" />
              <span>Customer Reviews for {seller.storeName}</span>
            </h2>
            <p className="text-xs text-[#777777] mt-0.5">
              Verified customer feedback and store satisfaction ratings
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-base sm:text-lg font-black text-[#FF5E00]">
            <Star className="w-5 h-5 fill-[#FF8C00] text-[#FF8C00]" />
            <span>{seller.rating.toFixed(1)} / 5.0</span>
            <span className="text-xs text-[#777777] font-normal">({seller.reviewCount} total reviews)</span>
          </div>
        </div>

        {sellerReviews.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#777777]">
            No reviews yet for products from this store. When buyers submit reviews, they will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sellerReviews.map((r) => (
              <div
                key={r.id}
                className="p-4 bg-[#F7F9FA] rounded-2xl border border-[#DDE2E6] space-y-2 hover:border-[#FF5E00]/40 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#1C2A39] text-white flex items-center justify-center text-xs font-bold uppercase shrink-0">
                      {r.user.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-[#1C2A39] truncate">{r.user.name}</span>
                    {r.isVerifiedPurchase && (
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full shrink-0">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="flex text-[#FF8C00] shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= r.rating ? "fill-[#FF8C00]" : "text-slate-300 fill-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-[#777777]">
                  <span>Product: </span>
                  <a
                    href={`/products/${r.product.slug}`}
                    className="text-[#1C2A39] hover:text-[#FF5E00] font-semibold underline"
                  >
                    {r.product.title}
                  </a>
                </div>

                {r.title && <h4 className="text-xs font-bold text-[#1C2A39]">{r.title}</h4>}
                <p className="text-xs text-[#333333] leading-relaxed">{r.comment}</p>

                {r.sellerResponse && (
                  <div className="mt-2 p-2.5 bg-white rounded-xl border border-orange-200 text-[11px] text-slate-700">
                    <span className="font-bold text-[#FF5E00]">Seller Response: </span>
                    {r.sellerResponse}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
