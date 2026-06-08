"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

const FEATURES = [
  { icon: "⚖️", title: "Workplace & Employment Law", desc: "Understand your rights in disputes, terminations, and workplace harassment situations with AI-guided explanations." },
  { icon: "📋", title: "Contract Review & Red-Flag Detection", desc: "Paste any contract and get an AI breakdown of risky clauses, missing protections, and negotiation points." },
  { icon: "✉️", title: "Legal Letter & Notice Drafting", desc: "Generate demand letters, legal notices, grievance letters, and dispute responses in minutes." },
  { icon: "📖", title: "Know Your Rights", desc: "Plain-English explanations of labour laws, consumer rights, tenant rights, and startup legal basics." },
  { icon: "👨‍⚖️", title: "Connect to Verified Lawyers", desc: "When AI isn't enough, get connected to vetted legal professionals at transparent, affordable rates." },
];

export default function LegalAIPage() {
  const [form, setForm] = useState({ name: "", email: "", useCase: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) { setError("Name and email are required."); return; }
    setSubmitting(true); setError("");
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => body.append(k, v));
    body.append("serviceType", "legal-ai-interest");
    try {
      const res = await fetch("/api/service-request", { method: "POST", body });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Email us at info@procareerlaunchpad.com");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="relative min-h-screen bg-brand-bg text-white overflow-x-hidden">
      <div className="blob blob-1" /><div className="blob blob-2" /><div className="noise-overlay" />
      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-16">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-400/30 bg-indigo-400/5 text-indigo-300 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            COMING SOON
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            Legal AI Assist —{" "}
            <span style={{ background: "linear-gradient(90deg,#6366F1,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Know Your Rights
            </span>
          </h1>
          <p className="text-white/50 text-base max-w-2xl mx-auto leading-relaxed">
            AI-powered legal guidance for workplace disputes, contracts, and everyday legal questions — fast, affordable, and in plain English.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-5 border border-white/8">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-black text-white text-sm mb-1">{f.title}</h3>
              <p className="text-white/45 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black mb-2">Get Notified at Launch</h2>
            <p className="text-white/40 text-sm">Express your interest and we&#39;ll reach out when Legal AI Assist goes live.</p>
          </div>

          {submitted ? (
            <div className="glass rounded-2xl p-10 text-center border border-indigo-400/20">
              <div className="text-3xl mb-4">⚖️</div>
              <h2 className="text-white font-black text-xl mb-2">Got it!</h2>
              <p className="text-white/50 text-sm mb-6">We&#39;ll notify <strong className="text-white">{form.email}</strong> when Legal AI Assist launches.</p>
              <a href="/" className="text-white font-bold px-6 py-3 rounded-xl text-sm inline-block hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>← Back to Home</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 border border-white/8 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">Full Name *</label>
                  <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Amit Kumar"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-400/50 placeholder-white/20" />
                </div>
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="amit@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-400/50 placeholder-white/20" />
                </div>
              </div>
              <div>
                <label className="text-white/60 text-xs font-semibold mb-1.5 block">What legal situation do you need help with?</label>
                <select value={form.useCase} onChange={(e) => set("useCase", e.target.value)}
                  className="w-full bg-[#0D0D2B] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400/50 text-white/80">
                  <option value="">Select a situation</option>
                  <option>Workplace dispute / termination</option>
                  <option>Contract review</option>
                  <option>Legal notice drafting</option>
                  <option>Know my employment rights</option>
                  <option>Consumer complaint</option>
                  <option>Startup / business legal</option>
                  <option>Other</option>
                </select>
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={submitting}
                className="w-full py-3.5 rounded-xl font-black text-sm text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
                {submitting ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Sending…</> : "Notify Me at Launch →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
