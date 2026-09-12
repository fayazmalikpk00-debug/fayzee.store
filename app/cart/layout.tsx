import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart | Fayzee Store",
  description: "View and manage items in your shopping cart on Fayzee Store.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://www.fayzee.store/cart",
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
