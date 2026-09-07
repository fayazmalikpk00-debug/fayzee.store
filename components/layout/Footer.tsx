import { CheckCircle2, Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-fayzee-dark text-slate-400 mt-20 border-t border-slate-800">
      {/* Trust Badges Banner */}
      <div className="border-b border-slate-800/80 bg-[#080d1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Express Nationwide Delivery</h4>
              <p className="text-xs text-slate-400">Fast, insured door-to-door delivery</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Authentic Guarantee</h4>
              <p className="text-xs text-slate-400">Verified official seller network</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">7-Day Free Return Policy</h4>
              <p className="text-xs text-slate-400">Hassle-free refunds & exchanges</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24/7 AI & Human Support</h4>
              <p className="text-xs text-slate-400">Instant answers with Fayzee AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-fayzee-coral flex items-center justify-center text-white font-bold text-lg">
              F
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">Fayzee</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
            Fayzee is Pakistan's premier multi-vendor commerce platform, connecting authentic sellers with millions of customers with transparent pricing, guaranteed authenticity, and next-gen AI shopping.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700">
              🇵🇰 Pakistan Official
            </span>
            <span className="px-3 py-1 bg-emerald-950/60 text-emerald-400 text-xs rounded-full border border-emerald-800/40 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> PTA Approved Tech
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">Explore Categories</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/category/smartphones-tablets" className="hover:text-white transition">Smartphones & Tablets</Link></li>
            <li><Link href="/category/laptops-computers" className="hover:text-white transition">Laptops & Computers</Link></li>
            <li><Link href="/category/audio-headphones" className="hover:text-white transition">Audio & Headphones</Link></li>
            <li><Link href="/category/mens-footwear" className="hover:text-white transition">Footwear & Sneakers</Link></li>
            <li><Link href="/category/home-appliances" className="hover:text-white transition">Home & Kitchen</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">Customer Care</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/help" className="hover:text-white transition">Help Center & FAQ</Link></li>
            <li><Link href="/orders" className="hover:text-white transition">Track Your Order</Link></li>
            <li><Link href="/help" className="hover:text-white transition">Returns & Refunds</Link></li>
            <li><Link href="/help" className="hover:text-white transition">Payment Methods</Link></li>
            <li><Link href="/help" className="hover:text-white transition">Contact Support</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">Sell on Fayzee</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/seller/register" className="text-amber-400 font-semibold hover:underline">Register Store</Link></li>
            <li><Link href="/seller/dashboard" className="hover:text-white transition">Seller Center Login</Link></li>
            <li><Link href="/help" className="hover:text-white transition">Seller Guidelines</Link></li>
            <li><Link href="/help" className="hover:text-white transition">Commission Structure</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800/80 py-6 text-xs text-slate-400 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <p>© {new Date().getFullYear()} Fayzee Inc. All rights reserved. Shop Smart. Shop Easy.</p>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <Link href="/seller/dashboard" className="hover:text-slate-300 transition">Seller Center</Link>
          <span>•</span>
          <Link href="/admin/login" className="hover:text-slate-300 transition">Admin Portal</Link>
        </div>
      </div>
    </footer>
  );
}
