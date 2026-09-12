import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Checkout | Fayzee Store",
  description: "Complete your order securely on Fayzee Store.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
