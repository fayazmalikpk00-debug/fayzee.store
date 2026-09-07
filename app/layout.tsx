import { FayzeeAIAssistant } from "@/components/ai/FayzeeAIAssistant";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fayzee — Shop Smart. Shop Easy | Pakistan's Premier Multi-Vendor Marketplace",
  description:
    "Discover, compare, and purchase 100% authentic tech, fashion, and lifestyle products from verified sellers with 24/7 AI shopping assistance.",
  openGraph: {
    title: "Fayzee — Shop Smart. Shop Easy",
    description: "Multi-vendor marketplace with verified authentic sellers and Fayzee AI assistant.",
    siteName: "Fayzee",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-full antialiased font-sans bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <FayzeeAIAssistant />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
