"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

const TOPICS = ["Job Search Strategy", "Resume & LinkedIn Optimization", "Salary Negotiation", "Interview Preparation", "Career Switch Guidance", "Freshers / Campus Placement", "Leadership & Career Growth"];

export default function CareerPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", topic: "", experience: "", message: "" });
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
    body.append("serviceType", "career-counseling");
    try {
      const res = await fetch("/api/service-request", { method: "POST", body });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Email us at info@procareerlaunchpad.com");
    } finally { setSubmitting(false); }
  };

  const tips = [
    { emoji: "🎯", title: "Tailor Every Application", desc: "Never send a generic resume. Customize your resume and cover letter for each role — recruiters can tell immediately." },
    { emoji: "🔗", title: "LinkedIn is Your Storefront", desc: "Recruiters search LinkedIn daily. An optimized profile with the right keywords gets you found without applying." },
    { emoji: "💬", title: "Network Before You Need It", desc: "80% of jobs are filled through referrals. Connect genuinely, not desperately. Build relationships first." },
    { emoji: "📊", title: "Quantify Your Achievements", desc: "Changed a process? Say it saved 30% time. Led a team? Say how many. Numbers make bullets land harder." },
    { emoji: "🧠", title: "Prepare for Behavioral Rounds", desc: "Use STAR method (Situation, Task, Action, Result) for every behavioral question. Prepare 8–10 stories." },
    { emoji: "💰", title: "Never Name a Number First", desc: "Always ask the company's budget before naming your salary expectation. You can negotiate up — never down." },
    { emoji: "⏱️", title: "Apply in the First 24 Hours", desc: "Applications submitted within the first day get 3× more attention. Set job alerts and act fast." },
    { emoji: "🤝", title: "Follow Up After Interviews", desc: "Send a thank-you email within 24 hours. Reference specific topics discussed. It sets you apart from 90% of candidates." },
  ];

  return (
    <div className="relative min-h-screen bg-brand-bg text-white overflow-x-hidden">
      <div className="blob blob-1" /><div className="blob blob-2" /><div className="noise-overlay" />
      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-500/5 text-pink-400 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />1-ON-1 CAREER COUNSELING
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            Career Guidance &{" "}
            <span style={{ background: "linear-gradient(90deg,#EC4899,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Job Hunting Tips
            </span>
          </h1>
          <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed">
            Expert career coaching to accelerate your job search — from strategy and resume to interviews and salary negotiation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <a href="https://calendar.app.google/HbKg3j7UYVZXKxxaA" target="_blank" rel="noreferrer"
              className="text-white font-bold px-6 py-3 rounded-full text-sm inline-flex items-center gap-2 transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#EC4899,#8B5CF6)" }}>
              📅 Book Free Discovery Call
            </a>
            <a href="#tips" className="glass border border-white/15 text-white/70 hover:text-white font-bold px-6 py-3 rounded-full text-sm inline-flex items-center gap-2 transition-all">
              📚 Read Free Tips ↓
            </a>
          </div>
        </div>

        {/* Services */}
        <div className="grid md:grid-cols-3 gap-4 mb-14">
          {[
            { icon: "🗺️", title: "Career Roadmap", desc: "Personalized 90-day plan to land your target role — with milestones and accountability.", badge: "Most Popular" },
            { icon: "🎤", title: "Mock Interviews", desc: "Realistic interview practice with expert feedback on your answers, body language, and confidence.", badge: "" },
            { icon: "💼", title: "Job Search Sprint", desc: "Intensive 2-week session to overhaul your resume, LinkedIn, and application strategy.", badge: "High Impact" },
          ].map((s) => (
            <div key={s.title} className="glass rounded-2xl p-6 border border-pink-500/15 relative">
              {s.badge && (
                <span className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">{s.badge}</span>
              )}
              <div className="text-2xl mb-3">{s.icon}</div>
              <h3 className="font-black text-white mb-1.5">{s.title}</h3>
              <p className="text-white/45 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Free Tips */}
        <div id="tips" className="mb-14">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black mb-2">Free Job Hunting Tips</h2>
            <p className="text-white/40 text-sm">Actionable tactics used by candidates who land offers 2× faster</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {tips.map((t) => (
              <div key={t.title} className="glass rounded-2xl p-5 border border-white/6 flex gap-4">
                <div className="text-2xl flex-shrink-0">{t.emoji}</div>
                <div>
                  <h3 className="font-black text-white text-sm mb-1">{t.title}</h3>
                  <p className="text-white/45 text-xs leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Book a session form */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-2">Book a Counseling Session</h2>
          <p className="text-white/40 text-sm text-center mb-8">Tell us your challenge and we&#39;ll reach out within 24 hours to schedule your session.</p>

          {submitted ? (
            <div className="glass rounded-2xl p-10 text-center border border-pink-500/20">
              <div className="w-16 h-16 rounded-full bg-pink-500/15 flex items-center justify-center mx-auto mb-4 text-3xl">🎯</div>
              <h2 className="text-white font-black text-xl mb-2">Session Request Sent!</h2>
              <p className="text-white/50 text-sm mb-4">We&#39;ll email <strong className="text-white">{form.email}</strong> within 24 hours to confirm your session.</p>
              <p className="text-white/30 text-xs mb-6">Or book instantly via Google Calendar:</p>
              <a href="https://calendar.app.google/HbKg3j7UYVZXKxxaA" target="_blank" rel="noreferrer"
                className="text-white font-bold px-6 py-3 rounded-xl text-sm inline-block transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#EC4899,#8B5CF6)" }}>
                Open Calendar Booking
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 md:p-8 border border-white/8 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">Full Name *</label>
                  <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Aarav Mehta"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-pink-500/50 placeholder-white/20" />
                </div>
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">Email Address *</label>
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="aarav@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-pink-500/50 placeholder-white/20" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">Phone Number</label>
                  <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 9876543210"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-pink-500/50 placeholder-white/20" />
                </div>
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">Years of Experience</label>
                  <input value={form.experience} onChange={(e) => set("experience", e.target.value)} placeholder="e.g. Fresher, 2 years, 8 years"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-pink-500/50 placeholder-white/20" />
                </div>
              </div>
              <div>
                <label className="text-white/60 text-xs font-semibold mb-1.5 block">Primary Topic</label>
                <select value={form.topic} onChange={(e) => set("topic", e.target.value)}
                  className="w-full bg-[#0D0D2B] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500/50 text-white/80">
                  <option value="">Select your main challenge</option>
                  {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/60 text-xs font-semibold mb-1.5 block">Describe your situation</label>
                <textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={4}
                  placeholder="What's your current challenge? What role are you targeting? What have you tried so far?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm resize-none focus:outline-none focus:border-pink-500/50 placeholder-white/20" />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={submitting}
                className="w-full py-3.5 rounded-xl font-black text-sm text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#EC4899,#8B5CF6)" }}>
                {submitting ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Sending…</> : "Book Counseling Session →"}
              </button>
              <p className="text-white/25 text-xs text-center">Or book instantly at{" "}
                <a href="https://calendar.app.google/HbKg3j7UYVZXKxxaA" target="_blank" rel="noreferrer" className="text-pink-400 underline">Google Calendar</a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
