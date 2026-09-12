import { FileCheck, Shield, AlertCircle, CheckCircle2, Scale } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Terms and Conditions | Fayzee Store",
  description:
    "Read the official Terms and Conditions for Fayzee Store. Review our user agreement, buyer and seller policies, order terms, and marketplace procedures.",
  alternates: {
    canonical: "https://www.fayzee.store/terms-and-conditions",
  },
  openGraph: {
    title: "Terms and Conditions | Fayzee Store",
    description:
      "Read the official Terms and Conditions for Fayzee Store. Review our user agreement, buyer and seller policies, order terms, and marketplace procedures.",
    url: "https://www.fayzee.store/terms-and-conditions",
    siteName: "FAYZEE",
    type: "website",
    locale: "en_PK",
    images: [
      {
        url: "https://www.fayzee.store/logo.png",
        width: 800,
        height: 800,
        alt: "FAYZEE Official Logo",
      },
    ],
  },
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#0B0F14] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[#E8E5DC] p-6 sm:p-12 shadow-sm space-y-8">
        {/* Header */}
        <div className="border-b border-[#E8E5DC] pb-6 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C8A96B] flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-[#C8A96B]" />
            <span>Legal Agreement</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B0F14] tracking-tight">
            Terms and Conditions
          </h1>
          <p className="text-xs text-slate-500">
            Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} • Fayzee Store
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C8A96B]" />
              <span>1. Agreement to Terms</span>
            </h2>
            <p>
              By accessing, browsing, or utilizing the services provided on <strong>Fayzee Store</strong> (<Link href="https://fayzee.store" className="text-[#C8A96B] underline font-semibold">https://fayzee.store</Link>), you agree to be legally bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please do not use this site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#C8A96B]" />
              <span>2. Multi-Vendor Marketplace Operations</span>
            </h2>
            <p>
              Fayzee operates as a curated e-commerce marketplace platform connecting independent verified sellers and brands with retail buyers across Pakistan.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Each product is cataloged with accurate descriptions, specifications, pricing, and stock status.</li>
              <li>Sellers must adhere strictly to authentic merchandise guidelines. Counterfeit goods are strictly prohibited and result in permanent seller termination.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14] flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#C8A96B]" />
              <span>3. Pricing & Payment Policy</span>
            </h2>
            <p>
              All prices displayed on Fayzee Store are denominated in <strong>Pakistani Rupees (PKR)</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Payment Options:</strong> We accept Debit/Credit Cards (processed securely via Safepay with 3D-Secure bank OTP verification), JazzCash, EasyPaisa, and Cash on Delivery (COD).</li>
              <li><strong>Price Inaccuracies:</strong> In the rare event of a typographical pricing error, Fayzee reserves the right to cancel unfulfilled orders with a 100% prompt refund.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#C8A96B]" />
              <span>4. Shipping & Delivery</span>
            </h2>
            <p>
              Orders are dispatched via licensed national courier services (TCS, Trax, PostEx, Leopard). Standard delivery across major cities in Pakistan is typically 2 to 4 business days. Real-time courier tracking numbers are provided upon dispatch.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14]">5. Governing Law & Jurisdiction</h2>
            <p>
              These Terms and Conditions shall be governed by, construed, and enforced in accordance with the laws of the <strong>Islamic Republic of Pakistan</strong>. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts of Pakistan.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14]">6. Contact Information</h2>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 font-mono">
              <p><strong>Platform:</strong> Fayzee Store</p>
              <p><strong>Customer Care:</strong> itsfayzeepk00@gmail.com</p>
              <p><strong>Founder / Principal:</strong> Fayaz Ullah</p>
              <p><strong>Address:</strong> Dalazak Road, Peshawar, KP, Pakistan</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
