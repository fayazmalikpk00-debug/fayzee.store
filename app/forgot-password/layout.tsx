import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Fayzee Store",
  description: "Reset your FAYZEE account password.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://www.fayzee.store/forgot-password",
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
