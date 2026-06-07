"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";

const PROFILE_TYPES = ["Student / Fresher", "Working Professional", "Freelancer", "Entrepreneur / Founder"];
const SERVICES_WANTED = ["Basic Portfolio Website", "Advanced Portfolio with Projects", "E-commerce Portfolio", "Photography / Creative Portfolio", "Developer Portfolio with GitHub integration"];

export default function PortfolioPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", profileType: "", serviceWanted: "", message: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.profileType) { setError("Please fill in all required fields."); return; }
    setSubmitting(true); setError("");
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => body.append(k, v));
    body.append("serviceType", "portfolio");
    if (file) body.append("resume", file);
    try {
      const res = await fetch("/api/service-request", { method: "POST", body });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please email us directly at info@procareerlaunchpad.com");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="relative min-h-screen bg-brand-bg text-white overflow-x-hidden">
      <div className="blob blob-1" /><div className="blob blob-2" /><div className="noise-overlay" />
      <Navbar />

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-32 pb-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-blue/30 bg-brand-blue/5 text-brand-blue text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />PORTFOLIO CREATION
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">
            Build Your <span style={{ background: "linear-gradient(90deg,#0EA5E9,#10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Portfolio</span>
          </h1>
          <p className="text-white/50 text-sm max-w-lg mx-auto">
            We design and build stunning portfolio websites for freshers, students, and professionals. Submit your request and we&#39;ll reach out within 24 hours.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: "🎨", label: "Custom Design" },
            { icon: "📱", label: "Mobile Responsive" },
            { icon: "⚡", label: "3 Day Delivery" },
            { icon: "♾️", label: "Lifetime Ownership" },
          ].map((f) => (
            <div key={f.label} className="glass rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{f.icon}</div>
              <p className="text-white/60 text-xs font-semibold">{f.label}</p>
            </div>
          ))}
        </div>

        {submitted ? (
          <div className="glass rounded-2xl p-10 text-center border border-brand-teal/20">
            <div className="w-16 h-16 rounded-full bg-brand-teal/15 flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
            <h2 className="text-white font-black text-xl mb-2">Request Submitted!</h2>
            <p className="text-white/50 text-sm mb-6">We&#39;ve received your request and will email you at <strong className="text-white">{form.email}</strong> within 24 hours.</p>
            <a href="/" className="btn-glow text-white font-bold px-6 py-3 rounded-xl text-sm inline-block">← Back to Home</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 md:p-8 border border-white/8 space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-xs font-semibold mb-1.5 block">Full Name *</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Rahul Sharma"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-blue/50 placeholder-white/20" />
              </div>
              <div>
                <label className="text-white/60 text-xs font-semibold mb-1.5 block">Email Address *</label>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="rahul@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-blue/50 placeholder-white/20" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-xs font-semibold mb-1.5 block">Phone Number</label>
                <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 9876543210"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-blue/50 placeholder-white/20" />
              </div>
              <div>
                <label className="text-white/60 text-xs font-semibold mb-1.5 block">Profile Type *</label>
                <select value={form.profileType} onChange={(e) => set("profileType", e.target.value)}
                  className="w-full bg-[#0D0D2B] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue/50 text-white/80">
                  <option value="" disabled>Select your profile</option>
                  {PROFILE_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-white/60 text-xs font-semibold mb-1.5 block">Service Wanted</label>
              <select value={form.serviceWanted} onChange={(e) => set("serviceWanted", e.target.value)}
                className="w-full bg-[#0D0D2B] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue/50 text-white/80">
                <option value="">Choose type (optional)</option>
                {SERVICES_WANTED.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-white/60 text-xs font-semibold mb-1.5 block">Tell us about yourself</label>
              <textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={4}
                placeholder="Share your background, projects, skills, and what you'd like your portfolio to showcase…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm resize-none focus:outline-none focus:border-brand-blue/50 placeholder-white/20" />
            </div>

            <div>
              <label className="text-white/60 text-xs font-semibold mb-1.5 block">Attach Resume (optional)</label>
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl p-5 text-center cursor-pointer hover:border-brand-blue/30 transition-colors">
                <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" className="hidden"
                  onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                {file ? (
                  <p className="text-brand-blue text-sm font-semibold">{file.name}</p>
                ) : (
                  <p className="text-white/30 text-sm">Click to upload PDF or DOCX resume</p>
                )}
              </div>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button type="submit" disabled={submitting}
              className="w-full py-3.5 rounded-xl font-black text-sm text-white btn-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {submitting ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Submitting…</> : "Submit Portfolio Request →"}
            </button>

            <p className="text-white/25 text-xs text-center">We&#39;ll respond within 24 hours · info@procareerlaunchpad.com</p>
          </form>
        )}
      </div>
    </div>
  );
}
