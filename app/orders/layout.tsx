import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders | Fayzee Store",
  description: "View and track your customer orders on Fayzee Store.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://www.fayzee.store/orders",
  },
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
