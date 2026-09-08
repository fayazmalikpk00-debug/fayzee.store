import { CheckCircle2, Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-fayzee-dark text-slate-400 mt-20 border-t border-slate-800">
      {/* Trust Badges Banner */}
      <div className="border-b border-slate-800/80 bg-[#080d1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Express Nationwide Delivery</h4>
              <p className="text-xs text-slate-400">Fast, insured door-to-door delivery</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Authentic Guarantee</h4>
              <p className="text-xs text-slate-400">Verified official seller network</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">7-Day Free Return Policy</h4>
              <p className="text-xs text-slate-400">Hassle-free refunds & exchanges</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
        <div className="sm:col-span-2 md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center shrink-0">
              <img
                src="/logo.png"
                alt="FAYZEE"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tight block leading-none">
                FAYZEE
              </span>
              <span className="text-[10px] font-bold text-brand-400 tracking-wider uppercase mt-1 block">
                Shop More • Live Better
              </span>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
            Fayzee is Pakistan's premier multi-vendor commerce platform, connecting authentic sellers with millions of customers with transparent pricing, guaranteed authenticity, and next-gen AI shopping.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
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
