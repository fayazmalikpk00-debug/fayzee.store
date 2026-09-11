"use client";

import { getAttributesForCategory } from "@/lib/categoryHierarchy";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Building2,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Landmark,
  Layers,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  Plus,
  Printer,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Tag,
  Trash2,
  Truck,
  Upload,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "orders" | "reviews" | "finance" | "messages" | "settings"
  >("overview");

  const [products, setProducts] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sellerReviews, setSellerReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Finance & Payouts State
  const [financeData, setFinanceData] = useState<any>(null);
  const [payoutsList, setPayoutsList] = useState<any[]>([]);
  const [bankForm, setBankForm] = useState({
    payoutMethod: "BANK_TRANSFER",
    bankName: "",
    accountTitle: "",
    accountNumber: "",
    iban: "",
    branchCode: "",
    payoutPhone: "",
  });
  const [savingBank, setSavingBank] = useState(false);
  const [bankSavedMsg, setBankSavedMsg] = useState("");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNotes, setWithdrawNotes] = useState("");
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState("");

  // Full Address / Dispatch Slip Modal State
  const [addressModalItem, setAddressModalItem] = useState<any | null>(null);
  const [copiedAddressId, setCopiedAddressId] = useState<string | null>(null);

  // Reviews Reply state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

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

  // Shipping Modal & Fulfillment Actions State
  const [shippingModalItem, setShippingModalItem] = useState<any | null>(null);
  const [courierName, setCourierName] = useState("PostEx Courier");
  const [courierWeight, setCourierWeight] = useState("0.5");
  const [trackingCode, setTrackingCode] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAutoBooking, setIsAutoBooking] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store Brand Logo, Banner & Settings State
  const [storeLogoUrl, setStoreLogoUrl] = useState("");
  const [storeBannerUrl, setStoreBannerUrl] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [followersCount, setFollowersCount] = useState(0);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Horizontal Slider state for Navigation Tabs
  const tabsNavRef = useRef<HTMLDivElement>(null);
  const [canScrollTabsLeft, setCanScrollTabsLeft] = useState(false);
  const [canScrollTabsRight, setCanScrollTabsRight] = useState(false);

  const checkTabsScroll = useCallback(() => {
    if (tabsNavRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsNavRef.current;
      setCanScrollTabsLeft(scrollLeft > 6);
      setCanScrollTabsRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  }, []);

  useEffect(() => {
    checkTabsScroll();
    const handleResize = () => checkTabsScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkTabsScroll, activeTab]);

  const handleTabsScroll = (direction: "left" | "right") => {
    if (tabsNavRef.current) {
      const offset = direction === "left" ? -280 : 280;
      tabsNavRef.current.scrollBy({ left: offset, behavior: "smooth" });
      setTimeout(checkTabsScroll, 350);
    }
  };

  // Customer Chat & Direct Messages State
  const [chatConversations, setChatConversations] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatReplyText, setChatReplyText] = useState("");
  const [sendingChatReply, setSendingChatReply] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);

  // Check URL query parameters for tab
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (
        tabParam === "messages" ||
        tabParam === "settings" ||
        tabParam === "products" ||
        tabParam === "orders" ||
        tabParam === "finance" ||
        tabParam === "reviews"
      ) {
        setActiveTab(tabParam as any);
      }
    }
  }, []);

  const fetchSellerData = async () => {
    try {
      const [prodRes, orderRes, catRes, revRes, finRes, payRes, profRes, chatRes] =
        await Promise.all([
          fetch("/api/seller/products"),
          fetch("/api/seller/orders"),
          fetch("/api/categories"),
          fetch("/api/seller/reviews"),
          fetch("/api/seller/finance"),
          fetch("/api/seller/payouts"),
          fetch("/api/seller/profile"),
          fetch("/api/chat/seller"),
        ]);

      const prodData = await prodRes.json();
      const orderData = await orderRes.json();
      const catData = await catRes.json();
      const revData = await revRes.json();
      const finData = await finRes.json();
      const payData = await payRes.json();
      const profData = await profRes.json();
      const chatData = await chatRes.json();

      if (prodData.products) setProducts(prodData.products);
      if (orderData.orderItems) setOrderItems(orderData.orderItems);
      if (catData.categories) setCategories(catData.categories);
      if (revData.reviews) setSellerReviews(revData.reviews);
      if (finData.summary) {
        setFinanceData(finData);
        if (finData.receivingAccount) {
          setBankForm((prev) => ({
            ...prev,
            ...finData.receivingAccount,
          }));
        }
      }
      if (payData.payouts) setPayoutsList(payData.payouts);

      if (profData.seller) {
        setStoreLogoUrl(profData.seller.logoUrl || "");
        setStoreBannerUrl(profData.seller.bannerUrl || "");
        setStoreDesc(profData.seller.description || "");
        setStorePhone(profData.seller.phone || "");
        setStoreAddress(profData.seller.address || "");
        setFollowersCount(profData.seller.followersCount || 0);
      }

      if (chatData.asSeller) {
        setChatConversations(chatData.asSeller);
        if (chatData.asSeller.length > 0 && !activeChatId) {
          setActiveChatId(chatData.asSeller[0].id);
        }
      }
    } catch (e) {
      console.error("Fetch seller data error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Poll chat messages for active chat
  const fetchActiveChatMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/chat/seller/${convId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.messages || []);
      }
    } catch (e) {
      console.error("fetchActiveChatMessages error:", e);
    }
  };

  useEffect(() => {
    if (activeChatId && activeTab === "messages") {
      fetchActiveChatMessages(activeChatId);
      const interval = setInterval(() => {
        fetchActiveChatMessages(activeChatId);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeChatId, activeTab]);

  useEffect(() => {
    if (activeTab === "messages" && chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
    }
  }, [chatMessages, activeTab]);

  // Brand Logo Upload Handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const upRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.error || "Failed to upload logo image");
      const url = upData.url || upData.images?.[0]?.url || upData.urls?.[0] || upData.files?.[0]?.url;
      if (!url) throw new Error("No image URL returned from upload server");

      setStoreLogoUrl(url);

      const saveRes = await fetch("/api/seller/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: url }),
      });
      if (!saveRes.ok) throw new Error("Failed to save brand logo to profile");

      setSuccessToast("Brand logo updated successfully! It is now live on your store.");
      setTimeout(() => setSuccessToast(""), 5000);
    } catch (err: any) {
      alert(err.message || "Logo upload failed");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  // Store Banner Upload Handler
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const upRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.error || "Failed to upload banner");
      const url = upData.url || upData.images?.[0]?.url || upData.urls?.[0] || upData.files?.[0]?.url;
      if (!url) throw new Error("No image URL returned from upload server");

      setStoreBannerUrl(url);

      const saveRes = await fetch("/api/seller/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bannerUrl: url }),
      });
      if (!saveRes.ok) throw new Error("Failed to save banner to profile");

      setSuccessToast("Store banner updated successfully!");
      setTimeout(() => setSuccessToast(""), 5000);
    } catch (err: any) {
      alert(err.message || "Banner upload failed");
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  };

  // Save Store Profile Details
  const handleSaveStoreProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg("");
    try {
      const res = await fetch("/api/seller/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: storeDesc,
          phone: storePhone,
          address: storeAddress,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile details");

      setProfileSuccessMsg("Store profile details saved successfully!");
      setTimeout(() => setProfileSuccessMsg(""), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Send Seller Chat Reply
  const handleSendSellerReply = async (textToSend?: string) => {
    const text = (textToSend || chatReplyText).trim();
    if (!text || !activeChatId || sendingChatReply) return;

    setSendingChatReply(true);
    try {
      const res = await fetch(`/api/chat/seller/${activeChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");

      setChatMessages((prev) => [...prev, data.message]);
      setChatReplyText("");

      // Refresh conversations list in background
      const convRes = await fetch("/api/chat/seller");
      if (convRes.ok) {
        const cData = await convRes.json();
        if (cData.asSeller) setChatConversations(cData.asSeller);
      }
    } catch (err: any) {
      alert(err.message || "Failed to send message");
    } finally {
      setSendingChatReply(false);
    }
  };

  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBank(true);
    setBankSavedMsg("");
    try {
      const res = await fetch("/api/seller/finance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bankForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save bank details");

      setBankSavedMsg("Receiving account details saved successfully!");
      setTimeout(() => setBankSavedMsg(""), 4000);
      fetchSellerData();
    } catch (err: any) {
      alert(err.message || "Failed to save details");
    } finally {
      setSavingBank(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingWithdraw(true);
    setWithdrawError("");
    setWithdrawSuccessMsg("");
    try {
      const res = await fetch("/api/seller/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(withdrawAmount),
          notes: withdrawNotes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit withdrawal request");

      setWithdrawSuccessMsg(data.message || "Withdrawal request submitted successfully!");
      setWithdrawAmount("");
      setWithdrawNotes("");
      setTimeout(() => {
        setIsWithdrawModalOpen(false);
        setWithdrawSuccessMsg("");
      }, 2000);
      fetchSellerData();
    } catch (err: any) {
      setWithdrawError(err.message || "Failed to submit request");
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim() || replyText.trim().length < 2) return;
    setSubmittingReply(true);
    try {
      const res = await fetch("/api/seller/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, sellerResponse: replyText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit response");
      setSellerReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, sellerResponse: replyText.trim() } : r))
      );
      setReplyingReviewId(null);
      setReplyText("");
      setSuccessToast("Your official response has been published!");
      setTimeout(() => setSuccessToast(""), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to submit response");
    } finally {
      setSubmittingReply(false);
    }
  };

  // 1-Click Copy Full Address for Courier Booking (TCS, Leopards, Trax, etc.)
  const handleCopyFullAddress = (item: any) => {
    if (!item) return;
    const shippingAddr =
      item.order?.parsedShippingAddress ||
      (typeof item.order?.shippingAddress === "string"
        ? (() => {
            try {
              return JSON.parse(item.order.shippingAddress);
            } catch {
              return null;
            }
          })()
        : item.order?.shippingAddress);

    const name = shippingAddr?.fullName || item.order?.user?.name || "Customer";
    const phone = shippingAddr?.phone || item.order?.user?.phone || "N/A";
    const street = shippingAddr?.street || "No street address";
    const city = shippingAddr?.city || "Pakistan";
    const state = shippingAddr?.state ? `, ${shippingAddr.state}` : "";
    const postal = shippingAddr?.postalCode ? ` (${shippingAddr.postalCode})` : "";
    const country = shippingAddr?.country || "Pakistan";
    const isCOD = item.order?.paymentMethod === "COD";
    const paymentLine = isCOD
      ? `PAYMENT: CASH ON DELIVERY (Collect: Rs. ${item.total})`
      : "PAYMENT: PREPAID ONLINE (Do NOT collect cash)";
    const noteLine = item.order?.notes ? `\nCUSTOMER NOTE: ${item.order.notes}` : "";

    const textToCopy = `--- COURIER DISPATCH SLIP ---
Recipient: ${name}
Contact: ${phone}
Address: ${street}
City/State: ${city}${state}${postal}, ${country}
------------------------------
Order #: ${item.order?.orderNumber || "N/A"}
Item: ${item.title} (Qty: ${item.quantity})
SKU: ${item.sku || "N/A"}
${paymentLine}${noteLine}
------------------------------`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedAddressId(item.id);
    setTimeout(() => setCopiedAddressId(null), 3000);
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

  const handleUpdateStatus = async (
    orderItemId: string,
    newStatus: string,
    trackingNumber?: string
  ) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch("/api/seller/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderItemId,
          fulfillmentStatus: newStatus,
          trackingNumber: trackingNumber || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order status");

      await fetchSellerData();
      setSuccessToast(
        newStatus === "PROCESSING"
          ? "✓ Order approved! Item moved to Packing & Processing."
          : newStatus === "SHIPPED"
          ? "🚚 Order dispatched & marked as Shipped!"
          : newStatus === "DELIVERED"
          ? "🎉 Order marked as Delivered successfully!"
          : newStatus === "CANCELLED"
          ? "Order item has been cancelled."
          : "Order status updated successfully."
      );
      setTimeout(() => setSuccessToast(""), 5000);
    } catch (e: any) {
      alert(e.message || "Failed to update status");
      console.error(e);
    } finally {
      setIsUpdatingStatus(false);
      setShippingModalItem(null);
    }
  };

  const handleAutoBookCourier = async (item: any) => {
    if (!item) return;
    setIsAutoBooking(true);
    try {
      const providerKey = courierName.includes("PostEx")
        ? "POSTEX"
        : courierName.includes("Trax")
        ? "TRAX"
        : courierName.includes("TCS")
        ? "TCS"
        : "POSTEX";

      const res = await fetch("/api/seller/orders/book-courier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderItemId: item.id,
          courierProvider: providerKey,
          weightInKg: Number(courierWeight) || 0.5,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Courier auto-booking failed");

      await fetchSellerData();
      setSuccessToast(
        `⚡ ${data.message || "Booked with Courier!"} CN: ${data.booking?.trackingNumber}`
      );
      setTimeout(() => setSuccessToast(""), 6000);
      setShippingModalItem(null);
    } catch (err: any) {
      alert(err.message || "Failed to book courier");
    } finally {
      setIsAutoBooking(false);
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
          <Link href="/login?redirect=/seller/dashboard" className="px-4 py-2 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] rounded-xl text-xs font-bold transition border border-[#C8A96B]/30 shadow-sm">
            Log In
          </Link>
          <Link href="/seller/register" className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[#0B0F14] rounded-xl text-xs font-bold transition">
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
  const pendingOrders = orderItems.filter(
    (i) => i.fulfillmentStatus === "PENDING" || i.fulfillmentStatus === "PROCESSING"
  ).length;
  const totalOrders = orderItems.length;

  const filteredOrders = orderItems.filter((i) => {
    if (orderStatusFilter === "ALL") return true;
    return i.fulfillmentStatus === orderStatusFilter;
  });

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
      <div className="bg-white rounded-3xl p-6 border border-[#E8E5DC] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#0B0F14] text-[#C8A96B] rounded-2xl flex items-center justify-center font-black text-xl shadow-md border border-[#C8A96B]/30 overflow-hidden shrink-0">
            {storeLogoUrl || (user.sellerProfile as any)?.logoUrl ? (
              <img
                src={(storeLogoUrl || (user.sellerProfile as any)?.logoUrl) as string}
                alt="Brand Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              user.sellerProfile?.storeName?.[0] || "S"
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#0B0F14]">
                {user.sellerProfile?.storeName || "Seller Store"}
              </h1>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full flex items-center gap-1 ${
                  user.sellerProfile?.status === "APPROVED"
                    ? "bg-emerald-100 text-emerald-800"
                    : user.sellerProfile?.status === "REJECTED"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-amber-100 text-amber-800 animate-pulse"
                }`}
              >
                {user.sellerProfile?.status === "APPROVED" ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Verified Merchant</span>
                  </>
                ) : user.sellerProfile?.status === "REJECTED" ? (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    <span>Application Rejected</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    <span>KYC Pending Review</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-[#8A8F98] mt-0.5">
              Welcome back, {user.name} • Manage products, stock, and customer orders
            </p>
          </div>
        </div>

        {user.sellerProfile?.storeSlug && (
          <Link
            href={`/sellers/${user.sellerProfile.storeSlug}`}
            target="_blank"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-[#FAF9F6] border border-[#E8E5DC] hover:border-[#C8A96B] rounded-xl text-xs font-bold text-[#0B0F14] transition self-start md:self-auto shadow-2xs"
          >
            <span>View Public Store</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#C8A96B]" />
          </Link>
        )}
      </div>

      {/* KYC Verification Status Banner */}
      {(!user.sellerProfile?.status || user.sellerProfile?.status === "PENDING") && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-amber-900 text-sm">
                KYC Verification Under Review
              </h3>
              <p className="text-amber-800 text-[11px] mt-0.5 max-w-2xl leading-relaxed">
                Aapka email verify ho chuka hai aur government identity documents (CNIC & Bank Cheque) FAYZEE Admin team ke paas review mein hain. 
                Admin aapke diye gaye number par WhatsApp call ya message ke zariye raabta karke aapka store approve karega.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <a
              href={`https://wa.me/923306767357?text=${encodeURIComponent(
                `Assalam-o-Alaikum Super Admin, mera store '${user.sellerProfile?.storeName || ""}' KYC verification ke liye pending hai. Please check and verify.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-98"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Admin</span>
            </a>
            <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900 uppercase tracking-wide">
              Under Review
            </span>
          </div>
        </div>
      )}

      {user.sellerProfile?.status === "REJECTED" && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-50 to-red-50 rounded-3xl border border-rose-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-rose-900 text-sm">
                KYC Application Rejected — Action Required
              </h3>
              <p className="text-rose-800 text-[11px] mt-0.5 max-w-2xl leading-relaxed">
                Admin Note: <strong>{user.sellerProfile?.rejectionReason || "Identity or documents could not be verified."}</strong>. 
                Please update your documents with clear photos to get approved.
              </p>
            </div>
          </div>
          <Link
            href="/seller/register"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shrink-0 self-start sm:self-auto shadow-xs"
          >
            Update Documents / Resubmit
          </Link>
        </div>
      )}

      {/* Navigation Tabs with Smooth Horizontal Slide Controls */}
      <div className="relative group/tabs mb-1">
        {/* Left Slide Button */}
        {canScrollTabsLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pr-3 bg-gradient-to-r from-[#FAF9F6] via-[#FAF9F6]/90 to-transparent pointer-events-none">
            <button
              type="button"
              onClick={() => handleTabsScroll("left")}
              className="pointer-events-auto w-8 h-8 rounded-full bg-white border border-[#E8E5DC] text-[#0B0F14] shadow-md hover:bg-[#0B0F14] hover:text-[#C8A96B] hover:border-[#0B0F14] flex items-center justify-center transition active:scale-90"
              title="Slide Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Buttons Scrollable Container */}
        <div
          ref={tabsNavRef}
          onScroll={checkTabsScroll}
          className="flex border-b border-[#E8E5DC] gap-6 sm:gap-8 text-sm font-bold overflow-x-auto no-scrollbar scroll-smooth px-1"
        >
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 transition relative whitespace-nowrap shrink-0 ${
              activeTab === "overview"
                ? "text-[#0B0F14] border-b-2 border-[#C8A96B]"
                : "text-[#8A8F98] hover:text-[#0B0F14]"
            }`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-3 transition relative whitespace-nowrap shrink-0 ${
              activeTab === "products"
                ? "text-[#0B0F14] border-b-2 border-[#C8A96B]"
                : "text-[#8A8F98] hover:text-[#0B0F14]"
            }`}
          >
            Product Catalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 transition relative whitespace-nowrap shrink-0 ${
              activeTab === "orders"
                ? "text-[#0B0F14] border-b-2 border-[#C8A96B]"
                : "text-[#8A8F98] hover:text-[#0B0F14]"
            }`}
          >
            Customer Orders ({orderItems.length})
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 transition relative whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === "reviews"
                ? "text-[#0B0F14] border-b-2 border-[#C8A96B]"
                : "text-[#8A8F98] hover:text-[#0B0F14]"
            }`}
          >
            <span>Customer Reviews</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === "reviews" ? "bg-[#C8A96B]/15 text-[#A07C38]" : "bg-stone-100 text-stone-600"
            }`}>
              {sellerReviews.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("finance")}
            className={`pb-3 transition relative whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === "finance"
                ? "text-[#0B0F14] border-b-2 border-[#C8A96B]"
                : "text-[#8A8F98] hover:text-[#0B0F14]"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Finance & Payouts</span>
            {financeData?.summary?.availableBalance > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                Rs. {Math.floor(financeData.summary.availableBalance).toLocaleString()}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`pb-3 transition relative whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === "messages"
                ? "text-[#0B0F14] border-b-2 border-[#C8A96B]"
                : "text-[#8A8F98] hover:text-[#0B0F14]"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Customer Messages</span>
            {chatConversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0) > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                {chatConversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-3 transition relative whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === "settings"
                ? "text-[#0B0F14] border-b-2 border-[#C8A96B]"
                : "text-[#8A8F98] hover:text-[#0B0F14]"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Brand Logo & Store Settings</span>
            {followersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C8A96B]/15 text-[#A07C38]">
                {followersCount} Followers
              </span>
            )}
          </button>
        </div>

        {/* Right Slide Button */}
        {canScrollTabsRight && (
          <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pl-3 bg-gradient-to-l from-[#FAF9F6] via-[#FAF9F6]/90 to-transparent pointer-events-none">
            <button
              type="button"
              onClick={() => handleTabsScroll("right")}
              className="pointer-events-auto w-8 h-8 rounded-full bg-white border border-[#E8E5DC] text-[#0B0F14] shadow-md hover:bg-[#0B0F14] hover:text-[#C8A96B] hover:border-[#0B0F14] flex items-center justify-center transition active:scale-90"
              title="Slide Right to View More Tabs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
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
                      <p className="text-[10px] font-bold text-amber-700">
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
            <h3 className="text-base font-bold text-[#0B0F14]">Your Product Listings</h3>
            <button
              onClick={() => {
                if (user.sellerProfile?.status === "PENDING" || !user.sellerProfile?.status) {
                  alert("KYC Verification Required: Your seller account is currently under review by Fayzee Admin. You will be able to list live products once verified.");
                  return;
                }
                if (user.sellerProfile?.status === "REJECTED") {
                  alert("Account Rejected: Please update your KYC verification documents from settings to list products.");
                  return;
                }
                resetFormState();
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] font-bold text-xs rounded-xl shadow-sm border border-[#C8A96B]/30 transition flex items-center gap-1.5 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#E8E5DC] shadow-xs overflow-hidden">
            {products.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <Package className="w-12 h-12 text-[#8A8F98] mx-auto mb-3" />
                <p className="text-sm font-bold text-[#0B0F14]">No products listed yet</p>
                <p className="text-xs text-[#8A8F98] mt-1 mb-4">
                  Start adding products to your store catalog to sell to customers nationwide.
                </p>
                <button
                  onClick={() => {
                    if (user.sellerProfile?.status === "PENDING" || !user.sellerProfile?.status) {
                      alert("KYC Verification Required: Your seller account is currently under review by Fayzee Admin. You will be able to list live products once verified.");
                      return;
                    }
                    if (user.sellerProfile?.status === "REJECTED") {
                      alert("Account Rejected: Please update your KYC verification documents from settings to list products.");
                      return;
                    }
                    resetFormState();
                    setIsAddModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] font-bold text-xs rounded-xl shadow-sm border border-[#C8A96B]/30 transition active:scale-98"
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
                              "/images/product-placeholder.svg"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Customer Orders for Your Store</h3>
              <p className="text-xs text-slate-500">
                Review, approve, and fulfill customer orders step-by-step.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {[
                { label: "All Orders", key: "ALL", count: orderItems.length },
                {
                  label: "Awaiting Approval",
                  key: "PENDING",
                  count: orderItems.filter((i) => i.fulfillmentStatus === "PENDING").length,
                  highlight: true,
                },
                {
                  label: "In Packing",
                  key: "PROCESSING",
                  count: orderItems.filter((i) => i.fulfillmentStatus === "PROCESSING").length,
                },
                {
                  label: "Shipped",
                  key: "SHIPPED",
                  count: orderItems.filter((i) => i.fulfillmentStatus === "SHIPPED").length,
                },
                {
                  label: "Delivered",
                  key: "DELIVERED",
                  count: orderItems.filter((i) => i.fulfillmentStatus === "DELIVERED").length,
                },
              ].map((pill) => {
                const isActive = orderStatusFilter === pill.key;
                return (
                  <button
                    key={pill.key}
                    onClick={() => setOrderStatusFilter(pill.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                      isActive
                        ? "bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/30 shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>{pill.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isActive
                          ? "bg-white/20 text-white"
                          : pill.highlight && pill.count > 0
                          ? "bg-amber-100 text-amber-800 font-black"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {pill.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-400 border border-slate-200">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {orderStatusFilter === "ALL"
                  ? "No customer orders yet"
                  : `No orders currently in "${orderStatusFilter}" status`}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When customers purchase items from your store, their orders will appear here for review, packing, and dispatch.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[760px]">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order / Date</th>
                      <th className="py-3 px-4">Item Ordered</th>
                      <th className="py-3 px-4">Customer & Address</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Fulfillment Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((item: any) => {
                      const shippingAddr =
                        item.order.parsedShippingAddress ||
                        (typeof item.order.shippingAddress === "string"
                          ? (() => {
                              try {
                                return JSON.parse(item.order.shippingAddress);
                              } catch {
                                return null;
                              }
                            })()
                          : item.order.shippingAddress);

                      const customerName =
                        shippingAddr?.fullName || item.order.user?.name || "Customer";
                      const customerPhone =
                        shippingAddr?.phone || item.order.user?.phone || "N/A";
                      const customerCity =
                        shippingAddr?.city || "Pakistan";

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900 block">
                              #{item.order.orderNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {formatDate(item.order.createdAt)}
                            </span>
                            <span
                              className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                item.order.paymentMethod === "COD"
                                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              }`}
                            >
                              {item.order.paymentMethod === "COD"
                                ? "Cash On Delivery (COD)"
                                : item.order.paymentMethod === "ONLINE_CARD"
                                ? "Prepaid (Card)"
                                : item.order.paymentMethod === "JAZZ_CASH"
                                ? "Prepaid (JazzCash)"
                                : item.order.paymentMethod === "EASYPAISA"
                                ? "Prepaid (EasyPaisa)"
                                : "Prepaid Online"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              {item.product?.images?.[0]?.url && (
                                <img
                                  src={item.product.images[0].url}
                                  alt=""
                                  className="w-10 h-10 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                                />
                              )}
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-900 line-clamp-1 block">
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                  Qty: <strong className="text-slate-700">{item.quantity}</strong> • SKU: {item.sku || "N/A"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 min-w-[260px]">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-slate-900 text-xs block">
                                  {customerName}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyFullAddress(item)}
                                  title="Copy Recipient Address for Courier"
                                  className="text-[10px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition shrink-0"
                                >
                                  {copiedAddressId === item.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-700 font-bold">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <a
                                href={`tel:${customerPhone}`}
                                className="text-[11px] text-blue-600 hover:underline font-medium block"
                              >
                                📞 {customerPhone}
                              </a>

                              {/* Complete Customer Address Box */}
                              <div className="text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200/90 leading-snug space-y-0.5">
                                <p className="font-medium text-slate-800">
                                  🏠 {shippingAddr?.street || "No street address provided"}
                                </p>
                                <p className="text-slate-500 text-[10px]">
                                  📍 {shippingAddr?.city || customerCity}
                                  {shippingAddr?.state ? `, ${shippingAddr.state}` : ""}
                                  {shippingAddr?.postalCode ? ` (${shippingAddr.postalCode})` : ""}
                                </p>
                                {item.order?.notes && (
                                  <p className="text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-medium">
                                    📝 Note: {item.order.notes}
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => setAddressModalItem(item)}
                                className="text-[10px] font-bold text-[#A07C38] hover:text-[#C8A96B] flex items-center gap-1 transition pt-0.5"
                              >
                                <FileText className="w-3 h-3" />
                                <span>View & Print Courier Slip</span>
                              </button>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-black text-slate-900">
                            {formatPrice(item.total)}
                          </td>

                          <td className="py-3.5 px-4">
                            {item.fulfillmentStatus === "PENDING" && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                <span>Awaiting Approval</span>
                              </span>
                            )}
                            {item.fulfillmentStatus === "PROCESSING" && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1.5 w-fit">
                                <Package className="w-3 h-3 text-blue-600" />
                                <span>Packing & Ready</span>
                              </span>
                            )}
                            {item.fulfillmentStatus === "SHIPPED" && (
                              <div className="space-y-0.5">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-900 border border-indigo-300 flex items-center gap-1.5 w-fit">
                                  <Truck className="w-3 h-3 text-indigo-600" />
                                  <span>Shipped</span>
                                </span>
                                {item.order.trackingNumber && (
                                  <span className="text-[10px] font-mono text-slate-500 block">
                                    {item.order.trackingNumber}
                                  </span>
                                )}
                              </div>
                            )}
                            {item.fulfillmentStatus === "DELIVERED" && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 w-fit">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Delivered</span>
                              </span>
                            )}
                            {item.fulfillmentStatus === "CANCELLED" && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1.5 w-fit">
                                <X className="w-3 h-3 text-rose-600" />
                                <span>Cancelled</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {item.fulfillmentStatus === "PENDING" && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(item.id, "PROCESSING")}
                                    disabled={isUpdatingStatus}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1 active:scale-98 disabled:opacity-50"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm("Are you sure you want to decline/cancel this order?")) {
                                        handleUpdateStatus(item.id, "CANCELLED");
                                      }
                                    }}
                                    disabled={isUpdatingStatus}
                                    className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {item.fulfillmentStatus === "PROCESSING" && (
                                <>
                                  <button
                                    onClick={() => {
                                      setShippingModalItem(item);
                                      setTrackingCode(`TRK-${Math.floor(1000000 + Math.random() * 9000000)}`);
                                    }}
                                    disabled={isUpdatingStatus}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1 active:scale-98"
                                  >
                                    <Truck className="w-3 h-3" />
                                    <span>Ship Out</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm("Cancel this processing order?")) {
                                        handleUpdateStatus(item.id, "CANCELLED");
                                      }
                                    }}
                                    disabled={isUpdatingStatus}
                                    className="px-2 py-1.5 text-slate-400 hover:text-rose-600 rounded-xl text-xs font-medium transition"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}

                              {item.fulfillmentStatus === "SHIPPED" && (
                                <button
                                  onClick={() => handleUpdateStatus(item.id, "DELIVERED")}
                                  disabled={isUpdatingStatus}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1 active:scale-98 disabled:opacity-50"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Mark Delivered</span>
                                </button>
                              )}

                              {item.fulfillmentStatus === "DELIVERED" && (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Complete</span>
                                </span>
                              )}

                              {item.fulfillmentStatus === "CANCELLED" && (
                                <span className="text-slate-400 text-xs font-medium">Closed</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Customer Reviews on Seller's Catalog */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          {/* Reviews Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">Overall Store Rating</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {user.sellerProfile?.rating?.toFixed(1) || "5.0"}
              </p>
              <span className="text-[10px] text-slate-400">Calculated across verified reviews</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">Total Reviews</span>
                <MessageSquare className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{sellerReviews.length}</p>
              <span className="text-[10px] text-slate-400">Customer feedback submissions</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">5-Star Feedback</span>
                <Star className="w-4 h-4 fill-[#C8A96B] text-[#C8A96B]" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {sellerReviews.filter((r) => r.rating === 5).length}
              </p>
              <span className="text-[10px] text-slate-400">Top-rated customer experiences</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">Responded</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {sellerReviews.filter((r) => r.sellerResponse).length}
              </p>
              <span className="text-[10px] text-slate-400">Official seller replies</span>
            </div>
          </div>

          {/* Customer Reviews List */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Customer Reviews for Your Products
            </h3>

            {sellerReviews.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No customer reviews yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When customers purchase your products and submit ratings, their reviews and comments will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sellerReviews.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
                  >
                    {/* Review Top: Customer info & Product link */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/30 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                          {r.user?.avatar ? (
                            <img src={r.user.avatar} alt={r.user.name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            (r.user?.name || "Customer").charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{r.user?.name || "Customer"}</span>
                            {r.isVerifiedPurchase && (
                              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full">
                                ✓ Verified Buyer
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {r.createdAt ? formatDate(r.createdAt) : "Recently"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <div className="flex text-[#C8A96B]">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= r.rating ? "fill-[#C8A96B]" : "text-slate-300 fill-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-black text-[#0B0F14]">{r.rating}.0 / 5.0</span>
                      </div>
                    </div>

                    {/* Product Context */}
                    {r.product && (
                      <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                        {r.product.images?.[0]?.url && (
                          <img
                            src={r.product.images[0].url}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-200"
                          />
                        )}
                        <span className="text-slate-500 truncate">Reviewed item:</span>
                        <Link
                          href={`/products/${r.product.slug}`}
                          target="_blank"
                          className="font-bold text-[#0B0F14] hover:text-[#C8A96B] underline truncate"
                        >
                          {r.product.title}
                        </Link>
                      </div>
                    )}

                    {/* Review Content */}
                    <div>
                      {r.title && <h4 className="text-xs font-bold text-slate-900 mb-0.5">{r.title}</h4>}
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{r.comment}</p>
                    </div>

                    {/* Seller Reply Box / Action */}
                    {r.sellerResponse && replyingReviewId !== r.id && (
                      <div className="bg-[#C8A96B]/10 p-3 rounded-xl border border-[#C8A96B]/30 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#A07C38] flex items-center gap-1">
                            <Store className="w-3.5 h-3.5 text-[#C8A96B]" /> Your Official Response:
                          </span>
                          <button
                            onClick={() => {
                              setReplyingReviewId(r.id);
                              setReplyText(r.sellerResponse);
                            }}
                            className="text-[10px] text-slate-500 hover:text-slate-800 underline font-medium"
                          >
                            Edit Reply
                          </button>
                        </div>
                        <p className="text-xs text-slate-800 pl-4">{r.sellerResponse}</p>
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingReviewId === r.id ? (
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                        <label className="text-xs font-bold text-slate-800 block">
                          Write an Official Response to this Customer:
                        </label>
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Thank the customer for their feedback or address their concern professionally..."
                          className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#C8A96B] focus:border-[#C8A96B]"
                        />
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingReviewId(null);
                              setReplyText("");
                            }}
                            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReplySubmit(r.id)}
                            disabled={submittingReply || !replyText.trim()}
                            className="px-4 py-1.5 bg-[#0B0F14] hover:bg-[#1A222C] disabled:opacity-50 text-[#C8A96B] text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1.5 border border-[#C8A96B]/30"
                          >
                            {submittingReply ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Posting...</span>
                              </>
                            ) : (
                              <span>Post Response</span>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : !r.sellerResponse ? (
                      <div className="pt-1">
                        <button
                          onClick={() => {
                            setReplyingReviewId(r.id);
                            setReplyText("");
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#C8A96B]" />
                          <span>Reply to Customer</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: Finance & Payouts */}
      {activeTab === "finance" && (
        <div className="space-y-6">
          {/* Top Finance Overview KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Available Balance */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 p-5 rounded-3xl border border-emerald-200 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  Available for Payout
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-950 mt-2">
                {formatPrice(financeData?.summary?.availableBalance || 0)}
              </p>
              <p className="text-[11px] text-emerald-700 mt-1">
                Cleared from delivered orders (Net 90%)
              </p>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setWithdrawError("");
                    setWithdrawSuccessMsg("");
                    setIsWithdrawModalOpen(true);
                  }}
                  disabled={!financeData?.summary?.availableBalance || financeData.summary.availableBalance < 1000}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Request Payout</span>
                </button>
                {(!financeData?.summary?.availableBalance || financeData.summary.availableBalance < 1000) && (
                  <span className="text-[10px] text-emerald-600/80 block text-center mt-1">
                    Min. withdrawal: Rs. 1,000
                  </span>
                )}
              </div>
            </div>

            {/* Pending Clearance */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-5 rounded-3xl border border-amber-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                  Pending Clearance
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-950 mt-2">
                {formatPrice(financeData?.summary?.pendingEarnings || 0)}
              </p>
              <p className="text-[11px] text-amber-700 mt-1">
                Locked in packing / in-transit orders.
              </p>
              <div className="mt-4 p-2 bg-amber-100/60 rounded-xl border border-amber-200 text-[10px] text-amber-800">
                Transfers to available balance once orders are delivered.
              </div>
            </div>

            {/* Gross Store Sales */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Gross Store Sales
                </span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {formatPrice(financeData?.summary?.totalSales || 0)}
              </p>
              <div className="mt-3 space-y-1 text-[11px] border-t border-slate-100 pt-2">
                <div className="flex justify-between text-slate-500">
                  <span>Platform Fee ({financeData?.summary?.commissionRate || 10}%):</span>
                  <span className="font-bold text-rose-600">
                    -{formatPrice(financeData?.summary?.totalCommission || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Completed Items:</span>
                  <span className="font-bold text-slate-700">
                    {financeData?.summary?.deliveredOrdersCount || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Withdrawn to Date */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Total Withdrawn
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {formatPrice(financeData?.summary?.transferredPayouts || 0)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Disbursed to your account to date
              </p>
              {financeData?.summary?.pendingPayouts > 0 && (
                <div className="mt-3 p-2 bg-blue-50 rounded-xl text-[10px] text-blue-700 font-medium">
                  {formatPrice(financeData.summary.pendingPayouts)} currently pending admin transfer
                </div>
              )}
            </div>
          </div>

          {/* Receiving Bank Account & Mobile Wallet Settings Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-[#C8A96B]" />
                  <span>Payout Receiving Account</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Specify the bank account or mobile wallet where Fayzee Admin transfers your store payouts.
                </p>
              </div>

              {bankSavedMsg && (
                <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{bankSavedMsg}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveBankDetails} className="space-y-4">
              {/* Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Payout Method:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setBankForm((prev) => ({ ...prev, payoutMethod: "BANK_TRANSFER" }))}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                      bankForm.payoutMethod === "BANK_TRANSFER"
                        ? "border-[#C8A96B] bg-[#C8A96B]/10 text-slate-900 ring-2 ring-[#C8A96B]/30"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Landmark className="w-4 h-4 text-[#C8A96B]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">Bank Account (IBAN)</span>
                      <span className="text-[10px] text-slate-400 block">All Pakistani Banks</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBankForm((prev) => ({ ...prev, payoutMethod: "JAZZ_CASH" }))}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                      bankForm.payoutMethod === "JAZZ_CASH"
                        ? "border-[#C8A96B] bg-[#C8A96B]/10 text-slate-900 ring-2 ring-[#C8A96B]/30"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      JC
                    </div>
                    <div>
                      <span className="text-xs font-bold block">JazzCash Mobile</span>
                      <span className="text-[10px] text-slate-400 block">Instant Wallet Payout</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBankForm((prev) => ({ ...prev, payoutMethod: "EASYPAISA" }))}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                      bankForm.payoutMethod === "EASYPAISA"
                        ? "border-[#C8A96B] bg-[#C8A96B]/10 text-slate-900 ring-2 ring-[#C8A96B]/30"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      EP
                    </div>
                    <div>
                      <span className="text-xs font-bold block">EasyPaisa Mobile</span>
                      <span className="text-[10px] text-slate-400 block">Instant Wallet Payout</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bank Account Fields */}
              {bankForm.payoutMethod === "BANK_TRANSFER" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Bank Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                      placeholder="e.g. Meezan Bank / HBL / Bank Alfalah"
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30 focus:border-[#C8A96B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Account Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bankForm.accountTitle}
                      onChange={(e) => setBankForm({ ...bankForm, accountTitle: e.target.value })}
                      placeholder="e.g. Malak Fayaz (Must match bank records)"
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30 focus:border-[#C8A96B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      IBAN Number (24 digits) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bankForm.iban}
                      onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value.toUpperCase() })}
                      placeholder="PK36MEZN0001234567890123"
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30 focus:border-[#C8A96B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Branch Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={bankForm.branchCode}
                      onChange={(e) => setBankForm({ ...bankForm, branchCode: e.target.value })}
                      placeholder="e.g. 0142"
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30 focus:border-[#C8A96B]"
                    />
                  </div>
                </div>
              )}

              {/* Mobile Wallet Fields */}
              {(bankForm.payoutMethod === "JAZZ_CASH" || bankForm.payoutMethod === "EASYPAISA") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Registered Account Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bankForm.accountTitle}
                      onChange={(e) => setBankForm({ ...bankForm, accountTitle: e.target.value })}
                      placeholder="e.g. Malak Fayaz"
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30 focus:border-[#C8A96B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Account Number (11 digits) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={11}
                      value={bankForm.payoutPhone}
                      onChange={(e) => setBankForm({ ...bankForm, payoutPhone: e.target.value.replace(/\D/g, "") })}
                      placeholder="03001234567"
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30 focus:border-[#C8A96B]"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingBank}
                  className="px-5 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] disabled:opacity-50 text-[#C8A96B] text-xs font-bold rounded-xl shadow-xs border border-[#C8A96B]/30 transition flex items-center gap-1.5 active:scale-98"
                >
                  {savingBank ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Details...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Receiving Details</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Payout History & Statements Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Withdrawal & Payout History</h3>
                <p className="text-xs text-slate-500">
                  Track your fund withdrawal requests and bank settlement receipts.
                </p>
              </div>
              <span className="text-xs text-slate-400">
                {payoutsList.length} total request{payoutsList.length === 1 ? "" : "s"}
              </span>
            </div>

            {payoutsList.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">No withdrawal requests yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  When you request a payout, its bank transfer status and reference will be tracked here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[640px]">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Request Date</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payout Method</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Bank Reference (UTR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payoutsList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4 text-slate-700">
                          {formatDate(p.requestedAt)}
                          <span className="text-[10px] text-slate-400 block font-mono">
                            ID: {p.id.slice(-8)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-black text-slate-900 text-sm">
                            {formatPrice(p.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800 block">
                            {p.payoutMethod === "BANK_TRANSFER"
                              ? "Bank Transfer (IBAN)"
                              : p.payoutMethod === "JAZZ_CASH"
                              ? "JazzCash Mobile"
                              : "EasyPaisa Mobile"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {p.status === "PENDING" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full text-[10px] font-bold border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                              <span>Pending Admin Transfer</span>
                            </span>
                          )}
                          {p.status === "TRANSFERRED" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-bold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Transferred & Settled</span>
                            </span>
                          )}
                          {p.status === "REJECTED" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-800 rounded-full text-[10px] font-bold border border-rose-200">
                              <X className="w-3 h-3 text-rose-600" />
                              <span>Declined (Refunded)</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {p.adminReference ? (
                            <div className="font-mono text-[11px] font-bold text-emerald-700 select-all">
                              {p.adminReference}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Processing...</span>
                          )}
                          {p.rejectionReason && (
                            <span className="text-[10px] text-rose-600 block mt-0.5">
                              Reason: {p.rejectionReason}
                            </span>
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

      {/* TAB 6: Customer Direct Messages & Inquiries */}
      {activeTab === "messages" && (
        <div className="bg-white rounded-3xl border border-[#E8E5DC] shadow-card overflow-hidden">
          <div className="p-5 border-b border-[#E8E5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF9F6]">
            <div>
              <h2 className="text-lg font-black text-[#0B0F14] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#C8A96B]" />
                <span>Customer Inquiries & Messages</span>
              </h2>
              <p className="text-xs text-[#8A8F98] mt-0.5">
                Chat directly with shoppers inquiring about your products, stock, and orders in real-time.
              </p>
            </div>
            <button
              onClick={() => fetchSellerData()}
              className="px-3.5 py-1.5 bg-white border border-[#E8E5DC] hover:border-[#C8A96B] text-xs font-bold text-[#0B0F14] rounded-xl transition self-start sm:self-auto shadow-2xs"
            >
              Refresh Chats
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#E8E5DC] min-h-[550px]">
            {/* Left Column: Conversations List */}
            <div className="p-4 space-y-3 bg-[#FAF9F6]/60">
              <div className="relative">
                <input
                  type="text"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  placeholder="Search customer name..."
                  className="w-full pl-9 pr-3 py-2 bg-white text-xs rounded-xl border border-[#E8E5DC] text-[#0B0F14] placeholder:text-[#8A8F98] focus:outline-none focus:border-[#C8A96B] transition shadow-2xs"
                />
                <Search className="w-4 h-4 text-[#8A8F98] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="space-y-1.5 max-h-[460px] overflow-y-auto">
                {chatConversations.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-2">
                    <MessageSquare className="w-8 h-8 text-[#C8A96B]/50 mx-auto" />
                    <p className="text-xs font-bold text-[#0B0F14]">No Customer Inquiries Yet</p>
                    <p className="text-[11px] text-[#8A8F98] leading-relaxed">
                      When shoppers browse your products and click "Chat with Seller", their messages will appear here.
                    </p>
                  </div>
                ) : (
                  chatConversations
                    .filter((c) =>
                      chatSearchQuery
                        ? c.customer?.name?.toLowerCase().includes(chatSearchQuery.toLowerCase())
                        : true
                    )
                    .map((conv) => {
                      const isSelected = activeChatId === conv.id;
                      return (
                        <button
                          key={conv.id}
                          type="button"
                          onClick={() => {
                            setActiveChatId(conv.id);
                            fetchActiveChatMessages(conv.id);
                          }}
                          className={`w-full text-left p-3 rounded-2xl transition flex items-start gap-3 ${
                            isSelected
                              ? "bg-[#0B0F14] text-white shadow-sm"
                              : "bg-white hover:bg-stone-100 text-[#0B0F14] border border-[#E8E5DC]/80"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                              isSelected
                                ? "bg-[#161F2B] text-[#C8A96B] border-[#C8A96B]/30"
                                : "bg-[#FAF9F6] text-[#0B0F14] border-[#E8E5DC]"
                            }`}
                          >
                            {conv.customer?.avatar ? (
                              <img
                                src={conv.customer.avatar}
                                alt={conv.customer.name}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              conv.customer?.name?.[0]?.toUpperCase() || "C"
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`text-xs font-bold truncate ${
                                  isSelected ? "text-white" : "text-[#0B0F14]"
                                }`}
                              >
                                {conv.customer?.name || "Customer"}
                              </span>
                              {conv.unreadCount > 0 && (
                                <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded-full text-[9px] font-black shrink-0">
                                  {conv.unreadCount} new
                                </span>
                              )}
                            </div>

                            <p
                              className={`text-[11px] truncate mt-0.5 ${
                                isSelected ? "text-slate-300" : "text-[#8A8F98]"
                              }`}
                            >
                              {conv.lastMessage?.content || "Started conversation"}
                            </p>

                            <span
                              className={`text-[9px] block mt-1 ${
                                isSelected ? "text-slate-400" : "text-[#8A8F98]/70"
                              }`}
                            >
                              {new Date(conv.lastMessageAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </button>
                      );
                    })
                )}
              </div>
            </div>

            {/* Right Column: Chat Stream & Reply Box */}
            <div className="lg:col-span-2 flex flex-col justify-between bg-white min-h-[500px]">
              {activeChatId && chatConversations.find((c) => c.id === activeChatId) ? (
                (() => {
                  const currentConv = chatConversations.find((c) => c.id === activeChatId);
                  return (
                    <>
                      {/* Active Chat Header */}
                      <div className="p-3.5 sm:p-4 border-b border-[#E8E5DC] flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#0B0F14] text-[#C8A96B] font-bold flex items-center justify-center border border-[#C8A96B]/30 shrink-0">
                            {currentConv.customer?.avatar ? (
                              <img
                                src={currentConv.customer.avatar}
                                alt={currentConv.customer.name}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              currentConv.customer?.name?.[0]?.toUpperCase() || "C"
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-[#0B0F14]">
                              {currentConv.customer?.name}
                            </h3>
                            <span className="text-[11px] text-[#8A8F98]">
                              {currentConv.customer?.email}
                            </span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-200">
                          Direct Customer Thread
                        </span>
                      </div>

                      {/* Messages Stream */}
                      <div
                        ref={chatMessagesContainerRef}
                        className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[380px] bg-[#FAF9F6]/40"
                      >
                        {chatMessages.length === 0 ? (
                          <div className="text-center py-10 text-xs text-[#8A8F98]">
                            No messages in this chat yet.
                          </div>
                        ) : (
                          chatMessages.map((m) => {
                            const isSellerMsg = m.senderRole === "SELLER";
                            return (
                              <div
                                key={m.id}
                                className={`flex flex-col ${
                                  isSellerMsg ? "items-end" : "items-start"
                                }`}
                              >
                                <div
                                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                                    isSellerMsg
                                      ? "bg-[#0B0F14] text-white rounded-br-xs border border-[#C8A96B]/20"
                                      : "bg-white text-[#0B0F14] rounded-bl-xs border border-[#E8E5DC]"
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                                </div>
                                <div className="flex items-center gap-1 mt-1 text-[10px] text-[#8A8F98] px-1">
                                  <span>
                                    {new Date(m.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  {isSellerMsg && (
                                    m.isRead ? (
                                      <CheckCheck className="w-3 h-3 text-[#C8A96B]" />
                                    ) : (
                                      <Check className="w-3 h-3 text-[#8A8F98]" />
                                    )
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}

                      </div>

                      {/* Quick Seller Responses */}
                      <div className="px-4 py-2 bg-[#FAF9F6] border-t border-[#E8E5DC] flex gap-1.5 overflow-x-auto no-scrollbar">
                        {[
                          "Assalam-o-Alaikum, yes this item is available in stock!",
                          "Your order has been packed and will be dispatched today.",
                          "Yes, we can provide original photos on request.",
                          "Thank you for contacting us! Let us know if you need any other help.",
                        ].map((phrase) => (
                          <button
                            key={phrase}
                            type="button"
                            onClick={() => handleSendSellerReply(phrase)}
                            disabled={sendingChatReply}
                            className="px-2.5 py-1 bg-white hover:bg-[#0B0F14] hover:text-[#C8A96B] border border-[#E8E5DC] rounded-full text-[11px] font-medium text-[#0B0F14] whitespace-nowrap transition shrink-0 active:scale-95"
                          >
                            {phrase}
                          </button>
                        ))}
                      </div>

                      {/* Reply Input Bar */}
                      <div className="p-3.5 bg-white border-t border-[#E8E5DC]">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSendSellerReply();
                          }}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="text"
                            value={chatReplyText}
                            onChange={(e) => setChatReplyText(e.target.value)}
                            placeholder={`Reply to ${currentConv.customer?.name}...`}
                            disabled={sendingChatReply}
                            className="flex-1 px-4 py-2.5 bg-[#FAF9F6] text-xs text-[#0B0F14] placeholder:text-[#8A8F98] rounded-xl border border-[#E8E5DC] focus:border-[#C8A96B] focus:outline-none transition"
                          />
                          <button
                            type="submit"
                            disabled={!chatReplyText.trim() || sendingChatReply}
                            className="px-4 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] rounded-xl text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed border border-[#C8A96B]/30 shadow-xs flex items-center gap-1.5 active:scale-95"
                          >
                            {sendingChatReply ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                <span>Send</span>
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    </>
                  );
                })()
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 text-[#8A8F98]">
                  <MessageSquare className="w-12 h-12 text-[#C8A96B]/40" />
                  <p className="text-sm font-bold text-[#0B0F14]">Select a Customer Thread</p>
                  <p className="text-xs max-w-xs">
                    Choose an inquiry from the left panel to view message history and send direct replies.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Store Profile & Brand Logo Settings */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Brand Logo & Store Banner Uploaders */}
            <div className="space-y-6">
              {/* Brand Logo Card */}
              <div className="bg-white p-6 rounded-3xl border border-[#E8E5DC] shadow-card space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DC]">
                  <div>
                    <h3 className="text-base font-black text-[#0B0F14] flex items-center gap-2">
                      <Store className="w-5 h-5 text-[#C8A96B]" />
                      <span>Official Brand Logo</span>
                    </h3>
                    <p className="text-xs text-[#8A8F98] mt-0.5">
                      Your brand icon displayed on products, verified badges, and public storefront.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Logo Preview */}
                  <div className="relative group shrink-0">
                    <div className="w-28 h-28 rounded-3xl bg-[#0B0F14] border-2 border-[#C8A96B] flex items-center justify-center overflow-hidden shadow-card">
                      {storeLogoUrl ? (
                        <img
                          src={storeLogoUrl}
                          alt="Brand Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-10 h-10 text-[#C8A96B]" />
                      )}
                    </div>

                    {uploadingLogo && (
                      <div className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#C8A96B]" />
                      </div>
                    )}
                  </div>

                  {/* Actions & Instructions */}
                  <div className="space-y-3 flex-1 text-center sm:text-left">
                    <div>
                      <span className="text-xs font-bold text-[#0B0F14] block">
                        Upload Store Brand Logo
                      </span>
                      <p className="text-[11px] text-[#8A8F98] mt-0.5">
                        Recommended: Square format 500x500px (PNG, JPG, WebP).
                      </p>
                    </div>

                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="px-4 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs border border-[#C8A96B]/30 active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{storeLogoUrl ? "Change Brand Logo" : "Upload Brand Logo"}</span>
                      </button>

                      {storeLogoUrl && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm("Are you sure you want to remove your brand logo?")) return;
                            setStoreLogoUrl("");
                            await fetch("/api/seller/profile", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ logoUrl: null }),
                            });
                            setSuccessToast("Logo removed.");
                            setTimeout(() => setSuccessToast(""), 3000);
                          }}
                          className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Store Banner Card */}
              <div className="bg-white p-6 rounded-3xl border border-[#E8E5DC] shadow-card space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DC]">
                  <div>
                    <h3 className="text-base font-black text-[#0B0F14] flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-[#C8A96B]" />
                      <span>Store Cover Banner</span>
                    </h3>
                    <p className="text-xs text-[#8A8F98] mt-0.5">
                      Wide panoramic banner shown at the top of your public seller store.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Banner Preview */}
                  <div className="h-32 sm:h-40 w-full rounded-2xl bg-[#0B0F14] border border-[#E8E5DC] overflow-hidden relative shadow-xs">
                    {storeBannerUrl ? (
                      <img
                        src={storeBannerUrl}
                        alt="Store Banner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#8A8F98] space-y-1">
                        <ImageIcon className="w-8 h-8 text-[#C8A96B]/60" />
                        <span className="text-xs font-medium">No banner uploaded yet</span>
                      </div>
                    )}

                    {uploadingBanner && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#C8A96B]" />
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={bannerInputRef}
                    onChange={handleBannerUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#8A8F98]">
                      Recommended: 1400x400px (16:9 or 3:1 ratio).
                    </span>
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      disabled={uploadingBanner}
                      className="px-4 py-2 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-[#C8A96B]/30 shadow-xs active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{storeBannerUrl ? "Change Banner" : "Upload Banner"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Store Bio, Followers Metric & Business Info */}
            <div className="space-y-6">
              {/* Followers & Public URL Card */}
              <div className="bg-gradient-to-br from-[#0B0F14] to-[#1A222C] p-6 rounded-3xl text-white shadow-card border border-[#C8A96B]/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#C8A96B]" />
                    <span className="text-xs uppercase tracking-wider font-extrabold text-[#C8A96B]">
                      Community & Reach
                    </span>
                  </div>
                  {user.sellerProfile?.storeSlug && (
                    <Link
                      href={`/sellers/${user.sellerProfile.storeSlug}`}
                      target="_blank"
                      className="text-xs text-white/90 hover:text-[#C8A96B] font-bold flex items-center gap-1 transition"
                    >
                      <span>Preview Live Store</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/15">
                    <span className="text-2xl sm:text-3xl font-black text-white block">
                      {followersCount}
                    </span>
                    <span className="text-xs text-white/70 font-medium">Store Followers</span>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/15">
                    <span className="text-2xl sm:text-3xl font-black text-white block">
                      {products.length}
                    </span>
                    <span className="text-xs text-white/70 font-medium">Listed Products</span>
                  </div>
                </div>
              </div>

              {/* Edit Store Information Form */}
              <div className="bg-white p-6 rounded-3xl border border-[#E8E5DC] shadow-card space-y-4">
                <div className="pb-3 border-b border-[#E8E5DC]">
                  <h3 className="text-base font-black text-[#0B0F14]">Store Details</h3>
                  <p className="text-xs text-[#8A8F98]">
                    Manage store bio, contact number, and pickup address.
                  </p>
                </div>

                {profileSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveStoreProfile} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#0B0F14] mb-1">Store Name</label>
                    <input
                      type="text"
                      disabled
                      value={user.sellerProfile?.storeName || ""}
                      className="w-full px-3 py-2 bg-stone-100 rounded-xl border border-[#E8E5DC] text-[#8A8F98] font-bold cursor-not-allowed"
                    />
                    <span className="text-[10px] text-[#8A8F98] mt-0.5 block">
                      Store name is verified by Admin. Contact support to request name changes.
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-[#0B0F14] mb-1">
                      Store Description & Bio
                    </label>
                    <textarea
                      rows={4}
                      value={storeDesc}
                      onChange={(e) => setStoreDesc(e.target.value)}
                      placeholder="Introduce your brand to shoppers: what makes your products special, warranty policies, etc."
                      className="w-full px-3 py-2.5 bg-[#FAF9F6] rounded-xl border border-[#E8E5DC] text-[#0B0F14] focus:outline-none focus:border-[#C8A96B] transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#0B0F14] mb-1">Business Phone</label>
                      <input
                        type="text"
                        value={storePhone}
                        onChange={(e) => setStorePhone(e.target.value)}
                        placeholder="03001234567"
                        className="w-full px-3 py-2 bg-[#FAF9F6] rounded-xl border border-[#E8E5DC] text-[#0B0F14] focus:outline-none focus:border-[#C8A96B] transition"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#0B0F14] mb-1">
                        Pickup City / Location
                      </label>
                      <input
                        type="text"
                        value={storeAddress}
                        onChange={(e) => setStoreAddress(e.target.value)}
                        placeholder="Karachi, Pakistan"
                        className="w-full px-3 py-2 bg-[#FAF9F6] rounded-xl border border-[#E8E5DC] text-[#0B0F14] focus:outline-none focus:border-[#C8A96B] transition"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-5 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] font-bold rounded-xl text-xs transition border border-[#C8A96B]/30 shadow-xs flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Store Details</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Request Fund Withdrawal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Request Fund Withdrawal</h3>
                  <p className="text-[11px] text-slate-500">
                    Transfer store earnings to your receiving account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account Details Preview */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                Destination Receiving Account
              </span>
              <p className="font-bold text-slate-900">
                {financeData?.receivingAccount?.payoutMethod === "BANK_TRANSFER"
                  ? `${financeData?.receivingAccount?.bankName || "Bank"} (${financeData?.receivingAccount?.accountTitle})`
                  : `${financeData?.receivingAccount?.payoutMethod} (${financeData?.receivingAccount?.accountTitle})`}
              </p>
              <p className="font-mono text-[11px] text-slate-600">
                {financeData?.receivingAccount?.iban ||
                  financeData?.receivingAccount?.accountNumber ||
                  financeData?.receivingAccount?.payoutPhone ||
                  "No account saved yet"}
              </p>
            </div>

            {/* Balance info */}
            <div className="flex justify-between items-center text-xs p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-emerald-950">
              <span>Available for Withdrawal:</span>
              <span className="font-black text-sm text-emerald-700">
                {formatPrice(financeData?.summary?.availableBalance || 0)}
              </span>
            </div>

            {withdrawError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs">
                {withdrawError}
              </div>
            )}

            {withdrawSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{withdrawSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Withdrawal Amount (Rs.) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  max={Math.floor(financeData?.summary?.availableBalance || 0)}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30 focus:border-[#C8A96B]"
                />

                {/* Quick Selection Pills */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount("1000")}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition"
                  >
                    Rs. 1,000
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount("5000")}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition"
                  >
                    Rs. 5,000
                  </button>
                  {financeData?.summary?.availableBalance >= 1000 && (
                    <button
                      type="button"
                      onClick={() =>
                        setWithdrawAmount(String(Math.floor(financeData.summary.availableBalance)))
                      }
                      className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 rounded-lg text-[10px] font-bold text-emerald-800 transition"
                    >
                      All Available
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Note for Admin (Optional)
                </label>
                <input
                  type="text"
                  value={withdrawNotes}
                  onChange={(e) => setWithdrawNotes(e.target.value)}
                  placeholder="e.g. Weekly settlement request"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30 focus:border-[#C8A96B]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWithdraw || !withdrawAmount || Number(withdrawAmount) < 1000}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 active:scale-98"
                >
                  {submittingWithdraw ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm & Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
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
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="block text-[10px] font-bold text-slate-600">
                                  Size / Spec
                                </label>
                              </div>
                              <input
                                type="text"
                                value={v.size}
                                onChange={(e) => handleUpdateVariant(v.id, "size", e.target.value)}
                                placeholder="e.g. 42 (or 40, 41, 42, 43, 44)"
                                className="w-full px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-brand-500"
                              />
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                <span className="text-[9px] text-slate-400 font-bold">Quick:</span>
                                {["40", "41", "42", "43", "44"].map((sz) => (
                                  <button
                                    key={sz}
                                    type="button"
                                    onClick={() => {
                                      const current = v.size.trim();
                                      const next = current ? (current.includes(sz) ? current : `${current}, ${sz}`) : sz;
                                      handleUpdateVariant(v.id, "size", next);
                                    }}
                                    className="px-1 py-0.5 bg-slate-100 hover:bg-[#C8A96B]/20 text-slate-700 hover:text-[#0B0F14] text-[9px] font-bold rounded border border-slate-200 transition"
                                  >
                                    +{sz}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => handleUpdateVariant(v.id, "size", "40, 41, 42, 43, 44")}
                                  className="px-1.5 py-0.5 bg-[#C8A96B]/15 hover:bg-[#C8A96B]/25 text-[#A07C38] text-[9px] font-black rounded border border-[#C8A96B]/30 transition"
                                >
                                  40-44 Set
                                </button>
                              </div>
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
                  className="px-5 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] font-bold rounded-xl disabled:opacity-50 transition text-xs shadow-sm border border-[#C8A96B]/30 flex items-center gap-1.5 active:scale-98"
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

      {/* Modal: Ship Out Order with Courier & Tracking */}
      {shippingModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ship Out Order</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    #{shippingModalItem.order.orderNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShippingModalItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">{shippingModalItem.title}</p>
                  <p className="text-slate-500 text-[11px]">
                    Qty: {shippingModalItem.quantity} • Total: {formatPrice(shippingModalItem.total)}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 ${
                    shippingModalItem.order.paymentMethod === "COD"
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  }`}
                >
                  {shippingModalItem.order.paymentMethod === "COD"
                    ? `Collect COD: ${formatPrice(shippingModalItem.total)}`
                    : "Prepaid Online"}
                </span>
              </div>

              {/* Complete Delivery Address for Courier Slip */}
              {(() => {
                const sAddr =
                  shippingModalItem.order.parsedShippingAddress ||
                  (typeof shippingModalItem.order.shippingAddress === "string"
                    ? (() => {
                        try {
                          return JSON.parse(shippingModalItem.order.shippingAddress);
                        } catch {
                          return null;
                        }
                      })()
                    : shippingModalItem.order.shippingAddress);

                const cName = sAddr?.fullName || shippingModalItem.order.user?.name || "Customer";
                const cPhone = sAddr?.phone || shippingModalItem.order.user?.phone || "N/A";
                const cStreet = sAddr?.street || "No street address provided";
                const cCity = sAddr?.city || "Pakistan";
                const cState = sAddr?.state ? `, ${sAddr.state}` : "";
                const cPostal = sAddr?.postalCode ? ` - ${sAddr.postalCode}` : "";

                return (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C8A96B]" />
                        <span>Courier Delivery Address</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyFullAddress(shippingModalItem)}
                        className="text-[10px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md flex items-center gap-1 transition"
                      >
                        {copiedAddressId === shippingModalItem.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Address</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-800 space-y-0.5 leading-snug">
                      <p className="font-bold text-slate-900">
                        {cName} • <span className="font-mono text-blue-600 font-medium">{cPhone}</span>
                      </p>
                      <p className="text-slate-700">🏠 {cStreet}</p>
                      <p className="text-slate-500 text-[10px]">
                        📍 {cCity}{cState}{cPostal}
                      </p>
                      {shippingModalItem.order.notes && (
                        <p className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 font-medium">
                          📝 Customer Note: {shippingModalItem.order.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* ⚡ 1-Click Automated Courier Booking Box */}
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E8E5DC] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-[#0B0F14] uppercase tracking-wide">
                    ⚡ 1-Click Automated Courier Booking
                  </span>
                </div>
                <span className="text-[10px] font-black text-[#C8A96B] bg-[#0B0F14] px-2.5 py-0.5 rounded-full border border-[#C8A96B]/30">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-[#8A8F98] leading-relaxed">
                Automatically books a courier rider to pick up this parcel from your store/warehouse and delivers it directly to the customer.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Courier Provider:
                  </label>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30"
                  >
                    <option value="PostEx Courier">PostEx (Instant Pickup & Fast COD)</option>
                    <option value="Trax Logistics">Trax Logistics (Express COD)</option>
                    <option value="TCS Express">TCS Express (Corporate Network)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Estimated Parcel Weight (KG):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={courierWeight}
                    onChange={(e) => setCourierWeight(e.target.value)}
                    placeholder="0.5"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={isAutoBooking || isUpdatingStatus}
                onClick={() => handleAutoBookCourier(shippingModalItem)}
                className="w-full py-3 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] rounded-xl text-xs font-black transition shadow-sm border border-[#C8A96B]/40 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {isAutoBooking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C8A96B]" />
                    <span>Booking Courier Rider & Generating CN...</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-[#C8A96B]" />
                    <span>⚡ Call Courier Rider & Book Dispatch Now</span>
                  </>
                )}
              </button>
            </div>

            {/* Separator */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-black text-slate-400">
                OR Manual Tracking Entry
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Manual Courier Partner
                </label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30 focus:border-[#C8A96B]"
                >
                  <option value="TCS Express">TCS Express</option>
                  <option value="PostEx Courier">PostEx</option>
                  <option value="Trax Logistics">Trax Logistics</option>
                  <option value="Leopards Courier">Leopards Courier</option>
                  <option value="M&P Express">M&P Express</option>
                  <option value="Direct Store Rider">Direct Store Rider</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tracking Code / Consignment #
                </label>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="e.g. 774892019"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C8A96B]/30 focus:border-[#C8A96B]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Manual tracking code if you already booked physically at courier branch.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShippingModalItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus || isAutoBooking}
                onClick={() => {
                  const combinedTracking = `${courierName} - ${trackingCode.trim() || "TRK-" + Math.floor(100000 + Math.random() * 900000)}`;
                  handleUpdateStatus(shippingModalItem.id, "SHIPPED", combinedTracking);
                }}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 active:scale-98 disabled:opacity-50"
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Manual Dispatch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Courier Dispatch & Parcel Slip Modal */}
      {addressModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#C8A96B]/15 text-[#A07C38] flex items-center justify-center font-black">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Courier Dispatch & Parcel Slip
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Order #{addressModalItem.order?.orderNumber} • {formatDate(addressModalItem.order?.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAddressModalItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Container */}
            {(() => {
              const sAddr =
                addressModalItem.order?.parsedShippingAddress ||
                (typeof addressModalItem.order?.shippingAddress === "string"
                  ? (() => {
                      try {
                        return JSON.parse(addressModalItem.order.shippingAddress);
                      } catch {
                        return null;
                      }
                    })()
                  : addressModalItem.order?.shippingAddress);

              const cName = sAddr?.fullName || addressModalItem.order?.user?.name || "Customer";
              const cPhone = sAddr?.phone || addressModalItem.order?.user?.phone || "N/A";
              const cStreet = sAddr?.street || "No street address provided";
              const cCity = sAddr?.city || "Pakistan";
              const cState = sAddr?.state ? `, ${sAddr.state}` : "";
              const cPostal = sAddr?.postalCode ? ` - ${sAddr.postalCode}` : "";
              const cCountry = sAddr?.country || "Pakistan";
              const isCOD = addressModalItem.order?.paymentMethod === "COD";

              return (
                <div className="space-y-4">
                  {/* Payment Instruction Banner */}
                  <div
                    className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                      isCOD
                        ? "bg-amber-50 border-amber-300 text-amber-900"
                        : "bg-emerald-50 border-emerald-300 text-emerald-900"
                    }`}
                  >
                    <div>
                      <span className="font-black text-xs block uppercase">
                        {isCOD ? "💵 Cash On Delivery (COD)" : "✅ Prepaid Online"}
                      </span>
                      <p className="text-[11px] mt-0.5">
                        {isCOD
                          ? "Courier rider must collect the exact amount below upon delivery:"
                          : "Customer has already paid online. Do NOT collect any cash."}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black">
                        {isCOD ? formatPrice(addressModalItem.total) : "PAID"}
                      </span>
                    </div>
                  </div>

                  {/* Recipient Box */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                        Deliver To / Recipient Details
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyFullAddress(addressModalItem)}
                        className="text-[11px] font-bold text-slate-700 hover:text-black bg-white border border-slate-200 hover:bg-slate-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition shadow-2xs"
                      >
                        {copiedAddressId === addressModalItem.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Address</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-sm font-black text-slate-900">
                      {cName}
                    </div>
                    <div className="text-xs font-semibold text-blue-700 font-mono">
                      📞 {cPhone}
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-700 space-y-1">
                      <p className="font-medium leading-relaxed">
                        <strong className="text-slate-900">House / Street:</strong> {cStreet}
                      </p>
                      <p>
                        <strong className="text-slate-900">City / District:</strong> {cCity}{cState}{cPostal}
                      </p>
                      <p>
                        <strong className="text-slate-900">Country:</strong> {cCountry}
                      </p>
                      {addressModalItem.order?.notes && (
                        <div className="mt-2 bg-amber-100/70 border border-amber-300 p-2 rounded-xl text-[11px] text-amber-950">
                          <strong>Customer Instructions:</strong> {addressModalItem.order.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Package Specs */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                      Package Contents
                    </span>
                    <p className="font-bold text-slate-900">{addressModalItem.title}</p>
                    <div className="flex items-center gap-4 text-slate-600 text-[11px]">
                      <span>Quantity: <strong>{addressModalItem.quantity}</strong></span>
                      <span>SKU: <strong className="font-mono">{addressModalItem.sku || "N/A"}</strong></span>
                      <span>Item Total: <strong>{formatPrice(addressModalItem.total)}</strong></span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Slip</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyFullAddress(addressModalItem)}
                        className="px-4 py-2 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs border border-[#C8A96B]/30"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Complete Slip</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddressModalItem(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
