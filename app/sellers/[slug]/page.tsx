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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Store Banner & Profile Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-md">
        <div className="h-44 sm:h-56 w-full relative">
          <img
            src={
              seller.bannerUrl ||
              "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400"
            }
            alt={seller.storeName}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="flex items-end gap-4">
            <img
              src={
                seller.logoUrl ||
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200"
              }
              alt={seller.storeName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-slate-900 shadow-xl bg-slate-800 shrink-0"
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
              <p className="text-xs text-slate-300 max-w-xl line-clamp-2">
                {seller.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-xs self-stretch sm:self-auto justify-around">
            <div className="text-center">
              <span className="text-amber-400 font-extrabold flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {seller.rating.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400">Positive Rating</span>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="text-center">
              <span className="font-extrabold text-white">{seller.products.length}</span>
              <span className="text-[10px] text-slate-400 block">Products</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Products Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Store className="w-5 h-5 text-brand-600" />
          <span>All Products by {seller.storeName}</span>
        </h2>

        {seller.products.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-slate-200">
            <p className="text-xs text-slate-500">This seller does not have any active products listed right now.</p>
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
    </div>
  );
}
