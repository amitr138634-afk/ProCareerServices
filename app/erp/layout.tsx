import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business & ERP Tools — Coming Soon",
  description:
    "Streamline your business operations with our upcoming ERP and business tools. Coming soon — drop your email for early access.",
  alternates: { canonical: "/erp" },
  openGraph: {
    title: "Business & ERP Tools — Coming Soon",
    description: "ERP and business operations tools. Coming soon.",
    url: "/erp",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
