import { CheckCircle2, Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0B0F14] text-[#E8EDF2] mt-20 border-t border-[#1C2530]">
      {/* Trust Badges Banner */}
      <div className="border-b border-[#141B22] bg-[#060A0E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#C8A96B]/10 border border-[#C8A96B]/25 flex items-center justify-center text-[#C8A96B] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Express Nationwide Delivery</h4>
              <p className="text-xs text-[#8A8F98]">Fast, insured door-to-door delivery</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Authentic Guarantee</h4>
              <p className="text-xs text-[#8A8F98]">Verified official seller network</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#C8A96B]/10 border border-[#C8A96B]/25 flex items-center justify-center text-[#C8A96B] shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">7-Day Free Return Policy</h4>
              <p className="text-xs text-[#8A8F98]">Hassle-free refunds & exchanges</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#C8A96B]/10 border border-[#C8A96B]/25 flex items-center justify-center text-[#C8A96B] shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24/7 AI & Human Support</h4>
              <p className="text-xs text-[#8A8F98]">Instant answers with Fayzee AI</p>
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
              <span className="text-xs font-bold text-[#C8A96B] tracking-wider uppercase mt-1 block">
                Shop More • Live Better
              </span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[#8A8F98] max-w-sm">
            Fayzee is Pakistan's premier multi-vendor commerce platform, connecting authentic sellers with millions of customers with transparent pricing, guaranteed authenticity, and next-gen AI shopping.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="px-3 py-1 bg-[#161F2B] text-slate-200 text-xs sm:text-sm rounded-full border border-slate-700/60">
              🇵🇰 Pakistan Official
            </span>
            <span className="px-3 py-1 bg-emerald-950/60 text-emerald-400 text-xs sm:text-sm rounded-full border border-emerald-800/40 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> PTA Approved Tech
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-3.5">Explore Categories</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/category/electronics?subcategory=smartphones-tablets" className="text-[#E8EDF2]/90 hover:text-[#C8A96B] transition">Smartphones & Tablets</Link></li>
            <li><Link href="/category/electronics?subcategory=laptops-computers" className="text-[#E8EDF2]/90 hover:text-[#C8A96B] transition">Laptops & Computers</Link></li>
            <li><Link href="/category/electronics?subcategory=audio" className="text-[#E8EDF2]/90 hover:text-[#C8A96B] transition">Audio & Headphones</Link></li>
            <li><Link href="/category/mens-fashion?subcategory=mens-footwear" className="text-[#E8EDF2]/90 hover:text-[#C8A96B] transition">Footwear & Sneakers</Link></li>
            <li><Link href="/category/home-appliances" className="text-[#E8EDF2]/90 hover:text-[#C8A96B] transition">Home & Kitchen</Link></li>
            <li><Link href="/categories" className="text-[#C8A96B] font-bold hover:underline transition">View All 18 Categories &rarr;</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-3.5">Customer Care & Policies</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/help" className="text-[#E8EDF2]/90 hover:text-[#C8A96B] transition">Help Center & FAQ</Link></li>
            <li><Link href="/orders" className="text-[#E8EDF2]/90 hover:text-[#C8A96B] transition">Track Your Order</Link></li>
            <li><Link href="/return-refund-policy" className="text-[#E8EDF2]/90 hover:text-[#C8A96B] transition">Returns & Refunds</Link></li>
            <li><Link href="/privacy-policy" className="text-[#E8EDF2]/90 hover:text-[#C8A96B] transition">Privacy Policy</Link></li>
            <li><Link href="/terms-and-conditions" className="text-[#E8EDF2]/90 hover:text-[#C8A96B] transition">Terms & Conditions</Link></li>
            <li><Link href="/ownership-statement" className="text-[#E8EDF2]/90 hover:text-[#C8A96B] transition">Ownership Statement</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-3.5">Sell on Fayzee</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/seller/register" className="text-[#C8A96B] font-bold hover:text-[#DFBE6E] hover:underline">Register Store</Link></li>
            <li><Link href="/seller/dashboard" className="text-[#E8EDF2]/90 hover:text-[#C8A96B] transition">Seller Center Login</Link></li>
            <li><Link href="/help" className="text-[#E8EDF2]/90 hover:text-[#C8A96B] transition">Seller Guidelines</Link></li>
            <li><Link href="/help" className="text-[#E8EDF2]/90 hover:text-[#C8A96B] transition">Commission Structure</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#1C2530] py-6 text-sm text-[#8A8F98] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left md:pr-48 lg:pr-56">
        <p>© {new Date().getFullYear()} Fayzee Store (Pvt) Ltd. All rights reserved. Registered in Pakistan.</p>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-3 gap-y-1 text-xs text-[#8A8F98]">
          <Link href="/privacy-policy" className="hover:text-[#C8A96B] transition">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms-and-conditions" className="hover:text-[#C8A96B] transition">Terms</Link>
          <span>•</span>
          <Link href="/return-refund-policy" className="hover:text-[#C8A96B] transition">Refund Policy</Link>
          <span>•</span>
          <Link href="/ownership-statement" className="hover:text-[#C8A96B] transition">Ownership</Link>
          <span>•</span>
          <Link href="/seller/dashboard" className="hover:text-[#C8A96B] transition">Seller Center</Link>
          <span>•</span>
          <Link href="/admin/login" className="hover:text-[#C8A96B] transition">Admin Portal</Link>
        </div>
      </div>
    </footer>
  );
}
