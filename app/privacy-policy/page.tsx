import { Shield, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Fayzee Store",
  description: "Official Privacy Policy of Fayzee Store. Learn how we collect, protect, and handle your data.",
  alternates: {
    canonical: "https://www.fayzee.store/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#0B0F14] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[#E8E5DC] p-6 sm:p-12 shadow-sm space-y-8">
        {/* Header */}
        <div className="border-b border-[#E8E5DC] pb-6 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C8A96B] flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#C8A96B]" />
            <span>Customer Data Protection</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B0F14] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500">
            Last Updated & Effective: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} • Fayzee Store (Pvt) Ltd.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C8A96B]" />
              <span>1. Overview & Commitment</span>
            </h2>
            <p>
              Welcome to <strong>Fayzee Store</strong> (accessible at <Link href="https://fayzee.store" className="text-[#C8A96B] underline font-semibold">https://fayzee.store</Link>). We respect your personal privacy and are committed to protecting your personal data in strict compliance with the laws of the Islamic Republic of Pakistan, State Bank regulations, and global data protection standards.
            </p>
            <p>
              This Privacy Policy describes how we collect, use, process, and safeguard your personal information when you visit our website, register an account, make purchases, or contact customer care.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#C8A96B]" />
              <span>2. Information We Collect</span>
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Personal Identification Data:</strong> Full name, email address, mobile/WhatsApp telephone number.</li>
              <li><strong>Delivery & Logistics Data:</strong> Shipping destination address, street, city, postal code, recipient contact number.</li>
              <li><strong>Payment Transaction Data:</strong> Transaction ID, selected payment method (Card, Safepay, JazzCash, EasyPaisa, or Cash on Delivery). <em>Note: Fayzee Store does not store raw credit/debit card numbers or CVV codes; all card transactions are tokenized and processed via certified PCI-DSS compliant payment gateways (Safepay).</em></li>
              <li><strong>Technical & Account Data:</strong> IP address, browser type, device information, and session logs for fraud prevention and security monitoring.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#C8A96B]" />
              <span>3. How We Use Your Information</span>
            </h2>
            <p>Your information is used strictly for legitimate commercial e-commerce purposes, including:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Processing, approving, and dispatching your orders.</li>
              <li>Generating official commercial sales tax invoices.</li>
              <li>Communicating order status updates, courier tracking numbers, and delivery notices.</li>
              <li>Facilitating secure 3D-Secure payment settlements and detecting unauthorized or fraudulent transactions.</li>
              <li>Providing dedicated customer care, dispute resolution, and warranty/return services.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C8A96B]" />
              <span>4. Third-Party Disclosures</span>
            </h2>
            <p>
              We do not sell, rent, or trade your personal information to third-party marketers. We only share necessary order data with authorized operational partners:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Payment Processors (Safepay / 1Link):</strong> For encrypted payment verification and bank settlements.</li>
              <li><strong>Logistics & Courier Partners (Trax, PostEx, TCS, Leopard):</strong> Strictly for physical order delivery handover and doorstep dispatch.</li>
              <li><strong>Regulatory & Legal Authorities:</strong> If required by applicable Pakistani law, court order, or law enforcement agency.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14]">5. Data Security & Storage</h2>
            <p>
              We implement industry-standard AES-256 encryption, TLS 1.3 cryptographic protocols, secure PostgreSQL database storage, and regular security audits to protect against unauthorized data breach or loss.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0B0F14]">6. Contact & Data Protection Officer</h2>
            <p>
              If you have any questions, inquiries, or requests regarding this Privacy Policy or wish to delete your account data, please contact our legal and compliance desk:
            </p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 font-mono">
              <p><strong>Entity:</strong> Fayzee Store (Pvt) Ltd.</p>
              <p><strong>Support Email:</strong> itsfayzeepk00@gmail.com</p>
              <p><strong>Primary Inquiries:</strong> itsfayzeepk00@gmail.com</p>
              <p><strong>Location:</strong> Dalazak Road, Peshawar, Khyber Pakhtunkhwa, Pakistan</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
