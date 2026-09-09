import { FayzeeAIAssistant } from "@/components/ai/FayzeeAIAssistant";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#1C2A39",
};

export const metadata: Metadata = {
  title: "FAYZEE — Shop More. Live Better | Pakistan's Premier Multi-Vendor Marketplace",
  description:
    "Discover, compare, and purchase 100% authentic tech, fashion, and lifestyle products from verified sellers with 24/7 AI shopping assistance.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "FAYZEE — Shop More. Live Better",
    description: "Multi-vendor marketplace with verified authentic sellers and Fayzee AI assistant.",
    siteName: "FAYZEE",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "FAYZEE Official Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-full antialiased font-sans bg-white text-[#333333] selection:bg-[#FF5E00] selection:text-white">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1 w-full max-w-full overflow-x-hidden min-w-0">{children}</main>
            <Footer />
            <FayzeeAIAssistant />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
