import { Building2, ShieldCheck, UserCheck, MapPin, Mail, Phone, Globe } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Ownership Statement | Fayzee Store",
  description:
    "Official Ownership and Governance Statement for Fayzee Store. Learn about our marketplace ownership, business operations, and official platform management.",
  alternates: {
    canonical: "https://www.fayzee.store/ownership-statement",
  },
  openGraph: {
    title: "Ownership Statement | Fayzee Store",
    description:
      "Official Ownership and Governance Statement for Fayzee Store. Learn about our marketplace ownership, business operations, and official platform management.",
    url: "https://www.fayzee.store/ownership-statement",
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

export default function OwnershipStatementPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#0B0F14] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[#E8E5DC] p-6 sm:p-12 shadow-sm space-y-8">
        {/* Header */}
        <div className="border-b border-[#E8E5DC] pb-6 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C8A96B] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#C8A96B]" />
            <span>Official Legal Disclosure</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B0F14] tracking-tight">
            Ownership Statement & Governance
          </h1>
          <p className="text-xs text-slate-500">
            Official Statement of Business Ownership & Governance • Fayzee Store
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#C8A96B]" />
              <span>1. Commercial Entity & Domain Ownership</span>
            </h2>
            <p>
              This website, <strong>https://fayzee.store</strong>, including all its content, digital properties, commercial checkout systems, and brand assets, is the sole proprietary commercial property of:
            </p>
            <div className="p-5 bg-[#FBFBFA] rounded-2xl border border-slate-200 text-xs space-y-2">
              <p><strong>Legal Trading Name:</strong> Fayzee Store</p>
              <p><strong>Business Type:</strong> Sole Proprietorship / E-Commerce Retail Marketplace</p>
              <p><strong>Operating Territory:</strong> Islamic Republic of Pakistan</p>
              <p><strong>Official Web Domain:</strong> <Link href="https://fayzee.store" className="text-[#C8A96B] underline font-semibold">https://fayzee.store</Link></p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#C8A96B]" />
              <span>2. Beneficial Ownership & Key Management</span>
            </h2>
            <p>
              In compliance with the regulations of the State Bank of Pakistan (SBP), financial partners, and authorized payment gateways (Safepay), the beneficial ownership of this commercial enterprise is declared as follows:
            </p>
            <div className="p-5 bg-[#FBFBFA] rounded-2xl border border-slate-200 text-xs space-y-2">
              <p><strong>Principal Owner & Founder:</strong> Fayaz Ullah</p>
              <p><strong>Designation:</strong> Proprietor / Chief Executive</p>
              <p><strong>Citizenship:</strong> Pakistani Citizen</p>
              <p><strong>Ownership Share:</strong> 100% Sole Ownership</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C8A96B]" />
              <span>3. Registered Operating Address</span>
            </h2>
            <div className="p-5 bg-[#FBFBFA] rounded-2xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">Fayzee Store Corporate Office</p>
              <p>Near Umar Pharmacy, Dalazak Road</p>
              <p>Peshawar, District Peshawar</p>
              <p>Khyber Pakhtunkhwa, Pakistan</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#C8A96B]" />
              <span>4. Official Customer & Merchant Contact Desk</span>
            </h2>
            <p>For official inquiries, supplier registrations, or regulatory communications:</p>
            <ul className="list-disc pl-5 space-y-1.5 font-mono text-xs">
              <li>General Customer Inquiries: <strong>itsfayzeepk00@gmail.com</strong></li>
              <li>Direct Owner Communications: <strong>itsfayzeepk00@gmail.com</strong></li>
              <li>Merchant Settlement / Billing Desk: <strong>itsfayzeepk00@gmail.com</strong></li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-slate-200">
            <p className="text-[11px] text-slate-400 italic">
              This statement is publicly published to ensure complete transparency, regulatory compliance, consumer trust, and adherence to international financial settlement standards.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
