"use client";

import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import {
  Check,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Truck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProductDetailView({ product }: { product: any }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"
  );
  const [selectedVariant, setSelectedVariant] = useState<any>(
    product.variants[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Authoritative current price and stock based on variant selection
  const currentPrice = selectedVariant?.salePrice ?? selectedVariant?.price ?? product.salePrice ?? product.price;
  const originalPrice = selectedVariant?.salePrice ? selectedVariant?.price : product.salePrice ? product.price : null;
  const currentStock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;

  const handleAddToCart = async () => {
    const ok = await addToCart(product.id, selectedVariant?.id, quantity);
    if (ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    }
  };

  const handleBuyNow = async () => {
    const ok = await addToCart(product.id, selectedVariant?.id, quantity);
    if (ok) {
      router.push("/checkout");
    }
  };

  const specs = product.specifications ? JSON.parse(product.specifications) : {};

  return (
    <div className="space-y-12">
      {/* Top Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            {product.discountPercent && product.discountPercent > 0 ? (
              <span className="absolute top-4 left-4 px-3 py-1 bg-fayzee-coral text-white text-xs font-black rounded-lg shadow-md">
                -{product.discountPercent}% OFF
              </span>
            ) : null}
          </div>

          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                    selectedImage === img.url
                      ? "border-brand-600 ring-2 ring-brand-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details & Purchase Actions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Breadcrumbs / Seller line */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5 truncate">
              <Link href={`/category/${product.category.slug}`} className="hover:text-brand-600 font-semibold">
                {product.category.name}
              </Link>
              {product.brand && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-slate-800">{product.brand.name}</span>
                </>
              )}
            </div>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="flex items-center gap-1 text-slate-500 hover:text-red-500 transition"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
              <span className="hidden sm:inline">Wishlist</span>
            </button>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            {product.title}
          </h1>

          {/* Rating and SKU */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-slate-500">({product.reviewCount} customer reviews)</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">SKU: <code className="text-slate-700 font-mono">{selectedVariant?.sku || product.sku}</code></span>
          </div>

          {/* Price Block */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-black text-brand-700">
              {formatPrice(currentPrice)}
            </span>
            {originalPrice && (
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="ml-auto text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {currentStock > 0 ? `${currentStock} In Stock` : "Out of Stock"}
            </span>
          </div>

          {/* Variant Selector */}
          {product.variants.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Select Option / Variant:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                      selectedVariant?.id === v.id
                        ? "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Action Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-slate-500 hover:text-slate-800 transition"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="p-2 text-slate-500 hover:text-slate-800 transition"
                  disabled={quantity >= currentStock}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[11px] text-slate-400">Max {currentStock} per customer</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className={`py-3.5 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                  added
                    ? "bg-emerald-600 text-white shadow-md"
                    : currentStock > 0
                    ? "bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
                className="py-3.5 px-6 rounded-2xl font-bold text-xs bg-gradient-to-r from-fayzee-coral to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Seller Snapshot Card */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Sold and shipped by</p>
                <Link
                  href={`/sellers/${product.seller.storeSlug}`}
                  className="text-xs font-bold text-slate-900 hover:text-brand-600 transition"
                >
                  {product.seller.storeName}
                </Link>
                <p className="text-[10px] text-amber-500 font-bold">
                  ⭐ {product.seller.rating.toFixed(1)} Positive Seller Rating
                </p>
              </div>
            </div>

            <Link
              href={`/sellers/${product.seller.storeSlug}`}
              className="px-3 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition"
            >
              Visit Store
            </Link>
          </div>

          {/* Delivery & Warranty perks */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <Truck className="w-4 h-4 text-brand-600 shrink-0" />
              <span className="text-slate-700">Delivery in 2-4 Days</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-slate-700">7 Days Return Window</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Description Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-900 border-b pb-3">
          Product Specifications & Description
        </h2>

        {/* Specifications Table */}
        {Object.keys(specs).length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <tbody>
                {Object.entries(specs).map(([key, val], idx) => (
                  <tr
                    key={key}
                    className={idx % 2 === 0 ? "bg-slate-50/70" : "bg-white"}
                  >
                    <td className="py-3 px-4 font-bold text-slate-700 w-1/3 border-b border-slate-100">
                      {key}
                    </td>
                    <td className="py-3 px-4 text-slate-800 border-b border-slate-100">
                      {String(val)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detailed description */}
        <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed pt-2">
          <p className="whitespace-pre-line">{product.description}</p>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Customer Reviews</h2>
            <p className="text-xs text-slate-500">Verified buyer ratings & feedback</p>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-lg">
            <Star className="w-5 h-5 fill-amber-400" />
            <span>{product.rating.toFixed(1)} / 5.0</span>
          </div>
        </div>

        {product.reviews.length === 0 ? (
          <p className="text-xs text-slate-500">
            No customer reviews yet. Be the first verified buyer to review this product!
          </p>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((r: any) => (
              <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{r.user.name}</span>
                    {r.isVerifiedPurchase && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                {r.title && <h4 className="text-xs font-bold text-slate-800">{r.title}</h4>}
                <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>

                {r.sellerResponse && (
                  <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
                    <span className="font-bold text-brand-700">Seller Response: </span>
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
