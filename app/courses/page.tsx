"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

const COURSES = [
  {
    icon: "📄",
    title: "Resume & LinkedIn Masterclass",
    desc: "A to Z of building a resume that beats ATS filters and a LinkedIn profile that attracts recruiters — with templates, live examples, and AI tools.",
    modules: 8,
    duration: "4 hours",
    level: "All Levels",
  },
  {
    icon: "🎤",
    title: "Interview Preparation Bootcamp",
    desc: "HR rounds, technical interviews, case studies, and salary negotiation — with mock interview recordings and a question bank of 200+ real questions.",
    modules: 10,
    duration: "6 hours",
    level: "All Levels",
  },
  {
    icon: "💻",
    title: "In-Demand Tech Skills Fast-Track",
    desc: "Focused crash courses on the skills that are actually hiring: Python, React, SQL, AWS, and System Design — project-based, no fluff.",
    modules: 12,
    duration: "10 hours",
    level: "Beginner to Intermediate",
  },
  {
    icon: "📊",
    title: "Business & Product Skills",
    desc: "Product management fundamentals, data analytics with Excel/Power BI, digital marketing essentials, and startup business thinking.",
    modules: 8,
    duration: "5 hours",
    level: "All Levels",
  },
  {
    icon: "🏆",
    title: "Job Search Strategy & Placement",
    desc: "How to find hidden jobs, approach referrals, ace Naukri and LinkedIn search algorithms, and convert interviews to offers — with direct placement support.",
    modules: 6,
    duration: "3 hours",
    level: "All Levels",
  },
];

export default function CoursesPage() {
  const [form, setForm] = useState({ name: "", email: "", interest: "" });
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
    body.append("serviceType", "courses-waitlist");
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
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-400/30 bg-violet-400/5 text-violet-300 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            LAUNCHING SOON
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            Career Courses{" "}
            <span style={{ background: "linear-gradient(90deg,#A78BFA,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              That Actually Work
            </span>
          </h1>
          <p className="text-white/50 text-base max-w-2xl mx-auto leading-relaxed">
            Self-paced video courses on resume writing, LinkedIn, interview prep, and in-demand skills — with certificates, lifetime access, and direct placement support.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {["Certificate on Completion", "Lifetime Access", "AI Tools Included", "Placement Support", "Self-Paced"].map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 bg-white/5 text-white/60">
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Courses grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {COURSES.map((c, i) => (
            <div key={i} className={`glass rounded-2xl p-5 border border-white/8 ${i === 4 ? "md:col-span-2" : ""}`}>
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">{c.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-black text-white text-sm">{c.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-400/10 text-violet-300 border border-violet-400/20 font-semibold">{c.level}</span>
                  </div>
                  <p className="text-white/45 text-xs leading-relaxed mb-3">{c.desc}</p>
                  <div className="flex items-center gap-4 text-[11px] text-white/30">
                    <span>📚 {c.modules} modules</span>
                    <span>⏱ {c.duration}</span>
                    <span className="ml-auto font-bold text-violet-300/60">Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Waitlist form */}
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black mb-2">Join the Waitlist</h2>
            <p className="text-white/40 text-sm">
              Be the first to know when we launch — and get early-bird pricing.
            </p>
          </div>

          {submitted ? (
            <div className="glass rounded-2xl p-10 text-center border border-violet-400/20">
              <div className="w-16 h-16 rounded-full bg-violet-400/10 flex items-center justify-center mx-auto mb-4 text-3xl">🎓</div>
              <h2 className="text-white font-black text-xl mb-2">You&#39;re on the list!</h2>
              <p className="text-white/50 text-sm mb-6">
                We&#39;ll email <strong className="text-white">{form.email}</strong> the moment courses go live — with an exclusive early-bird discount.
              </p>
              <a href="/" className="text-white font-bold px-6 py-3 rounded-xl text-sm inline-block transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#A78BFA,#EC4899)" }}>
                ← Back to Home
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 md:p-8 border border-white/8 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">Full Name *</label>
                  <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Priya Sharma"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-400/50 placeholder-white/20" />
                </div>
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">Email Address *</label>
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="priya@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-400/50 placeholder-white/20" />
                </div>
              </div>
              <div>
                <label className="text-white/60 text-xs font-semibold mb-1.5 block">Which course interests you most?</label>
                <select value={form.interest} onChange={(e) => set("interest", e.target.value)}
                  className="w-full bg-[#0D0D2B] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-400/50 text-white/80">
                  <option value="">Select a course</option>
                  {COURSES.map((c) => <option key={c.title} value={c.title}>{c.title}</option>)}
                  <option value="All of them">All of them!</option>
                </select>
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={submitting}
                className="w-full py-3.5 rounded-xl font-black text-sm text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#A78BFA,#EC4899)" }}>
                {submitting ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Joining…</>
                ) : "Join Waitlist — It's Free →"}
              </button>
              <p className="text-white/25 text-xs text-center">No spam · Just one launch email and your early-bird discount</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
