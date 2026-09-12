import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seller Dashboard | Fayzee Store",
  description: "Manage your seller products, orders, and store analytics.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
