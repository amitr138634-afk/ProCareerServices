import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import SpaceBackground from "@/components/SpaceBackground";
import ChatWidget from "@/components/ChatWidget";
import { Analytics } from "@vercel/analytics/next";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ProCareerLaunchpad — AI LinkedIn & ATS Optimizer",
  description:
    "LinkedIn profile optimizer + ATS resume scanner powered by AI. Free to start, ₹200 for full access.",
  keywords: "LinkedIn optimization, ATS scanner, AI resume, career coaching, ProCareerLaunchpad",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="antialiased font-jakarta" suppressHydrationWarning>
        <SessionProvider>
          <SpaceBackground />
          {children}
          <ChatWidget />
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  );
}
