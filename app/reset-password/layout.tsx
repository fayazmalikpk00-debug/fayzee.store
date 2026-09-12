import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Fayzee Store",
  description: "Set a new secure password for your FAYZEE account.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://www.fayzee.store/reset-password",
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
