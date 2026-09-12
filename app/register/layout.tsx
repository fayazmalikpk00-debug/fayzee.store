import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an Account | Fayzee Store",
  description: "Join FAYZEE to enjoy faster checkout, exclusive flash sales, and order tracking.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://www.fayzee.store/register",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
