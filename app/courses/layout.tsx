import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Courses — Coming Soon",
  description:
    "Self-paced video courses on resume writing, LinkedIn growth, interview cracking, and in-demand tech & business skills. Launching soon.",
  alternates: { canonical: "/courses" },
  openGraph: {
    title: "Career Courses — Coming Soon",
    description:
      "Self-paced courses on resumes, LinkedIn, interviews, and in-demand skills. Launching soon.",
    url: "/courses",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
