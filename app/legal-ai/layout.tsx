import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal AI Assist — Coming Soon",
  description:
    "AI-powered legal guidance for everyday problems — understand your rights, draft letters, and connect with verified professionals. Coming soon.",
  alternates: { canonical: "/legal-ai" },
  openGraph: {
    title: "Legal AI Assist — Coming Soon",
    description:
      "AI-powered legal guidance — know your rights and draft letters. Coming soon.",
    url: "/legal-ai",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
