"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SellerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders">("overview");

  const [products, setProducts] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newSalePrice, setNewSalePrice] = useState("");
  const [newStock, setNewStock] = useState("20");
  const [newDesc, setNewDesc] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [addingProduct, setAddingProduct] = useState(false);

  const fetchSellerData = async () => {
    try {
      const [prodRes, orderRes, catRes] = await Promise.all([
        fetch("/api/seller/products"),
        fetch("/api/seller/orders"),
        fetch("/api/products?limit=1"), // to ensure endpoint is alive, or fetch categories
      ]);

      const prodData = await prodRes.json();
      const orderData = await orderRes.json();

      if (prodData.products) setProducts(prodData.products);
      if (orderData.orderItems) setOrderItems(orderData.orderItems);
    } catch (e) {
      console.error(e);
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

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingProduct(true);
    try {
      const res = await fetch("/api/seller/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          categoryId: newCategory || "smartphones-tablets",
          price: Number(newPrice),
          salePrice: newSalePrice ? Number(newSalePrice) : null,
          stockQuantity: Number(newStock),
          description: newDesc,
          imageUrl: newImageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product");

      setIsAddModalOpen(false);
      setNewTitle("");
      setNewPrice("");
      setNewDesc("");
      await fetchSellerData();
      alert("Product listed successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to add product");
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
        body: JSON.stringify({ orderItemId, fulfillmentStatus: newStatus }),
      });
      if (res.ok) {
        await fetchSellerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading Seller Center...
      </div>
    );
  }

  if (!user || (user.role !== "SELLER" && !user.sellerProfile)) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 bg-orange-50 text-fayzee-coral rounded-full flex items-center justify-center mx-auto">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Seller Account Required</h2>
        <p className="text-xs text-slate-500">
          You must be logged in with an authorized seller account to access this portal.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/login?redirect=/seller/dashboard" className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold">
            Sign In
          </Link>
          <Link href="/seller/register" className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold">
            Apply to Sell
          </Link>
        </div>
      </div>
    );
  }

  // Calculate seller revenue and statistics
  const totalRevenue = orderItems.reduce((acc, item) => acc + item.total, 0);
  const pendingOrders = orderItems.filter((item) => item.fulfillmentStatus === "PENDING").length;
  const lowStockProducts = products.filter((p) => p.stockQuantity <= 5).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with Store Profile */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-fayzee-coral text-white font-black text-2xl flex items-center justify-center shadow-md">
            🏪
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">
                {user.sellerProfile?.storeName || "Seller Store"}
              </h1>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/30">
                {user.sellerProfile?.status || "APPROVED"}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Welcome back, {user.name} • Merchant Portal
            </p>
          </div>
        </div>

        {user.sellerProfile?.storeSlug && (
          <Link
            href={`/sellers/${user.sellerProfile.storeSlug}`}
            target="_blank"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition flex items-center gap-1.5"
          >
            <span>View Public Store</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === "overview"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Dashboard Overview
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === "products"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Manage Listings ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === "orders"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Customer Orders ({orderItems.length})
        </button>
      </div>

      {/* TAB 1: Overview KPIs */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Store Revenue
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-900">
                {formatPrice(totalRevenue)}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">Verified Earnings</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Listings
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-900">
                {products.length}
              </p>
              <span className="text-[10px] text-slate-500">Live on marketplace</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Pending Shipments
              </span>
              <p className="text-xl sm:text-2xl font-black text-orange-600">
                {pendingOrders}
              </p>
              <span className="text-[10px] text-orange-500 font-bold">Requires Fulfillment</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Low Stock Alerts
              </span>
              <p className="text-xl sm:text-2xl font-black text-red-600">
                {lowStockProducts}
              </p>
              <span className="text-[10px] text-red-500 font-bold">≤ 5 units left</span>
            </div>
          </div>

          {/* Recent Orders Preview */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recent Store Orders</h3>
              <button
                onClick={() => setActiveTab("orders")}
                className="text-xs font-bold text-brand-600 hover:underline"
              >
                View All
              </button>
            </div>

            {orderItems.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No orders placed for your store items yet.</p>
            ) : (
              <div className="space-y-2">
                {orderItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs"
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
            <h3 className="text-base font-bold text-slate-900">Your Product Listings</h3>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-left">
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
                          p.images[0]?.url ||
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
        </div>
      )}

      {/* TAB 3: Orders Scoped to Seller */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Customer Orders for Your Store</h3>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Buyer</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orderItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      #{item.order.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800 truncate max-w-xs">{item.title}</p>
                      <span className="text-[10px] text-slate-400">Qty: {item.quantity}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <p className="font-bold">{item.order.user.name}</p>
                      <span className="text-[10px] text-slate-400">{item.order.user.phone}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-700">
                      {formatPrice(item.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.fulfillmentStatus === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-700"
                            : item.fulfillmentStatus === "SHIPPED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {item.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {item.fulfillmentStatus === "PENDING" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "PROCESSING")}
                          className="px-2 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded text-[10px]"
                        >
                          Process
                        </button>
                      )}
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
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="text-base font-bold text-slate-900">List New Store Product</h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Wireless Ergonomic Mouse 2.4GHz"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Retail Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="4500"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sale Price (Optional)</label>
                  <input
                    type="number"
                    value={newSalePrice}
                    onChange={(e) => setNewSalePrice(e.target.value)}
                    placeholder="3999"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Stock Quantity</label>
                <input
                  type="number"
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Description</label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe your product specs, warranty, features..."
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingProduct}
                  className="px-4 py-2 bg-brand-600 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {addingProduct ? "Listing..." : "Publish Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
