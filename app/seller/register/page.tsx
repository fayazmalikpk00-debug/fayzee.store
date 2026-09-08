"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { AlertCircle, ArrowRight, CheckCircle2, ShieldCheck, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SellerRegisterPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [storeName, setStoreName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [cnic, setCnic] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!user) {
      router.push("/login?redirect=/seller/register");
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
          businessAddress,
          phone,
          description,
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
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-[#1C2A39]">Application Submitted!</h1>
        <p className="text-xs text-[#777777] max-w-md mx-auto">
          Thank you for applying to sell on Fayzee. Your business credentials and store profile are currently under review by our admin team.
        </p>
        <Link
          href="/seller/dashboard"
          className="inline-block px-5 py-2.5 bg-[#FF5E00] hover:bg-[#FF8C00] text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          Go to Seller Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#FF5E00] flex items-center justify-center text-white mx-auto shadow-md">
          <Store className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1C2A39]">
          Sell on Fayzee Marketplace
        </h1>
        <p className="text-xs text-[#777777]">
          Reach millions of high-intent buyers across Pakistan with low commission rates
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
        <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DDE2E6] shadow-sm space-y-4 text-xs">
        <h3 className="text-sm font-bold text-[#1C2A39] pb-2 border-b border-[#DDE2E6]">
          Store & Business Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-[#1C2A39] mb-1">Public Store Name</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Apex Electronics"
              className="w-full px-3.5 py-2.5 bg-[#F7F9FA] rounded-xl border border-[#DDE2E6] text-[#333333] focus:outline-none focus:border-[#FF5E00] focus:ring-1 focus:ring-[#FF5E00]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1C2A39] mb-1">Registered Business Entity</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Apex Tech Solutions Pvt Ltd"
              className="w-full px-3.5 py-2.5 bg-[#F7F9FA] rounded-xl border border-[#DDE2E6] text-[#333333] focus:outline-none focus:border-[#FF5E00] focus:ring-1 focus:ring-[#FF5E00]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1C2A39] mb-1">Owner CNIC (Government ID)</label>
            <input
              type="text"
              required
              value={cnic}
              onChange={(e) => setCnic(e.target.value)}
              placeholder="35201-XXXXXXX-X"
              className="w-full px-3.5 py-2.5 bg-[#F7F9FA] rounded-xl border border-[#DDE2E6] text-[#333333] focus:outline-none focus:border-[#FF5E00] focus:ring-1 focus:ring-[#FF5E00]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1C2A39] mb-1">NTN / Tax Registration Number</label>
            <input
              type="text"
              value={taxNumber}
              onChange={(e) => setTaxNumber(e.target.value)}
              placeholder="NTN-XXXXXXX (Optional)"
              className="w-full px-3.5 py-2.5 bg-[#F7F9FA] rounded-xl border border-[#DDE2E6] text-[#333333] focus:outline-none focus:border-[#FF5E00] focus:ring-1 focus:ring-[#FF5E00]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1C2A39] mb-1">Business Contact Phone</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 300 XXXXXXX"
              className="w-full px-3.5 py-2.5 bg-[#F7F9FA] rounded-xl border border-[#DDE2E6] text-[#333333] focus:outline-none focus:border-[#FF5E00] focus:ring-1 focus:ring-[#FF5E00]"
            />
          </div>

          <div>
            <label className="block font-bold text-[#1C2A39] mb-1">Store Dispatch Address</label>
            <input
              type="text"
              required
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              placeholder="Shop # / Plaza / City"
              className="w-full px-3.5 py-2.5 bg-[#F7F9FA] rounded-xl border border-[#DDE2E6] text-[#333333] focus:outline-none focus:border-[#FF5E00] focus:ring-1 focus:ring-[#FF5E00]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-[#1C2A39] mb-1">Store Description & Products</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us what types of products you sell, your experience, and distribution rights..."
              className="w-full px-3.5 py-2.5 bg-[#F7F9FA] rounded-xl border border-[#DDE2E6] text-[#333333] focus:outline-none focus:border-[#FF5E00] focus:ring-1 focus:ring-[#FF5E00]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !user}
          className="w-full py-3.5 bg-[#FF5E00] hover:bg-[#FF8C00] disabled:opacity-50 text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2"
        >
          {loading ? <span>Submitting Application...</span> : <span>Submit Seller Application</span>}
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-[11px] text-[#777777] pt-2 border-t border-[#DDE2E6]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Fayzee protects seller confidentiality under our Merchant Agreement.</span>
        </div>
      </form>
    </div>
  );
}
