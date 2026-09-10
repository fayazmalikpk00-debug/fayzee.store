"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import { detectCardBrand, isValidLuhn } from "@/lib/payment";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Key,
  Lock,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
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

  // 3D Secure & Mobile OTP Simulation Modal
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [demoOtp, setDemoOtp] = useState("482910");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(120);

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

  // OTP Countdown Timer
  useEffect(() => {
    let timer: any = null;
    if (isOtpModalOpen && otpSecondsLeft > 0) {
      timer = setInterval(() => {
        setOtpSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOtpModalOpen, otpSecondsLeft]);

  const shippingTotal =
    cart?.items?.reduce((acc, item) => acc + (item.product?.shippingFee || 0), 0) || 0;
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

  const fillDemoCard = () => {
    setCardNumber("4242 4242 4242 4242");
    setCardHolder(user?.name ? user.name.toUpperCase() : "FAYAZ MALIK");
    setCardExpiry("12/28");
    setCardCvv("123");
    setCardErrors({});
  };

  const fillDemoJazzCash = () => {
    setWalletPhone(user?.phone || "03001234567");
    setWalletCnic("892014");
  };

  const fillDemoEasyPaisa = () => {
    setWalletPhone(user?.phone || "03457654321");
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
      setErrorMsg(`Please enter a valid 11-digit Pakistani mobile number (e.g. 03XXXXXXXXX) for ${paymentMethod === "JAZZ_CASH" ? "JazzCash" : "EasyPaisa"}.`);
      return false;
    }
    return true;
  };

  const executeOrderPlacement = async (authPayload?: any) => {
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
            authCode: authPayload?.authCode,
            otpCode: authPayload?.otpCode,
          },
          couponCode: couponApplied?.code,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process order.");
      }

      await refreshCart();
      setIsOtpModalOpen(false);
      router.push(`/orders/${data.order.id}?success=true&payment=${paymentMethod.toLowerCase()}`);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during payment processing.");
      setIsOtpModalOpen(false);
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
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoOtp(randomOtp);
      setOtpCode("");
      setOtpError("");
      setOtpSecondsLeft(120);
      setIsOtpModalOpen(true);
      return;
    }

    if (paymentMethod === "JAZZ_CASH" || paymentMethod === "EASYPAISA") {
      if (!validateWalletInputs()) return;
      const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setDemoOtp(randomOtp);
      setOtpCode("");
      setOtpError("");
      setOtpSecondsLeft(120);
      setIsOtpModalOpen(true);
      return;
    }
  };

  const handleVerifyOtpAndPay = async () => {
    if (!otpCode.trim()) {
      setOtpError("Please enter the authorization code.");
      return;
    }

    setOtpVerifying(true);
    setOtpError("");

    // Realistic verification simulation
    setTimeout(async () => {
      if (otpCode.trim() !== demoOtp && otpCode.trim() !== "1234" && otpCode.trim() !== "482910") {
        setOtpError("Invalid OTP code. Please check the code and try again.");
        setOtpVerifying(false);
        return;
      }

      setOtpVerifying(false);
      const authCode = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;
      await executeOrderPlacement({ authCode, otpCode });
    }, 900);
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
        <h2 className="text-xl font-bold text-[#1C2A39]">No Items to Checkout</h2>
        <Link
          href="/products"
          className="inline-block px-5 py-2.5 bg-[#FF5E00] hover:bg-[#FF8C00] text-white rounded-xl text-xs font-semibold transition"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const detectedBrand = detectCardBrand(cardNumber);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
      <div className="pb-3 sm:pb-4 border-b border-[#DDE2E6]">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1C2A39] flex items-center gap-2">
          <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#16A34A] shrink-0" />
          <span>Secure Checkout & Payment</span>
        </h1>
        <p className="text-xs text-[#777777] mt-0.5">
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
        <div className="p-3.5 sm:p-4 bg-red-50 rounded-2xl border border-[#DC2626]/30 text-xs text-[#DC2626] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Address & Payment Method */}
        <div className="lg:col-span-8 space-y-5 sm:space-y-6">
          {/* Step 1: Shipping Address */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#DDE2E6] shadow-xs space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-[#1C2A39] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#FF5E00] shrink-0" />
              <span>1. Delivery Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1C2A39] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  placeholder="Recipient full name"
                  className="w-full px-3.5 py-2.5 bg-[#F7F9FA] rounded-xl border border-[#DDE2E6] focus:outline-none focus:border-[#FF5E00] text-xs text-[#333333]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C2A39] mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="03XX XXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-[#F7F9FA] rounded-xl border border-[#DDE2E6] focus:outline-none focus:border-[#FF5E00] text-xs text-[#333333]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#1C2A39] mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  placeholder="House / Apartment #, Street, Area"
                  className="w-full px-3.5 py-2.5 bg-[#F7F9FA] rounded-xl border border-[#DDE2E6] focus:outline-none focus:border-[#FF5E00] text-xs text-[#333333]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C2A39] mb-1">City</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="e.g. Lahore, Karachi, Islamabad"
                  className="w-full px-3.5 py-2.5 bg-[#F7F9FA] rounded-xl border border-[#DDE2E6] focus:outline-none focus:border-[#FF5E00] text-xs text-[#333333]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C2A39] mb-1">State / Province</label>
                <input
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="e.g. Punjab, Sindh, KPK, ICT"
                  className="w-full px-3.5 py-2.5 bg-[#F7F9FA] rounded-xl border border-[#DDE2E6] focus:outline-none focus:border-[#FF5E00] text-xs text-[#333333]"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method Channels */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#DDE2E6] shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-[#1C2A39] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#FF5E00] shrink-0" />
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
                    ? "border-[#FF5E00] bg-orange-50/40 shadow-xs"
                    : "border-[#DDE2E6] hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1C2A39]">Cash on Delivery</span>
                    <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                      Doorstep Cash
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentChannel"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="accent-[#FF5E00]"
                  />
                </div>
                <p className="text-[11px] text-[#777777] mt-2">
                  Pay with physical cash when the courier arrives at your destination.
                </p>
              </div>

              {/* Option 2: Debit / Credit Card */}
              <div
                onClick={() => setPaymentMethod("ONLINE_CARD")}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  paymentMethod === "ONLINE_CARD"
                    ? "border-[#FF5E00] bg-orange-50/40 shadow-xs"
                    : "border-[#DDE2E6] hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1C2A39]">Debit / Credit Card</span>
                    <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                      3D Secure
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentChannel"
                    checked={paymentMethod === "ONLINE_CARD"}
                    onChange={() => setPaymentMethod("ONLINE_CARD")}
                    className="accent-[#FF5E00]"
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">VISA</span>
                  <span className="text-[10px] font-extrabold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">Mastercard</span>
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">PayPak</span>
                </div>
              </div>

              {/* Option 3: JazzCash Mobile Account */}
              <div
                onClick={() => setPaymentMethod("JAZZ_CASH")}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  paymentMethod === "JAZZ_CASH"
                    ? "border-[#FF5E00] bg-orange-50/40 shadow-xs"
                    : "border-[#DDE2E6] hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1C2A39]">JazzCash Mobile Account</span>
                    <span className="px-1.5 py-0.2 bg-red-100 text-red-800 text-[10px] font-bold rounded">
                      Mobile Wallet
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentChannel"
                    checked={paymentMethod === "JAZZ_CASH"}
                    onChange={() => setPaymentMethod("JAZZ_CASH")}
                    className="accent-[#FF5E00]"
                  />
                </div>
                <p className="text-[11px] text-[#777777] mt-2">
                  Instant mobile checkout from your JazzCash account via OTP / MPIN.
                </p>
              </div>

              {/* Option 4: EasyPaisa Mobile Account */}
              <div
                onClick={() => setPaymentMethod("EASYPAISA")}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  paymentMethod === "EASYPAISA"
                    ? "border-[#FF5E00] bg-orange-50/40 shadow-xs"
                    : "border-[#DDE2E6] hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1C2A39]">EasyPaisa Mobile Account</span>
                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                      Mobile Wallet
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentChannel"
                    checked={paymentMethod === "EASYPAISA"}
                    onChange={() => setPaymentMethod("EASYPAISA")}
                    className="accent-[#FF5E00]"
                  />
                </div>
                <p className="text-[11px] text-[#777777] mt-2">
                  Fast & secure mobile payment directly from your EasyPaisa wallet.
                </p>
              </div>
            </div>

            {/* CHANNEL CONTENT 1: Debit / Credit Card Interactive Inputs & Live Card Preview */}
            {paymentMethod === "ONLINE_CARD" && (
              <div className="pt-4 border-t border-[#DDE2E6] space-y-5 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-[#1C2A39] uppercase tracking-wider">
                    Credit / Debit Card Details
                  </h4>
                  <button
                    type="button"
                    onClick={fillDemoCard}
                    className="text-[11px] font-bold text-[#FF5E00] hover:text-[#FF8C00] flex items-center gap-1 self-start sm:self-auto bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Fill Test Visa Card</span>
                  </button>
                </div>

                {/* Interactive Live Card Graphic Preview */}
                <div className="max-w-md mx-auto w-full rounded-2xl p-5 bg-gradient-to-br from-[#1C2A39] via-[#2A3B4C] to-[#0F172A] text-white shadow-xl relative overflow-hidden border border-slate-700/50">
                  <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[#FF5E00]/15 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-7 rounded bg-amber-300/80 border border-amber-200 flex items-center justify-center">
                        <div className="w-7 h-5 border border-amber-900/40 rounded-xs grid grid-cols-2 gap-0.5 p-0.5">
                          <div className="bg-amber-900/20" />
                          <div className="bg-amber-900/20" />
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-300">)))</span>
                    </div>
                    <span className="text-xs font-black tracking-widest uppercase bg-white/10 px-2.5 py-1 rounded-md">
                      {detectedBrand}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-mono">
                      Card Number
                    </span>
                    <span className="text-base sm:text-lg font-mono font-black tracking-widest block">
                      {cardNumber || "•••• •••• •••• ••••"}
                    </span>
                  </div>

                  <div className="flex items-end justify-between text-[10px] font-mono">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                        Cardholder
                      </span>
                      <span className="font-bold tracking-wider uppercase block truncate max-w-[170px]">
                        {cardHolder || "CARDHOLDER NAME"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                        Expires
                      </span>
                      <span className="font-bold block">{cardExpiry || "MM/YY"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-1">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#1C2A39] mb-1">
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
                      className={`w-full px-3.5 py-2.5 bg-[#F7F9FA] rounded-xl border focus:outline-none focus:border-[#FF5E00] text-xs font-medium uppercase ${
                        cardErrors.cardHolder ? "border-red-500 bg-red-50/20" : "border-[#DDE2E6]"
                      }`}
                    />
                    {cardErrors.cardHolder && (
                      <p className="text-[10px] text-red-600 mt-1">{cardErrors.cardHolder}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#1C2A39] mb-1 flex items-center justify-between">
                      <span>Card Number <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-[#FF5E00] font-bold">{detectedBrand}</span>
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      className={`w-full px-3.5 py-2.5 bg-[#F7F9FA] rounded-xl border focus:outline-none focus:border-[#FF5E00] text-xs font-mono font-semibold tracking-wider ${
                        cardErrors.cardNumber ? "border-red-500 bg-red-50/20" : "border-[#DDE2E6]"
                      }`}
                    />
                    {cardErrors.cardNumber && (
                      <p className="text-[10px] text-red-600 mt-1">{cardErrors.cardNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1C2A39] mb-1">
                      Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className={`w-full px-3.5 py-2.5 bg-[#F7F9FA] rounded-xl border focus:outline-none focus:border-[#FF5E00] text-xs font-mono text-center ${
                        cardErrors.cardExpiry ? "border-red-500 bg-red-50/20" : "border-[#DDE2E6]"
                      }`}
                    />
                    {cardErrors.cardExpiry && (
                      <p className="text-[10px] text-red-600 mt-1">{cardErrors.cardExpiry}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1C2A39] mb-1 flex items-center justify-between">
                      <span>Security CVV <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-normal">3-4 digits on back</span>
                    </label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={handleCvvChange}
                      placeholder="•••"
                      maxLength={4}
                      className={`w-full px-3.5 py-2.5 bg-[#F7F9FA] rounded-xl border focus:outline-none focus:border-[#FF5E00] text-xs font-mono text-center tracking-widest ${
                        cardErrors.cardCvv ? "border-red-500 bg-red-50/20" : "border-[#DDE2E6]"
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
              <div className="pt-4 border-t border-[#DDE2E6] space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-600 text-white font-black text-xs rounded">
                      JazzCash
                    </span>
                    <h4 className="text-xs font-bold text-[#1C2A39]">
                      Mobile Account Checkout
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={fillDemoJazzCash}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 self-start sm:self-auto bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Fill Test JazzCash</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-[#1C2A39] mb-1">
                      JazzCash Registered Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={walletPhone}
                      onChange={(e) => setWalletPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      placeholder="03001234567"
                      className="w-full px-3.5 py-2.5 bg-[#F7F9FA] rounded-xl border border-[#DDE2E6] focus:outline-none focus:border-[#FF5E00] text-xs font-mono font-medium"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Enter 11-digit mobile number linked with your JazzCash account.
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1C2A39] mb-1">
                      CNIC Last 6 Digits (Verification)
                    </label>
                    <input
                      type="text"
                      value={walletCnic}
                      onChange={(e) => setWalletCnic(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="e.g. 892014"
                      maxLength={6}
                      className="w-full px-3.5 py-2.5 bg-[#F7F9FA] rounded-xl border border-[#DDE2E6] focus:outline-none focus:border-[#FF5E00] text-xs font-mono text-center"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Required for high-limit transaction authorization.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* CHANNEL CONTENT 3: EasyPaisa Mobile Account Details */}
            {paymentMethod === "EASYPAISA" && (
              <div className="pt-4 border-t border-[#DDE2E6] space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-600 text-white font-black text-xs rounded">
                      EasyPaisa
                    </span>
                    <h4 className="text-xs font-bold text-[#1C2A39]">
                      Mobile Account Checkout
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={fillDemoEasyPaisa}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Fill Test EasyPaisa</span>
                  </button>
                </div>

                <div className="text-xs max-w-md">
                  <label className="block font-semibold text-[#1C2A39] mb-1">
                    EasyPaisa Registered Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={walletPhone}
                    onChange={(e) => setWalletPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    placeholder="03451234567"
                    className="w-full px-3.5 py-2.5 bg-[#F7F9FA] rounded-xl border border-[#DDE2E6] focus:outline-none focus:border-[#FF5E00] text-xs font-mono font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    You will receive an in-app push notification or OTP to authorize payment.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Review & Coupon */}
        <div className="lg:col-span-4 space-y-5 sm:space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#DDE2E6] shadow-sm space-y-5 sm:space-y-6 lg:sticky lg:top-24">
            <h3 className="text-base font-bold text-[#1C2A39] border-b border-[#DDE2E6] pb-3">
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
                      className="w-10 h-10 object-cover rounded-lg bg-[#F7F9FA] border border-[#DDE2E6] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1C2A39] truncate">{item.product.title}</p>
                      {item.variant && (
                        <p className="text-[10px] text-[#FF5E00] font-bold truncate">
                          {item.variant.size ? `Size: ${item.variant.size}` : ""}
                          {item.variant.size && item.variant.color ? " • " : ""}
                          {item.variant.color ? `Color: ${item.variant.color}` : ""}
                          {!item.variant.size && !item.variant.color ? item.variant.name : ""}
                        </p>
                      )}
                      <p className="text-[10px] text-[#777777]">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-[#1C2A39] shrink-0">
                      {formatPrice(price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2 border-t border-[#DDE2E6] space-y-2">
              <label className="text-xs font-bold text-[#1C2A39] flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#FF5E00] shrink-0" /> Have a Coupon Code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. FAYZEE10"
                  className="flex-1 px-3 py-2 text-xs bg-[#F7F9FA] rounded-xl border border-[#DDE2E6] uppercase font-mono min-w-0 focus:border-[#FF5E00] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3.5 sm:px-4 py-2 bg-[#1C2A39] hover:bg-[#2A3B4C] text-white text-xs font-bold rounded-xl shrink-0 transition"
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
            <div className="space-y-2 text-xs pt-2 border-t border-[#DDE2E6]">
              <div className="flex justify-between text-[#777777]">
                <span>Items Subtotal</span>
                <span className="font-bold text-[#1C2A39]">{formatPrice(cartSubtotal)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-[#16A34A]">
                  <span>Discount</span>
                  <span className="font-bold">-{formatPrice(couponApplied.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#777777]">
                <span>Shipping Fee</span>
                <span className="font-bold text-[#1C2A39]">
                  {shippingTotal === 0 ? "FREE" : formatPrice(shippingTotal)}
                </span>
              </div>
              <div className="border-t border-[#DDE2E6] pt-2.5 flex justify-between text-sm font-black text-[#1C2A39]">
                <span>Grand Total</span>
                <span className="text-[#FF5E00] text-base">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-3 sm:px-4 bg-[#FF5E00] hover:bg-[#FF8C00] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-1.5 flex-wrap text-center disabled:opacity-50 min-h-[46px] active:scale-98"
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
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </>
              )}
            </button>

            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#777777] justify-center text-center">
              <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>Authoritative 3D Secure Payment Verification</span>
            </div>
          </div>
        </div>
      </form>

      {/* 3D Secure / Mobile OTP Authentication Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {paymentMethod === "ONLINE_CARD"
                      ? "3D Secure Card Verification"
                      : `${paymentMethod === "JAZZ_CASH" ? "JazzCash" : "EasyPaisa"} Approval`}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Verified by Visa / Mastercard / State Bank of Pakistan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOtpModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Merchant & Transaction Summary */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Merchant:</span>
                <span className="font-bold text-slate-900">Fayzee Marketplace Store</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Amount:</span>
                <span className="font-black text-[#FF5E00] text-sm">{formatPrice(grandTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Channel:</span>
                <span className="font-medium text-slate-800">
                  {paymentMethod === "ONLINE_CARD"
                    ? `${detectedBrand} (ending in ${cardNumber.slice(-4)})`
                    : `${paymentMethod === "JAZZ_CASH" ? "JazzCash" : "EasyPaisa"} (${walletPhone})`}
                </span>
              </div>
            </div>

            {/* OTP Code Simulation & Input */}
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <div>
                  <span className="font-bold block">Simulated Security Code (SMS OTP):</span>
                  <span className="font-mono text-base font-black text-amber-900 tracking-widest">
                    {demoOtp}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpCode(demoOtp)}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition shadow-xs"
                >
                  Auto-Fill OTP
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter One-Time Password (OTP)
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setOtpError("");
                  }}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-[#F7F9FA] rounded-xl border border-[#DDE2E6] text-center font-mono font-black text-lg tracking-widest focus:outline-none focus:border-[#FF5E00]"
                />
                {otpError && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{otpError}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Expires in: {Math.floor(otpSecondsLeft / 60)}:{("0" + (otpSecondsLeft % 60)).slice(-2)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                    setDemoOtp(newOtp);
                    setOtpSecondsLeft(120);
                  }}
                  className="text-[#FF5E00] hover:underline font-bold"
                >
                  Resend Code
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOtpModalOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={otpVerifying || submitting}
                onClick={handleVerifyOtpAndPay}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 active:scale-98 disabled:opacity-50"
              >
                {otpVerifying || submitting ? (
                  <span>Authorizing with Bank...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Authorize & Pay {formatPrice(grandTotal)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

