import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Marketing Services — SEO, Ads & Social",
  description:
    "Grow your business online with full-funnel digital marketing: SEO, social media marketing, Google & Meta ads, and email marketing. Free consultation, no upfront cost.",
  alternates: { canonical: "/marketing" },
  openGraph: {
    title: "Digital Marketing Services — SEO, Ads & Social",
    description:
      "SEO, social media, Google & Meta ads, and email marketing. Free consultation.",
    url: "/marketing",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
