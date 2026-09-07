"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail, ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";

function AdminLoginForm() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      // Ensure that this account is an administrator
      if (data.user.role !== "ADMIN" && data.user.role !== "SUPER_ADMIN") {
        // Log out immediately if non-admin attempts login here
        await fetch("/api/auth/logout", { method: "POST" });
        throw new Error("Access Denied: This portal is strictly reserved for Fayzee platform administrators.");
      }

      await refreshUser();
      router.push("/admin/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in to Admin Portal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 via-brand-900 to-slate-800 border border-slate-700/80 flex items-center justify-center text-brand-400 mx-auto shadow-xl">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-2">
            <ShieldAlert className="w-3 h-3" /> Restricted Admin Portal
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fayzee Operations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in with authorized administrative credentials to manage marketplace operations
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Admin Login Form */}
      <form onSubmit={handleSubmit} className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-100 space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Admin Email Address</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@fayzee.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:bg-white transition"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Secure Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 focus:bg-white transition"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Verifying Admin Credentials...</span>
          ) : (
            <>
              <span>Authorize & Access Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="pt-2 border-t border-slate-100 text-center">
          <Link
            href="/"
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition inline-flex items-center gap-1"
          >
            ← Return to Marketplace Storefront
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-center text-xs text-slate-500">Loading admin portal...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
