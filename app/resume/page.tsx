"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";

const CAREER_LEVELS = [
  "Fresher / No experience",
  "Entry-level (1–2 years)",
  "Mid-level (3–6 years)",
  "Senior (7+ years)",
  "Career Switch",
  "Executive / C-Suite",
];

const RESUME_TYPES = [
  "Standard ATS Resume",
  "Creative / Design Resume",
  "Technical / IT Resume",
  "Management / Leadership Resume",
  "Academic / Research Resume",
];

export default function ResumePage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    careerLevel: "", currentRole: "", targetRole: "",
    resumeType: "", skills: "", message: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.careerLevel || !form.targetRole) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true); setError("");
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => body.append(k, v));
    body.append("serviceType", "resume-creation");
    body.append("profileType", form.careerLevel);
    if (file) body.append("resume", file);
    try {
      const res = await fetch("/api/service-request", { method: "POST", body });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please email us at info@procareerlaunchpad.com");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="relative min-h-screen bg-brand-bg text-white overflow-x-hidden">
      <div className="blob blob-1" /><div className="blob blob-2" /><div className="noise-overlay" />
      <Navbar />

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-32 pb-16">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/5 text-orange-400 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            RESUME CREATION · HUMAN + AI
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">
            Get a Resume That{" "}
            <span style={{ background: "linear-gradient(90deg,#F97316,#FBBF24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Gets You Hired
            </span>
          </h1>
          <p className="text-white/50 text-sm max-w-lg mx-auto">
            We write your resume from scratch — ATS-optimised, role-specific, human-reviewed. Order now and pay only ₹200 after you receive and approve it.
          </p>
        </div>

        {/* Pay-after-delivery banner */}
        <div className="glass rounded-2xl p-4 border border-orange-500/20 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm">Pay ₹200 only after delivery</p>
            <p className="text-white/45 text-xs">We deliver your resume first. You pay only when you&apos;re satisfied — no upfront charges.</p>
          </div>
          <div className="ml-auto text-2xl font-black text-orange-400 flex-shrink-0">₹200</div>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: "🎯", label: "ATS Optimised" },
            { icon: "🤖", label: "AI + Human" },
            { icon: "⚡", label: "24–48h Delivery" },
            { icon: "🔄", label: "Free Revisions" },
          ].map((f) => (
            <div key={f.label} className="glass rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{f.icon}</div>
              <p className="text-white/60 text-xs font-semibold">{f.label}</p>
            </div>
          ))}
        </div>

        {submitted ? (
          <div className="glass rounded-2xl p-10 text-center border border-orange-500/20">
            <div className="w-16 h-16 rounded-full bg-orange-500/15 flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
            <h2 className="text-white font-black text-xl mb-2">Order Placed!</h2>
            <p className="text-white/50 text-sm mb-2">
              We&apos;ll send your completed resume to{" "}
              <strong className="text-white">{form.email}</strong> within 24–48 hours.
            </p>
            <p className="text-orange-400/80 text-xs mb-6">
              A payment link for ₹200 will be shared after delivery. No upfront charges.
            </p>
            <a href="/" className="text-white font-bold px-6 py-3 rounded-xl text-sm inline-block transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#F97316,#FBBF24)" }}>
              ← Back to Home
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 md:p-8 border border-white/8 space-y-5">

            {/* Name / Email */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-xs font-semibold mb-1.5 block">Full Name *</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Rahul Sharma"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50 placeholder-white/20" />
              </div>
              <div>
                <label className="text-white/60 text-xs font-semibold mb-1.5 block">Email Address *</label>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="rahul@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50 placeholder-white/20" />
              </div>
            </div>

            {/* Phone / Career level */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-xs font-semibold mb-1.5 block">Phone Number</label>
                <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 9876543210"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50 placeholder-white/20" />
              </div>
              <div>
                <label className="text-white/60 text-xs font-semibold mb-1.5 block">Career Level *</label>
                <select value={form.careerLevel} onChange={(e) => set("careerLevel", e.target.value)}
                  className="w-full bg-[#0D0D2B] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 text-white/80">
                  <option value="" disabled>Select your level</option>
                  {CAREER_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Current role / Target role */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-xs font-semibold mb-1.5 block">Current Role / Field</label>
                <input value={form.currentRole} onChange={(e) => set("currentRole", e.target.value)}
                  placeholder="e.g. Software Engineer at TCS"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50 placeholder-white/20" />
              </div>
              <div>
                <label className="text-white/60 text-xs font-semibold mb-1.5 block">Target Job Title *</label>
                <input value={form.targetRole} onChange={(e) => set("targetRole", e.target.value)}
                  placeholder="e.g. Product Manager, Data Analyst"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50 placeholder-white/20" />
              </div>
            </div>

            {/* Resume type */}
            <div>
              <label className="text-white/60 text-xs font-semibold mb-1.5 block">Resume Style</label>
              <select value={form.resumeType} onChange={(e) => set("resumeType", e.target.value)}
                className="w-full bg-[#0D0D2B] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 text-white/80">
                <option value="">Standard ATS (recommended)</option>
                {RESUME_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Key skills */}
            <div>
              <label className="text-white/60 text-xs font-semibold mb-1.5 block">Key Skills to Highlight</label>
              <textarea value={form.skills} onChange={(e) => set("skills", e.target.value)} rows={3}
                placeholder="e.g. Python, Machine Learning, SQL, Data Visualisation, Agile, Team Leadership…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm resize-none focus:outline-none focus:border-orange-500/50 placeholder-white/20" />
            </div>

            {/* Extra context */}
            <div>
              <label className="text-white/60 text-xs font-semibold mb-1.5 block">Background & Achievements</label>
              <textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={4}
                placeholder="Tell us about your experience, notable projects, achievements, awards, or anything specific you'd like highlighted in your resume…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm resize-none focus:outline-none focus:border-orange-500/50 placeholder-white/20" />
            </div>

            {/* Existing resume upload */}
            <div>
              <label className="text-white/60 text-xs font-semibold mb-1.5 block">
                Existing Resume for Reference{" "}
                <span className="text-white/30 font-normal">(optional — helps us tailor faster)</span>
              </label>
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl p-5 text-center cursor-pointer hover:border-orange-500/30 transition-colors">
                <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" className="hidden"
                  onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                {file ? (
                  <p className="text-orange-400 text-sm font-semibold">{file.name}</p>
                ) : (
                  <div>
                    <p className="text-white/30 text-sm">Click to upload your existing resume</p>
                    <p className="text-white/20 text-xs mt-1">PDF or DOCX · Optional</p>
                  </div>
                )}
              </div>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button type="submit" disabled={submitting}
              className="w-full py-3.5 rounded-xl font-black text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#F97316,#FBBF24)" }}>
              {submitting
                ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Submitting…</>
                : "Order My Resume →"}
            </button>

            <div className="flex items-center justify-center gap-2 text-white/25 text-xs">
              <svg className="w-3.5 h-3.5 text-orange-400/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pay ₹200 only after we deliver your resume · No upfront payment required
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
