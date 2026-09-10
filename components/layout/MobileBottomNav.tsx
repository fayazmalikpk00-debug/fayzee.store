"use client";

import { useCart } from "@/components/providers/CartProvider";
import { Heart, Home, Layers, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const handleOpenAI = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-fayzee-ai"));
  };

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      name: "Categories",
      href: "/products",
      icon: Layers,
      isActive: pathname.startsWith("/products") || pathname.startsWith("/categories"),
    },
    {
      name: "Fayzee AI",
      href: "#",
      icon: Sparkles,
      isSpecial: true,
      onClick: handleOpenAI,
    },
    {
      name: "Wishlist",
      href: "/wishlist",
      icon: Heart,
      isActive: pathname === "/wishlist",
    },
    {
      name: "Cart",
      href: "/cart",
      icon: ShoppingBag,
      isActive: pathname === "/cart",
      badge: cartCount > 0 ? cartCount : undefined,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#1C2A39]/95 backdrop-blur-xl border-t border-[#243345] shadow-2xl px-2 py-1.5 flex items-center justify-around"
      aria-label="Mobile Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;

        if (item.isSpecial) {
          return (
            <button
              key={item.name}
              type="button"
              onClick={item.onClick}
              className="flex flex-col items-center -mt-5 group focus:outline-none"
              aria-label="Open Fayzee AI Shopping Assistant"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF5E00] to-[#FF8C00] text-white shadow-lg shadow-[#FF5E00]/40 flex items-center justify-center border-2 border-[#1C2A39] animate-pulse-glow group-active:scale-90 transition-transform">
                <Sparkles className="w-5 h-5 text-yellow-200" />
              </div>
              <span className="text-[10px] font-black text-[#FF8C00] mt-0.5 tracking-tight">
                Fayzee AI
              </span>
            </button>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all active:scale-80 relative ${
              item.isActive
                ? "text-[#FF5E00] font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2 bg-[#FF5E00] text-white text-[9px] font-black rounded-full min-w-[15px] h-3.5 px-0.5 flex items-center justify-center shadow-xs">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
