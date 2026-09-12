import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In to Your Account | Fayzee Store",
  description: "Sign in to your FAYZEE account to manage orders, wishlist, and track deliveries.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://www.fayzee.store/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
