"use client";

import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { useAuth } from "@/components/providers/AuthProvider";
import { ExternalLink, Loader2, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleSignInButtonProps {
  onSuccessRedirect?: string;
  onError?: (msg: string) => void;
  className?: string;
}

const DEFAULT_GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "204528773506-pn0mi563muah1ccqgqs1ioi2h2av00ds.apps.googleusercontent.com";

export function GoogleSignInButton({
  onSuccessRedirect = "/",
  onError,
  className = "",
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string | null>(DEFAULT_GOOGLE_CLIENT_ID);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const hiddenBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Immediately load script with default/env client ID
    if (DEFAULT_GOOGLE_CLIENT_ID) {
      loadGoogleGsiScript(DEFAULT_GOOGLE_CLIENT_ID);
    }

    // 2. Fetch public Google Client ID configuration
    fetch("/api/auth/google/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.configured && data.clientId) {
          setGoogleClientId(data.clientId);
          loadGoogleGsiScript(data.clientId);
        }
      })
      .catch((err) => console.error("Error fetching Google config:", err));
  }, []);


  const loadGoogleGsiScript = (clientId: string) => {
    if (typeof window === "undefined") return;

    if (window.google?.accounts?.id) {
      initGoogleGsi(clientId);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initGoogleGsi(clientId);
    };
    document.body.appendChild(script);
  };

  const initGoogleGsi = (clientId: string) => {
    if (!window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render a hidden official Google button so we can programmatically click it or use prompt
      if (hiddenBtnRef.current) {
        window.google.accounts.id.renderButton(hiddenBtnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
        });
      }

      // Display Google One Tap prompt at top right on supported browsers
      window.google.accounts.id.prompt();
    } catch (e) {
      console.error("Failed to initialize Google Identity Services:", e);
    }
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    const credential = response?.credential;
    if (!credential) {
      onError?.("Could not get Google credentials.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/google/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await refreshUser();
        router.push(onSuccessRedirect);
      } else {
        onError?.(data.error || "Failed to log in with Google.");
      }
    } catch (err: any) {
      onError?.(err.message || "Network error during Google sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!googleClientId) {
      // Show setup guidance modal if Google Client ID is not yet provided in .env/Vercel
      setShowSetupModal(true);
      return;
    }

    // If GSI rendered button exists, simulate click for the native Google popup window
    if (hiddenBtnRef.current) {
      const btn = hiddenBtnRef.current.querySelector("div[role=button]") as HTMLElement;
      if (btn) {
        btn.click();
        return;
      }
    }

    // Fallback to standard prompt or popup
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      window.location.href = "/api/auth/google";
    }
  };

  return (
    <>
      {/* Hidden container for Google's native iframe button */}
      <div ref={hiddenBtnRef} className="hidden" aria-hidden="true" />

      {/* Styled Continue with Google button matching the design */}
      <button
        type="button"
        disabled={loading}
        onClick={handleClick}
        className={`w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-[#0B0F14] border border-[#E8E5DC] font-bold text-xs rounded-2xl shadow-xs transition flex items-center justify-center gap-2.5 active:scale-98 cursor-pointer hover:border-slate-300 disabled:opacity-50 ${className}`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#0B0F14]" />
        ) : (
          <GoogleIcon className="w-4 h-4 shrink-0" />
        )}
        <span>{loading ? "Connecting Google..." : "Continue with Google"}</span>
      </button>

      {/* Setup Guide Modal if Client ID is not configured yet */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <GoogleIcon className="w-5 h-5" />
                <h3 className="font-bold text-sm text-[#0B0F14]">Google Sign-In Setup</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-black transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Google ki security policy ke tehat, Google se login karwane ke liye aapko Google Cloud Console se free <strong>Google Client ID</strong> hasil karna hoti hai taake Google aapki website ko verify kar sake.
            </p>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <p className="font-bold text-[#0B0F14] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" /> Sirf 2 Minute Ka Kaam:
              </p>
              <ol className="list-decimal pl-4 space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <li>Google Cloud Console par jayein.</li>
                <li><strong>OAuth Client ID</strong> banayein (Web application).</li>
                <li>
                  Authorized URI mein: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900 font-mono">https://fayzee.store</code> add karein.
                </li>
                <li>
                  Milnay wali <strong>Client ID</strong> ko apne Vercel / .env mein <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900 font-mono">GOOGLE_CLIENT_ID</code> ke tor par set karein.
                </li>
              </ol>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#0B0F14] text-[#C8A96B] font-bold text-xs hover:bg-[#161F2B] transition flex items-center gap-1.5 cursor-pointer"
              >
                Open Google Cloud Console <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
              >
                Theek Hai
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
