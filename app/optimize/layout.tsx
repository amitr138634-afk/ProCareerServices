import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI LinkedIn Profile Optimizer (India)",
  description:
    "Optimize your LinkedIn profile with AI — a recruiter-ready headline, About section, and experience rewrites mapped to your target role. Free to start, ₹200 for the full report.",
  alternates: { canonical: "/optimize" },
  openGraph: {
    title: "AI LinkedIn Profile Optimizer (India)",
    description:
      "AI-powered LinkedIn optimizer — headline, About, and experience rewrites. Free to start.",
    url: "/optimize",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
