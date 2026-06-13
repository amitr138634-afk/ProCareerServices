import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free ATS Resume Checker & Scanner",
  description:
    "Scan your resume against any job description and get a 0–100 ATS score with keyword gaps, section scoring, and 12+ specific fixes. First scan free.",
  alternates: { canonical: "/ats" },
  openGraph: {
    title: "Free ATS Resume Checker & Scanner",
    description:
      "Get a 0–100 ATS score for your resume with keyword gaps and 12+ fixes. First scan free.",
    url: "/ats",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
