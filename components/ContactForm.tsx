"use client";

import { useState } from "react";

const SERVICE_INTERESTS = [
  "LinkedIn Optimizer",
  "ATS Resume Scanner",
  "AI Content Creation",
  "Portfolio Creation",
  "Career Counseling",
  "Courses (when available)",
  "General Enquiry",
];

export default function ContactForm() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", interest: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.message) { setError("Please fill in your name, email, and message."); return; }
    setSubmitting(true); setError("");
    const body = new FormData();
    body.append("name", `${form.firstName} ${form.lastName}`.trim());
    body.append("email", form.email);
    body.append("phone", form.phone);
    body.append("serviceType", "contact");
    body.append("profileType", form.interest);
    body.append("message", form.message);
    try {
      const res = await fetch("/api/service-request", { method: "POST", body });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please email us directly at info@procareerlaunchpad.com");
    } finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="glass rounded-2xl p-10 text-center border border-brand-teal/20">
        <div className="w-16 h-16 rounded-full bg-brand-teal/15 flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
        <h3 className="text-white font-black text-xl mb-2">Message Sent!</h3>
        <p className="text-white/50 text-sm">Thanks for reaching out, {form.firstName}. We&#39;ll get back to you at <strong className="text-white">{form.email}</strong> within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 md:p-8 border border-white/8 space-y-4 text-left">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-white/60 text-xs font-semibold mb-1.5 block">First Name *</label>
          <input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Rahul"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/20" />
        </div>
        <div>
          <label className="text-white/60 text-xs font-semibold mb-1.5 block">Last Name</label>
          <input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Sharma"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/20" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-white/60 text-xs font-semibold mb-1.5 block">Email Address *</label>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="rahul@email.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/20" />
        </div>
        <div>
          <label className="text-white/60 text-xs font-semibold mb-1.5 block">Phone Number</label>
          <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 9876543210"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/20" />
        </div>
      </div>
      <div>
        <label className="text-white/60 text-xs font-semibold mb-1.5 block">Service Interest</label>
        <select value={form.interest} onChange={(e) => set("interest", e.target.value)}
          className="w-full bg-[#0D0D2B] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-teal/50 text-white/80">
          <option value="">Select a service</option>
          {SERVICE_INTERESTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="text-white/60 text-xs font-semibold mb-1.5 block">Message *</label>
        <textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={4}
          placeholder="How can we help you?"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm resize-none focus:outline-none focus:border-brand-teal/50 placeholder-white/20" />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button type="submit" disabled={submitting}
        className="w-full btn-glow text-white font-black py-3.5 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {submitting ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Sending…</> : "Send Message →"}
      </button>
      <p className="text-white/25 text-xs text-center">We respond within 24 hours · info@procareerlaunchpad.com</p>
    </form>
  );
}
