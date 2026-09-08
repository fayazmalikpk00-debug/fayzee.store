import { CheckCircle2, Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#1C2A39] text-[#E8EDF2] mt-20 border-t border-[#243345]">
      {/* Trust Badges Banner */}
      <div className="border-b border-[#243345] bg-[#15202B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#FF5E00]/15 border border-[#FF5E00]/30 flex items-center justify-center text-[#FF5E00] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Express Nationwide Delivery</h4>
              <p className="text-xs text-slate-300">Fast, insured door-to-door delivery</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Authentic Guarantee</h4>
              <p className="text-xs text-slate-300">Verified official seller network</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#FF8C00]/15 border border-[#FF8C00]/30 flex items-center justify-center text-[#FF8C00] shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">7-Day Free Return Policy</h4>
              <p className="text-xs text-slate-300">Hassle-free refunds & exchanges</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#FF5E00]/15 border border-[#FF5E00]/30 flex items-center justify-center text-[#FF5E00] shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24/7 AI & Human Support</h4>
              <p className="text-xs text-slate-300">Instant answers with Fayzee AI</p>
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
              <span className="text-[10px] font-bold text-[#FF5E00] tracking-wider uppercase mt-1 block">
                Shop More • Live Better
              </span>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-[#E8EDF2]/80 max-w-sm">
            Fayzee is Pakistan's premier multi-vendor commerce platform, connecting authentic sellers with millions of customers with transparent pricing, guaranteed authenticity, and next-gen AI shopping.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="px-3 py-1 bg-slate-800 text-slate-200 text-xs rounded-full border border-slate-700">
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
            <li><Link href="/category/smartphones-tablets" className="text-[#E8EDF2] hover:text-[#FF8C00] transition">Smartphones & Tablets</Link></li>
            <li><Link href="/category/laptops-computers" className="text-[#E8EDF2] hover:text-[#FF8C00] transition">Laptops & Computers</Link></li>
            <li><Link href="/category/audio-headphones" className="text-[#E8EDF2] hover:text-[#FF8C00] transition">Audio & Headphones</Link></li>
            <li><Link href="/category/mens-footwear" className="text-[#E8EDF2] hover:text-[#FF8C00] transition">Footwear & Sneakers</Link></li>
            <li><Link href="/category/home-appliances" className="text-[#E8EDF2] hover:text-[#FF8C00] transition">Home & Kitchen</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">Customer Care</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/help" className="text-[#E8EDF2] hover:text-[#FF8C00] transition">Help Center & FAQ</Link></li>
            <li><Link href="/orders" className="text-[#E8EDF2] hover:text-[#FF8C00] transition">Track Your Order</Link></li>
            <li><Link href="/help" className="text-[#E8EDF2] hover:text-[#FF8C00] transition">Returns & Refunds</Link></li>
            <li><Link href="/help" className="text-[#E8EDF2] hover:text-[#FF8C00] transition">Payment Methods</Link></li>
            <li><Link href="/help" className="text-[#E8EDF2] hover:text-[#FF8C00] transition">Contact Support</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">Sell on Fayzee</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/seller/register" className="text-[#FF5E00] font-bold hover:text-[#FF8C00] hover:underline">Register Store</Link></li>
            <li><Link href="/seller/dashboard" className="text-[#E8EDF2] hover:text-[#FF8C00] transition">Seller Center Login</Link></li>
            <li><Link href="/help" className="text-[#E8EDF2] hover:text-[#FF8C00] transition">Seller Guidelines</Link></li>
            <li><Link href="/help" className="text-[#E8EDF2] hover:text-[#FF8C00] transition">Commission Structure</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#243345] py-6 text-xs text-[#E8EDF2]/70 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <p>© {new Date().getFullYear()} Fayzee Inc. All rights reserved. Shop Smart. Shop Easy.</p>
        <div className="flex items-center gap-3 text-[11px] text-[#E8EDF2]/60">
          <Link href="/seller/dashboard" className="hover:text-[#FF8C00] transition">Seller Center</Link>
          <span>•</span>
          <Link href="/admin/login" className="hover:text-[#FF8C00] transition">Admin Portal</Link>
        </div>
      </div>
    </footer>
  );
}
