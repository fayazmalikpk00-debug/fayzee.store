"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { AlertCircle, ArrowRight, Lock, Mail, Phone, Store, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "SELLER">("CUSTOMER");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      await refreshUser();

      if (role === "SELLER") {
        router.push("/seller/register");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block group">
          <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-md mx-auto flex items-center justify-center border border-[#DDE2E6] group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="FAYZEE" className="w-full h-full object-contain" />
          </div>
        </Link>
        <h1 className="text-2xl font-black text-[#1C2A39]">Create FAYZEE Account</h1>
        <p className="text-xs text-[#777777]">Join millions shopping smart and easy</p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 rounded-2xl border border-[#DC2626]/30 text-xs text-[#DC2626] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="bg-white p-6 rounded-3xl border border-[#DDE2E6] shadow-sm space-y-4">
        {/* Account Role Selector */}
        <div className="grid grid-cols-2 gap-3 pb-2">
          <button
            type="button"
            onClick={() => setRole("CUSTOMER")}
            className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
              role === "CUSTOMER"
                ? "bg-orange-50 border-[#FF5E00] text-[#FF5E00]"
                : "border-[#DDE2E6] text-[#333333] hover:bg-[#F7F9FA]"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Customer</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("SELLER")}
            className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
              role === "SELLER"
                ? "bg-orange-50 border-[#FF5E00] text-[#FF5E00]"
                : "border-[#DDE2E6] text-[#333333] hover:bg-[#F7F9FA]"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Become a Seller</span>
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1C2A39] mb-1">Full Name</label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Asad Ali"
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F7F9FA] text-xs text-[#333333] rounded-xl border border-[#DDE2E6] focus:outline-none focus:border-[#FF5E00]"
            />
            <User className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1C2A39] mb-1">Email Address</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. asad@gmail.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F7F9FA] text-xs text-[#333333] rounded-xl border border-[#DDE2E6] focus:outline-none focus:border-[#FF5E00]"
            />
            <Mail className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1C2A39] mb-1">Phone Number</label>
          <div className="relative">
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 300 1234567"
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F7F9FA] text-xs text-[#333333] rounded-xl border border-[#DDE2E6] focus:outline-none focus:border-[#FF5E00]"
            />
            <Phone className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1C2A39] mb-1">Password</label>
          <div className="relative">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F7F9FA] text-xs text-[#333333] rounded-xl border border-[#DDE2E6] focus:outline-none focus:border-[#FF5E00]"
            />
            <Lock className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#FF5E00] hover:bg-[#FF8C00] disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-98"
        >
          {loading ? <span>Creating account...</span> : <span>Complete Registration</span>}
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="text-center pt-2 text-xs text-[#777777]">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-[#FF5E00] hover:text-[#FF8C00] hover:underline">
            Log In Here
          </Link>
        </div>
      </form>
    </div>
  );
}
