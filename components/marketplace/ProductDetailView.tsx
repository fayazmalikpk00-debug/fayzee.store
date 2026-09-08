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
    product.images[0]?.url || "/images/product-placeholder.svg"
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
    <div className="space-y-8 sm:space-y-12 pb-28 md:pb-8 w-full max-w-full overflow-x-hidden">
      {/* Top Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6 space-y-3 sm:space-y-4">
          <div className="relative aspect-square w-full max-w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            {product.discountPercent && product.discountPercent > 0 ? (
              <span className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2.5 py-1 bg-[#FF5E00] text-white text-[11px] sm:text-xs font-black rounded-lg shadow-md">
                -{product.discountPercent}% OFF
              </span>
            ) : null}
          </div>

          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1.5 -mx-1 px-1">
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition shrink-0 min-w-[64px] min-h-[64px] ${
                    selectedImage === img.url
                      ? "border-[#FF5E00] ring-2 ring-[#FF5E00]/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  aria-label="View product image"
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details & Purchase Actions */}
        <div className="lg:col-span-6 space-y-5 sm:space-y-6">
          {/* Breadcrumbs / Seller line */}
          <div className="flex items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <Link href={`/category/${product.category.slug}`} className="hover:text-[#FF5E00] font-semibold truncate">
                {product.category.name}
              </Link>
              {product.brand && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-slate-800 truncate">{product.brand.name}</span>
                </>
              )}
            </div>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="flex items-center gap-1 text-slate-500 hover:text-red-500 transition shrink-0 p-1"
              aria-label="Save to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
              <span className="hidden sm:inline text-xs">Wishlist</span>
            </button>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1C2A39] leading-snug break-words">
            {product.title}
          </h1>

          {/* Rating and SKU */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-[#777777]">({product.reviewCount} reviews)</span>
            <span className="text-slate-300 hidden xs:inline">|</span>
            <span className="text-[#777777]">SKU: <code className="text-[#333333] font-mono text-[11px]">{selectedVariant?.sku || product.sku}</code></span>
          </div>

          {/* Price Block */}
          <div className="p-3.5 sm:p-4 bg-[#F7F9FA] rounded-2xl border border-[#DDE2E6] flex flex-wrap items-baseline gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl font-black text-[#FF5E00]">
              {formatPrice(currentPrice)}
            </span>
            {originalPrice && (
              <span className="text-xs sm:text-sm text-[#777777] line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className={`ml-auto text-xs font-bold flex items-center gap-1 ${
              currentStock > 0 ? "text-emerald-600" : "text-red-600"
            }`}>
              <Check className="w-3.5 h-3.5" /> {currentStock > 0 ? `${currentStock} In Stock` : "Out of Stock"}
            </span>
          </div>

          {/* Variant Selector */}
          {product.variants.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-[#1C2A39] uppercase tracking-wider block">
                Select Option / Variant:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold border transition min-h-[42px] flex items-center justify-center ${
                      selectedVariant?.id === v.id
                        ? "border-[#FF5E00] bg-orange-50/50 text-[#FF5E00] ring-2 ring-[#FF5E00]/20 font-bold"
                        : "border-[#DDE2E6] bg-white hover:border-[#FF5E00] text-[#333333]"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & In-page Action Buttons (Hidden on mobile when sticky bar is active, visible on md+) */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#333333]">Quantity:</span>
              <div className="flex items-center border border-[#DDE2E6] rounded-xl bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 sm:p-2 text-[#333333] hover:text-[#FF5E00] transition min-w-[38px] min-h-[38px] flex items-center justify-center"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs font-bold text-[#1C2A39] min-w-[28px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="p-2 sm:p-2 text-[#333333] hover:text-[#FF5E00] transition min-w-[38px] min-h-[38px] flex items-center justify-center"
                  disabled={quantity >= currentStock}
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[11px] text-[#777777] truncate">Max {currentStock}</span>
            </div>

            {/* In-page Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1">
              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className={`py-3 sm:py-3.5 px-4 sm:px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 transition min-h-[46px] ${
                  added
                    ? "bg-emerald-600 text-white shadow-md"
                    : currentStock > 0
                    ? "bg-[#FF5E00] hover:bg-[#FF8C00] text-white shadow-md"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
                className="py-3 sm:py-3.5 px-4 sm:px-6 rounded-2xl font-bold text-xs bg-[#1C2A39] hover:bg-[#243345] text-white shadow-lg transition flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 min-h-[46px]"
              >
                <Zap className="w-4 h-4 text-[#FF5E00] shrink-0" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Seller Snapshot Card */}
          <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-[#DDE2E6] shadow-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5E00] shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] text-[#777777] font-medium">Sold by</p>
                <Link
                  href={`/sellers/${product.seller.storeSlug}`}
                  className="text-xs font-bold text-[#1C2A39] hover:text-[#FF5E00] transition truncate block"
                >
                  {product.seller.storeName}
                </Link>
                <p className="text-[10px] text-[#FF8C00] font-bold truncate">
                  ⭐ {product.seller.rating.toFixed(1)} Rating
                </p>
              </div>
            </div>

            <Link
              href={`/sellers/${product.seller.storeSlug}`}
              className="px-3 py-1.5 text-xs font-semibold text-[#FF5E00] bg-orange-50 hover:bg-orange-100 rounded-lg transition shrink-0"
            >
              Visit Store
            </Link>
          </div>

          {/* Delivery & Warranty perks */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-xs">
            <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-[#F7F9FA] rounded-xl border border-[#DDE2E6]">
              <Truck className="w-4 h-4 text-[#FF5E00] shrink-0" />
              <span className="text-[#333333] text-[11px] sm:text-xs font-medium">2-4 Days Delivery</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-[#F7F9FA] rounded-xl border border-[#DDE2E6]">
              <RotateCcw className="w-4 h-4 text-[#FF8C00] shrink-0" />
              <span className="text-[#333333] text-[11px] sm:text-xs font-medium">7-Day Free Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Description Tabs */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#DDE2E6] p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <h2 className="text-base sm:text-lg font-bold text-[#1C2A39] border-b border-[#DDE2E6] pb-3">
          Product Specifications & Description
        </h2>

        {/* Specifications Table */}
        {Object.keys(specs).length > 0 && (
          <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-[#DDE2E6] -mx-1 sm:mx-0">
            <table className="w-full text-xs text-left">
              <tbody>
                {Object.entries(specs).map(([key, val], idx) => (
                  <tr
                    key={key}
                    className={idx % 2 === 0 ? "bg-[#F7F9FA]" : "bg-white"}
                  >
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold text-[#1C2A39] w-1/3 border-b border-[#DDE2E6] break-words">
                      {key}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-[#333333] border-b border-[#DDE2E6] break-words">
                      {String(val)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detailed description */}
        <div className="prose prose-sm max-w-none text-[#333333] leading-relaxed pt-1 text-xs sm:text-sm">
          <p className="whitespace-pre-line">{product.description}</p>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#DDE2E6] p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-[#DDE2E6] pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1C2A39]">Customer Reviews</h2>
            <p className="text-[11px] sm:text-xs text-[#777777]">Verified buyer ratings & feedback</p>
          </div>
          <div className="flex items-center gap-1 text-[#FF8C00] font-extrabold text-base sm:text-lg">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-[#FF8C00]" />
            <span>{product.rating.toFixed(1)} / 5.0</span>
          </div>
        </div>

        {product.reviews.length === 0 ? (
          <p className="text-xs text-[#777777]">
            No customer reviews yet. Be the first verified buyer to review this product!
          </p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {product.reviews.map((r: any) => (
              <div key={r.id} className="p-3.5 sm:p-4 bg-[#F7F9FA] rounded-2xl border border-[#DDE2E6] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs font-bold text-[#1C2A39] truncate">{r.user.name}</span>
                    {r.isVerifiedPurchase && (
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] sm:text-[10px] font-bold rounded-full flex items-center gap-0.5 shrink-0">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex text-[#FF8C00] shrink-0">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#FF8C00]" />
                    ))}
                  </div>
                </div>

                {r.title && <h4 className="text-xs font-bold text-[#1C2A39]">{r.title}</h4>}
                <p className="text-xs text-[#333333] leading-relaxed">{r.comment}</p>

                {r.sellerResponse && (
                  <div className="mt-2 p-2.5 sm:p-3 bg-white rounded-xl border border-[#DDE2E6] text-xs text-[#333333]">
                    <span className="font-bold text-[#FF5E00]">Seller Response: </span>
                    {r.sellerResponse}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom Action Bar (visible on screens < md) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#DDE2E6] p-3 md:hidden shadow-2xl safe-bottom flex items-center gap-2">
        <div className="min-w-0 flex-1 pl-1">
          <span className="text-[10px] text-[#777777] block leading-none">Price</span>
          <span className="text-base font-black text-[#FF5E00] truncate block">
            {formatPrice(currentPrice)}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={currentStock <= 0}
          className={`py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shrink-0 min-h-[42px] ${
            added
              ? "bg-emerald-600 text-white shadow-xs"
              : currentStock > 0
              ? "bg-[#FF5E00] hover:bg-[#FF8C00] text-white shadow-xs"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          <span>{added ? "Added" : "Add to Cart"}</span>
        </button>

        <button
          onClick={handleBuyNow}
          disabled={currentStock <= 0}
          className="py-2.5 px-4 rounded-xl font-bold text-xs bg-[#1C2A39] hover:bg-[#243345] text-white shadow-md transition flex items-center justify-center gap-1 shrink-0 disabled:opacity-50 min-h-[42px]"
        >
          <Zap className="w-3.5 h-3.5 text-[#FF5E00]" />
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
}
