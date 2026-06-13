import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Professional ATS Resume Writing Service",
  description:
    "We write your ATS-optimised resume from scratch, tailored to your target role and human-reviewed. Pay ₹200 only after delivery — no upfront charges.",
  alternates: { canonical: "/resume" },
  openGraph: {
    title: "Professional ATS Resume Writing Service",
    description:
      "ATS-optimised resume tailored to your target role. Pay ₹200 only after delivery.",
    url: "/resume",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
