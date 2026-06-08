"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

const FEATURES = [
  { icon: "🏭", title: "Custom ERP Setup", desc: "We design and implement ERP systems tailored to your business — manufacturing, retail, services, or e-commerce." },
  { icon: "👥", title: "HR, Payroll & Attendance", desc: "Automate salary processing, leave management, attendance tracking, and employee records — no spreadsheets." },
  { icon: "📦", title: "Inventory & Supply Chain", desc: "Real-time stock tracking, supplier management, purchase orders, and demand forecasting powered by AI." },
  { icon: "💰", title: "Finance, Invoicing & Reporting", desc: "Automated invoicing, GST-compliant billing, P&L reports, and cash flow dashboards for business decisions." },
  { icon: "🤝", title: "CRM + Sales Pipeline", desc: "Track leads, manage follow-ups, automate outreach, and get AI insights on your top conversion opportunities." },
];

export default function ErpPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", businessType: "", message: "" });
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
    body.append("serviceType", "erp-interest");
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-400/30 bg-teal-400/5 text-teal-300 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            COMING SOON
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            ERP & Business Solutions —{" "}
            <span style={{ background: "linear-gradient(90deg,#14B8A6,#0EA5E9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Run Smarter
            </span>
          </h1>
          <p className="text-white/50 text-base max-w-2xl mx-auto leading-relaxed">
            AI-driven ERP and business automation for SMEs and startups. Cut manual work, reduce errors, and get real-time insights — without enterprise-level costs.
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
            <h2 className="text-2xl font-black mb-2">Express Your Interest</h2>
            <p className="text-white/40 text-sm">Tell us about your business and we&#39;ll reach out with a custom proposal.</p>
          </div>

          {submitted ? (
            <div className="glass rounded-2xl p-10 text-center border border-teal-400/20">
              <div className="text-3xl mb-4">🏭</div>
              <h2 className="text-white font-black text-xl mb-2">Thanks for your interest!</h2>
              <p className="text-white/50 text-sm mb-6">We&#39;ll reach out to <strong className="text-white">{form.email}</strong> with a custom ERP proposal for your business.</p>
              <a href="/" className="text-white font-bold px-6 py-3 rounded-xl text-sm inline-block hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg,#14B8A6,#0EA5E9)" }}>← Back to Home</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 border border-white/8 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">Your Name *</label>
                  <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Rohit Mehta"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-400/50 placeholder-white/20" />
                </div>
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="rohit@company.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-400/50 placeholder-white/20" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">Company Name</label>
                  <input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Your Company"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-400/50 placeholder-white/20" />
                </div>
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-400/50 placeholder-white/20" />
                </div>
              </div>
              <div>
                <label className="text-white/60 text-xs font-semibold mb-1.5 block">Business Type</label>
                <select value={form.businessType} onChange={(e) => set("businessType", e.target.value)}
                  className="w-full bg-[#0D0D2B] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-400/50 text-white/80">
                  <option value="">Select your business type</option>
                  <option>Manufacturing</option>
                  <option>Retail / E-commerce</option>
                  <option>Services / Consulting</option>
                  <option>Startup</option>
                  <option>Healthcare</option>
                  <option>Logistics / Supply Chain</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-white/60 text-xs font-semibold mb-1.5 block">What problem do you want to solve?</label>
                <textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={3}
                  placeholder="e.g., We're tracking inventory in Excel, managing payroll manually, have no CRM..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm resize-none focus:outline-none focus:border-teal-400/50 placeholder-white/20" />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={submitting}
                className="w-full py-3.5 rounded-xl font-black text-sm text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#14B8A6,#0EA5E9)" }}>
                {submitting ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Sending…</> : "Get a Custom ERP Proposal →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
