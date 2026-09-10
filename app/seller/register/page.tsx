"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SellerRegisterPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  // Step 1: Store & Entity Information
  const [storeName, setStoreName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [city, setCity] = useState("Karachi");
  const [description, setDescription] = useState("");

  // Step 2: Phone & OTP Verification
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [demoOtpHint, setDemoOtpHint] = useState("");

  // Step 3: CNIC & Tax Information
  const [cnic, setCnic] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [cnicFrontUrl, setCnicFrontUrl] = useState("");
  const [cnicBackUrl, setCnicBackUrl] = useState("");
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);

  // Step 4: Bank Account & Settlement Proof
  const [bankName, setBankName] = useState("");
  const [accountTitle, setAccountTitle] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [iban, setIban] = useState("");
  const [bankProofUrl, setBankProofUrl] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);

  // General State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  // CNIC Auto-Formatter: 12345-1234567-1
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 13) val = val.slice(0, 13);
    if (val.length > 12) {
      val = `${val.slice(0, 5)}-${val.slice(5, 12)}-${val.slice(12)}`;
    } else if (val.length > 5) {
      val = `${val.slice(0, 5)}-${val.slice(5)}`;
    }
    setCnic(val);
  };

  // Image Uploader Helper
  const handleDocumentUpload = async (
    file: File,
    type: "front" | "back" | "proof"
  ) => {
    if (!file) return;

    if (type === "front") setUploadingFront(true);
    if (type === "back") setUploadingBack(true);
    if (type === "proof") setUploadingProof(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload document image");
      }

      const uploadedUrl = data.images?.[0]?.url || data.url;
      if (type === "front") setCnicFrontUrl(uploadedUrl);
      if (type === "back") setCnicBackUrl(uploadedUrl);
      if (type === "proof") setBankProofUrl(uploadedUrl);
    } catch (err: any) {
      setErrorMsg(err.message || "Document upload failed");
    } finally {
      if (type === "front") setUploadingFront(false);
      if (type === "back") setUploadingBack(false);
      if (type === "proof") setUploadingProof(false);
    }
  };

  // OTP Handlers
  const handleSendOtp = async () => {
    if (!phone || phone.trim().length < 10) {
      setErrorMsg("Please enter a valid Pakistani mobile number first (e.g. 03001234567).");
      return;
    }

    setOtpLoading(true);
    setErrorMsg("");
    setOtpMessage("");
    setDemoOtpHint("");

    try {
      const res = await fetch("/api/seller/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SEND_OTP", phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send verification code");

      setOtpSent(true);
      setOtpMessage(data.message || "Verification code sent!");
      if (data.demoOtp) {
        setDemoOtpHint(data.demoOtp);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send code");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMsg("Please enter the complete 6-digit code.");
      return;
    }

    setOtpLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/seller/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VERIFY_OTP", phone, otp: otpCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid verification code");

      setIsPhoneVerified(true);
      setOtpMessage("Phone number verified successfully! ✓");
      setDemoOtpHint("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to verify code");
    } finally {
      setOtpLoading(false);
    }
  };

  // Main Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!user) {
      router.push("/login?redirect=/seller/register");
      return;
    }

    if (!cnicFrontUrl || !cnicBackUrl) {
      setErrorMsg("Please upload both the Front and Back images of your CNIC card.");
      return;
    }

    if (!bankProofUrl) {
      setErrorMsg("Please upload a photo of your Bank Cheque or Account Statement for payout verification.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/seller/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          businessName,
          cnic,
          taxNumber,
          businessAddress: `${businessAddress}, ${city}`,
          phone,
          description,
          cnicFrontUrl,
          cnicBackUrl,
          bankProofUrl,
          bankName,
          accountTitle,
          accountNumber,
          iban,
          isPhoneVerified,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Application submission failed.");
      }

      await refreshUser();
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit seller application.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4 animate-in fade-in">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-[#0B0F14]">KYC Application Submitted!</h1>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          Shukriya! Aapki store details aur government verification documents (CNIC & Bank Cheque) 
          FAYZEE Admin team ke paas review ke liye darj ho chuki hain. Account verify hote hi aap live products publish kar sakein ge.
        </p>
        <div className="pt-2">
          <Link
            href="/seller/dashboard"
            className="inline-block px-6 py-3 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] text-xs font-bold rounded-2xl shadow-sm border border-[#C8A96B]/30 transition"
          >
            Go to Seller Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#0B0F14] text-[#C8A96B] border border-[#C8A96B]/30 flex items-center justify-center mx-auto shadow-card">
          <Store className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0B0F14] tracking-tight">
          Sell on Fayzee Marketplace
        </h1>
        <p className="text-xs text-[#8A8F98]">
          Open your official verified merchant store across Pakistan with automated courier logistics
        </p>
      </div>

      {!user && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
          <span>You must sign in with your Fayzee user account before applying.</span>
          <Link href="/login?redirect=/seller/register" className="font-bold underline text-amber-900">
            Sign In First
          </Link>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E5DC] shadow-card space-y-8 text-xs">
        {/* SECTION 1: Store & Entity Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8E5DC]">
            <Store className="w-4 h-4 text-[#C8A96B]" />
            <h3 className="text-sm font-black text-[#0B0F14]">1. Store & Business Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#0B0F14] mb-1">
                Public Store Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Apex Electronics"
                className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-[#0B0F14] placeholder:text-[#8A8F98] focus:outline-none focus:border-[#C8A96B] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0B0F14] mb-1">
                Registered Business / Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Apex Tech Solutions Pvt Ltd"
                className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-[#0B0F14] placeholder:text-[#8A8F98] focus:outline-none focus:border-[#C8A96B] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0B0F14] mb-1">
                Warehouse / Store City <span className="text-rose-500">*</span>
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-[#0B0F14] font-medium focus:outline-none focus:border-[#C8A96B] focus:bg-white transition"
              >
                <option value="Karachi">Karachi</option>
                <option value="Lahore">Lahore</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Faisalabad">Faisalabad</option>
                <option value="Multan">Multan</option>
                <option value="Gujranwala">Gujranwala</option>
                <option value="Peshawar">Peshawar</option>
                <option value="Quetta">Quetta</option>
                <option value="Sialkot">Sialkot</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Other">Other Pakistani City</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#0B0F14] mb-1">
                Store Dispatch / Pickup Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="Shop #, Plaza, Street, Area"
                className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-[#0B0F14] placeholder:text-[#8A8F98] focus:outline-none focus:border-[#C8A96B] focus:bg-white transition"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Courier riders will pick up parcels from this address.
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#0B0F14] mb-1">Store Description & Products</label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what product categories you sell..."
                className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-[#0B0F14] placeholder:text-[#8A8F98] focus:outline-none focus:border-[#C8A96B] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Mobile Number & OTP Verification */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E5DC]">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#C8A96B]" />
              <h3 className="text-sm font-black text-[#0B0F14]">2. Mobile Phone & OTP Verification</h3>
            </div>
            {isPhoneVerified && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#0B0F14] mb-1">
                Business Contact Phone <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  required
                  disabled={isPhoneVerified}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03001234567"
                  className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-[#0B0F14] font-mono placeholder:text-[#8A8F98] focus:outline-none focus:border-[#C8A96B] focus:bg-white transition disabled:opacity-70"
                />
                {!isPhoneVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || !phone}
                    className="px-4 py-2.5 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] font-bold rounded-xl whitespace-nowrap transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {otpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>{otpSent ? "Resend" : "Send OTP"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* OTP Code Box */}
            {otpSent && !isPhoneVerified && (
              <div>
                <label className="block font-bold text-[#0B0F14] mb-1">
                  Enter 6-Digit OTP Code <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="e.g. 482910"
                    className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-[#0B0F14] font-mono text-center font-bold tracking-widest focus:outline-none focus:border-[#C8A96B] focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otpCode.length !== 6}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl whitespace-nowrap transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {otpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Verify Code</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* OTP Notification Hint */}
          {otpMessage && (
            <p className="text-[11px] text-emerald-700 font-bold">{otpMessage}</p>
          )}
          {demoOtpHint && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center justify-between">
              <span>Simulation / Demo Verification Code: <strong>{demoOtpHint}</strong></span>
              <button
                type="button"
                onClick={() => setOtpCode(demoOtpHint)}
                className="font-bold underline text-amber-800"
              >
                Auto-fill Code
              </button>
            </div>
          )}
        </div>

        {/* SECTION 3: National Identity & Document Uploads */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8E5DC]">
            <CreditCard className="w-4 h-4 text-[#C8A96B]" />
            <h3 className="text-sm font-black text-[#0B0F14]">3. Identity Verification & Government Documents (KYC)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#0B0F14] mb-1">
                Owner CNIC (National ID) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={cnic}
                onChange={handleCnicChange}
                placeholder="35201-1234567-1"
                maxLength={15}
                className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-[#0B0F14] font-mono placeholder:text-[#8A8F98] focus:outline-none focus:border-[#C8A96B] focus:bg-white transition"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">13-digit Pakistani CNIC number</span>
            </div>

            <div>
              <label className="block font-bold text-[#0B0F14] mb-1">FBR NTN / Tax Number (Optional)</label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="NTN-1234567-8"
                className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-[#0B0F14] placeholder:text-[#8A8F98] focus:outline-none focus:border-[#C8A96B] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Document Uploads: CNIC Front & Back */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* CNIC Front Photo */}
            <div className="p-4 rounded-2xl border-2 border-dashed border-[#E8E5DC] hover:border-[#C8A96B] transition bg-[#FAF9F5] space-y-2">
              <span className="block font-bold text-[#0B0F14]">
                CNIC Front Side Photo <span className="text-rose-500">*</span>
              </span>
              <p className="text-[10px] text-slate-500">
                Upload clear picture of the front side showing photo, name, and CNIC number.
              </p>

              {cnicFrontUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white">
                  <img src={cnicFrontUrl} alt="CNIC Front" className="w-full h-32 object-cover" />
                  <button
                    type="button"
                    onClick={() => setCnicFrontUrl("")}
                    className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 cursor-pointer bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                  <Upload className="w-6 h-6 text-[#C8A96B] mb-1" />
                  <span className="text-xs font-bold text-slate-700">
                    {uploadingFront ? "Uploading Front..." : "Choose CNIC Front Photo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingFront}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocumentUpload(file, "front");
                    }}
                    className="sr-only"
                  />
                </label>
              )}
            </div>

            {/* CNIC Back Photo */}
            <div className="p-4 rounded-2xl border-2 border-dashed border-[#E8E5DC] hover:border-[#C8A96B] transition bg-[#FAF9F5] space-y-2">
              <span className="block font-bold text-[#0B0F14]">
                CNIC Back Side Photo <span className="text-rose-500">*</span>
              </span>
              <p className="text-[10px] text-slate-500">
                Upload clear picture of the back side showing permanent address and barcode.
              </p>

              {cnicBackUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white">
                  <img src={cnicBackUrl} alt="CNIC Back" className="w-full h-32 object-cover" />
                  <button
                    type="button"
                    onClick={() => setCnicBackUrl("")}
                    className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 cursor-pointer bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                  <Upload className="w-6 h-6 text-[#C8A96B] mb-1" />
                  <span className="text-xs font-bold text-slate-700">
                    {uploadingBack ? "Uploading Back..." : "Choose CNIC Back Photo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingBack}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDocumentUpload(file, "back");
                    }}
                    className="sr-only"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: Bank Account & Payout Proof */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E8E5DC]">
            <Building2 className="w-4 h-4 text-[#C8A96B]" />
            <h3 className="text-sm font-black text-[#0B0F14]">4. Bank Account & Settlement Proof</h3>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
            <strong>Important:</strong> Under FAYZEE anti-fraud rules, your <strong>Bank Account Title</strong> must match your <strong>CNIC Name</strong> to receive weekly marketplace sales settlements.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#0B0F14] mb-1">
                Bank Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Meezan Bank / HBL / Bank Alfalah"
                className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-[#0B0F14] placeholder:text-[#8A8F98] focus:outline-none focus:border-[#C8A96B] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0B0F14] mb-1">
                Account Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={accountTitle}
                onChange={(e) => setAccountTitle(e.target.value)}
                placeholder="Account Title as on CNIC"
                className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-[#0B0F14] placeholder:text-[#8A8F98] focus:outline-none focus:border-[#C8A96B] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0B0F14] mb-1">
                IBAN Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={iban}
                onChange={(e) => setIban(e.target.value.toUpperCase())}
                placeholder="PK00MEZN0000001234567801"
                className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-[#0B0F14] font-mono placeholder:text-[#8A8F98] focus:outline-none focus:border-[#C8A96B] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0B0F14] mb-1">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 0101010123456"
                className="w-full px-3.5 py-2.5 bg-[#F5F3EE] rounded-xl border border-[#E8E5DC] text-[#0B0F14] placeholder:text-[#8A8F98] focus:outline-none focus:border-[#C8A96B] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Bank Cheque Upload */}
          <div className="p-4 rounded-2xl border-2 border-dashed border-[#E8E5DC] hover:border-[#C8A96B] transition bg-[#FAF9F5] space-y-2">
            <span className="block font-bold text-[#0B0F14]">
              Bank Cheque / Statement Proof Photo <span className="text-rose-500">*</span>
            </span>
            <p className="text-[10px] text-slate-500">
              Upload a clear photo of a cancelled cheque leaf or bank maintenance certificate showing your Account Title and IBAN.
            </p>

            {bankProofUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white">
                <img src={bankProofUrl} alt="Bank Proof" className="w-full h-36 object-cover" />
                <button
                  type="button"
                  onClick={() => setBankProofUrl("")}
                  className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 cursor-pointer bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                <FileText className="w-6 h-6 text-[#C8A96B] mb-1" />
                <span className="text-xs font-bold text-slate-700">
                  {uploadingProof ? "Uploading Proof..." : "Choose Cheque / Statement Photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingProof}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleDocumentUpload(file, "proof");
                  }}
                  className="sr-only"
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 space-y-3">
          <button
            type="submit"
            disabled={loading || !user || !cnicFrontUrl || !cnicBackUrl || !bankProofUrl}
            className="w-full py-4 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] border border-[#C8A96B]/40 disabled:opacity-50 font-black text-xs rounded-2xl shadow-card transition flex items-center justify-center gap-2 active:scale-98"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting KYC Verification Application...</span>
              </>
            ) : (
              <>
                <span>Submit Verified Seller Application</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center gap-2 text-[11px] text-[#8A8F98] justify-center pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>FAYZEE guarantees full data encryption and privacy for all submitted merchant credentials.</span>
          </div>
        </div>
      </form>
    </div>
  );
}
