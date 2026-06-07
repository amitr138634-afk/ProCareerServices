"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "authenticated") router.replace(callbackUrl);
  }, [status, router, callbackUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const res = await signIn("credentials", { email: email.toLowerCase(), password, redirect: false, callbackUrl });
    setLoading(false);
    if (res?.error) setError("Incorrect email or password");
    else if (res?.url) router.replace(res.url);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email.toLowerCase(), phone: phone.trim() || undefined, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      // Auto sign in after signup
      const signInRes = await signIn("credentials", { email: email.toLowerCase(), password, redirect: false, callbackUrl });
      setLoading(false);
      if (signInRes?.error) { setSuccess("Account created! Please sign in."); setTab("login"); }
      else if (signInRes?.url) router.replace(signInRes.url);
    } catch {
      setError("Something went wrong. Try again."); setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 btn-glow rounded-xl flex items-center justify-center text-white font-black">P</div>
            <span className="font-black text-white text-xl tracking-tight">ProCareer<span className="gradient-text">.</span></span>
          </div>
          <p className="text-white/40 text-sm">AI-powered career tools</p>
        </div>

        {/* Card */}
        <div className="glass-dark rounded-2xl border border-white/8 overflow-hidden">

          {/* Tab switcher */}
          <div className="flex border-b border-white/8">
            {(["login", "signup"] as const).map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                className={`flex-1 py-3.5 text-sm font-bold transition-colors capitalize ${tab === t ? "text-white bg-white/5 border-b-2 border-brand-teal" : "text-white/35 hover:text-white/60"}`}>
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div className="p-7">
            {/* Google button */}
            <button onClick={() => signIn("google", { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all text-sm mb-5">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/25 text-xs">or with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Error / Success */}
            {error && <p className="text-red-400 text-xs mb-4 text-center bg-red-400/8 border border-red-400/20 rounded-lg py-2 px-3">{error}</p>}
            {success && <p className="text-brand-teal text-xs mb-4 text-center bg-brand-teal/8 border border-brand-teal/20 rounded-lg py-2 px-3">{success}</p>}

            {/* Sign In form */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="space-y-3">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/25" />
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password" required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/25 pr-12" />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs">
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full btn-glow text-white font-black py-3 rounded-xl text-sm disabled:opacity-50">
                  {loading ? "Signing in…" : "Sign In →"}
                </button>
              </form>
            )}

            {/* Sign Up form */}
            {tab === "signup" && (
              <form onSubmit={handleSignup} className="space-y-3">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Full name" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/25" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/25" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/25" />
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 characters)" required minLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/25 pr-12" />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs">
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full btn-glow text-white font-black py-3 rounded-xl text-sm disabled:opacity-50">
                  {loading ? "Creating account…" : "Create Account →"}
                </button>
              </form>
            )}

            <p className="text-white/20 text-[11px] text-center mt-4">By continuing you agree to our terms · No spam ever</p>
          </div>
        </div>
      </div>
    </div>
  );
}
