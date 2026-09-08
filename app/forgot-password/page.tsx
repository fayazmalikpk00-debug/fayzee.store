"use client";

import { AlertCircle, ArrowLeft, CheckCircle2, Mail, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process request.");
      }

      setSuccessMsg(
        data.message ||
          "If an account with that email exists, a password reset link has been sent."
      );
      setEmail("");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block group">
            <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-md mx-auto flex items-center justify-center border border-[#DDE2E6] group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="FAYZEE" className="w-full h-full object-contain" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-[#1C2A39]">Forgot Password</h1>
          <p className="text-xs text-[#777777] max-w-xs mx-auto">
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-50 rounded-2xl border border-[#DC2626]/30 text-xs text-[#DC2626] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>Reset link dispatched</span>
            </div>
            <p className="text-emerald-700 leading-relaxed">
              {successMsg} Please check your inbox (and spam folder). The link will expire in 30 minutes.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-3xl border border-[#DDE2E6] shadow-sm space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-[#1C2A39] mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#F7F9FA] text-xs text-[#333333] rounded-xl border border-[#DDE2E6] focus:outline-none focus:border-[#FF5E00] transition"
              />
              <Mail className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FF5E00] hover:bg-[#FF8C00] disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-98"
          >
            {loading ? <span>Sending Reset Link...</span> : <span>Send Reset Link</span>}
            <Send className="w-4 h-4" />
          </button>

          <div className="text-center pt-2 text-xs text-[#777777]">
            Remember your password?{" "}
            <Link href="/login" className="font-bold text-[#FF5E00] hover:text-[#FF8C00] hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3 inline" /> Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
