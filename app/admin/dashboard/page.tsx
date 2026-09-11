"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { formatDate, formatDateTime, formatPrice } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Landmark,
  Layers,
  Loader2,
  Megaphone,
  Package,
  Plus,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Tag,
  Trash2,
  Truck,
  Users,
  Wallet,
  XCircle,
  Copy,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Flame,
  Mail,
  MessageSquare,
  Phone,
  Sliders,
  Globe,
  Percent,
  Ticket,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  Power,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "analytics" | "sellers" | "categories" | "products" | "finance" | "courier" | "payment" | "audit" | "support" | "settings"
  >("analytics");

  // Customer Support Tickets State
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [supportFilter, setSupportFilter] = useState<string>("ALL");
  const [supportSearch, setSupportSearch] = useState<string>("");
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [updatingTicketStatus, setUpdatingTicketStatus] = useState<string | null>(null);

  // Logistics & Courier API State
  const [courierSettings, setCourierSettings] = useState({
    activeProvider: "POSTEX",
    isSandbox: true,
    postexApiToken: "",
    traxApiKey: "",
    tcsUsername: "",
    tcsPassword: "",
    tcsCostCenterCode: "",
    defaultPickupCity: "Karachi",
    webhookSecret: "",
  });
  const [savingCourierSettings, setSavingCourierSettings] = useState(false);
  const [courierSettingsSavedMsg, setCourierSettingsSavedMsg] = useState("");
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Payment Gateway Settings State
  const [paymentSettings, setPaymentSettings] = useState({
    activeGateway: "SAFEPAY",
    isSandbox: true,
    safepayApiKey: "",
    safepayApiSecret: "",
    safepayWebhookSecret: "",
    payfastMerchantId: "",
    payfastSecuredKey: "",
    enableCod: true,
    enableOnlineCard: true,
    enableJazzcash: true,
    enableEasypaisa: true,
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [savingPaymentSettings, setSavingPaymentSettings] = useState(false);
  const [paymentSettingsSavedMsg, setPaymentSettingsSavedMsg] = useState("");
  const [copiedPaymentWebhook, setCopiedPaymentWebhook] = useState(false);

  // Finance & Settlements State
  const [adminFinanceData, setAdminFinanceData] = useState<any>(null);
  const [adminPayouts, setAdminPayouts] = useState<any[]>([]);
  const [payoutFilter, setPayoutFilter] = useState<string>("ALL");
  const [adminBankForm, setAdminBankForm] = useState({
    defaultCommissionRate: 10.0,
    minPayoutAmount: 1000.0,
    adminBankName: "",
    adminAccountTitle: "",
    adminAccountNumber: "",
    adminIban: "",
    adminBranchCode: "",
    adminJazzCash: "",
    adminEasyPaisa: "",
    payoutInstructions: "",
  });
  const [savingAdminSettings, setSavingAdminSettings] = useState(false);
  const [adminSettingsSavedMsg, setAdminSettingsSavedMsg] = useState("");

  // Payout Action Modal
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null);
  const [payoutActionType, setPayoutActionType] = useState<"TRANSFER" | "REJECT">("TRANSFER");
  const [payoutAdminRef, setPayoutAdminRef] = useState("");
  const [payoutRejectReason, setPayoutRejectReason] = useState("");
  const [processingPayout, setProcessingPayout] = useState(false);

  // Seller KYC Inspection Modal State
  const [inspectingSeller, setInspectingSeller] = useState<any | null>(null);
  const [sellerRejectReason, setSellerRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isUpdatingSellerStatus, setIsUpdatingSellerStatus] = useState(false);

  // Seller Commission Rate Management State
  const [globalCommissionRate, setGlobalCommissionRate] = useState<number>(10.0);
  const [editingCommissionSeller, setEditingCommissionSeller] = useState<any | null>(null);
  const [newCommissionInput, setNewCommissionInput] = useState<string>("10.0");
  const [isSavingCommission, setIsSavingCommission] = useState(false);
  const [showBulkCommissionModal, setShowBulkCommissionModal] = useState(false);
  const [bulkCommissionInput, setBulkCommissionInput] = useState<string>("10.0");
  const [isBulkUpdatingCommission, setIsBulkUpdatingCommission] = useState(false);
  const [commissionSuccessMsg, setCommissionSuccessMsg] = useState("");

  // Category Management State
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [catSearch, setCatSearch] = useState("");
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("📦");
  const [newCatDesc, setNewCatDesc] = useState("");

  // Products & Ads Promotion State
  const [productsList, setProductsList] = useState<any[]>([]);
  const [prodSearch, setProdSearch] = useState("");
  const [prodFilter, setProdFilter] = useState<"all" | "topPick" | "ads">("all");
  const [updatingProdId, setUpdatingProdId] = useState<string | null>(null);

  // Master Website Control & Settings State
  const [siteSettingsForm, setSiteSettingsForm] = useState({
    siteName: "FAYZEE",
    siteTagline: "Pakistan's Premier Multi-Vendor Marketplace",
    logoUrl: "",
    faviconUrl: "",
    supportPhone: "03306767357",
    supportEmail: "support@fayzee.store",
    whatsappNumber: "03306767357",
    officeAddress: "Lahore / Peshawar, Pakistan",
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
    youtubeUrl: "",
    announcementEnabled: true,
    announcementText: "🎉 Special Offer: Enjoy Free Delivery on Orders Over Rs. 3,000! Cash on Delivery Available Nationwide.",
    announcementLink: "/products",
    jazzcashTitle: "Fayaz Ullah",
    jazzcashNumber: "03306767357",
    easypaisaTitle: "Fayaz Ullah",
    easypaisaNumber: "03306767357",
    bankName: "Meezan Bank Limited",
    bankTitle: "FAYZEE STORE",
    bankAccountNumber: "01020304050607",
    bankIban: "PK36MEZN0001020304050607",
    standardShippingFee: 200.0,
    freeShippingThreshold: 3000.0,
    defaultCommissionRate: 10.0,
    applyCommissionToAllSellers: false,
    allowNewSellers: true,
    maintenanceMode: false,
    maintenanceMessage: "Site is undergoing scheduled maintenance. We will be back online shortly!",
  });
  const [savingSiteSettings, setSavingSiteSettings] = useState(false);
  const [siteSettingsSavedMsg, setSiteSettingsSavedMsg] = useState("");
  const [settingsSubTab, setSettingsSubTab] = useState<
    "general" | "announcement" | "payments" | "shipping" | "banners" | "coupons"
  >("general");

  // Banners State
  const [bannersList, setBannersList] = useState<any[]>([]);
  const [newBannerForm, setNewBannerForm] = useState({
    title: "",
    subtitle: "",
    badge: "FEATURED",
    imageUrl: "",
    linkUrl: "/products",
    position: "HERO",
    order: 0,
    isActive: true,
  });
  const [isCreatingBanner, setIsCreatingBanner] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);

  // Coupons State
  const [couponsList, setCouponsList] = useState<any[]>([]);
  const [newCouponForm, setNewCouponForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderAmount: 1000,
    maxDiscountAmount: 500,
    usageLimit: 100,
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isActive: true,
  });
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [savingCoupon, setSavingCoupon] = useState(false);

  // Horizontal Slider state for Navigation Tabs
  const adminTabsRef = useRef<HTMLDivElement>(null);
  const [canScrollAdminLeft, setCanScrollAdminLeft] = useState(false);
  const [canScrollAdminRight, setCanScrollAdminRight] = useState(false);

  const checkAdminTabsScroll = useCallback(() => {
    if (adminTabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = adminTabsRef.current;
      setCanScrollAdminLeft(scrollLeft > 6);
      setCanScrollAdminRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  }, []);

  useEffect(() => {
    checkAdminTabsScroll();
    const handleResize = () => checkAdminTabsScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkAdminTabsScroll, activeTab]);

  const handleAdminTabsScroll = (direction: "left" | "right") => {
    if (adminTabsRef.current) {
      const offset = direction === "left" ? -280 : 280;
      adminTabsRef.current.scrollBy({ left: offset, behavior: "smooth" });
      setTimeout(checkAdminTabsScroll, 350);
    }
  };

  const fetchData = async () => {
    try {
      const [
        analyticsRes,
        sellersRes,
        catRes,
        prodRes,
        finRes,
        payRes,
        courierRes,
        paymentRes,
        siteRes,
        bannersRes,
        couponsRes,
      ] = await Promise.all([
        fetch("/api/admin/analytics"),
        fetch("/api/admin/sellers"),
        fetch("/api/admin/categories"),
        fetch("/api/admin/products"),
        fetch("/api/admin/finance"),
        fetch("/api/admin/payouts"),
        fetch("/api/admin/courier-settings"),
        fetch("/api/admin/payment-settings"),
        fetch("/api/admin/site-settings").catch(() => null),
        fetch("/api/admin/banners").catch(() => null),
        fetch("/api/admin/coupons").catch(() => null),
      ]);

      const analyticsData = await analyticsRes.json();
      const sellersData = await sellersRes.json();
      const catData = await catRes.json();
      const prodData = await prodRes.json();
      const finData = await finRes.json();
      const payData = await payRes.json();
      const courierData = await courierRes.json();
      const paymentData = await paymentRes.json();

      if (analyticsData.metrics) setData(analyticsData);
      if (sellersData.sellers) setSellers(sellersData.sellers);
      if (sellersData.defaultCommissionRate !== undefined) setGlobalCommissionRate(sellersData.defaultCommissionRate);
      if (catData.categories) setCategoriesList(catData.categories);
      if (prodData.products) setProductsList(prodData.products);
      if (finData.metrics) {
        setAdminFinanceData(finData);
        if (finData.settings) {
          setAdminBankForm({
            defaultCommissionRate: finData.settings.defaultCommissionRate || 10.0,
            minPayoutAmount: finData.settings.minPayoutAmount || 1000.0,
            adminBankName: finData.settings.adminBankName || "",
            adminAccountTitle: finData.settings.adminAccountTitle || "",
            adminAccountNumber: finData.settings.adminAccountNumber || "",
            adminIban: finData.settings.adminIban || "",
            adminBranchCode: finData.settings.adminBranchCode || "",
            adminJazzCash: finData.settings.adminJazzCash || "",
            adminEasyPaisa: finData.settings.adminEasyPaisa || "",
            payoutInstructions: finData.settings.payoutInstructions || "",
          });
        }
      }
      if (payData.payouts) setAdminPayouts(payData.payouts);
      if (courierData?.settings) {
        setCourierSettings({
          activeProvider: courierData.settings.activeProvider || "POSTEX",
          isSandbox: courierData.settings.isSandbox ?? true,
          postexApiToken: courierData.settings.postexApiToken || "",
          traxApiKey: courierData.settings.traxApiKey || "",
          tcsUsername: courierData.settings.tcsUsername || "",
          tcsPassword: courierData.settings.tcsPassword || "",
          tcsCostCenterCode: courierData.settings.tcsCostCenterCode || "",
          defaultPickupCity: courierData.settings.defaultPickupCity || "Karachi",
          webhookSecret: courierData.settings.webhookSecret || "",
        });
      }
      if (paymentData?.config) {
        setPaymentSettings({
          activeGateway: paymentData.config.activeGateway || "SAFEPAY",
          isSandbox: paymentData.config.isSandbox ?? true,
          safepayApiKey: paymentData.config.safepayApiKey || "",
          safepayApiSecret: paymentData.config.safepayApiSecret || "",
          safepayWebhookSecret: paymentData.config.safepayWebhookSecret || "",
          payfastMerchantId: paymentData.config.payfastMerchantId || "",
          payfastSecuredKey: paymentData.config.payfastSecuredKey || "",
          enableCod: paymentData.config.enableCod ?? true,
          enableOnlineCard: paymentData.config.enableOnlineCard ?? true,
          enableJazzcash: paymentData.config.enableJazzcash ?? true,
          enableEasypaisa: paymentData.config.enableEasypaisa ?? true,
        });
        if (paymentData.recentTransactions) {
          setRecentTransactions(paymentData.recentTransactions);
        }
      }

      // Fetch customer support tickets
      const supportRes = await fetch("/api/admin/support").catch(() => null);
      if (supportRes && supportRes.ok) {
        const supportData = await supportRes.json();
        if (supportData.tickets) setSupportTickets(supportData.tickets);
      }

      // Populate Master Site Settings
      if (siteRes && siteRes.ok) {
        const siteData = await siteRes.json();
        if (siteData?.settings) {
          setSiteSettingsForm({
            siteName: siteData.settings.siteName || "FAYZEE",
            siteTagline: siteData.settings.siteTagline || "",
            logoUrl: siteData.settings.logoUrl || "",
            faviconUrl: siteData.settings.faviconUrl || "",
            supportPhone: siteData.settings.supportPhone || "",
            supportEmail: siteData.settings.supportEmail || "",
            whatsappNumber: siteData.settings.whatsappNumber || "",
            officeAddress: siteData.settings.officeAddress || "",
            facebookUrl: siteData.settings.facebookUrl || "",
            instagramUrl: siteData.settings.instagramUrl || "",
            tiktokUrl: siteData.settings.tiktokUrl || "",
            youtubeUrl: siteData.settings.youtubeUrl || "",
            announcementEnabled: siteData.settings.announcementEnabled ?? true,
            announcementText: siteData.settings.announcementText || "",
            announcementLink: siteData.settings.announcementLink || "/products",
            jazzcashTitle: siteData.settings.jazzcashTitle || "",
            jazzcashNumber: siteData.settings.jazzcashNumber || "",
            easypaisaTitle: siteData.settings.easypaisaTitle || "",
            easypaisaNumber: siteData.settings.easypaisaNumber || "",
            bankName: siteData.settings.bankName || "",
            bankTitle: siteData.settings.bankTitle || "",
            bankAccountNumber: siteData.settings.bankAccountNumber || "",
            bankIban: siteData.settings.bankIban || "",
            standardShippingFee: siteData.settings.standardShippingFee ?? 200,
            freeShippingThreshold: siteData.settings.freeShippingThreshold ?? 3000,
            defaultCommissionRate: siteData.settings.defaultCommissionRate ?? 10,
            applyCommissionToAllSellers: false,
            allowNewSellers: siteData.settings.allowNewSellers ?? true,
            maintenanceMode: siteData.settings.maintenanceMode ?? false,
            maintenanceMessage: siteData.settings.maintenanceMessage || "",
          });
        }
      }

      // Populate Banners
      if (bannersRes && bannersRes.ok) {
        const bData = await bannersRes.json();
        if (bData?.banners) setBannersList(bData.banners);
      }

      // Populate Coupons
      if (couponsRes && couponsRes.ok) {
        const cData = await couponsRes.json();
        if (cData?.coupons) setCouponsList(cData.coupons);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    setUpdatingTicketStatus(ticketId);
    try {
      const res = await fetch("/api/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status: newStatus }),
      });
      if (res.ok) {
        setSupportTickets((prev) =>
          prev.map((t) => (t.ticketId === ticketId ? { ...t, status: newStatus } : t))
        );
        if (selectedTicket && selectedTicket.ticketId === ticketId) {
          setSelectedTicket((prev: any) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingTicketStatus(null);
    }
  };

  const handleSaveAdminSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAdminSettings(true);
    setAdminSettingsSavedMsg("");
    try {
      const res = await fetch("/api/admin/finance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminBankForm),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to update settings");

      setAdminSettingsSavedMsg("Official platform bank details and commission settings saved successfully!");
      setTimeout(() => setAdminSettingsSavedMsg(""), 4000);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    } finally {
      setSavingAdminSettings(false);
    }
  };

  const handleSaveCourierSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCourierSettings(true);
    setCourierSettingsSavedMsg("");
    try {
      const res = await fetch("/api/admin/courier-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courierSettings),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to update courier settings");

      setCourierSettingsSavedMsg("Logistics & Courier API settings saved successfully!");
      setTimeout(() => setCourierSettingsSavedMsg(""), 4000);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to save courier settings");
    } finally {
      setSavingCourierSettings(false);
    }
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPaymentSettings(true);
    setPaymentSettingsSavedMsg("");
    try {
      const res = await fetch("/api/admin/payment-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentSettings),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to update payment settings");

      setPaymentSettingsSavedMsg("Payment Gateway configuration saved successfully!");
      setTimeout(() => setPaymentSettingsSavedMsg(""), 4000);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to save payment settings");
    } finally {
      setSavingPaymentSettings(false);
    }
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSiteSettings(true);
    setSiteSettingsSavedMsg("");
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteSettingsForm),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to update site settings");

      setSiteSettingsSavedMsg("Platform Master Control Settings updated successfully!");
      setTimeout(() => setSiteSettingsSavedMsg(""), 4000);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to save site settings");
    } finally {
      setSavingSiteSettings(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBanner(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBannerForm),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to create banner");

      alert("Banner created successfully!");
      setIsCreatingBanner(false);
      setNewBannerForm({
        title: "",
        subtitle: "",
        badge: "FEATURED",
        imageUrl: "",
        linkUrl: "/products",
        position: "HERO",
        order: 0,
        isActive: true,
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Error creating banner");
    } finally {
      setSavingBanner(false);
    }
  };

  const handleToggleBanner = async (bannerId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bannerId, isActive: !currentStatus }),
      });
      if (res.ok) {
        setBannersList((prev) =>
          prev.map((b) => (b.id === bannerId ? { ...b, isActive: !currentStatus } : b))
        );
      } else {
        const d = await res.json();
        alert(d.error || "Failed to toggle banner status");
      }
    } catch (err) {
      console.error(err);
      alert("Error toggling banner status");
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm("Are you sure you want to delete this promotional banner?")) return;
    try {
      const res = await fetch(`/api/admin/banners?id=${bannerId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBannersList((prev) => prev.filter((b) => b.id !== bannerId));
      } else {
        const d = await res.json();
        alert(d.error || "Failed to delete banner");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting banner");
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCoupon(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCouponForm),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to create coupon");

      alert("Coupon voucher created successfully!");
      setIsCreatingCoupon(false);
      setNewCouponForm({
        code: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderAmount: 1000,
        maxDiscountAmount: 500,
        usageLimit: 100,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        isActive: true,
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Error creating coupon");
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleToggleCoupon = async (couponId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: couponId, isActive: !currentStatus }),
      });
      if (res.ok) {
        setCouponsList((prev) =>
          prev.map((c) => (c.id === couponId ? { ...c, isActive: !currentStatus } : c))
        );
      } else {
        const d = await res.json();
        alert(d.error || "Failed to toggle coupon");
      }
    } catch (err) {
      console.error(err);
      alert("Error toggling coupon");
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm("Are you sure you want to permanently delete this discount coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${couponId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCouponsList((prev) => prev.filter((c) => c.id !== couponId));
      } else {
        const d = await res.json();
        alert(d.error || "Failed to delete coupon");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting coupon");
    }
  };

  const handleProcessPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout) return;

    setProcessingPayout(true);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId: selectedPayout.id,
          action: payoutActionType,
          adminReference: payoutAdminRef.trim(),
          rejectionReason: payoutRejectReason.trim(),
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to process payout");

      alert(resData.message || "Payout processed successfully!");
      setSelectedPayout(null);
      setPayoutAdminRef("");
      setPayoutRejectReason("");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Error processing payout");
    } finally {
      setProcessingPayout(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN")) {
      fetchData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleUpdateSellerStatus = async (sellerId: string, status: string, reason?: string) => {
    setIsUpdatingSellerStatus(true);
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, status, rejectionReason: reason }),
      });

      if (res.ok) {
        await fetchData();
        alert(`Seller status updated to ${status}. Notification sent to seller.`);
        setInspectingSeller(null);
        setSellerRejectReason("");
        setShowRejectInput(false);
      } else {
        const d = await res.json();
        alert(d.error || "Failed to update seller status");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating seller status");
    } finally {
      setIsUpdatingSellerStatus(false);
    }
  };

  const handleUpdateSellerCommission = async (sellerId: string, commissionRate: number) => {
    if (isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
      alert("Please enter a valid percentage between 0 and 100.");
      return;
    }
    setIsSavingCommission(true);
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, commissionRate }),
      });
      const data = await res.json();
      if (res.ok) {
        setSellers((prev) =>
          prev.map((s) => (s.id === sellerId ? { ...s, commissionRate } : s))
        );
        setCommissionSuccessMsg(data.message || `Seller commission rate set to ${commissionRate}%.`);
        setTimeout(() => setCommissionSuccessMsg(""), 5000);
        setEditingCommissionSeller(null);
      } else {
        alert(data.error || "Failed to update commission rate");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error updating commission rate");
    } finally {
      setIsSavingCommission(false);
    }
  };

  const handleBulkUpdateCommission = async (rate: number) => {
    if (isNaN(rate) || rate < 0 || rate > 100) {
      alert("Please enter a valid percentage between 0 and 100.");
      return;
    }
    setIsBulkUpdatingCommission(true);
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "BULK_UPDATE_COMMISSION", commissionRate: rate }),
      });
      const data = await res.json();
      if (res.ok) {
        setGlobalCommissionRate(rate);
        setSiteSettingsForm((prev) => ({ ...prev, defaultCommissionRate: rate }));
        setSellers((prev) => prev.map((s) => ({ ...s, commissionRate: rate })));
        setCommissionSuccessMsg(data.message || `All sellers updated to ${rate}% commission rate.`);
        setTimeout(() => setCommissionSuccessMsg(""), 6000);
        setShowBulkCommissionModal(false);
      } else {
        alert(data.error || "Failed to bulk update commission rate");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error during bulk commission update");
    } finally {
      setIsBulkUpdatingCommission(false);
    }
  };

  const handleToggleTopPick = async (productId: string, currentVal: boolean) => {
    setUpdatingProdId(productId);
    const newVal = !currentVal;
    // 1. Instant optimistic state update so UI and counter reflect instantly
    setProductsList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isTrending: newVal } : p))
    );
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, isTrending: newVal }),
      });
      const d = await res.json();
      if (!res.ok) {
        // Revert on failure
        setProductsList((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isTrending: currentVal } : p))
        );
        alert(d.error || "Failed to update Trending Collection status");
      }
    } catch (e) {
      console.error(e);
      setProductsList((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isTrending: currentVal } : p))
      );
      alert("Network error updating product");
    } finally {
      setUpdatingProdId(null);
    }
  };

  const handleToggleAd = async (productId: string, currentVal: boolean) => {
    setUpdatingProdId(productId);
    const newVal = !currentVal;
    // 1. Instant optimistic state update: if setting as true, unset previous featured
    setProductsList((prev) =>
      prev.map((p) => {
        if (p.id === productId) return { ...p, isFeatured: newVal };
        if (newVal) return { ...p, isFeatured: false };
        return p;
      })
    );
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, isFeatured: newVal }),
      });
      const d = await res.json();
      if (!res.ok) {
        // Revert on failure
        setProductsList((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isFeatured: currentVal } : p))
        );
        alert(d.error || "Failed to update Fayzee AI Top Pick status");
      }
    } catch (e) {
      console.error(e);
      setProductsList((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isFeatured: currentVal } : p))
      );
      alert("Network error updating Fayzee AI Top Pick");
    } finally {
      setUpdatingProdId(null);
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
      <div className="bg-[#0B0F14] border border-[#1A222C] text-white p-6 sm:p-8 rounded-3xl shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black">Fayzee Marketplace Admin Panel</h1>
            <span className="px-2.5 py-0.5 bg-[#0B0F14] text-[#C8A96B] text-[10px] font-black rounded-full border border-[#C8A96B]/40 shadow-xs">
              {user.role}
            </span>
          </div>
          <p className="text-xs text-[#8A8F98] mt-0.5">
            Platform governance, seller approvals, catalog oversight & financial audits
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8A8F98]">
            Signed in as: <strong className="text-white">{user.name}</strong>
          </span>
        </div>
      </div>

      {/* Tabs with Horizontal Slider Controls */}
      <div className="relative group/admintabs mb-2">
        {/* Left Slide Button */}
        {canScrollAdminLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pr-3 bg-gradient-to-r from-[#FAF9F6] via-[#FAF9F6]/90 to-transparent pointer-events-none">
            <button
              type="button"
              onClick={() => handleAdminTabsScroll("left")}
              className="pointer-events-auto w-7 h-7 rounded-full bg-white border border-[#E8E5DC] text-[#0B0F14] shadow-md hover:bg-[#0B0F14] hover:text-[#C8A96B] hover:border-[#0B0F14] flex items-center justify-center transition active:scale-90"
              title="Slide Left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Tabs */}
        <div
          ref={adminTabsRef}
          onScroll={checkAdminTabsScroll}
          className="flex gap-2 border-b border-[#E8E5DC] pb-2 text-xs font-bold overflow-x-auto no-scrollbar scroll-smooth px-1"
        >
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap shrink-0 ${
              activeTab === "analytics"
                ? "bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/40 shadow-xs"
                : "text-[#0B0F14] hover:bg-[#F5F3EE]"
            }`}
          >
            Platform Analytics
          </button>
          <button
            onClick={() => setActiveTab("sellers")}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap shrink-0 ${
              activeTab === "sellers"
                ? "bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/40 shadow-xs"
                : "text-[#0B0F14] hover:bg-[#F5F3EE]"
            }`}
          >
            Seller Approvals ({sellers.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === "categories"
                ? "bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/40 shadow-xs"
                : "text-[#0B0F14] hover:bg-[#F5F3EE]"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Category Hierarchy ({categoriesList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === "products"
                ? "bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/40 shadow-xs"
                : "text-[#0B0F14] hover:bg-[#F5F3EE]"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Featured & Trending ({productsList.filter((p) => p.isTrending).length})</span>
          </button>
          <button
            onClick={() => setActiveTab("finance")}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === "finance"
                ? "bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/40 shadow-xs"
                : "text-[#0B0F14] hover:bg-[#F5F3EE]"
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Finance & Settlements</span>
            {adminFinanceData?.metrics?.pendingPayoutsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                {adminFinanceData.metrics.pendingPayoutsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("courier")}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === "courier"
                ? "bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/40 shadow-xs"
                : "text-[#0B0F14] hover:bg-[#F5F3EE]"
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Courier & Delivery API</span>
            {courierSettings.isSandbox && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                SANDBOX
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === "payment"
                ? "bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/40 shadow-xs"
                : "text-[#0B0F14] hover:bg-[#F5F3EE]"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Payment Gateways</span>
            {paymentSettings.isSandbox ? (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                SANDBOX
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                LIVE
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === "support"
                ? "bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/40 shadow-xs"
                : "text-[#0B0F14] hover:bg-[#F5F3EE]"
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Support Tickets</span>
            {supportTickets.filter((t) => t.status === "OPEN").length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-black">
                {supportTickets.filter((t) => t.status === "OPEN").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === "settings"
                ? "bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/40 shadow-xs ring-1 ring-[#C8A96B]/30"
                : "text-[#0B0F14] hover:bg-[#F5F3EE]"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>⚙️ Master Site Control</span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap shrink-0 ${
              activeTab === "audit"
                ? "bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/40 shadow-xs"
                : "text-[#0B0F14] hover:bg-[#F5F3EE]"
            }`}
          >
            Security Audit Logs ({data?.recentAuditLogs?.length || 0})
          </button>
        </div>

        {/* Right Slide Button */}
        {canScrollAdminRight && (
          <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pl-3 bg-gradient-to-l from-[#FAF9F6] via-[#FAF9F6]/90 to-transparent pointer-events-none">
            <button
              type="button"
              onClick={() => handleAdminTabsScroll("right")}
              className="pointer-events-auto w-7 h-7 rounded-full bg-white border border-[#E8E5DC] text-[#0B0F14] shadow-md hover:bg-[#0B0F14] hover:text-[#C8A96B] hover:border-[#0B0F14] flex items-center justify-center transition active:scale-90"
              title="Slide Right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
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
          <div className="p-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Seller Stores & Applications</h3>
              <p className="text-xs text-slate-500">Approve, verify, or suspend seller storefronts & manage custom commission rates</p>
            </div>

            {/* Global Default Rate & Bulk Action */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Platform Default Commission</span>
                <span className="text-xs font-black text-purple-900 font-mono">{globalCommissionRate || 10}%</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBulkCommissionInput(String(globalCommissionRate || 10));
                  setShowBulkCommissionModal(true);
                }}
                className="px-3 py-1.5 bg-[#0B0F14] hover:bg-slate-800 text-[#C8A96B] font-bold rounded-xl text-xs transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
              >
                <Percent className="w-3.5 h-3.5" />
                <span>⚡ Set Rate For ALL Sellers</span>
              </button>
            </div>
          </div>

          {commissionSuccessMsg && (
            <div className="mx-5 my-3 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                {commissionSuccessMsg}
              </span>
              <button onClick={() => setCommissionSuccessMsg("")} className="text-emerald-600 hover:text-emerald-900 font-black cursor-pointer">✕</button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b uppercase">
                <tr>
                  <th className="py-3 px-4">Store & Business</th>
                  <th className="py-3 px-4">Applicant & Contact</th>
                  <th className="py-3 px-4">CNIC & Tax NTN</th>
                  <th className="py-3 px-4">KYC Documents</th>
                  <th className="py-3 px-4">Commission</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Verification Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{s.storeName}</p>
                      <span className="text-[11px] text-slate-500 block">{s.businessName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">/{s.storeSlug}</span>
                      {s.rejectionReason && (
                        <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                          Note: {s.rejectionReason}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{s.user?.name}</p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-slate-500">{s.user?.email}</span>
                        {s.isEmailVerified ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                            ✓ Email Verified
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[11px] text-slate-600 font-mono">{s.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      <div>CNIC: {s.cnic || "N/A"}</div>
                      <div>NTN: {s.taxNumber || "N/A"}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                            s.cnicFrontUrl
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${s.cnicFrontUrl ? "bg-emerald-500" : "bg-slate-300"}`} />
                          Front
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                            s.cnicBackUrl
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${s.cnicBackUrl ? "bg-emerald-500" : "bg-slate-300"}`} />
                          Back
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                            s.bankProofUrl
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${s.bankProofUrl ? "bg-emerald-500" : "bg-slate-300"}`} />
                          Cheque
                        </span>
                      </div>
                    </td>
                    {/* Commission Rate Column */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-slate-900 font-mono">
                            {s.commissionRate ?? globalCommissionRate ?? 10}%
                          </span>
                          {s.commissionRate !== undefined && s.commissionRate !== null && s.commissionRate !== globalCommissionRate ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Custom
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600">
                              Default
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommissionSeller(s);
                            setNewCommissionInput(String(s.commissionRate ?? globalCommissionRate ?? 10));
                          }}
                          className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold rounded-lg text-[10px] transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Percent className="w-3 h-3 text-purple-600" />
                          <span>Edit Rate</span>
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-700"
                            : s.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-800 animate-pulse"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {s.phone && (
                        <a
                          href={`https://wa.me/${s.phone.replace(/\D/g, "").replace(/^0/, "92")}?text=${encodeURIComponent(
                            `Assalam-o-Alaikum ${s.user?.name || ""}, I am FAYZEE Administrator reviewing your seller application for '${s.storeName}'.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-lg text-[10px] transition inline-flex items-center gap-1 shadow-xs"
                          title="Call or Chat with Seller on WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      <button
                        onClick={() => {
                          setInspectingSeller(s);
                          setShowRejectInput(false);
                          setSellerRejectReason("");
                        }}
                        className="px-3 py-1.5 bg-[#0B0F14] hover:bg-[#1a222c] text-[#C8A96B] font-bold rounded-lg text-[10px] transition inline-flex items-center gap-1 shadow-xs"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect KYC</span>
                      </button>

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
                          onClick={() => {
                            setInspectingSeller(s);
                            setShowRejectInput(true);
                          }}
                          className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-[10px] transition"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Seller KYC Document Inspection Modal */}
          {inspectingSeller && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0B0F14] text-[#C8A96B] flex items-center justify-center">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        {inspectingSeller.storeName} — KYC Verification
                      </h3>
                      <p className="text-xs text-slate-500">
                        Entity: {inspectingSeller.businessName} (Applicant: {inspectingSeller.user?.name})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        inspectingSeller.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : inspectingSeller.status === "REJECTED"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      Status: {inspectingSeller.status}
                    </span>
                    <button
                      onClick={() => setInspectingSeller(null)}
                      className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Identity & Bank Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
                      Identity & Contact Info
                    </span>
                    <p><strong className="text-slate-700">Applicant:</strong> {inspectingSeller.user?.name}</p>
                    <p className="flex items-center gap-1.5 flex-wrap">
                      <strong className="text-slate-700">Email:</strong> {inspectingSeller.user?.email}
                      {inspectingSeller.isEmailVerified ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Email OTP Verified
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700">
                          ✓ Verified
                        </span>
                      )}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <strong className="text-slate-700">Phone:</strong> <span className="font-mono font-bold text-slate-900">{inspectingSeller.phone}</span>
                    </p>

                    {/* Direct WhatsApp Call / Message Action */}
                    <div className="pt-2">
                      <a
                        href={`https://wa.me/${(inspectingSeller.phone || inspectingSeller.user?.phone || "").replace(/\D/g, "").replace(/^0/, "92")}?text=${encodeURIComponent(
                          `Assalam-o-Alaikum ${inspectingSeller.user?.name || ""}, I am FAYZEE Administrator reviewing your KYC verification documents for '${inspectingSeller.storeName}'.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm active:scale-98"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Call / Chat on WhatsApp ({inspectingSeller.phone})</span>
                      </a>
                    </div>

                    <p className="pt-1"><strong className="text-slate-700">CNIC Number:</strong> <span className="font-mono font-bold text-slate-900">{inspectingSeller.cnic || "N/A"}</span></p>
                    <p><strong className="text-slate-700">FBR NTN:</strong> {inspectingSeller.taxNumber || "N/A"}</p>
                    <p><strong className="text-slate-700">Pickup Address:</strong> {inspectingSeller.address || "N/A"}</p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
                      Bank Account for Settlements
                    </span>
                    <p><strong className="text-slate-700">Bank Name:</strong> {inspectingSeller.bankName || "Not specified"}</p>
                    <p><strong className="text-slate-700">Account Title:</strong> <span className="font-bold text-slate-900">{inspectingSeller.accountTitle || "Not specified"}</span></p>
                    <p><strong className="text-slate-700">Account Number:</strong> {inspectingSeller.accountNumber || "N/A"}</p>
                    <p><strong className="text-slate-700">IBAN:</strong> <span className="font-mono font-bold text-emerald-800">{inspectingSeller.iban || "N/A"}</span></p>
                    <p className="text-[10px] text-amber-700 font-semibold pt-1">
                      ⚠️ Verify that the Account Title matches the name on the CNIC document.
                    </p>

                    <div className="pt-2 border-t border-slate-200 mt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Platform Commission Rate</span>
                          <span className="text-xs font-black text-purple-900 font-mono">
                            {inspectingSeller.commissionRate ?? globalCommissionRate ?? 10}%
                            {inspectingSeller.commissionRate !== undefined && inspectingSeller.commissionRate !== null && inspectingSeller.commissionRate !== globalCommissionRate ? " (Custom)" : " (Default)"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommissionSeller(inspectingSeller);
                            setNewCommissionInput(String(inspectingSeller.commissionRate ?? globalCommissionRate ?? 10));
                          }}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Percent className="w-3 h-3" />
                          <span>Change Rate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents Inspection Cards */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    Uploaded Verification Documents (KYC Proofs)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* CNIC Front Card */}
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">CNIC Front Side</span>
                        {inspectingSeller.cnicFrontUrl && (
                          <a
                            href={inspectingSeller.cnicFrontUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-brand-600 font-bold hover:underline flex items-center gap-0.5"
                          >
                            <span>Full View</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {inspectingSeller.cnicFrontUrl ? (
                        <a href={inspectingSeller.cnicFrontUrl} target="_blank" rel="noreferrer" className="block group">
                          <img
                            src={inspectingSeller.cnicFrontUrl}
                            alt="CNIC Front"
                            className="w-full h-44 object-contain bg-slate-100 rounded-xl border group-hover:opacity-90 transition"
                          />
                        </a>
                      ) : (
                        <div className="w-full h-44 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                          Not uploaded
                        </div>
                      )}
                    </div>

                    {/* CNIC Back Card */}
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">CNIC Back Side</span>
                        {inspectingSeller.cnicBackUrl && (
                          <a
                            href={inspectingSeller.cnicBackUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-brand-600 font-bold hover:underline flex items-center gap-0.5"
                          >
                            <span>Full View</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {inspectingSeller.cnicBackUrl ? (
                        <a href={inspectingSeller.cnicBackUrl} target="_blank" rel="noreferrer" className="block group">
                          <img
                            src={inspectingSeller.cnicBackUrl}
                            alt="CNIC Back"
                            className="w-full h-44 object-contain bg-slate-100 rounded-xl border group-hover:opacity-90 transition"
                          />
                        </a>
                      ) : (
                        <div className="w-full h-44 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                          Not uploaded
                        </div>
                      )}
                    </div>

                    {/* Bank Cheque / Proof Card */}
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">Bank Cheque / Statement</span>
                        {inspectingSeller.bankProofUrl && (
                          <a
                            href={inspectingSeller.bankProofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-brand-600 font-bold hover:underline flex items-center gap-0.5"
                          >
                            <span>Full View</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {inspectingSeller.bankProofUrl ? (
                        <a href={inspectingSeller.bankProofUrl} target="_blank" rel="noreferrer" className="block group">
                          <img
                            src={inspectingSeller.bankProofUrl}
                            alt="Bank Cheque Proof"
                            className="w-full h-44 object-contain bg-slate-100 rounded-xl border group-hover:opacity-90 transition"
                          />
                        </a>
                      ) : (
                        <div className="w-full h-44 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                          Not uploaded
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rejection Reason Form */}
                {showRejectInput && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-xs">
                    <label className="block font-bold text-rose-900">
                      Reason for Rejection <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={sellerRejectReason}
                      onChange={(e) => setSellerRejectReason(e.target.value)}
                      placeholder="e.g. CNIC photo is blurry, please upload clear picture, or Bank Account Title does not match CNIC name."
                      className="w-full px-3 py-2 bg-white rounded-xl border border-rose-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowRejectInput(false)}
                        className="px-3 py-1.5 bg-white text-slate-700 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isUpdatingSellerStatus || !sellerRejectReason.trim()}
                        onClick={() => handleUpdateSellerStatus(inspectingSeller.id, "REJECTED", sellerRejectReason.trim())}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition disabled:opacity-50"
                      >
                        {isUpdatingSellerStatus ? "Rejecting..." : "Confirm Rejection with Reason"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Modal Footer Actions */}
                {!showRejectInput && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setInspectingSeller(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                    >
                      Close Window
                    </button>

                    <div className="flex items-center gap-2">
                      {inspectingSeller.status !== "APPROVED" && (
                        <button
                          type="button"
                          disabled={isUpdatingSellerStatus}
                          onClick={() => handleUpdateSellerStatus(inspectingSeller.id, "APPROVED")}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm active:scale-98"
                        >
                          <Check className="w-4 h-4" />
                          <span>Verify & Approve Store</span>
                        </button>
                      )}

                      {inspectingSeller.status !== "REJECTED" && (
                        <button
                          type="button"
                          onClick={() => setShowRejectInput(true)}
                          className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition active:scale-98"
                        >
                          Reject Application
                        </button>
                      )}

                      {inspectingSeller.status === "APPROVED" && (
                        <button
                          type="button"
                          disabled={isUpdatingSellerStatus}
                          onClick={() => handleUpdateSellerStatus(inspectingSeller.id, "SUSPENDED")}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                        >
                          Suspend Store
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Individual Seller Commission Rate Modal */}
          {editingCommissionSeller && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Percent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        Edit Commission Rate
                      </h3>
                      <p className="text-xs text-slate-500">
                        {editingCommissionSeller.storeName} ({editingCommissionSeller.user?.email})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingCommissionSeller(null)}
                    className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Current Rate:</span>
                    <span className="font-black text-purple-900 font-mono">{editingCommissionSeller.commissionRate ?? 10}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Platform Global Default:</span>
                    <span className="font-bold text-slate-700 font-mono">{globalCommissionRate}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Custom Commission Rate for this Seller (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={newCommissionInput}
                      onChange={(e) => setNewCommissionInput(e.target.value)}
                      placeholder="e.g. 8.5"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-black text-slate-900 focus:bg-white focus:border-purple-600 outline-none"
                    />
                    <span className="text-sm font-black text-slate-500">%</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setNewCommissionInput(String(globalCommissionRate))}
                      className="text-[11px] font-bold text-purple-600 hover:underline cursor-pointer"
                    >
                      Use Platform Default ({globalCommissionRate}%)
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setNewCommissionInput("5")}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      5% (VIP)
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setNewCommissionInput("0")}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      0% (Free Promo)
                    </button>
                  </div>
                </div>

                {/* Calculation Example Box */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <span className="font-bold text-slate-700 block">Calculation Example (Rs. 1,000 Order Item):</span>
                  <div className="flex justify-between">
                    <span>Platform Commission:</span>
                    <span className="font-bold text-rose-600">
                      Rs. {((1000 * (Number(newCommissionInput) || 0)) / 100).toFixed(0)} ({Number(newCommissionInput) || 0}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seller Receives:</span>
                    <span className="font-bold text-emerald-700">
                      Rs. {(1000 - (1000 * (Number(newCommissionInput) || 0)) / 100).toFixed(0)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingCommissionSeller(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSavingCommission}
                    onClick={() => handleUpdateSellerCommission(editingCommissionSeller.id, Number(newCommissionInput))}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md shadow-purple-600/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {isSavingCommission ? "Saving..." : "Save Commission Rate"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Update All Sellers Commission Rate Modal */}
          {showBulkCommissionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Percent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        ⚡ Bulk Commission Update
                      </h3>
                      <p className="text-xs text-slate-500">
                        Set uniform rate for all {sellers.length} registered sellers
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBulkCommissionModal(false)}
                    className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <span className="font-bold flex items-center gap-1 text-amber-950">
                    ⚠️ Universal Marketplace Update
                  </span>
                  <p>
                    Ye action database me maujood <strong>tamam {sellers.length} sellers</strong> ka commission rate ek sath badal dega aur platform ka global default rate bhi yahi ban jayega.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    New Universal Commission Rate (%) for ALL Sellers
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={bulkCommissionInput}
                      onChange={(e) => setBulkCommissionInput(e.target.value)}
                      placeholder="e.g. 12"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-black text-slate-900 focus:bg-white focus:border-amber-600 outline-none"
                    />
                    <span className="text-sm font-black text-slate-500">%</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setBulkCommissionInput("10")}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      10% (Standard)
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setBulkCommissionInput("12")}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      12%
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setBulkCommissionInput("15")}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      15%
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowBulkCommissionModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isBulkUpdatingCommission}
                    onClick={() => handleBulkUpdateCommission(Number(bulkCommissionInput))}
                    className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md shadow-amber-600/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {isBulkUpdatingCommission ? "Updating All..." : `Apply to All ${sellers.length} Sellers`}
                  </button>
                </div>
              </div>
            </div>
          )}
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

      {/* TAB 4: Products & Ads Management */}
      {activeTab === "products" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Catalog Items</span>
                <Package className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl font-black text-slate-900">{productsList.length}</p>
              <span className="text-xs text-slate-500 font-medium">Available across verified stores</span>
            </div>

            <div className="p-5 bg-[#0B0F14] text-white rounded-2xl border border-[#C8A96B]/30 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C8A96B] uppercase flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Featured Collection
                </span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-black text-xs">
                  {productsList.filter((p) => p.isTrending).length} Active
                </span>
              </div>
              <p className="text-2xl font-black text-white">
                {productsList.filter((p) => p.isTrending).length} Products Selected
              </p>
              <span className="text-xs text-slate-300">
                Live in &quot;Featured Collection: Trending Marketplace Picks&quot; on Homepage
              </span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-[#E8E5DC] shadow-card space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C8A96B] uppercase flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Fayzee AI Top Pick
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full font-black text-xs ${
                    productsList.filter((p) => p.isFeatured).length > 0
                      ? "bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/30"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  {productsList.filter((p) => p.isFeatured).length > 0 ? "1 Active (Admin Set)" : "Disabled (No Auto)"}
                </span>
              </div>
              <p className="text-base font-black text-slate-900 truncate">
                {productsList.find((p) => p.isFeatured)?.title || "No Product Selected (Hero Clean)"}
              </p>
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <span className="text-xs text-[#8A8F98] font-medium">
                  {productsList.find((p) => p.isFeatured)
                    ? "✓ Active in Homepage Hero Card"
                    : "100% Admin Controlled. Click 'Set as AI Top Pick' below to feature a product."}
                </span>
                {productsList.find((p) => p.isFeatured) && (
                  <button
                    type="button"
                    disabled={updatingProdId === productsList.find((p) => p.isFeatured)?.id}
                    onClick={() => {
                      const active = productsList.find((p) => p.isFeatured);
                      if (active) handleToggleAd(active.id, true);
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-bold underline cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    Remove Top Pick
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E5DC] shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8F98]" />
              <input
                type="text"
                placeholder="Search products by title, SKU, or seller store..."
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#F5F3EE] border border-[#E8E5DC] rounded-xl text-xs text-[#0B0F14] focus:bg-white focus:outline-hidden focus:border-[#C8A96B] transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setProdFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  prodFilter === "all"
                    ? "bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/40 shadow-xs"
                    : "bg-[#F5F3EE] text-[#0B0F14] hover:bg-slate-200"
                }`}
              >
                All ({productsList.length})
              </button>
              <button
                type="button"
                onClick={() => setProdFilter("topPick")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  prodFilter === "topPick"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                <Flame className="w-3.5 h-3.5 fill-current" /> Trending Collection ({productsList.filter((p) => p.isTrending).length})
              </button>
              <button
                type="button"
                onClick={() => setProdFilter("ads")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  prodFilter === "ads"
                    ? "bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/40 shadow-xs"
                    : "bg-[#F5F3EE] text-[#0B0F14] hover:bg-slate-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" /> AI Top Pick ({productsList.filter((p) => p.isFeatured).length})
              </button>
            </div>
          </div>

          {/* Products List Table / Cards */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Featured Collection & Trending Marketplace Picks Controls</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct Admin Control: Add or remove any product from the Homepage &quot;Featured Collection: Trending Marketplace Picks&quot; section, or promote as a Sponsored Website Ad.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {productsList
                .filter((p) => {
                  if (prodFilter === "topPick") return p.isTrending;
                  if (prodFilter === "ads") return p.isFeatured;
                  return true;
                })
                .filter((p) => {
                  if (!prodSearch.trim()) return true;
                  const q = prodSearch.toLowerCase();
                  return (
                    p.title?.toLowerCase().includes(q) ||
                    p.sku?.toLowerCase().includes(q) ||
                    p.seller?.storeName?.toLowerCase().includes(q) ||
                    p.category?.name?.toLowerCase().includes(q)
                  );
                })
                .map((product) => {
                  const isUpdating = updatingProdId === product.id;
                  return (
                    <div
                      key={product.id}
                      className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                    >
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                          <img
                            src={
                              product.images?.[0]?.url ||
                              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"
                            }
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {product.title}
                            </h4>
                            {product.isTrending && (
                              <span className="px-2 py-0.5 bg-amber-500/15 text-amber-700 text-[10px] font-black rounded-md border border-amber-300 flex items-center gap-1 shrink-0">
                                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" /> In Trending Collection
                              </span>
                            )}
                            {product.isFeatured && (
                              <span className="px-2 py-0.5 bg-[#0B0F14] text-[#C8A96B] text-[10px] font-black rounded-md border border-[#C8A96B]/30 flex items-center gap-1 shrink-0">
                                <Sparkles className="w-3 h-3 text-[#C8A96B]" /> Hero AI Top Pick
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-[#8A8F98] flex-wrap">
                            <span className="flex items-center gap-1 font-semibold text-[#0B0F14]">
                              <Store className="w-3.5 h-3.5 text-[#8A8F98]" />
                              {product.seller?.storeName || "Official Store"}
                            </span>
                            <span>•</span>
                            <span className="text-[#8A8F98]">
                              SKU: <span className="font-mono text-[#0B0F14]">{product.sku}</span>
                            </span>
                            <span>•</span>
                            <span className="text-[#8A8F98]">
                              Category: <span className="text-[#0B0F14]">{product.category?.name || "General"}</span>
                            </span>
                            <span>•</span>
                            <span className="font-black text-[#0B0F14]">
                              {formatPrice(product.salePrice || product.price)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: Trending Collection & Hero Fayzee AI Top Pick */}
                      <div className="flex items-center gap-2.5 shrink-0 flex-wrap self-end md:self-auto">
                        {/* 1. Trending Marketplace Picks / Featured Collection Toggle Button */}
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleTopPick(product.id, Boolean(product.isTrending))}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
                            product.isTrending
                              ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                              : "bg-white border border-[#E8E5DC] hover:border-amber-400 hover:text-amber-700 text-[#0B0F14]"
                          } disabled:opacity-50`}
                          title="Click to add or remove this product from the 'Featured Collection: Trending Marketplace Picks' section on Homepage"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Flame className={`w-3.5 h-3.5 ${product.isTrending ? "fill-white" : ""}`} />
                          )}
                          <span>
                            {product.isTrending ? "✓ In Trending Collection" : "Add to Trending Collection"}
                          </span>
                        </button>

                        {/* 2. Hero Fayzee AI Top Pick Toggle Button */}
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleAd(product.id, Boolean(product.isFeatured))}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
                            product.isFeatured
                              ? "bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] border border-[#C8A96B]/60 shadow-md"
                              : "bg-white border border-[#E8E5DC] hover:border-[#0B0F14] hover:text-[#0B0F14] text-[#0B0F14]"
                          } disabled:opacity-50`}
                          title="Spotlight this product on Homepage Hero right card as Fayzee AI Top Pick"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
                          )}
                          <span>
                            {product.isFeatured ? "✓ Active AI Top Pick" : "Set as AI Top Pick"}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}

              {productsList.length === 0 && (
                <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                  <Package className="w-8 h-8 mx-auto text-slate-300" />
                  <p>No products found in the catalog.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Finance & Settlements */}
      {activeTab === "finance" && (
        <div className="space-y-6">
          {/* Treasury & Financial KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Platform Revenue */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wide">Gross Collections</span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {formatPrice(adminFinanceData?.metrics?.totalPlatformRevenue || 0)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Total paid customer orders across store
              </p>
            </div>

            {/* Platform Commission Profit */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50/60 p-5 rounded-3xl border border-purple-200 shadow-xs">
              <div className="flex items-center justify-between text-purple-800">
                <span className="text-xs font-bold uppercase tracking-wide">Commission Profit</span>
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Landmark className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-purple-950 mt-2">
                {formatPrice(adminFinanceData?.metrics?.totalCommissionEarned || 0)}
              </p>
              <p className="text-[11px] text-purple-700 mt-0.5">
                Platform fee earned (10% on delivered items)
              </p>
            </div>

            {/* Total Disbursed */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wide">Disbursed to Sellers</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {formatPrice(adminFinanceData?.metrics?.totalDisbursedToSellers || 0)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Completed seller bank payouts to date
              </p>
            </div>

            {/* Pending Payout Queue */}
            <div className="bg-gradient-to-br from-rose-50 to-amber-50/60 p-5 rounded-3xl border border-rose-200 shadow-xs">
              <div className="flex items-center justify-between text-rose-800">
                <span className="text-xs font-bold uppercase tracking-wide">Pending Payouts</span>
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-rose-950 mt-2">
                {adminFinanceData?.metrics?.pendingPayoutsCount || 0}
              </p>
              <p className="text-[11px] text-rose-700 mt-0.5">
                {formatPrice(adminFinanceData?.metrics?.pendingPayoutsAmount || 0)} awaiting bank transfer
              </p>
            </div>
          </div>

          {/* Admin Official Bank Accounts & Mobile Wallets Setup Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-base font-bold text-[#0B0F14] flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-[#C8A96B]" />
                  <span>Platform Official Receiving & Disbursing Accounts</span>
                </h3>
                <p className="text-xs text-[#8A8F98] mt-0.5">
                  Configure official platform bank details and mobile accounts. Used for platform accounting, merchant payouts, and official records.
                </p>
              </div>

              {adminSettingsSavedMsg && (
                <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{adminSettingsSavedMsg}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveAdminSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B0F14] mb-1">
                    Official Bank Name
                  </label>
                  <input
                    type="text"
                    value={adminBankForm.adminBankName}
                    onChange={(e) => setAdminBankForm({ ...adminBankForm, adminBankName: e.target.value })}
                    placeholder="e.g. Habib Bank Limited (HBL) / Meezan Bank"
                    className="w-full px-3 py-2 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-xs text-[#0B0F14] font-medium focus:outline-none focus:border-[#C8A96B] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B0F14] mb-1">
                    Official Company Account Title
                  </label>
                  <input
                    type="text"
                    value={adminBankForm.adminAccountTitle}
                    onChange={(e) => setAdminBankForm({ ...adminBankForm, adminAccountTitle: e.target.value })}
                    placeholder="e.g. FAYZEE MARKETPLACE (PVT) LTD"
                    className="w-full px-3 py-2 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-xs text-[#0B0F14] font-medium focus:outline-none focus:border-[#C8A96B] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B0F14] mb-1">
                    Bank IBAN / Account Number
                  </label>
                  <input
                    type="text"
                    value={adminBankForm.adminIban}
                    onChange={(e) => setAdminBankForm({ ...adminBankForm, adminIban: e.target.value.toUpperCase() })}
                    placeholder="PK36HABB0012345678901234"
                    className="w-full px-3 py-2 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-xs font-mono text-[#0B0F14] focus:outline-none focus:border-[#C8A96B] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B0F14] mb-1">
                    Admin JazzCash Business Number
                  </label>
                  <input
                    type="tel"
                    value={adminBankForm.adminJazzCash}
                    onChange={(e) => setAdminBankForm({ ...adminBankForm, adminJazzCash: e.target.value })}
                    placeholder="03001234567"
                    className="w-full px-3 py-2 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-xs font-mono text-[#0B0F14] focus:outline-none focus:border-[#C8A96B] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B0F14] mb-1">
                    Admin EasyPaisa Business Number
                  </label>
                  <input
                    type="tel"
                    value={adminBankForm.adminEasyPaisa}
                    onChange={(e) => setAdminBankForm({ ...adminBankForm, adminEasyPaisa: e.target.value })}
                    placeholder="03451234567"
                    className="w-full px-3 py-2 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-xs font-mono text-[#0B0F14] focus:outline-none focus:border-[#C8A96B] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B0F14] mb-1">
                    Default Platform Commission (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={adminBankForm.defaultCommissionRate}
                    onChange={(e) => setAdminBankForm({ ...adminBankForm, defaultCommissionRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-xs font-bold text-[#0B0F14] focus:outline-none focus:border-[#C8A96B] focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0F14] mb-1">
                  Settlement & Payout Policy Instructions
                </label>
                <input
                  type="text"
                  value={adminBankForm.payoutInstructions}
                  onChange={(e) => setAdminBankForm({ ...adminBankForm, payoutInstructions: e.target.value })}
                  placeholder="e.g. Official platform settlement and merchant receiving account. Disbursed via 1-Link IBFT / RAAST."
                  className="w-full px-3 py-2 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-xs text-[#0B0F14] focus:outline-none focus:border-[#C8A96B] focus:bg-white transition"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={savingAdminSettings}
                  className="px-5 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] border border-[#C8A96B]/40 disabled:opacity-50 text-xs font-bold rounded-xl shadow-card transition flex items-center gap-1.5 active:scale-98"
                >
                  {savingAdminSettings ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Official Accounts...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Official Platform Accounts</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Seller Payout Requests Management Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Seller Withdrawal & Settlement Requests</h3>
                <p className="text-xs text-slate-500">
                  Review seller requests, disburse payments via online banking, and enter transfer references.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                {["ALL", "PENDING", "TRANSFERRED", "REJECTED"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setPayoutFilter(f)}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      payoutFilter === f
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {adminPayouts.filter((p) => payoutFilter === "ALL" || p.status === payoutFilter).length === 0 ? (
              <div className="py-12 px-4 text-center">
                <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">No payout requests in this filter</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  When sellers request withdrawals, they will appear in this settlement queue.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[750px]">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Seller / Store</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Destination Account</th>
                      <th className="py-3 px-4">Request Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminPayouts
                      .filter((p) => payoutFilter === "ALL" || p.status === payoutFilter)
                      .map((p) => {
                        let parsedDetails: any = {};
                        try {
                          parsedDetails = p.payoutDetails ? JSON.parse(p.payoutDetails) : {};
                        } catch {
                          parsedDetails = {};
                        }

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block">
                                {p.seller?.storeName}
                              </span>
                              <span className="text-[11px] text-slate-500 block">
                                {p.seller?.user?.name} ({p.seller?.user?.phone || p.seller?.phone || "N/A"})
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-black text-slate-900 text-sm">
                                {formatPrice(p.amount)}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-800 block text-[11px]">
                                  {parsedDetails.payoutMethod === "BANK_TRANSFER"
                                    ? `${parsedDetails.bankName || "Bank"} - ${parsedDetails.accountTitle}`
                                    : `${parsedDetails.payoutMethod} - ${parsedDetails.accountTitle}`}
                                </span>
                                <span className="font-mono text-[10px] text-slate-600 block select-all">
                                  {parsedDetails.iban ||
                                    parsedDetails.accountNumber ||
                                    parsedDetails.payoutPhone ||
                                    "No details"}
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-slate-600">
                              {formatDateTime(p.requestedAt)}
                            </td>

                            <td className="py-3 px-4">
                              {p.status === "PENDING" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full text-[10px] font-bold border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                                  <span>Pending Transfer</span>
                                </span>
                              )}
                              {p.status === "TRANSFERRED" && (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-bold border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Transferred</span>
                                  </span>
                                  {p.adminReference && (
                                    <span className="text-[10px] font-mono text-emerald-700 block mt-0.5 select-all font-bold">
                                      {p.adminReference}
                                    </span>
                                  )}
                                </div>
                              )}
                              {p.status === "REJECTED" && (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-800 rounded-full text-[10px] font-bold border border-rose-200">
                                    <XCircle className="w-3 h-3 text-rose-600" />
                                    <span>Declined</span>
                                  </span>
                                  {p.rejectionReason && (
                                    <span className="text-[10px] text-rose-600 block mt-0.5">
                                      {p.rejectionReason}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right">
                              {p.status === "PENDING" ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedPayout(p);
                                      setPayoutActionType("TRANSFER");
                                      setPayoutAdminRef(`UTR-${Math.floor(10000000 + Math.random() * 90000000)}`);
                                      setPayoutRejectReason("");
                                    }}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-2xs flex items-center gap-1"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>Mark Transferred</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedPayout(p);
                                      setPayoutActionType("REJECT");
                                      setPayoutRejectReason("");
                                    }}
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-xl text-xs font-bold transition"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400">
                                  {p.processedAt ? formatDate(p.processedAt) : "Settled"}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Process Payout Transfer / Reject */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    payoutActionType === "TRANSFER"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {payoutActionType === "TRANSFER" ? (
                    <Send className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {payoutActionType === "TRANSFER" ? "Disburse Seller Payout" : "Reject Payout Request"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Store: {selectedPayout.seller?.storeName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayout(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Payout Summary Info */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Transfer Amount:</span>
                <span className="text-base font-black text-emerald-700">
                  {formatPrice(selectedPayout.amount)}
                </span>
              </div>
              <div className="border-t border-slate-200/60 pt-1.5 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Seller Recipient Account:
                </span>
                <p className="font-mono font-bold text-slate-900 text-xs">
                  {(() => {
                    try {
                      const d = selectedPayout.payoutDetails ? JSON.parse(selectedPayout.payoutDetails) : {};
                      return `${d.bankName || d.payoutMethod || "Bank"} - ${d.accountTitle} (${d.iban || d.accountNumber || d.payoutPhone || "N/A"})`;
                    } catch {
                      return "Details recorded";
                    }
                  })()}
                </p>
              </div>
            </div>

            <form onSubmit={handleProcessPayout} className="space-y-4">
              {payoutActionType === "TRANSFER" ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bank Transfer Reference / UTR Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={payoutAdminRef}
                    onChange={(e) => setPayoutAdminRef(e.target.value)}
                    placeholder="e.g. UTR-98374291 or Cheque # 104829"
                    className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30 focus:border-[#C8A96B]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    This reference number will be visible to the seller on their withdrawal statement.
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reason for Rejection <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={payoutRejectReason}
                    onChange={(e) => setPayoutRejectReason(e.target.value)}
                    placeholder="e.g. Invalid IBAN or recipient title does not match store registration."
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                  <span className="text-[10px] text-rose-500 mt-1 block">
                    The requested amount will be returned to the seller's available wallet balance.
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPayout(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingPayout}
                  className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 active:scale-98 ${
                    payoutActionType === "TRANSFER"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {processingPayout ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        {payoutActionType === "TRANSFER" ? "Confirm Transfer & Settle" : "Confirm Rejection"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB: Logistics & Courier API Settings */}
      {activeTab === "courier" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-[#0B0F14] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-[#C8A96B]/30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C8A96B]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#C8A96B]/20 border border-[#C8A96B]/40 flex items-center justify-center text-[#C8A96B]">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono font-bold tracking-widest text-[#C8A96B] uppercase">
                    Centralized Logistics Engine
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#F5F3EE]">
                  Courier Delivery & Rider Dispatch API
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Connect leading Pakistani courier services (PostEx, Trax, TCS) to power automated 1-click parcel booking, 
                  rider warehouse pickup requests, Cash on Delivery (COD) collection, and customer tracking.
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end gap-2">
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                  courierSettings.isSandbox 
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${courierSettings.isSandbox ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`} />
                  <span>{courierSettings.isSandbox ? "Sandbox / Simulation Mode" : "Live Production Active"}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  Active Carrier: <strong className="text-white">{courierSettings.activeProvider}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Settings Saved Notification */}
          {courierSettingsSavedMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{courierSettingsSavedMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveCourierSettings} className="space-y-6">
            {/* Step 1: Active Courier Carrier Selection */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>1. Select Active Courier Partner</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose the primary delivery service used for automated order booking and rider calls.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* PostEx Option */}
                <div
                  onClick={() => setCourierSettings({ ...courierSettings, activeProvider: "POSTEX" })}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition relative ${
                    courierSettings.activeProvider === "POSTEX"
                      ? "border-[#0B0F14] bg-[#0B0F14]/5 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                        P
                      </div>
                      <span className="font-bold text-xs text-slate-900">PostEx Logistics</span>
                    </div>
                    {courierSettings.activeProvider === "POSTEX" && (
                      <span className="w-5 h-5 rounded-full bg-[#0B0F14] text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Modern eCommerce logistics with fast 1-click booking, rapid COD bank transfers, and live tracking.
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Recommended for FAYZEE
                  </span>
                </div>

                {/* Trax Option */}
                <div
                  onClick={() => setCourierSettings({ ...courierSettings, activeProvider: "TRAX" })}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition relative ${
                    courierSettings.activeProvider === "TRAX"
                      ? "border-[#0B0F14] bg-[#0B0F14]/5 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                        T
                      </div>
                      <span className="font-bold text-xs text-slate-900">Trax Logistics</span>
                    </div>
                    {courierSettings.activeProvider === "TRAX" && (
                      <span className="w-5 h-5 rounded-full bg-[#0B0F14] text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Pakistan's extensive 350+ cities delivery network, nationwide warehouse pickups, and Sonik API.
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                    Extensive Coverage
                  </span>
                </div>

                {/* TCS Option */}
                <div
                  onClick={() => setCourierSettings({ ...courierSettings, activeProvider: "TCS" })}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition relative ${
                    courierSettings.activeProvider === "TCS"
                      ? "border-[#0B0F14] bg-[#0B0F14]/5 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center">
                        TCS
                      </div>
                      <span className="font-bold text-xs text-slate-900">TCS Express</span>
                    </div>
                    {courierSettings.activeProvider === "TCS" && (
                      <span className="w-5 h-5 rounded-full bg-[#0B0F14] text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Established express courier network with corporate account credentials and cost center codes.
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                    Corporate Accounts
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Environment Mode & Simulation Toggle */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">2. Sandbox Simulation vs. Live Production</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Safe testing mode allows testing the entire dispatch flow without charging or calling real riders.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={courierSettings.isSandbox}
                    onChange={(e) => setCourierSettings({ ...courierSettings, isSandbox: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  <span className="ml-3 text-xs font-bold text-slate-700">
                    {courierSettings.isSandbox ? "Sandbox ON (Simulation)" : "Live API Active"}
                  </span>
                </label>
              </div>

              {courierSettings.isSandbox ? (
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-800">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Sandbox Mode is currently Enabled:
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    Sellers can click <strong>"⚡ Book Courier Dispatch"</strong> on orders right away. The system will 
                    instantly generate real-looking CN tracking numbers (e.g. <code>PEX-892104</code>), change order statuses to <strong>SHIPPED</strong>, 
                    and attach tracking links. When you are ready to book real pickups, turn Sandbox OFF and enter your live merchant token.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Live Production Mode is Active:
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    All 1-click booking requests from sellers will call the active courier's official API to generate genuine consignment 
                    notes and dispatch physical riders to the seller's warehouse address.
                  </p>
                </div>
              )}
            </div>

            {/* Step 3: API Credentials Configuration */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-black text-slate-900">3. Courier API Credentials</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your marketplace merchant API tokens below. These are kept encrypted and secure on the platform server.
                </p>
              </div>

              {/* PostEx Credentials */}
              {courierSettings.activeProvider === "POSTEX" && (
                <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      PostEx Merchant API Token
                    </span>
                    <a
                      href="https://merchant.postex.pk"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-brand-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Open PostEx Merchant Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div>
                    <input
                      type="password"
                      value={courierSettings.postexApiToken}
                      onChange={(e) => setCourierSettings({ ...courierSettings, postexApiToken: e.target.value })}
                      placeholder="Paste your PostEx API Token (e.g. eyJhbGciOi...)"
                      className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30 focus:border-[#C8A96B]"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Navigate to: PostEx Portal → Settings → API Tokens → Generate / Copy Token.
                    </span>
                  </div>
                </div>
              )}

              {/* Trax Credentials */}
              {courierSettings.activeProvider === "TRAX" && (
                <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Trax Sonik API Key
                    </span>
                    <a
                      href="https://sonik.trax.pk"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-brand-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Open Trax Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div>
                    <input
                      type="password"
                      value={courierSettings.traxApiKey}
                      onChange={(e) => setCourierSettings({ ...courierSettings, traxApiKey: e.target.value })}
                      placeholder="Paste your Trax API Key (e.g. trx_live_...)"
                      className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30 focus:border-[#C8A96B]"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Navigate to: Trax Sonik Portal → Developer Settings → API Key.
                    </span>
                  </div>
                </div>
              )}

              {/* TCS Credentials */}
              {courierSettings.activeProvider === "TCS" && (
                <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    TCS Express Corporate Credentials
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">TCS API Username</label>
                      <input
                        type="text"
                        value={courierSettings.tcsUsername}
                        onChange={(e) => setCourierSettings({ ...courierSettings, tcsUsername: e.target.value })}
                        placeholder="Corporate username"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">TCS API Password</label>
                      <input
                        type="password"
                        value={courierSettings.tcsPassword}
                        onChange={(e) => setCourierSettings({ ...courierSettings, tcsPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Cost Center Code</label>
                      <input
                        type="text"
                        value={courierSettings.tcsCostCenterCode}
                        onChange={(e) => setCourierSettings({ ...courierSettings, tcsCostCenterCode: e.target.value })}
                        placeholder="e.g. 100234"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Default City & Webhook Secret */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Marketplace Default Origin City
                  </label>
                  <input
                    type="text"
                    value={courierSettings.defaultPickupCity}
                    onChange={(e) => setCourierSettings({ ...courierSettings, defaultPickupCity: e.target.value })}
                    placeholder="e.g. Karachi"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Fallback city for pickup calculation if a new seller hasn't entered their warehouse city yet.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Webhook Secret Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={courierSettings.webhookSecret}
                    onChange={(e) => setCourierSettings({ ...courierSettings, webhookSecret: e.target.value })}
                    placeholder="Optional webhook authentication key"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Secures incoming webhook notifications from the courier network.
                  </span>
                </div>
              </div>
            </div>

            {/* Step 4: Webhook Auto-Update URL */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-[#C8A96B]" />
                <span>4. Automated Order Delivery Webhook</span>
              </h3>
              <p className="text-xs text-slate-500">
                Copy this URL and paste it into your PostEx or Trax webhook dashboard. When a rider delivers the parcel or 
                collects the cash, FAYZEE will instantly mark the order as <strong>DELIVERED</strong> and COD as <strong>PAID</strong>.
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://fayzee.store/api/webhooks/courier"
                  className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 select-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("https://fayzee.store/api/webhooks/courier");
                    setCopiedWebhook(true);
                    setTimeout(() => setCopiedWebhook(false), 3000);
                  }}
                  className="px-4 py-2.5 bg-[#0B0F14] hover:bg-[#1a222c] text-[#C8A96B] rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                >
                  {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWebhook ? "Copied!" : "Copy Webhook"}</span>
                </button>
              </div>
            </div>

            {/* Step 5: How It Works Guide for Marketplace Owner */}
            <div className="bg-[#FAF9F5] rounded-3xl border border-[#E8E5DC] p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#0B0F14] flex items-center gap-2">
                <Store className="w-4 h-4 text-[#C8A96B]" />
                <span>Marketplace Logistics Workflow (Daraz Centralized Model)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-[#0B0F14] text-[#C8A96B] font-black text-[10px] flex items-center justify-center">1</span>
                  <p className="font-bold text-slate-900 pt-1">Central Account</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Aap (Malak Fayaz) PostEx ya Trax par ek central merchant account register karte hain. COD ka saara paisa aapke bank account mein aayega.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-[#0B0F14] text-[#C8A96B] font-black text-[10px] flex items-center justify-center">2</span>
                  <p className="font-bold text-slate-900 pt-1">Automatic Dispatch</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Seller order aane par "1-Click Courier Booking" click karta hai. Hamara system rider ko seller ke warehouse address par bhejta hai.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-[#0B0F14] text-[#C8A96B] font-black text-[10px] flex items-center justify-center">3</span>
                  <p className="font-bold text-slate-900 pt-1">Live Tracking</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tracking CN number (jaise PEX-XXXX) customer aur seller dono ko turant milta hai aur live track hota hai.
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1">
                  <span className="w-5 h-5 rounded-full bg-[#0B0F14] text-[#C8A96B] font-black text-[10px] flex items-center justify-center">4</span>
                  <p className="font-bold text-slate-900 pt-1">Commission & Payout</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Delivery hone ke baad aapka platform commission deduct ho kar baaqi amount seller ke FAYZEE wallet mein credit ho jata hai.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Settings Action Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingCourierSettings}
                className="px-6 py-3 bg-[#0B0F14] hover:bg-[#1a222c] text-[#C8A96B] rounded-2xl text-xs font-black transition shadow-lg flex items-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {savingCourierSettings ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C8A96B]" />
                    <span>Saving Courier Configuration...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-[#C8A96B]" />
                    <span>Save Logistics & Courier API Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB: Payment Gateways & Transaction Verification */}
      {activeTab === "payment" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0B0F14] via-[#161F2B] to-[#0B0F14] rounded-3xl p-6 sm:p-8 text-white border border-[#C8A96B]/30 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#C8A96B]/20 text-[#C8A96B] text-[10px] font-black uppercase tracking-widest rounded-full border border-[#C8A96B]/30">
                  State Bank of Pakistan (SBP) Standard
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  3D Secure Active
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Official Payment Gateways & Transaction Verification
              </h2>
              <p className="text-xs text-[#8A8F98] max-w-2xl leading-relaxed">
                Connect your merchant bank accounts with <strong>Safepay</strong> or <strong>PayFast</strong>. 
                Customer payments are verified via 3D Secure bank OTP and authenticated through encrypted HMAC-SHA256 webhook signatures.
              </p>
            </div>

            <div className="flex items-center gap-3 self-stretch md:self-auto bg-white/5 p-3 rounded-2xl border border-white/10 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-[#C8A96B]/20 border border-[#C8A96B]/40 flex items-center justify-center text-[#C8A96B]">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8A8F98] uppercase block">Active Gateway</span>
                <span className="text-sm font-black text-[#C8A96B] block">
                  {paymentSettings.activeGateway}
                </span>
                <span className="text-[10px] text-slate-300">
                  {paymentSettings.isSandbox ? "🟡 Sandbox Test Mode" : "🟢 Live Production"}
                </span>
              </div>
            </div>
          </div>

          {paymentSettingsSavedMsg && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{paymentSettingsSavedMsg}</span>
            </div>
          )}

          <form onSubmit={handleSavePaymentSettings} className="space-y-6">
            {/* Step 1: Select Active Gateway */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C8A96B]" />
                <span>1. Select Active Online Gateway</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Safepay */}
                <div
                  onClick={() => setPaymentSettings({ ...paymentSettings, activeGateway: "SAFEPAY" })}
                  className={`p-5 rounded-2xl border-2 transition cursor-pointer space-y-2 relative ${
                    paymentSettings.activeGateway === "SAFEPAY"
                      ? "border-[#C8A96B] bg-[#FAF9F5] shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900">Safepay Gateway</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0B0F14] text-[#C8A96B]">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Visa, Mastercard, PayPak, EasyPaisa & Bank Transfer. Includes hosted 3D Secure checkout and automated webhook confirmation.
                  </p>
                </div>

                {/* PayFast */}
                <div
                  onClick={() => setPaymentSettings({ ...paymentSettings, activeGateway: "PAYFAST" })}
                  className={`p-5 rounded-2xl border-2 transition cursor-pointer space-y-2 relative ${
                    paymentSettings.activeGateway === "PAYFAST"
                      ? "border-[#C8A96B] bg-[#FAF9F5] shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900">PayFast (APPs)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      SBP Licensed
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Direct union of 1Link bank accounts, UnionPay, PayPak, JazzCash, EasyPaisa, and debit/credit cards across Pakistan.
                  </p>
                </div>

                {/* Simulator */}
                <div
                  onClick={() => setPaymentSettings({ ...paymentSettings, activeGateway: "MANUAL_SIMULATION" })}
                  className={`p-5 rounded-2xl border-2 transition cursor-pointer space-y-2 relative ${
                    paymentSettings.activeGateway === "MANUAL_SIMULATION"
                      ? "border-[#C8A96B] bg-[#FAF9F5] shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900">Sandbox Simulator</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      Testing Mode
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Test orders with sample Visa/Mastercard numbers and simulated 3D Secure SMS OTP codes without real bank credentials.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Environment Mode (Sandbox vs Live) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#C8A96B]" />
                <span>2. Environment & Processing Mode</span>
              </h3>

              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex-1 p-4 rounded-2xl border border-slate-200 hover:border-slate-300 cursor-pointer flex items-center gap-3 bg-slate-50/50">
                  <input
                    type="radio"
                    name="paymentMode"
                    checked={paymentSettings.isSandbox}
                    onChange={() => setPaymentSettings({ ...paymentSettings, isSandbox: true })}
                    className="w-4 h-4 text-[#C8A96B] focus:ring-[#C8A96B]"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Sandbox / Test Mode (Safe Testing)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Simulate 3D Secure and transactions without real money deduction.
                    </span>
                  </div>
                </label>

                <label className="flex-1 p-4 rounded-2xl border border-slate-200 hover:border-slate-300 cursor-pointer flex items-center gap-3 bg-slate-50/50">
                  <input
                    type="radio"
                    name="paymentMode"
                    checked={!paymentSettings.isSandbox}
                    onChange={() => setPaymentSettings({ ...paymentSettings, isSandbox: false })}
                    className="w-4 h-4 text-[#C8A96B] focus:ring-[#C8A96B]"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Live Production Mode (Real Banking)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Deduct actual funds from customer bank accounts and settle to your merchant account.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 3: Gateway Credentials */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#C8A96B]" />
                <span>3. Merchant API Credentials & Security Keys</span>
              </h3>

              {paymentSettings.activeGateway === "SAFEPAY" && (
                <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Safepay Merchant Credentials
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Public API Key (Client Secret)
                      </label>
                      <input
                        type="text"
                        value={paymentSettings.safepayApiKey}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, safepayApiKey: e.target.value })}
                        placeholder="sec_..."
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Safepay Portal → Developers → API Key</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        API Secret Key
                      </label>
                      <input
                        type="password"
                        value={paymentSettings.safepayApiSecret}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, safepayApiSecret: e.target.value })}
                        placeholder="••••••••••••••••"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Webhook Shared Secret (HMAC Verification)
                      </label>
                      <input
                        type="password"
                        value={paymentSettings.safepayWebhookSecret}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, safepayWebhookSecret: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Safepay Portal → Webhooks → Secret</span>
                    </div>
                  </div>
                </div>
              )}

              {paymentSettings.activeGateway === "PAYFAST" && (
                <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    PayFast (APPs) Merchant Credentials
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        PayFast Merchant ID
                      </label>
                      <input
                        type="text"
                        value={paymentSettings.payfastMerchantId}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, payfastMerchantId: e.target.value })}
                        placeholder="e.g. 10482"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Secured Key / Hash Secret
                      </label>
                      <input
                        type="password"
                        value={paymentSettings.payfastSecuredKey}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, payfastSecuredKey: e.target.value })}
                        placeholder="••••••••••••••••"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Methods Activation Toggles */}
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-800 block mb-3">
                  Supported Customer Payment Channels
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <label className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.enableCod}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, enableCod: e.target.checked })}
                      className="rounded text-[#C8A96B] focus:ring-[#C8A96B]"
                    />
                    <span className="text-xs font-bold text-slate-800">Cash on Delivery</span>
                  </label>

                  <label className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.enableOnlineCard}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, enableOnlineCard: e.target.checked })}
                      className="rounded text-[#C8A96B] focus:ring-[#C8A96B]"
                    />
                    <span className="text-xs font-bold text-slate-800">Visa / Mastercard</span>
                  </label>

                  <label className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.enableJazzcash}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, enableJazzcash: e.target.checked })}
                      className="rounded text-[#C8A96B] focus:ring-[#C8A96B]"
                    />
                    <span className="text-xs font-bold text-slate-800">JazzCash Wallet</span>
                  </label>

                  <label className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.enableEasypaisa}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, enableEasypaisa: e.target.checked })}
                      className="rounded text-[#C8A96B] focus:ring-[#C8A96B]"
                    />
                    <span className="text-xs font-bold text-slate-800">EasyPaisa Wallet</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Step 4: Automated Bank Webhook */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-[#C8A96B]" />
                <span>4. Bank Webhook Notification URL (Anti-Fraud Protection)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Copy this URL and enter it in your <strong>Safepay Developer Dashboard → Webhooks</strong>. 
                When a customer authorizes payment via bank OTP, Safepay will send an encrypted HMAC-SHA256 signature to this URL, instantly confirming the order as <strong>PAID</strong>.
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://fayzee.store/api/webhooks/payment/safepay"
                  className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 select-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("https://fayzee.store/api/webhooks/payment/safepay");
                    setCopiedPaymentWebhook(true);
                    setTimeout(() => setCopiedPaymentWebhook(false), 3000);
                  }}
                  className="px-4 py-2.5 bg-[#0B0F14] hover:bg-[#1a222c] text-[#C8A96B] rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                >
                  {copiedPaymentWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPaymentWebhook ? "Copied!" : "Copy Webhook"}</span>
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingPaymentSettings}
                className="px-6 py-3 bg-[#0B0F14] hover:bg-[#1a222c] text-[#C8A96B] rounded-2xl text-xs font-black transition shadow-lg flex items-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {savingPaymentSettings ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C8A96B]" />
                    <span>Saving Payment Gateway Configuration...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-[#C8A96B]" />
                    <span>Save Payment Gateway Configuration</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Step 5: Recent Transactions & Webhook Audit Log */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C8A96B]" />
                <span>Recent Online Transactions & Payment Audit Logs</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Total Logs: {recentTransactions.length}
              </span>
            </div>

            {recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No online payment transactions recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Order Number</th>
                      <th className="py-2.5 px-3">Transaction ID</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {recentTransactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {tx.order?.orderNumber || tx.orderId}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 truncate max-w-[150px]">
                          {tx.transactionId}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#0B0F14]">
                          {tx.paymentMethod}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-sans">
                          {tx.order?.user?.name || "Customer"}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          Rs. {Math.round(tx.amount).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.status === "PAID"
                                ? "bg-emerald-100 text-emerald-800"
                                : tx.status === "PROCESSING"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-sans">
                          {formatDateTime(tx.createdAt)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-sans">
                          {tx.orderId ? (
                            <Link
                              href={`/orders/${tx.orderId}/invoice`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C8A96B] hover:text-[#D4B15A] bg-[#0B0F14] hover:bg-[#1A212D] px-2 py-1 rounded-md transition shadow-2xs"
                              title="View Client Official Tax Invoice"
                            >
                              <FileText className="w-3 h-3 text-[#C8A96B]" />
                              <span>Invoice</span>
                            </Link>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
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

      {/* TAB 6: Audit Trail */}
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

      {/* TAB: Customer Support Tickets */}
      {activeTab === "support" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C8A96B]" />
                  <span>Customer Support Desk & Inquiries</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Manage inquiries submitted from the official Help page (/help).
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={supportSearch}
                    onChange={(e) => setSupportSearch(e.target.value)}
                    placeholder="Search name, email, ticket..."
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#C8A96B]"
                  />
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  {["ALL", "OPEN", "RESOLVED"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setSupportFilter(f)}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        supportFilter === f
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tickets Table */}
            {supportTickets.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Mail className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-medium">No customer support tickets received yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-black uppercase text-slate-400">
                      <th className="py-2.5 px-3">Ticket Ref</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Department & Subject</th>
                      <th className="py-2.5 px-3">Order Ref</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Submitted</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {supportTickets
                      .filter((t) => {
                        if (supportFilter !== "ALL" && t.status !== supportFilter) return false;
                        if (!supportSearch.trim()) return true;
                        const q = supportSearch.toLowerCase();
                        return (
                          t.ticketId?.toLowerCase().includes(q) ||
                          t.name?.toLowerCase().includes(q) ||
                          t.email?.toLowerCase().includes(q) ||
                          t.subject?.toLowerCase().includes(q) ||
                          t.orderNumber?.toLowerCase().includes(q)
                        );
                      })
                      .map((ticket) => (
                        <tr key={ticket.id || ticket.ticketId} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 font-mono font-bold text-[#0B0F14]">
                            {ticket.ticketId}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">{ticket.name}</span>
                            <span className="text-[11px] text-slate-500 block">{ticket.email}</span>
                            {ticket.phone && (
                              <span className="text-[10px] text-emerald-600 font-mono block">
                                📞 {ticket.phone}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 max-w-xs">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5F3EE] text-[#0B0F14] border border-slate-200 inline-block mb-1">
                              {ticket.category}
                            </span>
                            <p className="font-semibold text-slate-900 truncate">{ticket.subject}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{ticket.message}</p>
                          </td>
                          <td className="py-3 px-3">
                            {ticket.orderNumber ? (
                              <span className="font-mono text-[11px] font-bold text-[#C8A96B] bg-[#0B0F14] px-2 py-0.5 rounded">
                                {ticket.orderNumber}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() =>
                                handleUpdateTicketStatus(
                                  ticket.ticketId,
                                  ticket.status === "OPEN" ? "RESOLVED" : "OPEN"
                                )
                              }
                              disabled={updatingTicketStatus === ticket.ticketId}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                                ticket.status === "RESOLVED"
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                  : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              }`}
                              title="Click to toggle status"
                            >
                              {updatingTicketStatus === ticket.ticketId ? "..." : ticket.status}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-400 whitespace-nowrap">
                            {formatDateTime(ticket.createdAt)}
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedTicket(ticket)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                                title="Read Message & Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <a
                                href={`mailto:${ticket.email}?subject=Re: [${ticket.ticketId}] ${ticket.subject}&body=Dear ${ticket.name},%0D%0A%0D%0AThank you for reaching out to Fayzee Store Support.`}
                                className="p-1.5 rounded-lg bg-[#0B0F14] hover:bg-[#161F2B] text-[#C8A96B] transition"
                                title="Reply via Email"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </a>
                              {ticket.phone && (
                                <a
                                  href={`https://wa.me/${ticket.phone.replace(/[^0-9]/g, "")}?text=Assalam-o-Alaikum ${encodeURIComponent(ticket.name)}, regarding your Fayzee support ticket ${ticket.ticketId}:`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition"
                                  title="Chat on WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
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

      {/* TAB: Master Website Control Panel & CMS */}
      {activeTab === "settings" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Control Header Card */}
          <div className="bg-[#0B0F14] border border-[#1A222C] text-white p-6 sm:p-7 rounded-3xl shadow-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#C8A96B]/15 border border-[#C8A96B]/30 flex items-center justify-center text-[#C8A96B]">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                      <span>Master Website Control Panel</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C8A96B]/20 text-[#C8A96B] border border-[#C8A96B]/30">
                        LIVE CMS
                      </span>
                    </h2>
                    <p className="text-xs text-[#8A8F98]">
                      Control all website parameters, payment numbers, announcements, banners, and rules dynamically without code changes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-Navigation Pills */}
              <div className="flex items-center gap-1.5 bg-[#161F2B] p-1.5 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
                {[
                  { id: "general", label: "Store Identity", icon: Building2 },
                  { id: "announcement", label: "Announcement", icon: Megaphone },
                  { id: "payments", label: "Payment Accounts", icon: CreditCard },
                  { id: "shipping", label: "Shipping & Rules", icon: Truck },
                  { id: "banners", label: "Hero Banners", icon: ImageIcon },
                  { id: "coupons", label: "Promo Coupons", icon: Ticket },
                ].map((st) => {
                  const Icon = st.icon;
                  const isCurrent = settingsSubTab === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setSettingsSubTab(st.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        isCurrent
                          ? "bg-[#C8A96B] text-[#0B0F14] shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification alert on save */}
            {siteSettingsSavedMsg && (
              <div className="mt-4 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{siteSettingsSavedMsg}</span>
              </div>
            )}
          </div>

          {/* SUB-TAB 1: Store Identity & Support */}
          {settingsSubTab === "general" && (
            <form onSubmit={handleSaveSiteSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#C8A96B]" />
                  <span>Store Branding & Official Customer Support</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your official store title, tagline, WhatsApp contact, support helpline, and social profiles.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-900 mb-1">Store Name</label>
                  <input
                    type="text"
                    value={siteSettingsForm.siteName}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, siteName: e.target.value })}
                    placeholder="FAYZEE"
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900 focus:bg-white focus:border-[#C8A96B] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Store Slogan / Tagline</label>
                  <input
                    type="text"
                    value={siteSettingsForm.siteTagline}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, siteTagline: e.target.value })}
                    placeholder="Pakistan's Premier Multi-Vendor Marketplace"
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900 focus:bg-white focus:border-[#C8A96B] outline-none"
                  />
                </div>

                <div className="sm:col-span-2 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <label className="block font-bold text-emerald-950 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Official WhatsApp Support Number</span>
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.2 rounded-full font-black">
                      ACTIVE CHAT
                    </span>
                  </label>
                  <input
                    type="text"
                    value={siteSettingsForm.whatsappNumber}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, whatsappNumber: e.target.value })}
                    placeholder="03306767357"
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-emerald-300 font-mono font-bold text-emerald-900 focus:border-emerald-600 outline-none"
                  />
                  <p className="text-[11px] text-emerald-800 leading-normal">
                    This WhatsApp number is wired to quick chat links across the entire store, help desk, and customer notifications.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Support Helpline Phone</label>
                  <input
                    type="text"
                    value={siteSettingsForm.supportPhone}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, supportPhone: e.target.value })}
                    placeholder="03306767357"
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-slate-900 focus:bg-white focus:border-[#C8A96B] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Official Support Email</label>
                  <input
                    type="email"
                    value={siteSettingsForm.supportEmail}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, supportEmail: e.target.value })}
                    placeholder="support@fayzee.store"
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900 focus:bg-white focus:border-[#C8A96B] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-900 mb-1">Headquarters / Office Address</label>
                  <input
                    type="text"
                    value={siteSettingsForm.officeAddress}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, officeAddress: e.target.value })}
                    placeholder="Lahore / Peshawar, Pakistan"
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900 focus:bg-white focus:border-[#C8A96B] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Facebook Page URL</label>
                  <input
                    type="url"
                    value={siteSettingsForm.facebookUrl}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/fayzeestore"
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:bg-white focus:border-[#C8A96B] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Instagram Profile URL</label>
                  <input
                    type="url"
                    value={siteSettingsForm.instagramUrl}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/fayzeestore"
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-900 focus:bg-white focus:border-[#C8A96B] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={savingSiteSettings}
                  className="px-6 py-2.5 rounded-xl bg-[#0B0F14] text-[#C8A96B] hover:bg-[#161F2B] font-bold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingSiteSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Store Identity Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* SUB-TAB 2: Top Announcement Bar */}
          {settingsSubTab === "announcement" && (
            <form onSubmit={handleSaveSiteSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#C8A96B]" />
                  <span>Top Announcement Bar & Header Marquee</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Broadcast flash sales, festive promotions, free delivery announcements, or system alerts on top of all pages.
                </p>
              </div>

              {/* Live Preview Box */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-400 block tracking-wider">
                  Live Preview on Storefront:
                </span>
                {siteSettingsForm.announcementEnabled ? (
                  <div className="bg-[#060A0E] text-[#C8A96B] text-xs py-2 px-4 rounded-xl border border-[#141B22] flex items-center justify-between shadow-xs">
                    <span className="font-semibold truncate">
                      {siteSettingsForm.announcementText || "Special Offer Announcement Text"}
                    </span>
                    <span className="text-[10px] text-white font-bold underline shrink-0 ml-2">
                      Explore &rarr;
                    </span>
                  </div>
                ) : (
                  <div className="bg-slate-100 text-slate-400 text-xs py-2 px-4 rounded-xl border border-dashed border-slate-300 text-center font-bold">
                    Announcement Bar is currently DISABLED / HIDDEN
                  </div>
                )}
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Display Announcement Bar</span>
                    <span className="text-[11px] text-slate-500">Toggle ON to display across Header, or OFF to hide</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSiteSettingsForm({
                        ...siteSettingsForm,
                        announcementEnabled: !siteSettingsForm.announcementEnabled,
                      })
                    }
                    className={`px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                      siteSettingsForm.announcementEnabled
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {siteSettingsForm.announcementEnabled ? "ACTIVE (LIVE)" : "DISABLED"}
                  </button>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Announcement Message</label>
                  <textarea
                    rows={3}
                    value={siteSettingsForm.announcementText}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, announcementText: e.target.value })}
                    placeholder="🎉 Special Offer: Enjoy Free Delivery on Orders Over Rs. 3,000! Cash on Delivery Available Nationwide."
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900 focus:bg-white focus:border-[#C8A96B] outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">Optional Click URL / Redirection Link</label>
                  <input
                    type="text"
                    value={siteSettingsForm.announcementLink}
                    onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, announcementLink: e.target.value })}
                    placeholder="/products or /flash-sale"
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-slate-900 focus:bg-white focus:border-[#C8A96B] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={savingSiteSettings}
                  className="px-6 py-2.5 rounded-xl bg-[#0B0F14] text-[#C8A96B] hover:bg-[#161F2B] font-bold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingSiteSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Announcement Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* SUB-TAB 3: Official Payment Receiving Accounts */}
          {settingsSubTab === "payments" && (
            <form onSubmit={handleSaveSiteSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#C8A96B]" />
                  <span>Official Receiving Accounts (JazzCash • EasyPaisa • Bank Transfer)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update the official payment accounts displayed to customers on the Checkout page (/checkout). Changes take effect immediately without touching source code.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Official JazzCash Account Card */}
                <div className="p-5 rounded-3xl bg-red-50/70 border border-red-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-red-600 text-white font-black text-xs rounded-lg">
                        JazzCash
                      </span>
                      <span className="font-bold text-red-950 text-xs">Official Receiving Account</span>
                    </div>
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                      Checkout Visible
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-red-900 mb-1">JazzCash Account Title</label>
                      <input
                        type="text"
                        value={siteSettingsForm.jazzcashTitle}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, jazzcashTitle: e.target.value })}
                        placeholder="Fayaz Ullah"
                        className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-red-200 font-bold text-slate-900 focus:border-red-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-red-900 mb-1">JazzCash Account / Mobile Number</label>
                      <input
                        type="text"
                        value={siteSettingsForm.jazzcashNumber}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, jazzcashNumber: e.target.value })}
                        placeholder="03306767357"
                        className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-red-200 font-mono font-black text-red-600 focus:border-red-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-red-800 leading-normal">
                    💡 Customers selecting JazzCash at checkout will be instructed to transfer to this number and submit their 8558 TID.
                  </p>
                </div>

                {/* Official EasyPaisa Account Card */}
                <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-emerald-600 text-white font-black text-xs rounded-lg">
                        EasyPaisa
                      </span>
                      <span className="font-bold text-emerald-950 text-xs">Official Receiving Account</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Checkout Visible
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-emerald-900 mb-1">EasyPaisa Account Title</label>
                      <input
                        type="text"
                        value={siteSettingsForm.easypaisaTitle}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, easypaisaTitle: e.target.value })}
                        placeholder="Fayaz Ullah"
                        className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-emerald-200 font-bold text-slate-900 focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-emerald-900 mb-1">EasyPaisa Account / Mobile Number</label>
                      <input
                        type="text"
                        value={siteSettingsForm.easypaisaNumber}
                        onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, easypaisaNumber: e.target.value })}
                        placeholder="03306767357"
                        className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-emerald-200 font-mono font-black text-emerald-700 focus:border-emerald-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-800 leading-normal">
                    💡 Customers selecting EasyPaisa at checkout will be instructed to transfer to this number and submit their 3737 TID.
                  </p>
                </div>
              </div>

              {/* Official Corporate Bank Account Section */}
              <div className="p-5 rounded-3xl bg-[#F5F3EE] border border-[#E8E5DC] space-y-4">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-[#C8A96B]" />
                  <span className="font-bold text-slate-900 text-xs">Official Corporate Bank Account</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={siteSettingsForm.bankName}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, bankName: e.target.value })}
                      placeholder="Meezan Bank Limited"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#C8A96B]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Account Title</label>
                    <input
                      type="text"
                      value={siteSettingsForm.bankTitle}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, bankTitle: e.target.value })}
                      placeholder="FAYZEE STORE"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#C8A96B]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={siteSettingsForm.bankAccountNumber}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, bankAccountNumber: e.target.value })}
                      placeholder="01020304050607"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-mono text-slate-900 outline-none focus:border-[#C8A96B]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">IBAN</label>
                    <input
                      type="text"
                      value={siteSettingsForm.bankIban}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, bankIban: e.target.value })}
                      placeholder="PK36MEZN0001020304050607"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-mono text-slate-900 outline-none focus:border-[#C8A96B]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={savingSiteSettings}
                  className="px-6 py-2.5 rounded-xl bg-[#0B0F14] text-[#C8A96B] hover:bg-[#161F2B] font-bold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingSiteSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Receiving Payment Accounts</span>
                </button>
              </div>
            </form>
          )}

          {/* SUB-TAB 4: Shipping Rates & Business Rules */}
          {settingsSubTab === "shipping" && (
            <form onSubmit={handleSaveSiteSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#C8A96B]" />
                  <span>Shipping Rates, Thresholds & Platform Policies</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure standard courier delivery fees, free shipping order qualification, commission rates, and vendor registration gates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <label className="block font-bold text-slate-900">Standard Shipping Delivery Fee</label>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-bold text-slate-400">Rs.</span>
                    <input
                      type="number"
                      value={siteSettingsForm.standardShippingFee}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, standardShippingFee: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-black text-slate-900 outline-none focus:border-[#C8A96B]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">Charged per order under threshold</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                  <label className="block font-bold text-emerald-950">Free Delivery Order Threshold</label>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-bold text-emerald-600">Rs.</span>
                    <input
                      type="number"
                      value={siteSettingsForm.freeShippingThreshold}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, freeShippingThreshold: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-emerald-300 font-black text-emerald-900 outline-none focus:border-emerald-600"
                    />
                  </div>
                  <span className="text-[10px] text-emerald-700">Orders equal or above this get free delivery</span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-purple-950">Marketplace Commission Rate</label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">
                      Default & Bulk Control
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={siteSettingsForm.defaultCommissionRate}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, defaultCommissionRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-purple-300 font-black text-purple-900 outline-none focus:border-purple-600"
                    />
                    <span className="font-bold text-purple-600">%</span>
                  </div>
                  <span className="text-[10px] text-purple-700 block">Default platform fee deducted on delivered seller orders</span>

                  {/* Bulk Apply to all Sellers Checkbox */}
                  <label className="flex items-center gap-2 pt-2 border-t border-purple-200/80 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(siteSettingsForm.applyCommissionToAllSellers)}
                      onChange={(e) => setSiteSettingsForm({ ...siteSettingsForm, applyCommissionToAllSellers: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-600 accent-purple-600 cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-purple-950">
                      ⚡ Apply this {siteSettingsForm.defaultCommissionRate}% rate to ALL existing sellers upon saving
                    </span>
                  </label>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-900 block">Allow New Seller Registrations</span>
                    <span className="text-[11px] text-slate-500">Allow new vendor storefront signups on /seller/register</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSiteSettingsForm({ ...siteSettingsForm, allowNewSellers: !siteSettingsForm.allowNewSellers })}
                    className={`px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                      siteSettingsForm.allowNewSellers ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {siteSettingsForm.allowNewSellers ? "OPEN" : "CLOSED"}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-900 block">Store Maintenance Mode</span>
                    <span className="text-[11px] text-slate-500">Temporarily restrict public storefront during maintenance</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSiteSettingsForm({ ...siteSettingsForm, maintenanceMode: !siteSettingsForm.maintenanceMode })}
                    className={`px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                      siteSettingsForm.maintenanceMode ? "bg-rose-600 text-white shadow-xs" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {siteSettingsForm.maintenanceMode ? "ENABLED (OFFLINE)" : "NORMAL (LIVE)"}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={savingSiteSettings}
                  className="px-6 py-2.5 rounded-xl bg-[#0B0F14] text-[#C8A96B] hover:bg-[#161F2B] font-bold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingSiteSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Shipping & Policy Rules</span>
                </button>
              </div>
            </form>
          )}

          {/* SUB-TAB 5: Homepage Hero Banners & Slider Manager */}
          {settingsSubTab === "banners" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#C8A96B]" />
                    <span>Homepage Hero Banners & Promotions Manager</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add, activate, reorder, or delete custom promotional slides and hero banners.
                  </p>
                </div>

                <button
                  onClick={() => setIsCreatingBanner(!isCreatingBanner)}
                  className="px-4 py-2 rounded-xl bg-[#0B0F14] text-[#C8A96B] hover:bg-[#161F2B] font-bold text-xs transition flex items-center gap-1.5 self-start cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isCreatingBanner ? "Cancel" : "Add New Banner"}</span>
                </button>
              </div>

              {/* Create Banner Form */}
              {isCreatingBanner && (
                <form onSubmit={handleCreateBanner} className="p-5 rounded-3xl bg-[#F5F3EE] border border-[#E8E5DC] space-y-4 animate-in fade-in">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">New Promotional Banner</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Banner Title *</label>
                      <input
                        type="text"
                        required
                        value={newBannerForm.title}
                        onChange={(e) => setNewBannerForm({ ...newBannerForm, title: e.target.value })}
                        placeholder="e.g. Mega Electronics Gala"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#C8A96B]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Subtitle / Slogan</label>
                      <input
                        type="text"
                        value={newBannerForm.subtitle}
                        onChange={(e) => setNewBannerForm({ ...newBannerForm, subtitle: e.target.value })}
                        placeholder="Up to 50% Off on Verified Brands"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#C8A96B]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Badge Pill</label>
                      <input
                        type="text"
                        value={newBannerForm.badge}
                        onChange={(e) => setNewBannerForm({ ...newBannerForm, badge: e.target.value })}
                        placeholder="HOT DEAL / NEW"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 outline-none focus:border-[#C8A96B]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-800 mb-1">Banner Image URL *</label>
                      <input
                        type="url"
                        required
                        value={newBannerForm.imageUrl}
                        onChange={(e) => setNewBannerForm({ ...newBannerForm, imageUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/... or /images/hero-banner.jpg"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-mono text-slate-900 outline-none focus:border-[#C8A96B]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Target Link URL</label>
                      <input
                        type="text"
                        value={newBannerForm.linkUrl}
                        onChange={(e) => setNewBannerForm({ ...newBannerForm, linkUrl: e.target.value })}
                        placeholder="/products or /category/electronics"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-mono text-slate-900 outline-none focus:border-[#C8A96B]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Display Position</label>
                      <select
                        value={newBannerForm.position}
                        onChange={(e) => setNewBannerForm({ ...newBannerForm, position: e.target.value })}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 outline-none"
                      >
                        <option value="HERO">Homepage Hero Slider</option>
                        <option value="PROMO_TOP">Promo Top Bar</option>
                        <option value="PROMO_SIDE">Sidebar Feature</option>
                        <option value="FOOTER_BANNER">Footer Banner</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Sort Order</label>
                      <input
                        type="number"
                        value={newBannerForm.order}
                        onChange={(e) => setNewBannerForm({ ...newBannerForm, order: Number(e.target.value) })}
                        placeholder="0"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-mono text-slate-900 outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newBannerForm.isActive}
                          onChange={(e) => setNewBannerForm({ ...newBannerForm, isActive: e.target.checked })}
                          className="w-4 h-4 rounded text-[#C8A96B]"
                        />
                        <span className="font-bold text-slate-800">Immediately Active (Live)</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingBanner(false)}
                      className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingBanner}
                      className="px-5 py-2 rounded-xl bg-[#0B0F14] text-[#C8A96B] font-bold text-xs hover:bg-[#161F2B] transition flex items-center gap-1.5"
                    >
                      {savingBanner ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>Save & Publish Banner</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Existing Banners Grid */}
              {bannersList.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-3xl">
                  <ImageIcon className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">No custom promotional banners created yet.</p>
                  <span className="text-[11px] text-slate-400 block">The default high-definition hero banner is currently active on the homepage.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bannersList.map((banner) => (
                    <div key={banner.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="relative h-36 bg-slate-900 overflow-hidden">
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-black/80 text-white backdrop-blur-xs">
                              {banner.position}
                            </span>
                            {banner.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#C8A96B] text-[#0B0F14]">
                                {banner.badge}
                              </span>
                            )}
                          </div>
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              banner.isActive ? "bg-emerald-500 text-white" : "bg-slate-600 text-white"
                            }`}>
                              {banner.isActive ? "LIVE" : "PAUSED"}
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 space-y-1">
                          <h4 className="font-bold text-slate-900 text-xs truncate">{banner.title}</h4>
                          {banner.subtitle && <p className="text-[11px] text-slate-500 line-clamp-1">{banner.subtitle}</p>}
                          <span className="text-[10px] text-[#C8A96B] font-mono block truncate">{banner.linkUrl}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => handleToggleBanner(banner.id, banner.isActive)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                            banner.isActive ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          }`}
                        >
                          {banner.isActive ? "Pause" : "Activate"}
                        </button>

                        <button
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 6: Discount Coupons & Vouchers */}
          {settingsSubTab === "coupons" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-[#C8A96B]" />
                    <span>Store Discount Coupons & Promo Voucher Engine</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generate promotional vouchers, percentage discounts, or flat PKR discounts applied at checkout.
                  </p>
                </div>

                <button
                  onClick={() => setIsCreatingCoupon(!isCreatingCoupon)}
                  className="px-4 py-2 rounded-xl bg-[#0B0F14] text-[#C8A96B] hover:bg-[#161F2B] font-bold text-xs transition flex items-center gap-1.5 self-start cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isCreatingCoupon ? "Cancel" : "Create Coupon"}</span>
                </button>
              </div>

              {/* Create Coupon Form */}
              {isCreatingCoupon && (
                <form onSubmit={handleCreateCoupon} className="p-5 rounded-3xl bg-[#F5F3EE] border border-[#E8E5DC] space-y-4 animate-in fade-in">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">New Promo Coupon</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Coupon Code *</label>
                      <input
                        type="text"
                        required
                        value={newCouponForm.code}
                        onChange={(e) => setNewCouponForm({ ...newCouponForm, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })}
                        placeholder="e.g. FAYZEE20"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-mono font-black text-slate-900 uppercase tracking-widest outline-none focus:border-[#C8A96B]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Discount Type</label>
                      <select
                        value={newCouponForm.discountType}
                        onChange={(e) => setNewCouponForm({ ...newCouponForm, discountType: e.target.value })}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 outline-none font-medium"
                      >
                        <option value="PERCENTAGE">Percentage (% Off)</option>
                        <option value="FIXED">Fixed Amount (PKR Flat Off)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Discount Value ({newCouponForm.discountType === "PERCENTAGE" ? "%" : "PKR"}) *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={newCouponForm.discountValue}
                        onChange={(e) => setNewCouponForm({ ...newCouponForm, discountValue: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-bold text-slate-900 outline-none focus:border-[#C8A96B]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Minimum Order Amount (Rs.)</label>
                      <input
                        type="number"
                        value={newCouponForm.minOrderAmount}
                        onChange={(e) => setNewCouponForm({ ...newCouponForm, minOrderAmount: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Max Discount Cap (Rs.)</label>
                      <input
                        type="number"
                        value={newCouponForm.maxDiscountAmount}
                        onChange={(e) => setNewCouponForm({ ...newCouponForm, maxDiscountAmount: Number(e.target.value) })}
                        placeholder="Optional cap"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Max Redemptions (Usage Limit)</label>
                      <input
                        type="number"
                        value={newCouponForm.usageLimit}
                        onChange={(e) => setNewCouponForm({ ...newCouponForm, usageLimit: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-mono text-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Expiry Date *</label>
                      <input
                        type="date"
                        required
                        value={newCouponForm.endDate}
                        onChange={(e) => setNewCouponForm({ ...newCouponForm, endDate: e.target.value })}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 outline-none font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-800 mb-1">Campaign Description</label>
                      <input
                        type="text"
                        value={newCouponForm.description}
                        onChange={(e) => setNewCouponForm({ ...newCouponForm, description: e.target.value })}
                        placeholder="e.g. 20% Off for New Year shoppers"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingCoupon(false)}
                      className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingCoupon}
                      className="px-5 py-2 rounded-xl bg-[#0B0F14] text-[#C8A96B] font-bold text-xs hover:bg-[#161F2B] transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {savingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>Create Coupon</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Coupons List Table */}
              {couponsList.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-3xl">
                  <Ticket className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">No active discount coupons found.</p>
                  <span className="text-[11px] text-slate-400 block">Click "+ Create Coupon" to launch your first promotional code.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-black uppercase text-slate-400">
                        <th className="py-2.5 px-3">Promo Code</th>
                        <th className="py-2.5 px-3">Discount</th>
                        <th className="py-2.5 px-3">Eligibility</th>
                        <th className="py-2.5 px-3">Redemptions</th>
                        <th className="py-2.5 px-3">Expiry</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {couponsList.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3">
                            <span className="px-2.5 py-1 rounded-lg bg-[#0B0F14] text-[#C8A96B] font-mono font-black text-xs tracking-wider">
                              {c.code}
                            </span>
                            {c.description && <span className="text-[11px] text-slate-500 block mt-1">{c.description}</span>}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `Rs. ${c.discountValue} FLAT`}
                            {c.maxDiscountAmount && (
                              <span className="text-[10px] text-slate-400 block font-normal">
                                Cap: Rs. {c.maxDiscountAmount}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            Min: Rs. {c.minOrderAmount || 0}
                          </td>
                          <td className="py-3 px-3 font-mono">
                            <span className="font-bold text-slate-900">{c.usedCount || c._count?.usages || 0}</span>
                            <span className="text-slate-400"> / {c.usageLimit}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                            {formatDate(c.endDate)}
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() => handleToggleCoupon(c.id, c.isActive)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition ${
                                c.isActive ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                              }`}
                            >
                              {c.isActive ? "ACTIVE" : "PAUSED"}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleDeleteCoupon(c.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Delete Coupon"
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
          )}
        </div>
      )}

      {/* Ticket Details Inspection Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400">
                  Customer Support Ticket
                </span>
                <h3 className="font-mono font-black text-base text-[#0B0F14]">
                  {selectedTicket.ticketId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-black transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#F5F3EE] p-4 rounded-2xl">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Customer</span>
                <span className="font-bold text-slate-900">{selectedTicket.name}</span>
                <span className="text-slate-500 block">{selectedTicket.email}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Phone / WA</span>
                <span className="font-bold text-slate-900">{selectedTicket.phone || "Not Provided"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Department</span>
                <span className="font-bold text-slate-900">{selectedTicket.category}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Order Reference</span>
                <span className="font-bold text-[#C8A96B] font-mono">{selectedTicket.orderNumber || "None"}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Subject</span>
              <p className="font-bold text-sm text-slate-900">{selectedTicket.subject}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Full Message</span>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-800 leading-relaxed max-h-52 overflow-y-auto whitespace-pre-line font-sans">
                {selectedTicket.message}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() =>
                  handleUpdateTicketStatus(
                    selectedTicket.ticketId,
                    selectedTicket.status === "OPEN" ? "RESOLVED" : "OPEN"
                  )
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedTicket.status === "RESOLVED"
                    ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {selectedTicket.status === "RESOLVED" ? "Re-open Ticket" : "Mark as Resolved"}
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedTicket.email}?subject=Re: [${selectedTicket.ticketId}] ${selectedTicket.subject}`}
                  className="px-4 py-2 rounded-xl bg-[#0B0F14] text-[#C8A96B] text-xs font-bold hover:bg-[#161F2B] transition flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" /> Reply Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
