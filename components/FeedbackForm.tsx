"use client";

import { useState } from "react";

const SERVICES = [
  "LinkedIn Optimizer", "ATS Resume Scanner", "Resume Creation",
  "Portfolio Creation", "Career Counseling", "Social Media Marketing", "General",
];

export default function FeedbackForm() {
  const [form, setForm] = useState({ name: "", email: "", service: "", rating: 0, message: "" });
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.rating || !form.message) {
      setError("Please fill in all required fields and select a rating.");
      return;
    }
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="py-8 text-center">
        <div className="text-5xl mb-4">🙏</div>
        <h3 className="text-white font-black text-lg mb-2">Thank you, {form.name}!</h3>
        <p className="text-white/50 text-sm">Your review will appear on our site after verification.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star rating */}
        <div>
          <label className="text-white/60 text-xs font-semibold mb-2 block">Your Rating *</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => set("rating", star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110"
              >
                <svg
                  className="w-8 h-8 transition-colors"
                  style={{ color: star <= (hover || form.rating) ? "#FBBF24" : "rgba(255,255,255,0.15)" }}
                  fill="currentColor" viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
            {form.rating > 0 && (
              <span className="text-amber-400 text-sm font-bold self-center ml-1">
                {["", "Poor", "Fair", "Good", "Great", "Excellent!"][form.rating]}
              </span>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-white/60 text-xs font-semibold mb-1.5 block">Your Name *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Rahul Sharma"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/20" />
          </div>
          <div>
            <label className="text-white/60 text-xs font-semibold mb-1.5 block">Email *</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="rahul@email.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/20" />
          </div>
        </div>

        <div>
          <label className="text-white/60 text-xs font-semibold mb-1.5 block">Service Used</label>
          <select value={form.service} onChange={(e) => set("service", e.target.value)}
            className="w-full bg-[#0D0D2B] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal/50 text-white/80">
            <option value="">Select a service (optional)</option>
            {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="text-white/60 text-xs font-semibold mb-1.5 block">Your Review *</label>
          <textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={4}
            placeholder="Tell us about your experience — what changed, what worked, what you'd recommend to others…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm resize-none focus:outline-none focus:border-brand-teal/50 placeholder-white/20" />
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button type="submit" disabled={submitting}
          className="w-full py-3 rounded-xl font-black text-sm text-white btn-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {submitting
            ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Submitting…</>
            : "Submit Review →"}
        </button>

        <p className="text-white/20 text-xs text-center">Reviews are published after verification · Your email is never shown publicly</p>
      </form>
  );
}
