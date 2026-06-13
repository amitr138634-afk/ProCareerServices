import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio Website Creation",
  description:
    "A custom, mobile-responsive portfolio website that showcases your projects, skills, and experience — for freshers, students, and professionals. Delivered in 3 days.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Portfolio Website Creation",
    description:
      "A custom, mobile-responsive portfolio website that showcases your work. Delivered in 3 days.",
    url: "/portfolio",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
