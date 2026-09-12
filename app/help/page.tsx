import { ContactSupportSection } from "@/components/help/ContactSupportSection";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  Package,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Customer Help & Support Center | Fayzee Store Pakistan",
  description:
    "Contact Fayzee customer care, find answers to common questions about orders, payments, returns, seller registration, or reach us via email at itsfayzeepk00@gmail.com.",
  alternates: {
    canonical: "https://www.fayzee.store/help",
  },
};

export default function HelpPage() {
  const faqs = [
    {
      q: "How does Fayzee ensure product authenticity?",
      a: "All sellers on Fayzee undergo rigorous business verification (NTN, CNIC, and brand authorization checks). Products listed under official brand stores are 100% genuine with official warranties.",
    },
    {
      q: "What payment methods are supported?",
      a: "Fayzee supports Cash on Delivery (COD) nationwide, as well as instant online payment via Visa, Mastercard, and UnionPay with 3D Secure verification powered by Safepay.",
    },
    {
      q: "What is Fayzee's return policy?",
      a: "We offer a 7-day hassle-free return window for items that are defective, damaged, or significantly not as described. Simply navigate to your order details to request a return or view our official Return & Refund Policy.",
    },
    {
      q: "How long does delivery take in Pakistan?",
      a: "Standard delivery takes 2 to 4 business days in major cities (Karachi, Lahore, Islamabad, Peshawar, Rawalpindi) and 3 to 6 business days for other regional areas via verified courier partners.",
    },
    {
      q: "How does Fayzee AI shopping assistance work?",
      a: "Fayzee AI connects directly to our authoritative product catalog and verified seller database to search specifications, compare phones or laptops, verify stock, and help you track orders in real-time.",
    },
    {
      q: "How do I become a seller on Fayzee?",
      a: "Click on 'Become a Seller' in the navbar or visit /seller/register. Fill out your business credentials and store profile. Our administrator team reviews and approves applications within 24-48 hours.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#FAFAF8] py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 1. Header Banner */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8A96B]/15 border border-[#C8A96B]/30 text-xs font-black text-[#C8A96B] uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Support & Trust Center
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B0F14] tracking-tight">
            How Can We Assist You Today?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Find answers to common questions about orders, payments, shipping, returns, or get in touch with our live support operations team.
          </p>
        </div>

        {/* 2. Key Support Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/orders"
            className="p-6 bg-white rounded-3xl border border-[#E8E5DC] hover:border-[#C8A96B] shadow-xs hover:shadow-md transition space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0B0F14] text-sm group-hover:text-[#C8A96B] transition flex items-center justify-between">
              <span>Shipping & Delivery</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track active parcels, view courier delivery estimates, and inspect live courier statuses.
            </p>
          </Link>

          <Link
            href="/return-refund-policy"
            className="p-6 bg-white rounded-3xl border border-[#E8E5DC] hover:border-[#C8A96B] shadow-xs hover:shadow-md transition space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0B0F14] text-sm group-hover:text-[#C8A96B] transition flex items-center justify-between">
              <span>Returns & Refunds</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              7-day easy claim window, money-back procedures, and seller return protocols.
            </p>
          </Link>

          <Link
            href="/terms-and-conditions"
            className="p-6 bg-white rounded-3xl border border-[#E8E5DC] hover:border-[#C8A96B] shadow-xs hover:shadow-md transition space-y-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0B0F14] text-sm group-hover:text-[#C8A96B] transition flex items-center justify-between">
              <span>Buyer Protection</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              100% money-back guarantee, genuine brands, and verified escrow transactions.
            </p>
          </Link>
        </div>

        {/* 3. Frequently Asked Questions */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E8E5DC] shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-[#0B0F14] flex items-center gap-2.5">
              <HelpCircle className="w-5 h-5 text-[#C8A96B]" />
              <span>Frequently Asked Questions</span>
            </h2>
            <span className="text-xs text-slate-400 font-semibold">
              {faqs.length} Common Inquiries
            </span>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="p-5 bg-[#F5F3EE] rounded-2xl border border-[#E8E5DC] space-y-2"
              >
                <h4 className="font-bold text-[#0B0F14] text-xs sm:text-sm">
                  {faq.q}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Interactive Real Contact Channels & Email Support Ticket Form */}
        <ContactSupportSection />
      </div>
    </main>
  );
}
