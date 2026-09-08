"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { formatDate, formatDateTime, formatPrice } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Layers,
  Package,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "analytics" | "sellers" | "categories" | "audit"
  >("analytics");

  // Category Management State
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [catSearch, setCatSearch] = useState("");
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("📦");
  const [newCatDesc, setNewCatDesc] = useState("");

  const fetchData = async () => {
    try {
      const [analyticsRes, sellersRes, catRes] = await Promise.all([
        fetch("/api/admin/analytics"),
        fetch("/api/admin/sellers"),
        fetch("/api/admin/categories"),
      ]);

      const analyticsData = await analyticsRes.json();
      const sellersData = await sellersRes.json();
      const catData = await catRes.json();

      if (analyticsData.metrics) setData(analyticsData);
      if (sellersData.sellers) setSellers(sellersData.sellers);
      if (catData.categories) setCategoriesList(catData.categories);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN")) {
      fetchData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleUpdateSellerStatus = async (sellerId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, status }),
      });

      if (res.ok) {
        await fetchData();
        alert(`Seller status updated to ${status}. Notification and audit log recorded.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading Admin Operations Portal...
      </div>
    );
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500">
          This portal is strictly protected for Fayzee Marketplace Administrators.
        </p>
        <Link
          href="/admin/login"
          className="inline-block px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
        >
          Sign In as Admin
        </Link>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalSellers: 0,
    totalProducts: 0,
    lowStockCount: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-[#1C2A39] border border-[#2A3B4C] text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black">Fayzee Marketplace Admin Panel</h1>
            <span className="px-2.5 py-0.5 bg-[#FF5E00]/20 text-[#FF8C00] text-[10px] font-black rounded-full border border-[#FF5E00]/40">
              {user.role}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Platform governance, seller approvals, catalog oversight & financial audits
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300">
            Signed in as: <strong className="text-white">{user.name}</strong>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#DDE2E6] pb-2 text-xs font-bold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === "analytics"
              ? "bg-[#FF5E00] text-white"
              : "text-[#333333] hover:bg-[#F7F9FA]"
          }`}
        >
          Platform Analytics
        </button>
        <button
          onClick={() => setActiveTab("sellers")}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === "sellers"
              ? "bg-[#FF5E00] text-white"
              : "text-[#333333] hover:bg-[#F7F9FA]"
          }`}
        >
          Seller Approvals ({sellers.length})
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === "categories"
              ? "bg-[#FF5E00] text-white"
              : "text-[#333333] hover:bg-[#F7F9FA]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Category Hierarchy ({categoriesList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === "audit"
              ? "bg-[#FF5E00] text-white"
              : "text-[#333333] hover:bg-[#F7F9FA]"
          }`}
        >
          Security Audit Logs ({data?.recentAuditLogs?.length || 0})
        </button>
      </div>

      {/* TAB 1: Analytics & KPIs */}
      {activeTab === "analytics" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Volume</span>
              <p className="text-lg font-black text-slate-900">{formatPrice(metrics.totalRevenue)}</p>
              <span className="text-[10px] text-emerald-600 font-bold">Paid Transactions</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</span>
              <p className="text-lg font-black text-slate-900">{metrics.totalOrders}</p>
              <span className="text-[10px] text-slate-500">All Statuses</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Customers</span>
              <p className="text-lg font-black text-slate-900">{metrics.totalCustomers}</p>
              <span className="text-[10px] text-slate-500">Registered</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Approved Stores</span>
              <p className="text-lg font-black text-slate-900">{metrics.totalSellers}</p>
              <span className="text-[10px] text-emerald-600 font-bold">Active Merchants</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Catalog Size</span>
              <p className="text-lg font-black text-slate-900">{metrics.totalProducts}</p>
              <span className="text-[10px] text-slate-500">Active SKUs</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Low Stock</span>
              <p className="text-lg font-black text-red-600">{metrics.lowStockCount}</p>
              <span className="text-[10px] text-red-500 font-bold">Needs Restock</span>
            </div>
          </div>

          {/* Recent Orders in Marketplace */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Marketplace Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Order #</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Total</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.recentOrders?.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        <Link href={`/orders/${ord.id}`} className="hover:text-brand-600">
                          #{ord.orderNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        {ord.user.name} ({ord.user.email})
                      </td>
                      <td className="py-2.5 px-4 font-bold text-brand-700">
                        {formatPrice(ord.grandTotal)}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">{formatDate(ord.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Seller Approvals & Applications */}
      {activeTab === "sellers" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Seller Stores & Applications</h3>
              <p className="text-xs text-slate-500">Approve, verify, or suspend seller storefronts</p>
            </div>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b uppercase">
              <tr>
                <th className="py-3 px-4">Store & Business</th>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">CNIC / Tax NTN</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sellers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{s.storeName}</p>
                    <span className="text-[11px] text-slate-500 block">{s.businessName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">/{s.storeSlug}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">{s.user.name}</p>
                    <span className="text-[11px] text-slate-500 block">{s.user.email}</span>
                    <span className="text-[10px] text-slate-400">{s.phone}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                    <div>CNIC: {s.cnic || "Verified"}</div>
                    <div>NTN: {s.taxNumber || "N/A"}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-700"
                          : s.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700 animate-pulse"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    {s.status !== "APPROVED" && (
                      <button
                        onClick={() => handleUpdateSellerStatus(s.id, "APPROVED")}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition"
                      >
                        Approve
                      </button>
                    )}
                    {s.status !== "REJECTED" && (
                      <button
                        onClick={() => handleUpdateSellerStatus(s.id, "REJECTED")}
                        className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-[10px] transition"
                      >
                        Reject
                      </button>
                    )}
                    {s.status === "APPROVED" && (
                      <button
                        onClick={() => handleUpdateSellerStatus(s.id, "SUSPENDED")}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] transition"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Category Management Hierarchy (3-Tier) */}
      {activeTab === "categories" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-600" />
                <span>Marketplace Category Tree Oversight</span>
              </h3>
              <p className="text-xs text-slate-500">
                18 Top-Level Departments &rarr; Subcategories &rarr; Specific Product Types
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  placeholder="Search departments..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 w-48 sm:w-64"
                />
              </div>
            </div>
          </div>

          {/* Department Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Departments</span>
              <p className="text-xl font-black text-slate-900">{categoriesList.length}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Subcategories</span>
              <p className="text-xl font-black text-brand-600">
                {categoriesList.reduce(
                  (sum, c) => sum + (c.subcategories?.length || 0),
                  0
                )}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Product Types</span>
              <p className="text-xl font-black text-indigo-600">
                {categoriesList.reduce(
                  (sum, c) =>
                    sum +
                    (c.subcategories?.reduce(
                      (subSum: number, sub: any) =>
                        subSum + (sub.productTypes?.length || 0),
                      0
                    ) || 0),
                  0
                )}
              </p>
            </div>
          </div>

          {/* Hierarchy List Accordion */}
          <div className="space-y-2">
            {categoriesList
              .filter((c) =>
                catSearch.trim()
                  ? c.name.toLowerCase().includes(catSearch.toLowerCase().trim())
                  : true
              )
              .map((cat) => {
                const isExpanded = expandedCatId === cat.id;
                return (
                  <div
                    key={cat.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition"
                  >
                    <div
                      onClick={() => setExpandedCatId(isExpanded ? null : cat.id)}
                      className="p-4 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer flex items-center justify-between gap-3 select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl shrink-0">{cat.icon}</span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <span>{cat.name}</span>
                            <span className="text-[11px] font-mono text-slate-400 font-normal">
                              /{cat.slug}
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {cat.subcategories?.length || 0} Subcategories • {cat._count?.products || 0} Products
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cat.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {cat.isActive ? "Active" : "Disabled"}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* Subcategories & Product Types Nested Accordion */}
                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-slate-100 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {cat.subcategories?.map((sub: any) => (
                            <div
                              key={sub.id}
                              className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-900">
                                  {sub.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {sub._count?.products || 0} prods
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-1 pt-1">
                                {sub.productTypes?.map((pt: any) => (
                                  <span
                                    key={pt.id}
                                    className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded text-[10px]"
                                  >
                                    {pt.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 4: Audit Trail */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Security & Operational Audit Logs</h3>
          <div className="space-y-3">
            {data?.recentAuditLogs?.length === 0 ? (
              <p className="text-xs text-slate-500">No administrative logs recorded yet.</p>
            ) : (
              data?.recentAuditLogs?.map((log: any) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-purple-700 font-mono uppercase">{log.action}</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">Target: {log.targetType} ({log.targetId})</p>
                    <span className="text-[10px] text-slate-400">Actor: {log.actor?.name || "System"}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{formatDateTime(log.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
