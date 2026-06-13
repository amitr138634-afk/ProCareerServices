"use client";

import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterSignup({ source = "footer" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error");
      setMsg("Please enter a valid email.");
      return;
    }
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
      setMsg("Something went wrong. Please try again.");
    }
  };

  if (status === "done") {
    return (
      <p className="text-brand-teal text-xs font-semibold flex items-center gap-1.5">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        You&#39;re in! Career &amp; marketing tips are on the way.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          aria-label="Email address"
          className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-teal/50 placeholder-white/25"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-glow text-white font-bold text-xs px-4 py-2 rounded-lg whitespace-nowrap disabled:opacity-50"
        >
          {status === "loading" ? "…" : "Subscribe"}
        </button>
      </div>
      {status === "error" && <p className="text-red-400 text-[11px]">{msg}</p>}
    </form>
  );
}
