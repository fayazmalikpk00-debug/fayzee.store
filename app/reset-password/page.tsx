"use client";

import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!token) {
      setErrorMsg("Reset token is missing from the URL. Please click the link received in your email.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasNumber) {
      setErrorMsg("Password must contain at least one letter and one number.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-check.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while resetting your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block group">
          <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-card mx-auto flex items-center justify-center border border-[#E8E5DC] group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="FAYZEE" className="w-full h-full object-contain" />
          </div>
        </Link>
        <h1 className="text-2xl font-black text-[#0B0F14]">Set New Password</h1>
        <p className="text-xs text-[#8A8F98]">
          Create a strong password for your FAYZEE account
        </p>
      </div>

      {!token && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Missing Reset Token:</span> No valid token was detected in your link. Please open the exact link sent to your email, or{" "}
            <Link href="/forgot-password" className="font-bold underline text-amber-900">
              request a new reset link
            </Link>.
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-red-50 rounded-2xl border border-[#DC2626]/30 text-xs text-[#DC2626] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {success ? (
        <div className="bg-white p-8 rounded-3xl border border-[#E8E5DC] shadow-card text-center space-y-5">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-[#16A34A]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#0B0F14]">Password Reset Complete!</h2>
            <p className="text-xs text-[#8A8F98]">
              Your password has been securely updated. You can now log in with your new credentials.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full py-3 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] border border-[#C8A96B]/40 font-bold text-xs rounded-2xl shadow-card transition flex items-center justify-center gap-1.5 active:scale-98"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-3xl border border-[#E8E5DC] shadow-card space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-[#0B0F14] mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={!token}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters (letters & numbers)"
                className="w-full pl-10 pr-10 py-2.5 bg-[#F5F3EE] text-xs text-[#0B0F14] placeholder:text-[#8A8F98] rounded-xl border border-[#E8E5DC] focus:outline-none focus:border-[#C8A96B] focus:bg-white transition disabled:opacity-50"
              />
              <Lock className="w-4 h-4 text-[#8A8F98] absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8F98] hover:text-[#0B0F14] transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[#8A8F98] mt-1">
              Must be at least 8 characters with letters & numbers.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B0F14] mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={!token}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#F5F3EE] text-xs text-[#0B0F14] placeholder:text-[#8A8F98] rounded-xl border border-[#E8E5DC] focus:outline-none focus:border-[#C8A96B] focus:bg-white transition disabled:opacity-50"
              />
              <Lock className="w-4 h-4 text-[#8A8F98] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-3 bg-[#0B0F14] hover:bg-[#1A222C] text-[#C8A96B] border border-[#C8A96B]/40 disabled:opacity-50 font-bold text-xs rounded-2xl shadow-card transition flex items-center justify-center gap-1.5 active:scale-98"
          >
            {loading ? <span>Updating Password...</span> : <span>Reset Password</span>}
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2 text-xs text-[#8A8F98]">
            Remembered your password?{" "}
            <Link href="/login" className="font-bold text-[#C8A96B] hover:text-[#D4B15A] hover:underline">
              Return to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Suspense
        fallback={
          <div className="text-center text-xs text-slate-500 py-12">
            Loading reset form...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
