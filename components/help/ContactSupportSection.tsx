"use client";

import {
  AlertCircle,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

export function ContactSupportSection() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [category, setCategory] = useState("Order Status & Delivery");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ticketResult, setTicketResult] = useState<{
    ticketId: string;
    message: string;
  } | null>(null);

  const handleCopy = (text: string, type: "email" | "phone") => {
    navigator.clipboard.writeText(text);
    if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2500);
    }
  };

  const handleOpenAI = () => {
    window.dispatchEvent(new CustomEvent("open-fayzee-ai"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!message.trim() || message.trim().length < 5) {
      setErrorMessage("Please enter a message (at least 5 characters).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          orderNumber,
          category,
          subject: subject.trim() || `${category} - ${name}`,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit support inquiry.");
      }

      setTicketResult({
        ticketId: data.ticketId,
        message: data.message,
      });

      // Clear fields
      setName("");
      setEmail("");
      setPhone("");
      setOrderNumber("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-8" id="contact-support">
      {/* Section Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-black text-[#C8A96B] uppercase tracking-wider">
          Direct Customer Assistance
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[#0B0F14]">
          Get in Touch with Our Team
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Need help with an order, return, or seller inquiry? Reach out via direct email, WhatsApp, or submit a support ticket below.
        </p>
      </div>

      {/* 1. Quick Contact Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Email Support Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8E5DC] shadow-sm hover:border-[#C8A96B] transition space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#C8A96B]/15 text-[#C8A96B] flex items-center justify-center font-bold">
              <Mail className="w-6 h-6 text-[#C8A96B]" />
            </div>
            <h3 className="font-bold text-sm text-[#0B0F14]">Official Email Support</h3>
            <p className="text-xs text-slate-500">
              Direct inbox monitored 24/7 by our dedicated support department.
            </p>
            <p className="font-mono text-xs font-black text-slate-900 bg-[#F5F3EE] px-3 py-1.5 rounded-xl border border-slate-200 select-all">
              support@fayzee.store
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleCopy("support@fayzee.store", "email")}
              className="w-full py-2 px-3 rounded-xl bg-[#0B0F14] hover:bg-[#161F2B] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Email Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#C8A96B]" />
                  <span>Copy Email Address</span>
                </>
              )}
            </button>

            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=support@fayzee.store&su=Customer+Support+Inquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0B0F14] border border-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span>Compose in Gmail</span>
            </a>
          </div>
        </div>

        {/* WhatsApp Support Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8E5DC] shadow-sm hover:border-[#C8A96B] transition space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Phone className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-bold text-sm text-[#0B0F14]">WhatsApp & Phone Helpline</h3>
            <p className="text-xs text-slate-500">
              Immediate WhatsApp chat with verified representatives in Pakistan.
            </p>
            <p className="font-mono text-xs font-black text-slate-900 bg-[#F5F3EE] px-3 py-1.5 rounded-xl border border-slate-200 select-all">
              +92 330 6767357
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <a
              href="https://wa.me/923306767357?text=Assalam-o-Alaikum%20Fayzee%20Support,%20I%20need%20assistance%20with%20an%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat on WhatsApp</span>
            </a>

            <button
              onClick={() => handleCopy("03306767357", "phone")}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0B0F14] border border-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedPhone ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Number Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Phone Number</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Fayzee AI Shopping Co-Pilot */}
        <div className="bg-gradient-to-br from-[#0B0F14] via-[#161F2B] to-[#0B0F14] text-white rounded-3xl p-6 border border-[#C8A96B]/30 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#C8A96B]/20 text-[#C8A96B] flex items-center justify-center font-bold">
              <Bot className="w-6 h-6 text-[#C8A96B]" />
            </div>
            <h3 className="font-bold text-sm text-white">Instant AI Co-Pilot</h3>
            <p className="text-xs text-slate-300">
              Get immediate answers about product specs, laptop/phone comparisons, and order status.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] text-[11px] font-bold">
              <Sparkles className="w-3 h-3 animate-spin" />
              <span>Available 24/7 Instantly</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleOpenAI}
              className="w-full py-2 px-3 rounded-xl bg-[#C8A96B] hover:bg-[#D4B97F] text-[#0B0F14] font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Fayzee AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Embedded Real Support Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E5DC] shadow-card">
        {ticketResult ? (
          /* Success Screen */
          <div className="text-center py-10 space-y-5 max-w-lg mx-auto animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border-2 border-emerald-500 shadow-md">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">
                Inquiry Dispatched Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Your message has been assigned Ticket Reference:
              </p>
              <div className="inline-block px-4 py-2 bg-[#F5F3EE] rounded-2xl border border-slate-300 font-mono font-black text-sm text-slate-900 tracking-wider select-all">
                {ticketResult.ticketId}
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Our customer operations team at <strong>support@fayzee.store</strong> will review your request and reply to your provided email address within <strong>2 to 4 business hours</strong>.
            </p>

            <button
              onClick={() => setTicketResult(null)}
              className="px-6 py-2.5 rounded-full bg-[#0B0F14] hover:bg-[#161F2B] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Send Another Inquiry
            </button>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-[#0B0F14] flex items-center gap-2">
                <Send className="w-5 h-5 text-[#C8A96B]" />
                <span>Submit a Customer Support Ticket</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fill out the details below and an official case will be generated for our support desk.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Fayaz Ullah"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAFAF8] focus:bg-white focus:border-[#C8A96B] focus:ring-2 focus:ring-[#C8A96B]/20 outline-none text-xs font-medium transition"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAFAF8] focus:bg-white focus:border-[#C8A96B] focus:ring-2 focus:ring-[#C8A96B]/20 outline-none text-xs font-medium transition"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0330 6767357"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAFAF8] focus:bg-white focus:border-[#C8A96B] focus:ring-2 focus:ring-[#C8A96B]/20 outline-none text-xs font-medium transition"
                />
              </div>

              {/* Order Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Order Number (If applicable)
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. FYZ-82910"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAFAF8] focus:bg-white focus:border-[#C8A96B] focus:ring-2 focus:ring-[#C8A96B]/20 outline-none text-xs font-medium transition"
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Inquiry Department
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAFAF8] focus:bg-white focus:border-[#C8A96B] focus:ring-2 focus:ring-[#C8A96B]/20 outline-none text-xs font-medium transition"
                >
                  <option value="Order Status & Delivery">Order Status & Delivery Delay</option>
                  <option value="Returns & Refunds">Return Request & Refund Status</option>
                  <option value="Payment & Gateway">Payment / Safepay Verification</option>
                  <option value="Product Authenticity">Product Quality & Warranty</option>
                  <option value="Seller Account">Seller Onboarding & Payouts</option>
                  <option value="General Inquiry">General Marketplace Question</option>
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your inquiry"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-[#FAFAF8] focus:bg-white focus:border-[#C8A96B] focus:ring-2 focus:ring-[#C8A96B]/20 outline-none text-xs font-medium transition"
                />
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Detailed Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your request, issue, or question in detail so our support team can assist you swiftly..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#FAFAF8] focus:bg-white focus:border-[#C8A96B] focus:ring-2 focus:ring-[#C8A96B]/20 outline-none text-xs font-medium transition resize-y"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Protected by Fayzee Marketplace Buyer Protection & SSL Encryption.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-full bg-[#0B0F14] hover:bg-[#161F2B] text-white font-bold text-xs flex items-center gap-2 transition shadow-md cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C8A96B]" />
                    <span>Transmitting Ticket...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#C8A96B]" />
                    <span>Send Support Ticket</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
