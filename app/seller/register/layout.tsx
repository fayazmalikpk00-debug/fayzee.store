import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell on FAYZEE — Register Your Store | Seller Center Pakistan",
  description:
    "Join FAYZEE as a verified merchant. Reach thousands of active online shoppers across Pakistan with 0% commission on your first 30 days.",
  alternates: {
    canonical: "https://www.fayzee.store/seller/register",
  },
  openGraph: {
    title: "Sell on FAYZEE — Register Your Store | Seller Center Pakistan",
    description:
      "Join FAYZEE as a verified merchant. Reach thousands of active online shoppers across Pakistan with 0% commission on your first 30 days.",
    url: "https://www.fayzee.store/seller/register",
    siteName: "FAYZEE",
    type: "website",
    locale: "en_PK",
    images: [
      {
        url: "https://www.fayzee.store/logo.png",
        width: 800,
        height: 800,
        alt: "Sell on FAYZEE",
      },
    ],
  },
};

export default function SellerRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
