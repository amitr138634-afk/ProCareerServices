"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/#services",  label: "Services" },
  { href: "/#pricing",   label: "Pricing" },
  { href: "/blogs",      label: "Blog" },
  { href: "/webdev",     label: "Web Dev" },
  { href: "/naukri",     label: "Naukri" },
  { href: "/resume",     label: "Resume" },
  { href: "/career",     label: "Career" },
  { href: "/#contact",   label: "Contact" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm btn-glow">P</div>
          <span className="font-black text-white text-base tracking-tight hidden sm:block">
            ProCareer<span className="gradient-text">Launchpad</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-5 text-sm text-white/55 font-medium">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className={`hover:text-white transition-colors whitespace-nowrap ${pathname === l.href ? "text-white" : ""}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">

          {/* FAQ icon — always visible before sign-in area */}
          <Link href="/#faq" title="FAQ"
            className="flex items-center justify-center w-8 h-8 rounded-full glass border border-white/10 hover:border-brand-teal/40 hover:text-brand-teal text-white/45 transition-all flex-shrink-0"
            aria-label="FAQ">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Link>

          {/* Auth */}
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          ) : session?.user ? (
            <div className="relative">
              <button onClick={() => setDropOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 hover:border-white/25 transition-all">
                {session.user.image
                  ? <img src={session.user.image} alt="" className="w-6 h-6 rounded-full" />
                  : <div className="w-6 h-6 rounded-full bg-brand-teal/30 flex items-center justify-center text-brand-teal text-xs font-black">{(session.user.name ?? "U")[0]}</div>
                }
                <span className="text-white/80 text-xs font-semibold hidden sm:block max-w-[100px] truncate">
                  {session.user.name ?? session.user.email}
                </span>
                <svg className={`w-3.5 h-3.5 text-white/40 transition-transform ${dropOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 glass-dark border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                  <Link href="/optimize" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                    <span className="text-brand-teal">⚡</span> LinkedIn Optimizer
                  </Link>
                  <Link href="/ats" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                    <span className="text-brand-purple">📄</span> ATS Scanner
                  </Link>
                  <Link href="/naukri" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                    <span className="text-orange-400">🔍</span> Naukri Optimizer
                  </Link>
                  <Link href="/resume" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                    <span className="text-orange-400">📝</span> Resume Creation
                  </Link>
                  <div className="border-t border-white/8" />
                  <Link href="/dashboard" onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                    <span className="text-brand-teal">⊞</span> My Dashboard
                  </Link>
                  <div className="border-t border-white/8" />
                  <button onClick={() => { setDropOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400/80 hover:text-red-400 hover:bg-white/5 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => window.location.href = "/login"}
              className="flex items-center gap-2 px-4 py-2 rounded-full btn-glow text-white text-sm font-bold transition-all flex-shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" opacity=".9"/>
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity=".8"/>
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" opacity=".7"/>
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity=".6"/>
              </svg>
              Sign In
            </button>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden p-2 text-white/50 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden glass-dark border-t border-white/5 px-4 py-3 space-y-0.5">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className="flex items-center py-2.5 px-3 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              {l.label}
            </Link>
          ))}
          <Link href="/#faq" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 py-2.5 px-3 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            FAQ
          </Link>
        </div>
      )}
    </nav>
  );
}
