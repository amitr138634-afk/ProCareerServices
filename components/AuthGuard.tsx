"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PaidContext } from "./PaidContext";

interface PaidStatus {
  loggedIn: boolean;
  email?: string;
  name?: string;
  image?: string;
  isPaid: boolean;
  paidServices?: string[];
}

interface AuthGuardProps {
  children: React.ReactNode;
  toolName: string;
  serviceKey?: string; // e.g. "linkedin" | "naukri" | "ats"
}


export default function AuthGuard({ children, toolName, serviceKey }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [paid, setPaid] = useState<PaidStatus | null>(null);
  const [checking, setChecking] = useState(true);

  const checkPaid = useCallback(async () => {
    try {
      const url = serviceKey ? `/api/check-session?service=${serviceKey}` : "/api/check-session";
      const res = await fetch(url);
      const data: PaidStatus = await res.json();
      setPaid(data);
    } finally {
      setChecking(false);
    }
  }, [serviceKey]);

  useEffect(() => {
    if (status === "authenticated") checkPaid();
    else if (status === "unauthenticated") { setChecking(false); setPaid({ loggedIn: false, isPaid: false }); }
  }, [status, checkPaid]);

  // Loading
  if (status === "loading" || checking) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-white/40 text-sm flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Loading…
        </div>
      </div>
    );
  }

  // Not logged in
  if (!session || !paid?.loggedIn) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
        </div>
        <div className="relative z-10 w-full max-w-sm text-center">
          <div className="inline-flex items-center gap-2 mb-8">
            <div className="w-9 h-9 btn-glow rounded-xl flex items-center justify-center text-white font-black">P</div>
            <span className="font-black text-white text-xl tracking-tight">ProCareer<span className="gradient-text">.</span></span>
          </div>

          <div className="glass-dark rounded-2xl p-8 border border-white/8">
            <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-brand-teal" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <h2 className="text-white font-black text-lg mb-2">Sign in to use {toolName}</h2>
            <p className="text-white/40 text-sm mb-6">Free to start · ₹200 unlocks 6 hours of full access</p>
            <button
              onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)}
              className="w-full btn-glow text-white font-bold py-3.5 rounded-xl text-sm mb-3"
            >
              Sign In / Create Account →
            </button>
            <a href="/" className="block text-white/30 hover:text-white/60 text-xs transition-colors">← Back to home</a>
          </div>
        </div>
      </div>
    );
  }

  // Logged in — show user bar + children
  const effectivelyPaid = paid.isPaid;

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      {/* User bar */}
      <div className="glass-dark border-b border-white/5 px-4 py-2 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          {paid.image && <img src={paid.image} alt="" className="w-6 h-6 rounded-full" />}
          <span className="text-white/60 text-xs">{paid.name || paid.email}</span>
        </div>
        <div className="flex items-center gap-3">
          {effectivelyPaid && (
            <span className="text-brand-teal text-[11px] font-semibold">✓ Full access unlocked</span>
          )}
          {!effectivelyPaid && (
            <span className="text-white/30 text-[11px]">Free tier · Pay ₹200 to unlock full access</span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-white/25 hover:text-white/60 text-[11px] transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Tool content */}
      <PaidContext.Provider value={effectivelyPaid}>
        <div className="flex-1">{children}</div>
      </PaidContext.Provider>
    </div>
  );
}
