"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

const PLATFORMS = [
  "LinkedIn",
  "Instagram",
  "Facebook",
  "Website / Blog",
  "All Platforms",
];
const CONTENT_TYPES = [
  "Posts & Carousels",
  "Reels / Short Videos",
  "Blog Articles",
  "Stories",
  "All Content Types",
];
const GOALS = [
  "Personal Branding",
  "Job Search Visibility",
  "Thought Leadership",
  "Business Promotion",
  "Community Building",
];

const offerings = [
  {
    icon: "💼",
    title: "LinkedIn Content",
    desc: "Posts, carousels, thought-leadership articles, and polls — optimised for the LinkedIn algorithm to grow followers and attract recruiters.",
  },
  {
    icon: "📸",
    title: "Instagram & Facebook",
    desc: "Feed posts, reels scripts, stories, and captions — visually branded content that builds your audience on Meta platforms.",
  },
  {
    icon: "📝",
    title: "Blog / Website Writing",
    desc: "SEO-optimised long-form articles for your website or Medium — establish authority in your niche and drive organic traffic.",
  },
  {
    icon: "🎬",
    title: "Reels & Short-Form Video",
    desc: "Punchy scripts and shot lists for Instagram Reels and Facebook videos — designed to maximise reach and saves.",
  },
  {
    icon: "📅",
    title: "Content Calendar",
    desc: "30-day multi-platform content plan aligned with your goals, audience, and platform-specific peak posting times.",
  },
  {
    icon: "📊",
    title: "Analytics & Growth",
    desc: "Monthly performance review across all platforms with strategy refinements based on what's actually working.",
  },
];

export default function ContentPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    platform: "",
    contentType: "",
    goal: "",
    currentRole: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      setError("Name and email are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => body.append(k, v));
    body.append("serviceType", "content-creation");
    try {
      const res = await fetch("/api/service-request", { method: "POST", body });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Email us at info@procareerlaunchpad.com");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-bg text-white overflow-x-hidden">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="noise-overlay" />
      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/5 text-yellow-400 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            AI + HUMAN CONTENT CREATION
          </div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="inline-flex items-baseline gap-1 px-4 py-2 rounded-2xl border border-yellow-500/30 bg-yellow-500/8">
              <span className="text-3xl font-black text-yellow-400">₹500</span>
              <span className="text-yellow-400/60 text-sm font-semibold">/week</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            Content That Builds Your{" "}
            <span
              style={{
                background: "linear-gradient(90deg,#F59E0B,#EF4444)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Personal Brand
            </span>
          </h1>
          <p className="text-white/50 text-base max-w-2xl mx-auto leading-relaxed">
            We create reels, posts, blogs, and carousels for{" "}
            <strong className="text-white/80">LinkedIn, Instagram, Facebook,</strong> and your website —
            AI-drafted, human-refined, posted consistently so you stay visible and grow.
          </p>

          {/* Platform badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["LinkedIn", "Instagram", "Facebook", "Website / Blog", "Reels", "Posts", "Blogs"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-semibold border border-white/10 bg-white/5 text-white/60"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Offerings grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-14">
          {offerings.map((o) => (
            <div key={o.title} className="glass rounded-2xl p-5 border border-white/8">
              <div className="text-2xl mb-3">{o.icon}</div>
              <h3 className="font-black text-white text-sm mb-1">{o.title}</h3>
              <p className="text-white/45 text-xs leading-relaxed">{o.desc}</p>
            </div>
          ))}
        </div>

        {/* AI Generator — Coming Soon */}
        <div className="mb-14">
          <div className="relative glass rounded-2xl p-8 border border-yellow-500/20 overflow-hidden">
            {/* Glow */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 0%, #F59E0B 0%, transparent 70%)" }}
            />
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 text-xs font-bold mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                COMING SOON
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-3">
                AI Content Generator
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Describe your topic and target platform — our AI will instantly generate ready-to-post
                LinkedIn posts, Instagram captions, Facebook posts, reel scripts, and blog drafts
                tailored to your personal brand.
              </p>

              {/* Feature preview pills */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {[
                  "LinkedIn Post",
                  "Instagram Caption",
                  "Facebook Post",
                  "Reel Script",
                  "Blog Article",
                  "Story Content",
                  "Carousel Copy",
                ].map((f) => (
                  <span
                    key={f}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-yellow-500/20 bg-yellow-500/5 text-yellow-400/70"
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* Disabled generator preview */}
              <div className="glass rounded-xl p-5 border border-white/8 opacity-50 cursor-not-allowed select-none text-left mb-4">
                <div className="flex gap-3 mb-4">
                  <div className="flex-1">
                    <div className="text-white/30 text-xs font-semibold mb-1.5">Platform</div>
                    <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white/20 text-sm">
                      Select platform…
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-white/30 text-xs font-semibold mb-1.5">Content Type</div>
                    <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white/20 text-sm">
                      Select type…
                    </div>
                  </div>
                </div>
                <div className="text-white/30 text-xs font-semibold mb-1.5">What do you want to post about?</div>
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/15 text-sm h-16">
                  Describe your topic or idea…
                </div>
                <div className="mt-4 py-3 rounded-xl text-center text-sm font-black text-white/20 border border-white/10">
                  Generate Content →
                </div>
              </div>

              <p className="text-white/30 text-xs">
                Be the first to know when it launches — submit the form below and we&#39;ll notify you.
              </p>
            </div>
          </div>
        </div>

        {/* Enquiry form */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-2">Request Your Content Plan</h2>
          <p className="text-white/40 text-sm text-center mb-8">
            Tell us about your goals and we&#39;ll build a personalised multi-platform content strategy for you.
          </p>

          {submitted ? (
            <div className="glass rounded-2xl p-10 text-center border border-yellow-500/20">
              <div className="w-16 h-16 rounded-full bg-yellow-500/15 flex items-center justify-center mx-auto mb-4 text-3xl">
                🚀
              </div>
              <h2 className="text-white font-black text-xl mb-2">We&#39;ll be in touch!</h2>
              <p className="text-white/50 text-sm mb-6">
                Expect an email at{" "}
                <strong className="text-white">{form.email}</strong> within 24 hours with your free
                content strategy overview.
              </p>
              <a
                href="/"
                className="text-white font-bold px-6 py-3 rounded-xl text-sm inline-block transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#F59E0B,#EF4444)" }}
              >
                ← Back to Home
              </a>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="glass rounded-2xl p-6 md:p-8 border border-white/8 space-y-5"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">Full Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Priya Patel"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50 placeholder-white/20"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">Email Address *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="priya@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50 placeholder-white/20"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50 placeholder-white/20"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">Current Role</label>
                  <input
                    value={form.currentRole}
                    onChange={(e) => set("currentRole", e.target.value)}
                    placeholder="Software Engineer, Founder, etc."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500/50 placeholder-white/20"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">Primary Platform</label>
                  <select
                    value={form.platform}
                    onChange={(e) => set("platform", e.target.value)}
                    className="w-full bg-[#0D0D2B] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500/50 text-white/80"
                  >
                    <option value="">Select platform</option>
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">Content Type</label>
                  <select
                    value={form.contentType}
                    onChange={(e) => set("contentType", e.target.value)}
                    className="w-full bg-[#0D0D2B] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500/50 text-white/80"
                  >
                    <option value="">Select type</option>
                    {CONTENT_TYPES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white/60 text-xs font-semibold mb-1.5 block">Primary Goal</label>
                <select
                  value={form.goal}
                  onChange={(e) => set("goal", e.target.value)}
                  className="w-full bg-[#0D0D2B] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500/50 text-white/80"
                >
                  <option value="">Select goal</option>
                  {GOALS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white/60 text-xs font-semibold mb-1.5 block">
                  Tell us about your goals
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  rows={4}
                  placeholder="What do you want to achieve? What topics do you want to post about? Any industry or audience details?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm resize-none focus:outline-none focus:border-yellow-500/50 placeholder-white/20"
                />
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl font-black text-sm text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#F59E0B,#EF4444)" }}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Sending…
                  </>
                ) : (
                  "Get Free Content Strategy →"
                )}
              </button>

              <p className="text-white/25 text-xs text-center">
                Response within 24 hours · info@procareerlaunchpad.com
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
