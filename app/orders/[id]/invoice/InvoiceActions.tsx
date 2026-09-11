"use client";

import { ArrowLeft, Check, Copy, Printer } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function InvoiceActions({
  orderId,
  orderNumber,
}: {
  orderId: string;
  orderNumber: string;
}) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <aside aria-label="Invoice Controls" className="print:hidden bg-[#0B0F14] text-white border-b border-[#C8A96B]/20 py-3.5 px-4 sm:px-8 sticky top-0 z-40 shadow-md backdrop-blur-md bg-opacity-95">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/orders/${orderId}`}
          className="inline-flex items-center gap-1.5 text-xs text-[#8A8F98] hover:text-[#C8A96B] transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order #{orderNumber}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 transition cursor-pointer"
            title="Copy Invoice Link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Link</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#C8A96B] hover:bg-[#D4B15A] text-[#0B0F14] text-xs font-bold transition shadow-sm active:scale-98 cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4 text-[#0B0F14]" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
