import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career & Marketing Blog",
  description:
    "Tips and guides on LinkedIn, resumes, ATS, job search, and digital marketing for professionals and businesses across India.",
  alternates: { canonical: "/blogs" },
  openGraph: {
    title: "Career & Marketing Blog",
    description:
      "Guides on LinkedIn, resumes, job search, and digital marketing.",
    url: "/blogs",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
