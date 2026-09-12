import { ProductCard } from "@/components/marketplace/ProductCard";
import { SellerStoreHeaderActions } from "@/components/marketplace/SellerStoreHeaderActions";
import prisma from "@/lib/db";
import { ShieldCheck, Star, Store } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const seller = await prisma.sellerProfile.findUnique({
    where: { storeSlug: slug },
    select: { storeName: true, description: true },
  });

  if (!seller) return { title: "Seller Store | Fayzee" };

  return {
    title: `${seller.storeName} — Official Store | Fayzee`,
    description: seller.description || `Shop authentic products from ${seller.storeName} on Fayzee Store.`,
    alternates: {
      canonical: `https://www.fayzee.store/sellers/${slug}`,
    },
  };
}

export default async function SellerStorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const seller = await prisma.sellerProfile.findUnique({
    where: { storeSlug: slug },
    include: {
      _count: {
        select: { followers: true },
      },
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
      <div className="relative rounded-3xl overflow-hidden bg-[#0B0F14] text-white shadow-card border border-[#1A222C]">
        <div className="h-44 sm:h-56 w-full relative">
          <img
            src={
              seller.bannerUrl ||
              "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400"
            }
            alt={seller.storeName}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/60 to-transparent" />
        </div>

        <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="flex items-end gap-4">
            <img
              src={
                seller.logoUrl ||
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200"
              }
              alt={seller.storeName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-[#0B0F14] shadow-card bg-[#0B0F14] shrink-0"
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
              <p className="text-xs text-[#8A8F98] max-w-xl line-clamp-2">
                {seller.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-stretch sm:self-auto">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-xs justify-around">
              <div className="text-center">
                <span className="text-[#C8A96B] font-extrabold flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#C8A96B]" /> {seller.rating.toFixed(1)}
                </span>
                <span className="text-[10px] text-white/70 block">({seller.reviewCount} Ratings)</span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div className="text-center">
                <span className="font-extrabold text-white">{seller.products.length}</span>
                <span className="text-[10px] text-white/70 block">Products</span>
              </div>
            </div>

            <SellerStoreHeaderActions
              seller={{
                id: seller.id,
                storeName: seller.storeName,
                storeSlug: seller.storeSlug,
                logoUrl: seller.logoUrl,
                rating: seller.rating,
                initialFollowerCount: (seller as any)._count?.followers || 0,
              }}
            />
          </div>
        </div>
      </div>

      {/* Seller Products Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#0B0F14] flex items-center gap-2">
          <Store className="w-5 h-5 text-[#C8A96B]" />
          <span>All Products by {seller.storeName}</span>
        </h2>

        {seller.products.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-[#E8E5DC] shadow-card">
            <p className="text-xs text-[#8A8F98]">This seller does not have any active products listed right now.</p>
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
      <div className="bg-white rounded-3xl border border-[#E8E5DC] p-6 sm:p-8 space-y-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E5DC] pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#0B0F14] flex items-center gap-2">
              <Star className="w-5 h-5 text-[#C8A96B] fill-[#C8A96B]" />
              <span>Customer Reviews for {seller.storeName}</span>
            </h2>
            <p className="text-xs text-[#8A8F98] mt-0.5">
              Verified customer feedback and store satisfaction ratings
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-base sm:text-lg font-black text-[#0B0F14]">
            <Star className="w-5 h-5 fill-[#C8A96B] text-[#C8A96B]" />
            <span>{seller.rating.toFixed(1)} / 5.0</span>
            <span className="text-xs text-[#8A8F98] font-normal">({seller.reviewCount} total reviews)</span>
          </div>
        </div>

        {sellerReviews.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8A8F98]">
            No reviews yet for products from this store. When buyers submit reviews, they will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sellerReviews.map((r) => (
              <div
                key={r.id}
                className="p-4 bg-[#F5F3EE] rounded-2xl border border-[#E8E5DC] space-y-2 hover:border-[#C8A96B]/60 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#0B0F14] text-[#C8A96B] flex items-center justify-center text-xs font-bold uppercase shrink-0 border border-[#C8A96B]/30">
                      {r.user.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-[#0B0F14] truncate">{r.user.name}</span>
                    {r.isVerifiedPurchase && (
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full shrink-0">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="flex text-[#C8A96B] shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= r.rating ? "fill-[#C8A96B]" : "text-[#8A8F98]/40 fill-[#8A8F98]/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-[#8A8F98]">
                  <span>Product: </span>
                  <a
                    href={`/products/${r.product.slug}`}
                    className="text-[#0B0F14] hover:text-[#C8A96B] font-semibold underline"
                  >
                    {r.product.title}
                  </a>
                </div>

                {r.title && <h4 className="text-xs font-bold text-[#0B0F14]">{r.title}</h4>}
                <p className="text-xs text-[#0B0F14] leading-relaxed">{r.comment}</p>

                {r.sellerResponse && (
                  <div className="mt-2 p-2.5 bg-white rounded-xl border border-[#E8E5DC] text-[11px] text-[#0B0F14]">
                    <span className="font-bold text-[#C8A96B]">Seller Response: </span>
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
