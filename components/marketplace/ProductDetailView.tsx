"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Heart,
  Loader2,
  MessageSquare,
  MessageSquarePlus,
  Minus,
  PenSquare,
  Plus,
  RotateCcw,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Truck,
  User as UserIcon,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function getColorHex(colorName: string): string {
  const lower = colorName.toLowerCase();
  if (lower.includes("navy")) return "#1B2A47";
  if (lower.includes("blue")) return "#2563EB";
  if (lower.includes("light brown") || lower.includes("tan")) return "#C4A482";
  if (lower.includes("brown")) return "#8B4513";
  if (lower.includes("off-white") || lower.includes("cream")) return "#FDF6E2";
  if (lower.includes("white")) return "#FFFFFF";
  if (lower.includes("black")) return "#111827";
  if (lower.includes("grey") || lower.includes("gray")) return "#9CA3AF";
  if (lower.includes("red")) return "#DC2626";
  if (lower.includes("green")) return "#16A34A";
  if (lower.includes("yellow")) return "#EAB308";
  if (lower.includes("pink")) return "#EC4899";
  if (lower.includes("orange")) return "#FF5E00";
  return "#D1D5DB";
}

export function ProductDetailView({ product }: { product: any }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const variants = product.variants || [];

  // Extract available colors
  const rawColors: string[] = [];
  variants.forEach((v: any) => {
    if (v.color && typeof v.color === "string" && v.color.trim()) {
      rawColors.push(v.color.trim());
    } else if (v.name && v.name.includes("/")) {
      const parts = v.name.split("/").map((s: string) => s.trim());
      if (parts[0]) rawColors.push(parts[0]);
    }
  });
  const availableColors = Array.from(new Set(rawColors));

  // Extract available sizes
  const rawSizes: string[] = [];
  variants.forEach((v: any) => {
    if (v.size && typeof v.size === "string" && v.size.trim()) {
      const parts = v.size
        .split(/[,/]/)
        .map((s: string) => s.trim().replace(/^size\s+/i, ""))
        .filter(Boolean);
      rawSizes.push(...parts);
    } else if (v.name && v.name.toLowerCase().includes("size")) {
      const match = v.name.match(/size\s*([0-9a-zA-Z]+)/i);
      if (match && match[1]) rawSizes.push(match[1]);
    }
  });

  // Also check specifications or attributes if size not found in variants
  if (rawSizes.length === 0 && product.attributes) {
    try {
      const attrs = typeof product.attributes === "string" ? JSON.parse(product.attributes) : product.attributes;
      if (attrs?.size && typeof attrs.size === "string") {
        const parts = attrs.size.split(/[,/]/).map((s: string) => s.trim()).filter(Boolean);
        rawSizes.push(...parts);
      }
    } catch (_) {}
  }
  const availableSizes = Array.from(new Set(rawSizes));

  const [selectedColor, setSelectedColor] = useState<string>(
    availableColors[0] || variants[0]?.color || ""
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    availableSizes[0] || variants[0]?.size || ""
  );
  const [sizeError, setSizeError] = useState<string>("");
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);

  // Helper to find best matching variant for color + size
  const getMatchingVariant = (color: string, size: string) => {
    if (!variants || variants.length === 0) return null;

    if (color && size) {
      const match = variants.find((v: any) => {
        const cMatch = v.color && v.color.toLowerCase() === color.toLowerCase();
        const sMatch =
          v.size &&
          (v.size.toLowerCase() === size.toLowerCase() ||
            v.size.toLowerCase().includes(size.toLowerCase()));
        const nameMatch =
          v.name &&
          v.name.toLowerCase().includes(color.toLowerCase()) &&
          v.name.toLowerCase().includes(size.toLowerCase());
        return (cMatch && sMatch) || nameMatch;
      });
      if (match) return match;
    }

    if (color) {
      const match = variants.find(
        (v: any) =>
          (v.color && v.color.toLowerCase() === color.toLowerCase()) ||
          (v.name && v.name.toLowerCase().includes(color.toLowerCase()))
      );
      if (match) return match;
    }

    if (size) {
      const match = variants.find(
        (v: any) =>
          (v.size && v.size.toLowerCase() === size.toLowerCase()) ||
          (v.name && v.name.toLowerCase().includes(size.toLowerCase()))
      );
      if (match) return match;
    }

    return variants[0] || null;
  };

  const [selectedVariant, setSelectedVariant] = useState<any>(() =>
    getMatchingVariant(availableColors[0] || "", availableSizes[0] || "") || variants[0] || null
  );

  // Helper to find the best image URL for a color
  const getImageForColor = (color: string): string | null => {
    if (!color) return null;
    const colorLower = color.toLowerCase().trim();

    // 1. Check if any variant of this color has an explicit image
    const vWithImg = variants.find(
      (v: any) =>
        v.image &&
        v.color &&
        v.color.toLowerCase().trim() === colorLower
    );
    if (vWithImg?.image) return vWithImg.image;

    // 2. Check product.images where alt matches color
    const imgByAlt = product.images?.find((img: any) => {
      if (!img.alt) return false;
      const altLower = img.alt.toLowerCase().trim();
      return (
        altLower === colorLower ||
        altLower.includes(colorLower) ||
        colorLower.includes(altLower)
      );
    });
    if (imgByAlt?.url) return imgByAlt.url;

    // 3. Fallback: intelligent distribution across product.images
    const colorIdx = availableColors.findIndex(
      (c) => c.toLowerCase().trim() === colorLower
    );
    if (colorIdx !== -1 && product.images && product.images.length > 0) {
      const imgIdx = Math.min(
        product.images.length - 1,
        Math.floor((colorIdx * product.images.length) / availableColors.length)
      );
      if (product.images[imgIdx]?.url) {
        return product.images[imgIdx].url;
      }
    }

    return null;
  };

  const handleColorSelect = (color: string, updateImage = true) => {
    setSelectedColor(color);
    const matched = getMatchingVariant(color, selectedSize);
    if (matched) {
      setSelectedVariant(matched);
    }
    if (updateImage) {
      const colorImg = getImageForColor(color);
      if (colorImg) {
        setSelectedImage(colorImg);
      } else if (matched?.image) {
        setSelectedImage(matched.image);
      }
    }
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setSizeError("");
    const matched = getMatchingVariant(selectedColor, size);
    if (matched) {
      setSelectedVariant(matched);
      if (matched.image) setSelectedImage(matched.image);
    }
  };

  const handleThumbnailSelect = (img: any) => {
    setSelectedImage(img.url);

    // 1. Check if any variant with this image has a color
    const vMatch = variants.find((v: any) => v.image === img.url);
    if (vMatch?.color) {
      handleColorSelect(vMatch.color, false);
      return;
    }

    // 2. Check if img.alt matches any available color
    if (img.alt) {
      const altLower = img.alt.toLowerCase().trim();
      const colorMatch = availableColors.find(
        (c) =>
          c.toLowerCase().trim() === altLower ||
          altLower.includes(c.toLowerCase().trim())
      );
      if (colorMatch) {
        handleColorSelect(colorMatch, false);
        return;
      }
    }

    // 3. Index mapping fallback
    const imgIdx = product.images?.findIndex((i: any) => i.url === img.url);
    if (
      imgIdx !== undefined &&
      imgIdx !== -1 &&
      availableColors.length > 0 &&
      product.images
    ) {
      const colorIdx = Math.min(
        availableColors.length - 1,
        Math.floor((imgIdx * availableColors.length) / product.images.length)
      );
      if (availableColors[colorIdx]) {
        handleColorSelect(availableColors[colorIdx], false);
      }
    }
  };

  const [selectedImage, setSelectedImage] = useState<string>(() => {
    if (availableColors[0]) {
      const initialColorImg = getImageForColor(availableColors[0]);
      if (initialColorImg) return initialColorImg;
    }
    return product.images[0]?.url || "/images/product-placeholder.svg";
  });
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Authoritative current price and stock based on variant selection
  const currentPrice = selectedVariant?.salePrice ?? selectedVariant?.price ?? product.salePrice ?? product.price;
  const originalPrice = selectedVariant?.salePrice ? selectedVariant?.price : product.salePrice ? product.price : null;
  const currentStock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;

  const handleAddToCart = async () => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSizeError("Please select a size before adding to cart.");
      return;
    }
    const targetVariant = getMatchingVariant(selectedColor, selectedSize) || selectedVariant;
    const ok = await addToCart(product.id, targetVariant?.id, quantity);
    if (ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    }
  };

  const handleBuyNow = async () => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSizeError("Please select a size before buying.");
      return;
    }
    const targetVariant = getMatchingVariant(selectedColor, selectedSize) || selectedVariant;
    const ok = await addToCart(product.id, targetVariant?.id, quantity);
    if (ok) {
      router.push("/checkout");
    }
  };

  const { user } = useAuth();
  const [reviewsList, setReviewsList] = useState<any[]>(product.reviews || []);
  const [currentRating, setCurrentRating] = useState<number>(product.rating || 0);
  const [currentReviewCount, setCurrentReviewCount] = useState<number>(product.reviewCount || 0);

  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const ratingLabels: Record<number, string> = {
    1: "1 Star — Poor",
    2: "2 Stars — Fair",
    3: "3 Stars — Good",
    4: "4 Stars — Very Good",
    5: "5 Stars — Excellent",
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/products/${product.slug}`);
      return;
    }

    if (!reviewComment.trim() || reviewComment.trim().length < 5) {
      setReviewError("Please provide a review comment with at least 5 characters.");
      return;
    }

    setIsSubmittingReview(true);
    setReviewError("");
    setReviewSuccess("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: ratingValue,
          title: reviewTitle.trim() || undefined,
          comment: reviewComment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      // Update reviews list live
      setReviewsList((prev) => {
        const remaining = prev.filter((r) => r.userId !== user.id);
        return [data.review, ...remaining];
      });

      if (typeof data.productRating === "number") {
        setCurrentRating(data.productRating);
      }
      if (typeof data.productReviewCount === "number") {
        setCurrentReviewCount(data.productReviewCount);
      }

      setReviewSuccess(data.message || "Thank you! Your review has been submitted.");
      setReviewTitle("");
      setReviewComment("");
      setTimeout(() => {
        setShowReviewForm(false);
        setReviewSuccess("");
      }, 2000);
    } catch (err: any) {
      setReviewError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const specs = product.specifications ? JSON.parse(product.specifications) : {};

  return (
    <div className="space-y-8 sm:space-y-12 pb-28 md:pb-8 w-full max-w-full overflow-x-hidden">
      {/* Top Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6 space-y-3 sm:space-y-4">
          <div className="relative aspect-square w-full max-w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#E8E5DC] shadow-xs">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-cover object-center transition-all duration-300 ease-in-out"
            />
            {product.discountPercent && product.discountPercent > 0 ? (
              <span className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2.5 py-1 bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/40 text-[11px] sm:text-xs font-black rounded-lg shadow-md z-10">
                -{Math.round(product.discountPercent)}% OFF
              </span>
            ) : null}
          </div>

          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1.5 -mx-1 px-1">
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => handleThumbnailSelect(img)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition shrink-0 min-w-[64px] min-h-[64px] ${
                    selectedImage === img.url
                      ? "border-[#0B0F14] ring-2 ring-[#C8A96B]/50 scale-105"
                      : "border-[#E8E5DC] hover:border-[#8A8F98] opacity-80 hover:opacity-100"
                  }`}
                  aria-label="View product image"
                >
                  <img src={img.url} alt={img.alt || product.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details & Purchase Actions */}
        <div className="lg:col-span-6 space-y-5 sm:space-y-6">
          {/* Breadcrumbs / Seller line */}
          <div className="flex items-center justify-between text-xs text-[#8A8F98] gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <Link href={`/category/${product.category.slug}`} className="hover:text-[#C8A96B] font-semibold truncate transition">
                {product.category.name}
              </Link>
              {product.brand && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-[#0B0F14] truncate">{product.brand.name}</span>
                </>
              )}
            </div>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="flex items-center gap-1 text-[#8A8F98] hover:text-red-500 transition shrink-0 p-1"
              aria-label="Save to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
              <span className="hidden sm:inline text-xs font-semibold">Wishlist</span>
            </button>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0B0F14] leading-snug break-words">
            {product.title}
          </h1>

          {/* Rating and SKU */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-1 text-[#C8A96B] font-black bg-[#0B0F14] px-2.5 py-1 rounded-lg border border-[#C8A96B]/30">
              <Star className="w-3.5 h-3.5 fill-[#C8A96B]" />
              <span>{currentRating.toFixed(1)}</span>
            </div>
            <span className="text-[#8A8F98] font-medium">({currentReviewCount} reviews)</span>
            <span className="text-[#E8E5DC] hidden xs:inline">|</span>
            <span className="text-[#8A8F98]">SKU: <code className="text-[#0B0F14] font-mono text-[11px] font-semibold">{selectedVariant?.sku || product.sku}</code></span>
          </div>

          {/* Price Block */}
          <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-[#E8E5DC] shadow-xs flex flex-wrap items-baseline gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl font-black text-[#0B0F14]">
              {formatPrice(currentPrice)}
            </span>
            {originalPrice && (
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg text-[#8A8F98] line-through">
                  {formatPrice(originalPrice)}
                </span>
                {product.discountPercent && product.discountPercent > 0 ? (
                  <span className="px-2 py-0.5 bg-[#0B0F14] border border-[#C8A96B]/40 text-[#C8A96B] text-xs font-black rounded-md">
                    -{Math.round(product.discountPercent)}% OFF
                  </span>
                ) : null}
              </div>
            )}
            <span className={`ml-auto text-xs font-bold flex items-center gap-1 ${
              currentStock > 0 ? "text-emerald-700" : "text-red-600"
            }`}>
              <Check className="w-3.5 h-3.5" /> {currentStock > 0 ? `${currentStock} In Stock` : "Out of Stock"}
            </span>
          </div>

          {/* Color & Size Selectors */}
          <div className="space-y-4 pt-1">
            {/* COLOR SELECTOR WITH DIRECT PICTURES */}
            {availableColors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0B0F14]">
                    Color: <span className="text-[#C8A96B] font-black">{selectedColor}</span>
                  </span>
                  <span className="text-[#8A8F98] text-[11px] font-medium">
                    {availableColors.length} {availableColors.length === 1 ? "color" : "colors"} available
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {availableColors.map((color) => {
                    const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                    const colorImg = getImageForColor(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorSelect(color)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2.5 text-left ${
                          isSelected
                            ? "border-[#0B0F14] bg-[#0B0F14] text-white ring-2 ring-[#C8A96B]/40 shadow-sm"
                            : "border-[#E8E5DC] bg-white hover:border-[#0B0F14] text-[#0B0F14]"
                        }`}
                        title={`Select ${color}`}
                      >
                        {/* Direct shoe picture thumbnail */}
                        {colorImg ? (
                          <img
                            src={colorImg}
                            alt={color}
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover border border-[#E8E5DC] shrink-0 bg-white"
                          />
                        ) : (
                          <span
                            className="w-4 h-4 rounded-full border border-[#E8E5DC] shrink-0 shadow-2xs"
                            style={{ backgroundColor: getColorHex(color) }}
                          />
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="truncate leading-tight font-bold">{color}</span>
                          {isSelected && (
                            <span className="text-[10px] text-[#C8A96B] flex items-center gap-0.5 font-extrabold mt-0.5">
                              <Check className="w-3 h-3 stroke-[2.5]" /> Selected
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SIZE SELECTOR */}
            {availableSizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0B0F14]">
                    Select Size:{" "}
                    <span className="text-[#C8A96B] font-black">
                      {selectedSize ? `EU ${selectedSize}` : "Please Select"}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[11px] font-bold text-[#0B0F14] hover:text-[#C8A96B] flex items-center gap-1 transition underline underline-offset-2"
                  >
                    <Ruler className="w-3.5 h-3.5 text-[#C8A96B]" />
                    <span>Size Guide</span>
                  </button>
                </div>

                {sizeError && (
                  <p className="text-xs text-red-600 font-bold flex items-center gap-1.5 p-2 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {sizeError}
                  </p>
                )}

                {/* Interactive Size Chips */}
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {availableSizes.map((sz) => {
                    const isSelected = selectedSize.toLowerCase() === sz.toLowerCase();
                    // Check stock for this specific size
                    const sizeVariant = getMatchingVariant(selectedColor, sz);
                    const isOutOfStock = sizeVariant && sizeVariant.stockQuantity <= 0;

                    return (
                      <button
                        key={sz}
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => handleSizeSelect(sz)}
                        className={`min-w-[50px] h-11 px-3.5 rounded-xl text-xs font-black border transition-all flex items-center justify-center ${
                          isSelected
                            ? "border-[#0B0F14] bg-[#0B0F14] text-white shadow-md ring-2 ring-[#C8A96B]/50 scale-105"
                            : isOutOfStock
                            ? "border-slate-200 bg-slate-100 text-slate-400 line-through cursor-not-allowed"
                            : "border-[#E8E5DC] bg-white text-[#0B0F14] hover:border-[#0B0F14] hover:text-[#0B0F14]"
                        }`}
                        title={isOutOfStock ? `Size ${sz} is Out of Stock` : `Select Size ${sz}`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[#8A8F98]">
                  All sizes are standard European (EU) sizing. Click <strong>Size Guide</strong> for UK & US conversions.
                </p>
              </div>
            )}

            {/* General Fallback Variant Selector (if no separate colors/sizes identified) */}
            {availableColors.length === 0 && availableSizes.length === 0 && variants.length > 0 && (
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-[#0B0F14] uppercase tracking-wider block">
                  Select Option / Variant:
                </label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v: any) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold border transition min-h-[42px] flex items-center justify-center ${
                        selectedVariant?.id === v.id
                          ? "border-[#0B0F14] bg-[#0B0F14] text-white ring-2 ring-[#C8A96B]/30 font-bold"
                          : "border-[#E8E5DC] bg-white hover:border-[#0B0F14] text-[#0B0F14]"
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity & In-page Action Buttons (Hidden on mobile when sticky bar is active, visible on md+) */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#0B0F14]">Quantity:</span>
              <div className="flex items-center border border-[#E8E5DC] rounded-xl bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 sm:p-2 text-[#0B0F14] hover:text-[#C8A96B] transition min-w-[38px] min-h-[38px] flex items-center justify-center"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs font-bold text-[#0B0F14] min-w-[28px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="p-2 sm:p-2 text-[#0B0F14] hover:text-[#C8A96B] transition min-w-[38px] min-h-[38px] flex items-center justify-center"
                  disabled={quantity >= currentStock}
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[11px] text-[#8A8F98] truncate">Max {currentStock}</span>
            </div>

            {/* In-page Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1">
              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className={`py-3 sm:py-3.5 px-4 sm:px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 transition min-h-[46px] shadow-sm ${
                  added
                    ? "bg-emerald-700 text-white"
                    : currentStock > 0
                    ? "bg-[#0B0F14] hover:bg-[#1A222C] text-white border border-[#0B0F14]"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#C8A96B]" /> <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
                className="py-3 sm:py-3.5 px-4 sm:px-6 rounded-2xl font-black text-xs bg-[#C8A96B] hover:bg-[#B89858] text-[#0B0F14] shadow-md transition flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 min-h-[46px]"
              >
                <Zap className="w-4 h-4 text-[#0B0F14] shrink-0 fill-[#0B0F14]" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Seller Snapshot Card */}
          <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-[#E8E5DC] shadow-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#0B0F14] border border-[#C8A96B]/30 flex items-center justify-center text-[#C8A96B] shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] text-[#8A8F98] font-medium">Sold by</p>
                <Link
                  href={`/sellers/${product.seller.storeSlug}`}
                  className="text-xs font-bold text-[#0B0F14] hover:text-[#C8A96B] transition truncate block"
                >
                  {product.seller.storeName}
                </Link>
                <p className="text-[10px] text-[#C8A96B] font-bold truncate">
                  ★ {product.seller.rating.toFixed(1)} Rating
                </p>
              </div>
            </div>

            <Link
              href={`/sellers/${product.seller.storeSlug}`}
              className="px-3 py-1.5 text-xs font-bold text-[#0B0F14] bg-[#F5F3EE] hover:bg-[#E8E5DC] border border-[#E8E5DC] rounded-lg transition shrink-0"
            >
              Visit Store
            </Link>
          </div>

          {/* Delivery & Warranty perks */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-xs">
            <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-white rounded-xl border border-[#E8E5DC] shadow-xs">
              <Truck className="w-4 h-4 text-[#C8A96B] shrink-0" />
              <span className="text-[#0B0F14] text-[11px] sm:text-xs font-semibold">2-4 Days Delivery</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-white rounded-xl border border-[#E8E5DC] shadow-xs">
              <RotateCcw className="w-4 h-4 text-[#C8A96B] shrink-0" />
              <span className="text-[#0B0F14] text-[11px] sm:text-xs font-semibold">7-Day Free Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Description Tabs */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8E5DC] p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 shadow-xs">
        <h2 className="text-base sm:text-lg font-black text-[#0B0F14] border-b border-[#E8E5DC] pb-3">
          Product Specifications & Description
        </h2>

        {/* Specifications Table */}
        {Object.keys(specs).length > 0 && (
          <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-[#E8E5DC] -mx-1 sm:mx-0">
            <table className="w-full text-xs text-left">
              <tbody>
                {Object.entries(specs).map(([key, val], idx) => (
                  <tr
                    key={key}
                    className={idx % 2 === 0 ? "bg-[#F5F3EE]" : "bg-white"}
                  >
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold text-[#0B0F14] w-1/3 border-b border-[#E8E5DC] break-words">
                      {key}
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-[#0B0F14] border-b border-[#E8E5DC] break-words">
                      {String(val)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detailed description */}
        <div className="prose prose-sm max-w-none text-[#0B0F14] leading-relaxed pt-1 text-xs sm:text-sm">
          <p className="whitespace-pre-line">{product.description}</p>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8E5DC] p-4 sm:p-6 lg:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DC] pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#0B0F14] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#C8A96B]" />
              <span>Customer Reviews & Ratings</span>
            </h2>
            <p className="text-xs text-[#8A8F98] mt-0.5">
              Verified customer feedback and product satisfaction scores
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowReviewForm(!showReviewForm);
                setReviewError("");
                setReviewSuccess("");
              }}
              className="px-4 py-2 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] border border-[#C8A96B]/40 text-xs sm:text-sm font-bold rounded-full transition shadow-xs flex items-center gap-1.5 active:scale-98"
            >
              {showReviewForm ? <X className="w-4 h-4" /> : <PenSquare className="w-4 h-4" />}
              <span>{showReviewForm ? "Close Form" : "Write a Review"}</span>
            </button>
          </div>
        </div>

        {/* Rating Summary & Star Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#F5F3EE] p-4 sm:p-6 rounded-2xl border border-[#E8E5DC]">
          {/* Left: Overall Score */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-3 border-b md:border-b-0 md:border-r border-[#E8E5DC]">
            <span className="text-4xl sm:text-5xl font-black text-[#0B0F14]">
              {currentRating.toFixed(1)}
            </span>
            <div className="flex text-[#C8A96B] my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= Math.round(currentRating)
                      ? "fill-[#C8A96B] text-[#C8A96B]"
                      : "text-slate-300 fill-slate-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-[#8A8F98] font-medium">
              Based on {currentReviewCount} verified {currentReviewCount === 1 ? "review" : "reviews"}
            </p>
          </div>

          {/* Right: Star Breakdown Bars */}
          <div className="md:col-span-8 flex flex-col justify-center space-y-2 text-xs">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviewsList.filter((r) => r.rating === star).length;
              const percent = currentReviewCount > 0 ? (count / currentReviewCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-12 text-[#0B0F14] font-bold flex items-center gap-1 shrink-0">
                    <span>{star}</span>
                    <Star className="w-3.5 h-3.5 fill-[#C8A96B] text-[#C8A96B]" />
                  </span>
                  <div className="flex-1 bg-white rounded-full h-2.5 overflow-hidden border border-[#E8E5DC]">
                    <div
                      className="bg-[#0B0F14] h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[#8A8F98] font-semibold shrink-0">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive "Write a Review" Form */}
        {showReviewForm && (
          <div className="p-4 sm:p-6 bg-white rounded-2xl border-2 border-[#0B0F14] shadow-md space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#E8E5DC] pb-2">
              <h3 className="text-sm sm:text-base font-bold text-[#0B0F14] flex items-center gap-1.5">
                <PenSquare className="w-4 h-4 text-[#C8A96B]" />
                <span>Share Your Review for {product.title}</span>
              </h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-[#8A8F98] hover:text-[#0B0F14] p-1"
                aria-label="Close review form"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!user ? (
              <div className="py-6 text-center space-y-3">
                <UserIcon className="w-10 h-10 text-[#C8A96B] mx-auto opacity-80" />
                <h4 className="text-sm font-bold text-[#0B0F14]">
                  Sign In Required to Submit a Review
                </h4>
                <p className="text-xs text-[#8A8F98] max-w-sm mx-auto">
                  To protect our buyers from fake feedback, reviews can only be submitted by registered customer accounts.
                </p>
                <Link
                  href={`/login?redirect=/products/${product.slug}`}
                  className="inline-block px-5 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-white text-xs sm:text-sm font-bold rounded-full transition shadow-sm"
                >
                  Sign In to Continue
                </Link>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* 1. Star Rating Selector */}
                <div>
                  <label className="text-xs font-bold text-[#0B0F14] block mb-1.5">
                    Your Overall Rating: <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatingValue(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-110 transition-transform focus:outline-none"
                        aria-label={`Rate ${star} star`}
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            star <= (hoverRating || ratingValue)
                              ? "fill-[#C8A96B] text-[#C8A96B]"
                              : "text-slate-300 fill-slate-100"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-[#0B0F14]">
                      {ratingLabels[hoverRating || ratingValue]}
                    </span>
                  </div>
                </div>

                {/* 2. Review Title */}
                <div>
                  <label className="text-xs font-bold text-[#0B0F14] block mb-1">
                    Review Headline (Optional):
                  </label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Excellent build quality, fast delivery, highly recommended!"
                    maxLength={100}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-[#E8E5DC] focus:border-[#0B0F14] focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/20 transition"
                  />
                </div>

                {/* 3. Review Comment */}
                <div>
                  <label className="text-xs font-bold text-[#0B0F14] block mb-1">
                    Your Detailed Review: <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell other shoppers what you liked or disliked about this product, quality, functionality, packaging..."
                    rows={4}
                    required
                    minLength={5}
                    maxLength={2000}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-[#E8E5DC] focus:border-[#0B0F14] focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/20 transition"
                  />
                </div>

                {/* Error / Success feedback */}
                {reviewError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}
                {reviewSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{reviewSuccess}</span>
                  </div>
                )}

                {/* Submit button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    disabled={isSubmittingReview}
                    className="px-4 py-2 text-xs font-semibold text-[#8A8F98] hover:text-[#0B0F14] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-6 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-full transition shadow-sm flex items-center gap-2 active:scale-98"
                  >
                    {isSubmittingReview ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#C8A96B]" />
                        <span>Publishing Review...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-[#C8A96B]" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Customer Reviews List */}
        {reviewsList.length === 0 ? (
          <div className="py-10 text-center space-y-3 bg-[#F5F3EE] rounded-2xl border border-[#E8E5DC]">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto text-[#C8A96B] shadow-xs">
              <Star className="w-6 h-6 fill-[#C8A96B]" />
            </div>
            <h4 className="text-sm font-bold text-[#0B0F14]">No customer reviews yet</h4>
            <p className="text-xs text-[#8A8F98] max-w-sm mx-auto">
              Be the first customer to purchase and review this product to help others make informed decisions.
            </p>
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-block px-5 py-2 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] border border-[#C8A96B]/40 text-xs font-bold rounded-full transition shadow-xs mt-1"
            >
              Write First Review
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {reviewsList.map((r: any) => (
              <div
                key={r.id}
                className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E8E5DC] space-y-2.5 transition hover:border-[#C8A96B]/60 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-full bg-[#0B0F14] text-[#C8A96B] flex items-center justify-center text-xs font-bold uppercase overflow-hidden shrink-0">
                      {r.user?.avatar ? (
                        <img src={r.user.avatar} alt={r.user.name} className="w-full h-full object-cover" />
                      ) : (
                        (r.user?.name || "Customer").charAt(0)
                      )}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0B0F14] truncate">
                          {r.user?.name || "Verified Customer"}
                        </span>
                        {r.isVerifiedPurchase && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] sm:text-[10px] font-bold rounded-full flex items-center gap-0.5 shrink-0 border border-emerald-200">
                            <Check className="w-3 h-3" /> Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#8A8F98] block mt-0.5">
                        {r.createdAt ? formatDate(r.createdAt) : "Recently"}
                      </span>
                    </div>
                  </div>

                  <div className="flex text-[#C8A96B] shrink-0 self-start sm:self-auto">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i <= r.rating ? "fill-[#C8A96B]" : "text-slate-300 fill-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {r.title && (
                  <h4 className="text-xs sm:text-sm font-bold text-[#0B0F14] pt-1">
                    {r.title}
                  </h4>
                )}
                <p className="text-xs text-[#0B0F14]/90 leading-relaxed whitespace-pre-line">
                  {r.comment}
                </p>

                {/* Seller Response Block */}
                {r.sellerResponse && (
                  <div className="mt-3 p-3 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-xs text-[#0B0F14] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#0B0F14] font-bold">
                      <Store className="w-3.5 h-3.5 text-[#C8A96B]" />
                      <span>Response from {product.seller?.storeName || "Seller"}:</span>
                    </div>
                    <p className="text-xs text-[#0B0F14]/80 pl-5 leading-relaxed">
                      {r.sellerResponse}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom Action Bar (visible on screens < md) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E8E5DC] p-3 md:hidden shadow-2xl safe-bottom flex items-center gap-2">
        <div className="min-w-0 flex-1 pl-1">
          <span className="text-[10px] font-bold text-[#8A8F98] block leading-none truncate">
            {selectedSize ? `Size: ${selectedSize}` : selectedColor ? `Color: ${selectedColor}` : "Price"}
          </span>
          <span className="text-base font-black text-[#0B0F14] truncate block">
            {formatPrice(currentPrice)}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={currentStock <= 0}
          className={`py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shrink-0 min-h-[42px] ${
            added
              ? "bg-emerald-700 text-white shadow-xs"
              : currentStock > 0
              ? "bg-[#0B0F14] hover:bg-[#1A222C] text-white border border-[#0B0F14] shadow-xs"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4 text-[#C8A96B]" />}
          <span>{added ? "Added" : "Add to Cart"}</span>
        </button>

        <button
          onClick={handleBuyNow}
          disabled={currentStock <= 0}
          className="py-2.5 px-4 rounded-xl font-black text-xs bg-[#C8A96B] hover:bg-[#B89858] text-[#0B0F14] shadow-md transition flex items-center justify-center gap-1 shrink-0 disabled:opacity-50 min-h-[42px]"
        >
          <Zap className="w-3.5 h-3.5 text-[#0B0F14] fill-[#0B0F14]" />
          <span>Buy Now</span>
        </button>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8E5DC] shadow-2xl max-w-xl w-full p-5 sm:p-7 max-h-[90vh] overflow-y-auto space-y-5"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DC]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0B0F14] text-[#C8A96B] flex items-center justify-center border border-[#C8A96B]/30">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#0B0F14]">
                    Size Guide & Fit Chart
                  </h3>
                  <p className="text-xs text-[#8A8F98] font-medium">
                    Standard Pakistani (PK) & European (EU) Footwear Conversions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className="p-1.5 text-[#8A8F98] hover:text-[#0B0F14] rounded-lg hover:bg-[#F5F3EE] transition"
                aria-label="Close size guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sizing Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#0B0F14] uppercase tracking-wider">
                Footwear / Shoes Sizing Reference
              </h4>
              <div className="overflow-x-auto rounded-xl border border-[#E8E5DC]">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-[#0B0F14] text-[#C8A96B] font-bold border-b border-[#0B0F14]">
                      <th className="py-2.5 px-3">EU Size</th>
                      <th className="py-2.5 px-3">UK / PK</th>
                      <th className="py-2.5 px-3">US Men</th>
                      <th className="py-2.5 px-3">Foot Length (CM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E5DC] text-[#0B0F14] font-medium">
                    {[
                      { eu: "39", uk: "5.5", us: "6.5", cm: "24.5 cm" },
                      { eu: "40", uk: "6.5", us: "7.5", cm: "25.0 cm" },
                      { eu: "41", uk: "7.5", us: "8.5", cm: "26.0 cm" },
                      { eu: "42", uk: "8.5", us: "9.5", cm: "26.5 cm" },
                      { eu: "43", uk: "9.5", us: "10.5", cm: "27.5 cm" },
                      { eu: "44", uk: "10.5", us: "11.5", cm: "28.0 cm" },
                      { eu: "45", uk: "11.5", us: "12.5", cm: "29.0 cm" },
                    ].map((row, idx) => (
                      <tr
                        key={row.eu}
                        onClick={() => {
                          handleSizeSelect(row.eu);
                          setShowSizeGuide(false);
                        }}
                        className={`cursor-pointer hover:bg-[#F5F3EE] transition ${
                          selectedSize === row.eu
                            ? "bg-[#0B0F14] font-bold text-[#C8A96B]"
                            : idx % 2 === 0
                            ? "bg-white"
                            : "bg-[#F5F3EE]/50"
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold">{row.eu}</td>
                        <td className="py-2.5 px-3">{row.uk}</td>
                        <td className="py-2.5 px-3">{row.us}</td>
                        <td className="py-2.5 px-3">{row.cm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-[#8A8F98] italic">
                * Click on any row to immediately select that shoe size.
              </p>
            </div>

            {/* Measurement Tips */}
            <div className="bg-[#F5F3EE] rounded-xl p-4 border border-[#E8E5DC] text-xs text-[#0B0F14] space-y-2">
              <p className="font-bold text-[#0B0F14] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
                How to measure your feet:
              </p>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] leading-relaxed text-[#0B0F14]/80">
                <li>Place your foot firmly on a piece of paper on a flat floor against the wall.</li>
                <li>Draw a line at the tip of your longest toe and measure the distance in cm.</li>
                <li>Compare with the chart above to choose your ideal EU shoe size.</li>
              </ol>
              <div className="text-[11px] text-[#0B0F14] bg-white p-2.5 rounded-lg border border-[#E8E5DC] mt-2 font-semibold flex items-center gap-1.5">
                <span>💡</span>
                <span>If you prefer a relaxed fit or have wider feet, we recommend picking 1 size up.</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className="px-5 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-white font-bold text-xs rounded-xl transition shadow-xs"
              >
                Got It, Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
