import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist | Fayzee Store",
  description: "View and manage your saved wishlist items on Fayzee Store.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://www.fayzee.store/wishlist",
  },
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
