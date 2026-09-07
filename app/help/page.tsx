import { HelpCircle, Mail, Phone, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  const faqs = [
    {
      q: "How does Fayzee ensure product authenticity?",
      a: "All sellers on Fayzee undergo rigorous business verification (NTN, CNIC, and brand authorization checks). Products listed under official brand stores are 100% genuine with official warranties.",
    },
    {
      q: "What payment methods are supported?",
      a: "Fayzee supports Cash on Delivery (COD) nationwide, as well as instant online payment via Visa, Mastercard, and UnionPay with 3D Secure verification.",
    },
    {
      q: "What is Fayzee's return policy?",
      a: "We offer a 7-day hassle-free return window for items that are defective, damaged, or significantly not as described. Simply navigate to your order details to request a return.",
    },
    {
      q: "How does Fayzee AI shopping assistance work?",
      a: "Fayzee AI connects directly to our authoritative product catalog and verified seller database to search specifications, compare phones or laptops, verify stock, and help you track orders.",
    },
    {
      q: "How do I become a seller on Fayzee?",
      a: "Click on 'Become a Seller' in the navbar or visit `/seller/register`. Fill out your business credentials and store profile. Our administrator team reviews and approves applications within 24-48 hours.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
          Support & Trust
        </span>
        <h1 className="text-3xl font-black text-slate-900">How can we help you?</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Find answers to common questions about orders, payments, returns, and selling on Fayzee.
        </p>
      </div>

      {/* Support categories */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
          <Truck className="w-6 h-6 text-brand-600" />
          <h4 className="font-bold text-slate-900 text-sm">Shipping & Delivery</h4>
          <p className="text-slate-500">Track packages, view delivery estimates, and report courier delays.</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
          <RotateCcw className="w-6 h-6 text-amber-600" />
          <h4 className="font-bold text-slate-900 text-sm">Returns & Refunds</h4>
          <p className="text-slate-500">Initiate returns within 7 days and track your refund status.</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <h4 className="font-bold text-slate-900 text-sm">Buyer Protection</h4>
          <p className="text-slate-500">100% money-back guarantee on fraudulent or unverified goods.</p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-600" /> Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{faq.q}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact banner */}
      <div className="bg-gradient-to-r from-fayzee-dark to-brand-900 text-white p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-bold text-base">Still need assistance?</h3>
          <p className="text-xs text-slate-300">Our customer team is available 24/7 or you can chat with Fayzee AI.</p>
        </div>
        <div className="flex gap-2">
          <a
            href="mailto:support@fayzee.com"
            className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-100 transition flex items-center gap-1.5"
          >
            <Mail className="w-4 h-4" /> Email Us
          </a>
        </div>
      </div>
    </div>
  );
}
