import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | Fayzee Store",
  description: "Manage your Fayzee customer profile, addresses, and account settings.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
