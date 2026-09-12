"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import { detectCardBrand, isValidLuhn } from "@/lib/payment/utils";
import { calculateOrderShipping } from "@/lib/shipping";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
  Smartphone,
  Tag,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PaymentChannel = "COD" | "ONLINE_CARD" | "JAZZ_CASH" | "EASYPAISA";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, cartSubtotal, cartCount, refreshCart } = useCart();

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Pakistan",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentChannel>("COD");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Card Payment Details
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardErrors, setCardErrors] = useState<{ [key: string]: string }>({});

  // Mobile Wallet Details (JazzCash / EasyPaisa)
  const [walletPhone, setWalletPhone] = useState("");
  const [walletCnic, setWalletCnic] = useState("");
  const [walletTid, setWalletTid] = useState("");

  // Dynamic Platform Site Settings (Controlled via Super Admin)
  const [siteSettings, setSiteSettings] = useState<any>({
    jazzcashTitle: "Fayaz Ullah",
    jazzcashNumber: "03306767357",
    easypaisaTitle: "Fayaz Ullah",
    easypaisaNumber: "03306767357",
    standardShippingFee: 200,
    freeShippingThreshold: 3000,
  });

  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => res.json())
      .then((d) => {
        if (d?.settings) {
          setSiteSettings(d.settings);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.name) {
      setAddress((prev) => ({
        ...prev,
        fullName: user.name,
        phone: user.phone || prev.phone,
      }));
      if (!cardHolder) setCardHolder(user.name.toUpperCase());
      if (!walletPhone && user.phone) setWalletPhone(user.phone);
    }
  }, [user]);

  // Shipping calculation with platform free delivery threshold (must match orderService)
  const calculatedItemsShipping =
    cart?.items?.reduce((acc, item) => acc + (item.product?.shippingFee || 0), 0) || 0;
  const shippingTotal = calculateOrderShipping({
    itemShippingTotal: calculatedItemsShipping,
    subtotal: cartSubtotal,
    standardShippingFee: siteSettings?.standardShippingFee,
    freeShippingThreshold: siteSettings?.freeShippingThreshold,
  });
  const discountAmount = couponApplied ? couponApplied.discount : 0;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingTotal);

  // Card formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
    if (cardErrors.cardNumber) {
      setCardErrors((prev) => ({ ...prev, cardNumber: "" }));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + "/" + raw.slice(2);
    }
    setCardExpiry(raw);
    if (cardErrors.cardExpiry) {
      setCardErrors((prev) => ({ ...prev, cardExpiry: "" }));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardCvv(raw);
    if (cardErrors.cardCvv) {
      setCardErrors((prev) => ({ ...prev, cardCvv: "" }));
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const code = couponCode.toUpperCase().trim();
    if (code === "FAYZEE10") {
      const disc = (cartSubtotal * 10) / 100;
      setCouponApplied({ code, discount: Math.min(disc, 3000) });
      setErrorMsg("");
    } else if (code === "WELCOME500") {
      if (cartSubtotal >= 3000) {
        setCouponApplied({ code, discount: 500 });
        setErrorMsg("");
      } else {
        setErrorMsg("Coupon WELCOME500 requires a minimum order of Rs. 3,000.");
      }
    } else {
      setErrorMsg("Invalid or expired coupon code.");
    }
  };

  const validateCardInputs = (): boolean => {
    const errors: { [key: string]: string } = {};
    const cleanNumber = cardNumber.replace(/\s+/g, "");

    if (!cleanNumber || cleanNumber.length < 15) {
      errors.cardNumber = "Enter a valid 16-digit card number.";
    } else if (!isValidLuhn(cleanNumber)) {
      errors.cardNumber = "Invalid card number checksum.";
    }

    if (!cardHolder.trim()) {
      errors.cardHolder = "Cardholder full name is required.";
    }

    if (!cardExpiry || !cardExpiry.includes("/") || cardExpiry.length < 5) {
      errors.cardExpiry = "Expiry date format must be MM/YY.";
    } else {
      const [mm, yy] = cardExpiry.split("/").map((s) => parseInt(s, 10));
      const currentYear = parseInt(new Date().getFullYear().toString().slice(-2), 10);
      const currentMonth = new Date().getMonth() + 1;
      if (mm < 1 || mm > 12) {
        errors.cardExpiry = "Invalid month (01-12).";
      } else if (yy < currentYear || (yy === currentYear && mm < currentMonth)) {
        errors.cardExpiry = "Card has expired.";
      }
    }

    if (!cardCvv || cardCvv.length < 3) {
      errors.cardCvv = "CVV must be 3 or 4 digits.";
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateWalletInputs = (): boolean => {
    const cleanPhone = walletPhone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 11 || !cleanPhone.startsWith("03")) {
      setErrorMsg(`Please enter your valid 11-digit Pakistani mobile number (e.g. 03XXXXXXXXX) for ${paymentMethod === "JAZZ_CASH" ? "JazzCash" : "EasyPaisa"}.`);
      return false;
    }
    if (!walletTid.trim()) {
      setErrorMsg(`Please enter the Transaction ID (TID) from your ${paymentMethod === "JAZZ_CASH" ? "JazzCash / 8558" : "EasyPaisa / 3737"} payment confirmation SMS.`);
      return false;
    }
    return true;
  };

  const executeOrderPlacement = async () => {
    setSubmitting(true);
    setErrorMsg("");

    try {
      const cleanCard = cardNumber.replace(/\s+/g, "");
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: address,
          paymentMethod,
          paymentDetails: {
            method: paymentMethod,
            cardNumber: cleanCard,
            cardHolder: cardHolder.trim(),
            cardExpiry,
            cardCvv,
            cardBrand: detectCardBrand(cleanCard),
            walletPhone: walletPhone.replace(/\D/g, ""),
            walletCnicLast6: walletCnic,
            transactionId: walletTid.trim(),
            tid: walletTid.trim(),
          },
          couponCode: couponApplied?.code,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process order.");
      }

      await refreshCart();

      // If official gateway (Safepay) provided a hosted 3D-secure checkout redirect
      if (data.paymentResult?.redirectUrl && data.paymentResult?.status === "PROCESSING") {
        window.location.href = data.paymentResult.redirectUrl;
        return;
      }

      router.push(`/orders/${data.order.id}?success=true&payment=${paymentMethod.toLowerCase()}`);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during payment processing.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!user) {
      router.push(`/login?redirect=/checkout`);
      return;
    }

    if (!cart || cart.items.length === 0) {
      setErrorMsg("Your cart is empty.");
      return;
    }

    if (!address.fullName || !address.street || !address.city || !address.phone) {
      setErrorMsg("Please provide all required delivery address fields.");
      return;
    }

    // Branch by Payment Method
    if (paymentMethod === "COD") {
      await executeOrderPlacement();
      return;
    }

    if (paymentMethod === "ONLINE_CARD") {
      if (!validateCardInputs()) return;
      await executeOrderPlacement();
      return;
    }

    if (paymentMethod === "JAZZ_CASH" || paymentMethod === "EASYPAISA") {
      if (!validateWalletInputs()) return;
      await executeOrderPlacement();
      return;
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Preparing secure checkout...
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#0B0F14]">No Items to Checkout</h2>
        <Link
          href="/products"
          className="inline-block px-5 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-white rounded-xl text-xs font-semibold transition border border-[#0B0F14]"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const detectedBrand = detectCardBrand(cardNumber);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
      <div className="pb-3 sm:pb-4 border-b border-[#E8E5DC]">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0B0F14] flex items-center gap-2">
          <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#C8A96B] shrink-0" />
          <span>Secure Checkout & Payment</span>
        </h1>
        <p className="text-xs text-[#8A8F98] mt-0.5">
          Review your items, delivery details, and select a verified payment method
        </p>
      </div>

      {!user && (
        <div className="p-3.5 sm:p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>You are checking out as a guest. Log in to save orders to your profile.</span>
          <Link href="/login?redirect=/checkout" className="font-bold underline text-amber-900 shrink-0">
            Sign In Now
          </Link>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 sm:p-4 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Address & Payment Method */}
        <div className="lg:col-span-8 space-y-5 sm:space-y-6">
          {/* Step 1: Shipping Address */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#E8E5DC] shadow-subtle space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-[#0B0F14] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#C8A96B] shrink-0" />
              <span>1. Delivery Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0B0F14] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  placeholder="Recipient full name"
                  className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] focus:outline-none focus:border-[#0B0F14] text-xs text-[#0B0F14]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0B0F14] mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="03XX XXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] focus:outline-none focus:border-[#0B0F14] text-xs text-[#0B0F14]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#0B0F14] mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  placeholder="House / Apartment #, Street, Area"
                  className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] focus:outline-none focus:border-[#0B0F14] text-xs text-[#0B0F14]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0B0F14] mb-1">City</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="e.g. Lahore, Karachi, Islamabad"
                  className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] focus:outline-none focus:border-[#0B0F14] text-xs text-[#0B0F14]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0B0F14] mb-1">State / Province</label>
                <input
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="e.g. Punjab, Sindh, KPK, ICT"
                  className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] focus:outline-none focus:border-[#0B0F14] text-xs text-[#0B0F14]"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method Channels */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#E8E5DC] shadow-subtle space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-[#0B0F14] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#C8A96B] shrink-0" />
                <span>2. Select Payment Method</span>
              </h3>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
              </span>
            </div>

            {/* Payment Channel Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Cash On Delivery */}
              <div
                onClick={() => setPaymentMethod("COD")}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  paymentMethod === "COD"
                    ? "border-[#0B0F14] bg-[#0B0F14]/5 shadow-subtle"
                    : "border-[#E8E5DC] hover:border-[#0B0F14]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0B0F14]">Cash on Delivery</span>
                    <span className="px-1.5 py-0.2 bg-[#F5F3EE] text-[#0B0F14] text-[10px] font-bold rounded border border-[#E8E5DC]">
                      Doorstep Cash
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentChannel"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="accent-[#0B0F14]"
                  />
                </div>
                <p className="text-[11px] text-[#8A8F98] mt-2">
                  Pay with physical cash when the courier arrives at your destination.
                </p>
              </div>

              {/* Option 2: Debit / Credit Card */}
              <div
                onClick={() => setPaymentMethod("ONLINE_CARD")}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  paymentMethod === "ONLINE_CARD"
                    ? "border-[#0B0F14] bg-[#0B0F14]/5 shadow-subtle"
                    : "border-[#E8E5DC] hover:border-[#0B0F14]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0B0F14]">Debit / Credit Card</span>
                    <span className="px-1.5 py-0.2 bg-[#0B0F14] text-[#C8A96B] text-[10px] font-bold rounded">
                      3D Secure
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentChannel"
                    checked={paymentMethod === "ONLINE_CARD"}
                    onChange={() => setPaymentMethod("ONLINE_CARD")}
                    className="accent-[#0B0F14]"
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-extrabold text-[#0B0F14] bg-[#F5F3EE] border border-[#E8E5DC] px-1.5 py-0.5 rounded">VISA</span>
                  <span className="text-[10px] font-extrabold text-[#0B0F14] bg-[#F5F3EE] border border-[#E8E5DC] px-1.5 py-0.5 rounded">Mastercard</span>
                  <span className="text-[10px] font-extrabold text-[#0B0F14] bg-[#F5F3EE] border border-[#E8E5DC] px-1.5 py-0.5 rounded">PayPak</span>
                </div>
              </div>

              {/* Option 3: JazzCash Mobile Account */}
              <div
                onClick={() => setPaymentMethod("JAZZ_CASH")}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  paymentMethod === "JAZZ_CASH"
                    ? "border-[#0B0F14] bg-[#0B0F14]/5 shadow-subtle"
                    : "border-[#E8E5DC] hover:border-[#0B0F14]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0B0F14]">JazzCash Mobile Account</span>
                    <span className="px-1.5 py-0.2 bg-red-100 text-red-800 text-[10px] font-bold rounded">
                      Mobile Wallet
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentChannel"
                    checked={paymentMethod === "JAZZ_CASH"}
                    onChange={() => setPaymentMethod("JAZZ_CASH")}
                    className="accent-[#0B0F14]"
                  />
                </div>
                <p className="text-[11px] text-[#8A8F98] mt-2">
                  Instant mobile checkout from your JazzCash account via OTP / MPIN.
                </p>
              </div>

              {/* Option 4: EasyPaisa Mobile Account */}
              <div
                onClick={() => setPaymentMethod("EASYPAISA")}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  paymentMethod === "EASYPAISA"
                    ? "border-[#0B0F14] bg-[#0B0F14]/5 shadow-subtle"
                    : "border-[#E8E5DC] hover:border-[#0B0F14]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0B0F14]">EasyPaisa Mobile Account</span>
                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                      Mobile Wallet
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentChannel"
                    checked={paymentMethod === "EASYPAISA"}
                    onChange={() => setPaymentMethod("EASYPAISA")}
                    className="accent-[#0B0F14]"
                  />
                </div>
                <p className="text-[11px] text-[#8A8F98] mt-2">
                  Fast & secure mobile payment directly from your EasyPaisa wallet.
                </p>
              </div>
            </div>

            {/* CHANNEL CONTENT 1: Debit / Credit Card Interactive Inputs & Live Card Preview */}
            {paymentMethod === "ONLINE_CARD" && (
              <div className="pt-4 border-t border-[#E8E5DC] space-y-5 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-[#0B0F14] uppercase tracking-wider">
                    Credit / Debit Card Details
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#8A8F98] font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C8A96B]" />
                    <span>Safepay 3D-Secure 256-bit Encrypted</span>
                  </div>
                </div>

                {/* Interactive Live Card Graphic Preview */}
                <div className="max-w-md mx-auto w-full rounded-2xl p-5 bg-gradient-to-br from-[#0B0F14] via-[#161F2B] to-[#060A0E] text-white shadow-xl relative overflow-hidden border border-[#C8A96B]/30">
                  <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[#C8A96B]/15 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-7 rounded bg-[#C8A96B]/30 border border-[#C8A96B]/60 flex items-center justify-center">
                        <div className="w-7 h-5 border border-[#C8A96B]/50 rounded-xs grid grid-cols-2 gap-0.5 p-0.5">
                          <div className="bg-[#C8A96B]/40" />
                          <div className="bg-[#C8A96B]/40" />
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#C8A96B]">)))</span>
                    </div>
                    <span className="text-xs font-black tracking-widest uppercase bg-white/10 text-[#C8A96B] px-2.5 py-1 rounded-md border border-[#C8A96B]/20">
                      {detectedBrand}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="text-[9px] uppercase tracking-widest text-[#8A8F98] block font-mono">
                      Card Number
                    </span>
                    <span className="text-base sm:text-lg font-mono font-black tracking-widest block text-white">
                      {cardNumber || "•••• •••• •••• ••••"}
                    </span>
                  </div>

                  <div className="flex items-end justify-between text-[10px] font-mono">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#8A8F98] block">
                        Cardholder
                      </span>
                      <span className="font-bold tracking-wider uppercase block truncate max-w-[170px] text-white">
                        {cardHolder || "CARDHOLDER NAME"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-[#8A8F98] block">
                        Expires
                      </span>
                      <span className="font-bold block text-white">{cardExpiry || "MM/YY"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-1">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#0B0F14] mb-1">
                      Name on Card <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => {
                        setCardHolder(e.target.value.toUpperCase());
                        if (cardErrors.cardHolder) setCardErrors((prev) => ({ ...prev, cardHolder: "" }));
                      }}
                      placeholder="e.g. MALAK FAYAZ"
                      className={`w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border focus:outline-none focus:border-[#0B0F14] text-xs font-medium uppercase text-[#0B0F14] ${
                        cardErrors.cardHolder ? "border-red-500 bg-red-50/20" : "border-[#E8E5DC]"
                      }`}
                    />
                    {cardErrors.cardHolder && (
                      <p className="text-[10px] text-red-600 mt-1">{cardErrors.cardHolder}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#0B0F14] mb-1 flex items-center justify-between">
                      <span>Card Number <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-[#C8A96B] font-bold">{detectedBrand}</span>
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      className={`w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border focus:outline-none focus:border-[#0B0F14] text-xs font-mono font-semibold tracking-wider text-[#0B0F14] ${
                        cardErrors.cardNumber ? "border-red-500 bg-red-50/20" : "border-[#E8E5DC]"
                      }`}
                    />
                    {cardErrors.cardNumber && (
                      <p className="text-[10px] text-red-600 mt-1">{cardErrors.cardNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0B0F14] mb-1">
                      Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className={`w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border focus:outline-none focus:border-[#0B0F14] text-xs font-mono text-center text-[#0B0F14] ${
                        cardErrors.cardExpiry ? "border-red-500 bg-red-50/20" : "border-[#E8E5DC]"
                      }`}
                    />
                    {cardErrors.cardExpiry && (
                      <p className="text-[10px] text-red-600 mt-1">{cardErrors.cardExpiry}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0B0F14] mb-1 flex items-center justify-between">
                      <span>Security CVV <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-[#8A8F98] font-normal">3-4 digits on back</span>
                    </label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={handleCvvChange}
                      placeholder="•••"
                      maxLength={4}
                      className={`w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border focus:outline-none focus:border-[#0B0F14] text-xs font-mono text-center tracking-widest text-[#0B0F14] ${
                        cardErrors.cardCvv ? "border-red-500 bg-red-50/20" : "border-[#E8E5DC]"
                      }`}
                    />
                    {cardErrors.cardCvv && (
                      <p className="text-[10px] text-red-600 mt-1">{cardErrors.cardCvv}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CHANNEL CONTENT 2: JazzCash Mobile Account Details */}
            {paymentMethod === "JAZZ_CASH" && (
              <div className="pt-4 border-t border-[#E8E5DC] space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-red-600 text-white font-black text-xs rounded-lg">
                    JazzCash
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#0B0F14]">
                      Direct JazzCash Mobile Transfer
                    </h4>
                    <p className="text-[10px] text-[#8A8F98]">
                      Transfer exact total to official account and enter TID below
                    </p>
                  </div>
                </div>

                {/* Official Store Recipient Box */}
                <div className="bg-red-50/80 p-4 rounded-2xl border border-red-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-red-950 uppercase tracking-wide flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-red-600" />
                      <span>Official Fayzee JazzCash Account</span>
                    </span>
                    <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-red-700 block">Account Title:</span>
                      <span className="font-bold text-[#0B0F14] text-xs">{siteSettings.jazzcashTitle || "Fayaz Ullah"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-red-700 block">Account / Mobile Number:</span>
                      <span className="font-mono font-black text-red-600 text-sm select-all">{siteSettings.jazzcashNumber || "03306767357"}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-red-900/90 pt-1.5 border-t border-red-200 leading-relaxed font-medium">
                    💡 JazzCash App ya *786# se <span className="font-mono font-bold">{siteSettings.jazzcashNumber || "03306767357"}</span> par <span className="font-bold">{formatPrice(grandTotal)}</span> send karein. Uske baad 8558 se aane wala Transaction ID (TID) neeche likhein:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-[#0B0F14] mb-1">
                      Your Sender Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={walletPhone}
                      onChange={(e) => setWalletPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      placeholder="03XXXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] focus:outline-none focus:border-[#0B0F14] text-xs font-mono font-medium text-[#0B0F14]"
                    />
                    <span className="text-[10px] text-[#8A8F98] mt-1 block">
                      Apna JazzCash number jahan se paise send kiye.
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0B0F14] mb-1">
                      Transaction ID (TID / Trx ID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={walletTid}
                      onChange={(e) => setWalletTid(e.target.value.trim())}
                      placeholder="e.g. 028471928374"
                      className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] focus:outline-none focus:border-[#0B0F14] text-xs font-mono font-bold text-[#0B0F14]"
                    />
                    <span className="text-[10px] text-[#8A8F98] mt-1 block">
                      JazzCash SMS (8558) se mila hua TID number.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* CHANNEL CONTENT 3: EasyPaisa Mobile Account Details */}
            {paymentMethod === "EASYPAISA" && (
              <div className="pt-4 border-t border-[#E8E5DC] space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-600 text-white font-black text-xs rounded-lg">
                    EasyPaisa
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#0B0F14]">
                      Direct EasyPaisa Mobile Transfer
                    </h4>
                    <p className="text-[10px] text-[#8A8F98]">
                      Transfer exact total to official account and enter TID below
                    </p>
                  </div>
                </div>

                {/* Official Store Recipient Box */}
                <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Official Fayzee EasyPaisa Account</span>
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-emerald-700 block">Account Title:</span>
                      <span className="font-bold text-[#0B0F14] text-xs">{siteSettings.easypaisaTitle || "Fayaz Ullah"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-700 block">Account / Mobile Number:</span>
                      <span className="font-mono font-black text-emerald-700 text-sm select-all">{siteSettings.easypaisaNumber || "03306767357"}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-900/90 pt-1.5 border-t border-emerald-200 leading-relaxed font-medium">
                    💡 EasyPaisa App ya *786# se <span className="font-mono font-bold">{siteSettings.easypaisaNumber || "03306767357"}</span> par <span className="font-bold">{formatPrice(grandTotal)}</span> send karein. Uske baad 3737 se aane wala Transaction ID (TID) neeche likhein:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-[#0B0F14] mb-1">
                      Your Sender Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={walletPhone}
                      onChange={(e) => setWalletPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      placeholder="03XXXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] focus:outline-none focus:border-[#0B0F14] text-xs font-mono font-medium text-[#0B0F14]"
                    />
                    <span className="text-[10px] text-[#8A8F98] mt-1 block">
                      Apna EasyPaisa number jahan se paise send kiye.
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0B0F14] mb-1">
                      Transaction ID (TID / Trx ID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={walletTid}
                      onChange={(e) => setWalletTid(e.target.value.trim())}
                      placeholder="e.g. 19283746501"
                      className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] focus:outline-none focus:border-[#0B0F14] text-xs font-mono font-bold text-[#0B0F14]"
                    />
                    <span className="text-[10px] text-[#8A8F98] mt-1 block">
                      EasyPaisa SMS (3737) se mila hua TID number.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Review & Coupon */}
        <div className="lg:col-span-4 space-y-5 sm:space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#E8E5DC] shadow-subtle space-y-5 sm:space-y-6 lg:sticky lg:top-24">
            <h3 className="text-base font-bold text-[#0B0F14] border-b border-[#E8E5DC] pb-3">
              Order Summary ({cartCount} Items)
            </h3>

            {/* Item list preview */}
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1 -mr-1">
              {cart.items.map((item) => {
                const price =
                  item.variant?.salePrice ??
                  item.variant?.price ??
                  item.product?.salePrice ??
                  item.product?.price ??
                  0;
                return (
                  <div key={item.id} className="flex items-center gap-2.5 text-xs">
                    <img
                      src={
                        item.product.images[0]?.url ||
                        "/images/product-placeholder.svg"
                      }
                      alt=""
                      className="w-10 h-10 object-cover rounded-lg bg-[#F5F3EE] border border-[#E8E5DC] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0B0F14] truncate">{item.product.title}</p>
                      {item.variant && (
                        <p className="text-[10px] text-[#8A8F98] font-bold truncate">
                          {item.variant.size ? `Size: ${item.variant.size}` : ""}
                          {item.variant.size && item.variant.color ? " • " : ""}
                          {item.variant.color ? `Color: ${item.variant.color}` : ""}
                          {!item.variant.size && !item.variant.color ? item.variant.name : ""}
                        </p>
                      )}
                      <p className="text-[10px] text-[#8A8F98]">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-[#0B0F14] shrink-0">
                      {formatPrice(price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2 border-t border-[#E8E5DC] space-y-2">
              <label className="text-xs font-bold text-[#0B0F14] flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#C8A96B] shrink-0" /> Have a Coupon Code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. FAYZEE10"
                  className="flex-1 px-3 py-2 text-xs bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] uppercase font-mono min-w-0 focus:border-[#0B0F14] focus:outline-none text-[#0B0F14]"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3.5 sm:px-4 py-2 bg-[#0B0F14] hover:bg-[#1A222C] text-white text-xs font-bold rounded-xl shrink-0 transition border border-[#0B0F14]"
                >
                  Apply
                </button>
              </div>

              {couponApplied && (
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-700 flex items-center justify-between font-medium">
                  <span>Coupon {couponApplied.code} applied!</span>
                  <span className="font-bold">-{formatPrice(couponApplied.discount)}</span>
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs pt-2 border-t border-[#E8E5DC]">
              <div className="flex justify-between text-[#8A8F98]">
                <span>Items Subtotal</span>
                <span className="font-bold text-[#0B0F14]">{formatPrice(cartSubtotal)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-bold">-{formatPrice(couponApplied.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#8A8F98]">
                <span>Shipping Fee</span>
                <span className="font-bold text-[#0B0F14]">
                  {shippingTotal === 0 ? "FREE" : formatPrice(shippingTotal)}
                </span>
              </div>
              <div className="border-t border-[#E8E5DC] pt-2.5 flex justify-between text-sm font-black text-[#0B0F14]">
                <span>Grand Total</span>
                <span className="text-[#0B0F14] text-base">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-3 sm:px-4 bg-[#0B0F14] hover:bg-[#1A222C] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-1.5 flex-wrap text-center disabled:opacity-50 min-h-[46px] active:scale-98 border border-[#0B0F14]"
            >
              {submitting ? (
                <span>Authorizing Order...</span>
              ) : (
                <>
                  <span>
                    {paymentMethod === "COD"
                      ? `Confirm Order (${formatPrice(grandTotal)})`
                      : `Pay Now (${formatPrice(grandTotal)})`}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#C8A96B] shrink-0" />
                </>
              )}
            </button>

            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#8A8F98] justify-center text-center">
              <ShieldCheck className="w-4 h-4 text-[#C8A96B] shrink-0" />
              <span>Authoritative 3D Secure Payment Verification</span>
            </div>
          </div>
        </div>
      </form>

    </div>
  );
}

