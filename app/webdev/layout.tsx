import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web & App Development Services",
  description:
    "Custom websites, e-commerce stores, mobile apps, blogs, and branding — from a quick landing page to a full web application. Get a free quote.",
  alternates: { canonical: "/webdev" },
  openGraph: {
    title: "Web & App Development Services",
    description:
      "Custom websites, e-commerce, mobile apps, and branding. Get a free quote.",
    url: "/webdev",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
