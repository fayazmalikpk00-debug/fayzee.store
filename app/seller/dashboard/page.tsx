"use client";

import { getAttributesForCategory } from "@/lib/categoryHierarchy";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  DollarSign,
  Image as ImageIcon,
  Layers,
  Loader2,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Sliders,
  Sparkles,
  Star,
  Store,
  Tag,
  Trash2,
  Truck,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface UploadedImageItem {
  url: string;
  name: string;
  isThumbnail: boolean;
}

interface VariantFormItem {
  id: string;
  color: string;
  size: string;
  sku: string;
  price: string;
  salePrice: string;
  stockQuantity: string;
}

export default function SellerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders">("overview");

  const [products, setProducts] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Product Modal State (3-Tier Category + Attributes + Variants)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState(""); // Category ID
  const [newSubcategory, setNewSubcategory] = useState(""); // Subcategory ID
  const [newProductType, setNewProductType] = useState(""); // ProductType ID
  const [categorySearch, setCategorySearch] = useState("");
  const [productAttributes, setProductAttributes] = useState<Record<string, string>>({});
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<VariantFormItem[]>([]);

  const [newPrice, setNewPrice] = useState("");
  const [newSalePrice, setNewSalePrice] = useState("");
  const [newStock, setNewStock] = useState("20");
  const [newDesc, setNewDesc] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImageItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [formError, setFormError] = useState("");
  const [addingProduct, setAddingProduct] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSellerData = async () => {
    try {
      const [prodRes, orderRes, catRes] = await Promise.all([
        fetch("/api/seller/products"),
        fetch("/api/seller/orders"),
        fetch("/api/categories"),
      ]);

      const prodData = await prodRes.json();
      const orderData = await orderRes.json();
      const catData = await catRes.json();

      if (prodData.products) setProducts(prodData.products);
      if (orderData.orderItems) setOrderItems(orderData.orderItems);
      if (catData.categories) setCategories(catData.categories);
    } catch (e) {
      console.error("Fetch seller data error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "SELLER") {
      fetchSellerData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Handle image upload from device (Production Cloudinary)
  const MAX_PRODUCT_IMAGES = 8;
  const MAX_IMAGE_SIZE_BYTES = 60 * 1024 * 1024; // 60MB

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError("");
    setFormError("");

    if (uploadedImages.length + files.length > MAX_PRODUCT_IMAGES) {
      setUploadError(
        `You can upload a maximum of ${MAX_PRODUCT_IMAGES} images per product. You currently have ${uploadedImages.length}.`
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
      "image/avif",
      "image/jpg",
    ];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".avif"];

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setUploadError(`Image "${file.name}" exceeds the 60MB limit. Please choose a smaller file.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!allowedMimes.includes(file.type) && !allowedExtensions.includes(ext)) {
        setUploadError(
          `File "${file.name}" is not a supported format. Please upload JPG, PNG, WebP, HEIC, HEIF, or AVIF.`
        );
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      validFiles.push(file);
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      validFiles.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image.");
      }

      const newItems: UploadedImageItem[] = (data.files || [data]).map((f: any, idx: number) => ({
        url: f.url,
        name: f.name || `image-${idx + 1}`,
        isThumbnail: uploadedImages.length === 0 && idx === 0,
      }));

      setUploadedImages((prev) => {
        const combined = [...prev, ...newItems];
        // Ensure at least one is thumbnail
        if (!combined.some((item) => item.isThumbnail) && combined.length > 0) {
          combined[0].isThumbnail = true;
        }
        return combined;
      });
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSetMainImage = (index: number) => {
    setUploadedImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isThumbnail: i === index,
      }))
    );
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      // If we removed the main image, make the first remaining image the main image
      if (filtered.length > 0 && !filtered.some((img) => img.isThumbnail)) {
        filtered[0].isThumbnail = true;
      }
      return filtered;
    });
  };

  // Category and cascading helpers
  const selectedCatObj = categories.find((c: any) => c.id === newCategory);
  const availableSubcategories = selectedCatObj?.subcategories || [];
  const selectedSubcatObj = availableSubcategories.find((s: any) => s.id === newSubcategory);
  const availableProductTypes = selectedSubcatObj?.productTypes || [];
  const dynamicAttrDefs = selectedCatObj ? getAttributesForCategory(selectedCatObj.slug) : [];

  const handleCategoryChange = (catId: string) => {
    setNewCategory(catId);
    setNewSubcategory("");
    setNewProductType("");
    setProductAttributes({});
  };

  const handleSubcategoryChange = (subId: string) => {
    setNewSubcategory(subId);
    setNewProductType("");
  };

  const handleAttributeChange = (key: string, val: string) => {
    setProductAttributes((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleAddVariant = () => {
    const newVar: VariantFormItem = {
      id: Math.random().toString(36).substring(2, 9),
      color: "",
      size: "",
      sku: "",
      price: newPrice || "",
      salePrice: newSalePrice || "",
      stockQuantity: "10",
    };
    setVariants((prev) => [...prev, newVar]);
  };

  const handleUpdateVariant = (id: string, field: keyof VariantFormItem, val: string) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: val } : v))
    );
  };

  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const resetFormState = () => {
    setNewTitle("");
    setNewCategory("");
    setNewSubcategory("");
    setNewProductType("");
    setCategorySearch("");
    setProductAttributes({});
    setHasVariants(false);
    setVariants([]);
    setNewPrice("");
    setNewSalePrice("");
    setNewStock("20");
    setNewDesc("");
    setUploadedImages([]);
    setUploadError("");
    setFormError("");
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newCategory) {
      setFormError("Please select a primary category.");
      return;
    }

    if (!newSubcategory && availableSubcategories.length > 0) {
      setFormError("Please select a subcategory.");
      return;
    }

    if (uploadedImages.length === 0) {
      setFormError("Please upload at least one product image from your device.");
      return;
    }

    const totalVariantStock = variants.reduce(
      (sum, v) => sum + (Number(v.stockQuantity) || 0),
      0
    );
    const finalStock =
      hasVariants && variants.length > 0 ? totalVariantStock : Number(newStock);

    setAddingProduct(true);
    try {
      const res = await fetch("/api/seller/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          categoryId: newCategory,
          subcategoryId: newSubcategory || null,
          productTypeId: newProductType || null,
          price: Number(newPrice),
          salePrice: newSalePrice ? Number(newSalePrice) : null,
          stockQuantity: finalStock,
          description: newDesc.trim(),
          attributes: Object.keys(productAttributes).length > 0 ? productAttributes : null,
          variants:
            hasVariants && variants.length > 0
              ? variants.map((v) => ({
                  name: [v.color.trim(), v.size.trim()].filter(Boolean).join(" / ") || "Standard",
                  sku: v.sku.trim() || undefined,
                  color: v.color.trim() || null,
                  size: v.size.trim() || null,
                  price: Number(v.price) || Number(newPrice),
                  salePrice: v.salePrice ? Number(v.salePrice) : null,
                  stockQuantity: Number(v.stockQuantity) || 0,
                }))
              : undefined,
          images: uploadedImages.map((img, idx) => ({
            url: img.url,
            isThumbnail: img.isThumbnail,
            sortOrder: img.isThumbnail ? 0 : idx + 1,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product");

      setIsAddModalOpen(false);
      resetFormState();
      await fetchSellerData();
      setSuccessToast(`Product "${newTitle}" has been listed successfully!`);
      setTimeout(() => setSuccessToast(""), 5000);
    } catch (err: any) {
      setFormError(err.message || "Failed to add product");
    } finally {
      setAddingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing from your store?")) return;
    try {
      const res = await fetch(`/api/seller/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (orderItemId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/seller/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderItemId, status: newStatus }),
      });
      if (res.ok) {
        await fetchSellerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm text-slate-500 font-medium">
          Loading Seller Center...
        </span>
      </div>
    );
  }

  if (!user || (user.role !== "SELLER" && !user.sellerProfile)) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Store className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Seller Account Required</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          You must be logged in with an authorized seller account to access this portal.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/login?redirect=/seller/dashboard" className="px-4 py-2 bg-[#FF5E00] hover:bg-[#FF8C00] text-white rounded-xl text-xs font-bold transition">
            Log In
          </Link>
          <Link href="/seller/register" className="px-4 py-2 bg-[#1C2A39] hover:bg-[#2A3B4C] text-white rounded-xl text-xs font-bold transition">
            Become a Seller
          </Link>
        </div>
      </div>
    );
  }

  // Calculate seller revenue and statistics
  const totalRevenue = orderItems.reduce(
    (acc, curr) => (curr.fulfillmentStatus !== "CANCELLED" ? acc + curr.total : acc),
    0
  );
  const pendingOrders = orderItems.filter((i) => i.fulfillmentStatus === "PROCESSING").length;
  const totalOrders = orderItems.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-[#16A34A] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span className="text-xs font-bold">{successToast}</span>
          <button onClick={() => setSuccessToast("")} className="text-white/80 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Store Status */}
      <div className="bg-white rounded-3xl p-6 border border-[#DDE2E6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#1C2A39] text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md border border-[#2A3B4C]">
            {user.sellerProfile?.storeName?.[0] || "S"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#1C2A39]">
                {user.sellerProfile?.storeName || "Seller Store"}
              </h1>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">
                {user.sellerProfile?.status || "APPROVED"}
              </span>
            </div>
            <p className="text-xs text-[#777777] mt-0.5">
              Welcome back, {user.name} • Manage products, stock, and customer orders
            </p>
          </div>
        </div>

        {user.sellerProfile?.storeSlug && (
          <Link
            href={`/sellers/${user.sellerProfile.storeSlug}`}
            target="_blank"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-[#F7F9FA] border border-[#1C2A39] rounded-xl text-xs font-bold text-[#1C2A39] transition self-start md:self-auto"
          >
            <span>View Public Store</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#DDE2E6] gap-8 text-sm font-bold">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 transition relative ${
            activeTab === "overview"
              ? "text-[#FF5E00] border-b-2 border-[#FF5E00]"
              : "text-[#777777] hover:text-[#1C2A39]"
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-3 transition relative ${
            activeTab === "products"
              ? "text-[#FF5E00] border-b-2 border-[#FF5E00]"
              : "text-[#777777] hover:text-[#1C2A39]"
          }`}
        >
          Product Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 transition relative ${
            activeTab === "orders"
              ? "text-[#FF5E00] border-b-2 border-[#FF5E00]"
              : "text-[#777777] hover:text-[#1C2A39]"
          }`}
        >
          Customer Orders ({orderItems.length})
        </button>
      </div>

      {/* TAB 1: Overview Dashboard */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">Total Sales</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{formatPrice(totalRevenue)}</p>
              <span className="text-[10px] text-slate-400">Gross revenue</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">Active Listings</span>
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{products.length}</p>
              <span className="text-[10px] text-slate-400">Items listed in store</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{totalOrders}</p>
              <span className="text-[10px] text-slate-400">{pendingOrders} pending dispatch</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">Rating</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {user.sellerProfile?.rating?.toFixed(1) || "5.0"}
              </p>
              <span className="text-[10px] text-slate-400">Seller satisfaction index</span>
            </div>
          </div>

          {/* Quick Actions & Recent Orders Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Recent Customer Orders</h3>
              <button
                onClick={() => setActiveTab("orders")}
                className="text-xs text-brand-600 hover:text-brand-700 font-bold"
              >
                View all orders &rarr;
              </button>
            </div>

            {orderItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No orders received for your store yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {orderItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{item.title}</span>
                      <p className="text-[10px] text-slate-500">
                        Order #{item.order.orderNumber} • Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-brand-700">{formatPrice(item.total)}</span>
                      <p className="text-[10px] font-bold text-orange-600">
                        {item.fulfillmentStatus}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Product Management */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1C2A39]">Your Product Listings</h3>
            <button
              onClick={() => {
                resetFormState();
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 bg-[#FF5E00] hover:bg-[#FF8C00] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#DDE2E6] shadow-xs overflow-hidden">
            {products.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <Package className="w-12 h-12 text-[#777777] mx-auto mb-3" />
                <p className="text-sm font-bold text-[#1C2A39]">No products listed yet</p>
                <p className="text-xs text-[#777777] mt-1 mb-4">
                  Start adding products to your store catalog to sell to customers nationwide.
                </p>
                <button
                  onClick={() => {
                    resetFormState();
                    setIsAddModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#FF5E00] hover:bg-[#FF8C00] text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-98"
                >
                  List Your First Product
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[640px]">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase">
                    <tr>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={
                              p.images?.[0]?.url ||
                              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100"
                            }
                            alt=""
                            className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/products/${p.slug}`}
                              className="font-bold text-slate-900 hover:text-brand-600 truncate block max-w-xs"
                            >
                              {p.title}
                            </Link>
                            <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{p.category?.name}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {formatPrice(p.salePrice || p.price)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold ${
                              p.stockQuantity <= 5 ? "text-red-600" : "text-slate-800"
                            }`}
                          >
                            {p.stockQuantity} units
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded text-[10px]">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Orders Scoped to Seller */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Customer Orders for Your Store</h3>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[700px]">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="py-3 px-4">Order Details</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Customer Info</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orderItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">#{item.order.orderNumber}</span>
                        <p className="text-[10px] text-slate-400">
                          {formatDate(item.order.createdAt)}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 line-clamp-1">{item.title}</span>
                        <span className="text-[10px] text-slate-400">Qty: {item.quantity}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900">
                          {item.order.shippingAddress?.fullName || item.order.user?.name}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {item.order.shippingAddress?.city}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatPrice(item.total)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.fulfillmentStatus === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.fulfillmentStatus === "SHIPPED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.fulfillmentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {item.fulfillmentStatus === "PROCESSING" && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, "SHIPPED")}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[10px]"
                          >
                            Ship Out
                          </button>
                        )}
                        {item.fulfillmentStatus === "SHIPPED" && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, "DELIVERED")}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded text-[10px]"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">List New Store Product</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Error Banner */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="font-medium">{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              {/* Product Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Wireless Ergonomic Mouse 2.4GHz"
                  className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              {/* 3-Tier Categorization: Category -> Subcategory -> Product Type */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3.5">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Marketplace Category Hierarchy (3-Tier)
                  </span>
                </div>

                {/* 1. Category */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      1. Department / Category <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {categories.length} Departments Available
                    </span>
                  </div>

                  {/* Search box for category */}
                  <div className="relative mb-1.5">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="Quick search categories (e.g. phones, fashion, grocery)..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <select
                    required
                    value={newCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs"
                  >
                    <option value="">-- Choose Category Department --</option>
                    {categories
                      .filter((cat) =>
                        categorySearch.trim()
                          ? cat.name.toLowerCase().includes(categorySearch.toLowerCase().trim())
                          : true
                      )
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({cat.subcategories?.length || 0} Subcategories)
                        </option>
                      ))}
                  </select>
                </div>

                {/* 2. Subcategory */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      2. Subcategory {availableSubcategories.length > 0 && <span className="text-red-500">*</span>}
                    </label>
                    {newCategory && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {availableSubcategories.length} subcategories
                      </span>
                    )}
                  </div>
                  <select
                    disabled={!newCategory}
                    required={availableSubcategories.length > 0}
                    value={newSubcategory}
                    onChange={(e) => handleSubcategoryChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!newCategory
                        ? "-- Select a Category first --"
                        : availableSubcategories.length === 0
                        ? "-- No Subcategories defined --"
                        : "-- Select Subcategory --"}
                    </option>
                    {availableSubcategories.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.productTypes?.length || 0} Product Types)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Product Type */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      3. Specific Product Type <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    {newSubcategory && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {availableProductTypes.length} types
                      </span>
                    )}
                  </div>
                  <select
                    disabled={!newSubcategory}
                    value={newProductType}
                    onChange={(e) => setNewProductType(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!newSubcategory
                        ? "-- Select a Subcategory first --"
                        : availableProductTypes.length === 0
                        ? "-- No specific product types (General) --"
                        : "-- Select Specific Product Type (e.g. Smartphones, T-Shirts) --"}
                    </option>
                    {availableProductTypes.map((pt: any) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Category Specifications & Attributes */}
              {dynamicAttrDefs.length > 0 && (
                <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/60 space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-amber-200/50">
                    <Sliders className="w-4 h-4 text-amber-700" />
                    <span className="font-bold text-amber-900 text-[11px] uppercase tracking-wider">
                      {selectedCatObj?.name} Specific Attributes
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {dynamicAttrDefs.map((attr: any) => {
                      const attrName = attr.label || attr.name || attr.key;
                      const attrKey = attr.key || attr.name || attr.label;
                      return (
                        <div key={attrKey}>
                          <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                            {attrName}
                          </label>
                          {attr.options && attr.options.length > 0 ? (
                            <select
                              value={productAttributes[attrKey] || ""}
                              onChange={(e) => handleAttributeChange(attrKey, e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                            >
                              <option value="">-- Choose {attrName} --</option>
                              {attr.options.map((opt: string) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={productAttributes[attrKey] || ""}
                              onChange={(e) => handleAttributeChange(attrKey, e.target.value)}
                              placeholder={attr.placeholder || `e.g. Enter ${attrName}`}
                              className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price and Sale Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Retail Price (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="4500"
                    className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sale Price (Rs.) <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newSalePrice}
                    onChange={(e) => setNewSalePrice(e.target.value)}
                    placeholder="3999"
                    className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  {hasVariants && variants.length > 0 && (
                    <span className="text-[10px] text-brand-600 font-bold">
                      Calculated from variants: {variants.reduce((s, v) => s + (Number(v.stockQuantity) || 0), 0)} units
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  required={!hasVariants || variants.length === 0}
                  disabled={hasVariants && variants.length > 0}
                  min="0"
                  value={
                    hasVariants && variants.length > 0
                      ? variants.reduce((s, v) => s + (Number(v.stockQuantity) || 0), 0)
                      : newStock
                  }
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              {/* Product Variants (Color, Size, SKU, Custom Price & Stock) */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-brand-600" />
                    <div>
                      <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                        Product Variants
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Enable if this product has multiple sizes, colors, or specifications
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !hasVariants;
                      setHasVariants(nextState);
                      if (nextState && variants.length === 0) {
                        handleAddVariant();
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                      hasVariants
                        ? "bg-brand-600 text-white shadow-xs"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    <span>{hasVariants ? "Variants Enabled" : "+ Enable Variants"}</span>
                  </button>
                </div>

                {hasVariants && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-200/60">
                    <p className="text-[10px] text-slate-500">
                      Specify variations with individual stock, color/size, and pricing:
                    </p>

                    <div className="space-y-2">
                      {variants.map((v, idx) => (
                        <div
                          key={v.id}
                          className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] text-brand-700">
                              Variant #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(v.id)}
                              className="text-red-500 hover:text-red-700 p-1 text-[10px] font-bold flex items-center gap-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                                Color / Shade
                              </label>
                              <input
                                type="text"
                                value={v.color}
                                onChange={(e) => handleUpdateVariant(v.id, "color", e.target.value)}
                                placeholder="e.g. Titanium Black"
                                className="w-full px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-brand-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                                Size / Spec
                              </label>
                              <input
                                type="text"
                                value={v.size}
                                onChange={(e) => handleUpdateVariant(v.id, "size", e.target.value)}
                                placeholder="e.g. 256GB / XL / 42 EU"
                                className="w-full px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-brand-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                                Variant SKU
                              </label>
                              <input
                                type="text"
                                value={v.sku}
                                onChange={(e) => handleUpdateVariant(v.id, "sku", e.target.value)}
                                placeholder="Auto-generated if blank"
                                className="w-full px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-brand-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                                Price (Rs.)
                              </label>
                              <input
                                type="number"
                                value={v.price}
                                onChange={(e) => handleUpdateVariant(v.id, "price", e.target.value)}
                                placeholder={newPrice || "4500"}
                                className="w-full px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-brand-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                                Sale Price (Rs.)
                              </label>
                              <input
                                type="number"
                                value={v.salePrice}
                                onChange={(e) => handleUpdateVariant(v.id, "salePrice", e.target.value)}
                                placeholder={newSalePrice || "Optional"}
                                className="w-full px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-brand-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                                Stock Qty
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={v.stockQuantity}
                                onChange={(e) => handleUpdateVariant(v.id, "stockQuantity", e.target.value)}
                                placeholder="10"
                                className="w-full px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-brand-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="w-full py-2 border border-dashed border-brand-300 hover:border-brand-500 bg-brand-50/30 hover:bg-brand-50/70 text-brand-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Variant</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Device Image Upload Section */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-700">
                    Product Images <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {uploadedImages.length} of 8 images uploaded
                  </span>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif,.heic,.heif"
                  multiple
                  className="hidden"
                  id="seller-file-upload"
                />

                {/* Upload Error Alert */}
                {uploadError && (
                  <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Upload Zone */}
                {uploadedImages.length === 0 ? (
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                      isUploading
                        ? "bg-slate-50 border-slate-200 cursor-not-allowed opacity-75"
                        : "border-slate-300 hover:border-brand-500 hover:bg-brand-50/20 bg-slate-50/50"
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-7 h-7 animate-spin text-brand-600" />
                        <p className="font-bold text-slate-700">Uploading and processing image...</p>
                        <span className="text-[10px] text-slate-400">Please wait a moment</span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">
                            Click or tap to upload product images
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Supports JPG, PNG, WebP, HEIC, HEIF, AVIF up to 60MB (up to 8 images)
                          </p>
                        </div>
                        <button
                          type="button"
                          className="mt-1 px-3 py-1.5 bg-brand-600 text-white rounded-lg font-bold text-[11px] shadow-xs"
                        >
                          Select from Device
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Grid of uploaded images */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {uploadedImages.map((img, index) => (
                        <div
                          key={index}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition group ${
                            img.isThumbnail
                              ? "border-brand-600 ring-2 ring-brand-500/20"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-full object-cover"
                          />

                          {/* Main Image Badge */}
                          {img.isThumbnail ? (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-brand-600 text-white text-[9px] font-black rounded shadow-sm flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-white" />
                              <span>Main</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(index)}
                              className="absolute bottom-1 left-1 right-1 py-0.5 bg-black/60 hover:bg-black/80 text-white text-[9px] font-bold rounded text-center opacity-0 group-hover:opacity-100 transition"
                            >
                              Set Main
                            </button>
                          )}

                          {/* Remove Image Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 p-1 bg-white/90 hover:bg-red-500 hover:text-white text-slate-600 rounded-full shadow-sm transition"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {/* Add More Images Button */}
                      {uploadedImages.length < 8 && (
                        <div
                          onClick={() => !isUploading && fileInputRef.current?.click()}
                          className="aspect-square border-2 border-dashed border-slate-200 hover:border-brand-500 hover:bg-brand-50/20 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-brand-600 cursor-pointer transition gap-1"
                        >
                          {isUploading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                          ) : (
                            <>
                              <Plus className="w-5 h-5" />
                              <span className="text-[10px] font-bold">Add More</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400">
                      ★ The image marked "Main" will appear as the primary thumbnail across the marketplace.
                    </p>
                  </div>
                )}
              </div>

              {/* Product Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe your product specifications, warranty, features, and package contents..."
                  className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingProduct || isUploading}
                  className="px-5 py-2.5 bg-[#FF5E00] hover:bg-[#FF8C00] text-white font-bold rounded-xl disabled:opacity-50 transition text-xs shadow-sm flex items-center gap-1.5 active:scale-98"
                >
                  {addingProduct ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Listing Product...</span>
                    </>
                  ) : (
                    <span>Publish Product</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
