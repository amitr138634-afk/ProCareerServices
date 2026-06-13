import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Counseling & 1-on-1 Coaching",
  description:
    "Personalised job search strategy, interview preparation, resume + LinkedIn alignment, and salary negotiation coaching. Book a free 15-minute discovery call.",
  alternates: { canonical: "/career" },
  openGraph: {
    title: "Career Counseling & 1-on-1 Coaching",
    description:
      "Job search strategy, interview prep, and salary negotiation coaching. Book a free call.",
    url: "/career",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
