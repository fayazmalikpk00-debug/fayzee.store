"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { AlertCircle, ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        throw new Error(data.error || "Login failed.");
      }

      await refreshUser();

      if (data.user.role === "SELLER") {
        router.push("/seller/dashboard");
      } else if (data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push(redirectUrl);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block group">
          <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-md mx-auto flex items-center justify-center border border-slate-200/80 group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="FAYZEE" className="w-full h-full object-contain" />
          </div>
        </Link>
        <h1 className="text-2xl font-black text-slate-900">Sign in to FAYZEE</h1>
        <p className="text-xs text-slate-500">
          Enter your email and password to access your account
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-700">Password</label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-semibold text-brand-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-1.5"
        >
          {loading ? <span>Authenticating...</span> : <span>Sign In to Account</span>}
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="text-center pt-2 text-xs text-slate-500">
          Don't have an account yet?{" "}
          <Link href="/register" className="font-bold text-brand-600 hover:underline">
            Register Here
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Suspense fallback={<div className="text-center text-xs text-slate-500">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
