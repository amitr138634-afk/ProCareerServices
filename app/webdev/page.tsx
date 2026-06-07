"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const PROJECT_TYPES = [
  "Business / Corporate Website",
  "E-commerce / Online Store",
  "Personal Blog or Portfolio",
  "Restaurant / Café / Shop Website",
  "Booking & Appointment System",
  "Mobile App (Android / iOS)",
  "Web Application / SaaS",
  "Landing Page / Lead Generation",
  "Brand Identity & Logo Design",
  "Other",
];

const BUDGET_OPTIONS = [
  "₹2,999 – ₹9,999 (Starter)",
  "₹10,000 – ₹29,999 (Professional)",
  "₹30,000 – ₹99,999 (Business)",
  "₹1,00,000+ (Enterprise)",
  "Not sure yet — tell me what I need",
];

const SERVICES_OFFERED = [
  { icon: "🌐", title: "Business Websites", desc: "Professional multi-page websites for shops, agencies, clinics, restaurants, and any business that wants to be found online." },
  { icon: "🛒", title: "E-commerce Stores", desc: "Full online stores with product listings, cart, payments (Razorpay/Stripe), inventory management, and order tracking." },
  { icon: "📱", title: "Mobile Apps", desc: "Native Android and iOS apps or cross-platform solutions built with React Native — from concept to App Store." },
  { icon: "✍️", title: "Personal Blogs", desc: "Clean, fast, SEO-optimised blogs with admin CMS so you can write and publish without touching code." },
  { icon: "🎨", title: "Branding & Identity", desc: "Logo design, brand colors, typography, and a complete brand kit that makes your business memorable." },
  { icon: "⚡", title: "Web Applications", desc: "Custom dashboards, SaaS tools, internal systems, booking platforms — complex apps built with Next.js and modern tech." },
];

export default function WebDevPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", projectType: "",
    budget: "", deadline: "", description: "", existingWebsite: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.projectType || !form.description) {
      setError("Please fill in Name, Email, Project Type, and Description.");
      return;
    }
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/service-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          serviceType: "web-app-development",
          profileType: form.projectType,
          message: `Budget: ${form.budget || "Not specified"}\nDeadline: ${form.deadline || "Flexible"}\nExisting site: ${form.existingWebsite || "None"}\n\n${form.description}`,
          hasResume: false,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or email us directly.");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="relative min-h-screen bg-brand-bg text-white overflow-x-hidden">
      <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      <div className="noise-overlay" />
      <Navbar />

      {/* Hero */}
      <section className="relative z-10 pt-28 pb-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#06B6D4]/25 bg-[#06B6D4]/8 text-[#06B6D4] text-xs font-bold mb-5">
            🌐 Web & App Development
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
            We Build Websites & Apps<br />
            <span style={{ background: "linear-gradient(135deg,#06B6D4,#0EA5E9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              That Actually Work for Your Business
            </span>
          </h1>
          <p className="text-white/45 text-sm max-w-xl mx-auto mb-8">
            From a simple shop landing page to a full e-commerce store or mobile app — we design, develop, and deliver on time. Starting at just ₹2,999.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#enquiry" className="btn-glow text-white font-black px-7 py-3 rounded-xl text-sm">Get Free Quote →</a>
            <a href="#services" className="text-white/60 hover:text-white font-bold px-7 py-3 rounded-xl text-sm border border-white/15 hover:border-white/30 transition-all">See Services</a>
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section id="services" className="relative z-10 py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-center mb-8">What We Build</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES_OFFERED.map((s) => (
              <div key={s.title} className="glass rounded-2xl p-5 border border-white/8 hover:border-[#06B6D4]/30 transition-all">
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3 className="text-white font-black text-sm mb-2">{s.title}</h3>
                <p className="text-white/45 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="relative z-10 py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { tier: "Starter", price: "₹2,999+", items: ["Landing page / 1-pager", "Mobile responsive", "Contact form", "3-day delivery"], color: "#10B981" },
              { tier: "Professional", price: "₹9,999+", items: ["Multi-page website", "CMS for content updates", "SEO setup", "5-day delivery"], color: "#06B6D4", highlight: true },
              { tier: "Business", price: "₹29,999+", items: ["E-commerce / Web app", "Payment integration", "Admin dashboard", "Custom timeline"], color: "#8B5CF6" },
            ].map((p) => (
              <div key={p.tier} className="glass rounded-2xl p-5 border flex flex-col"
                style={{ borderColor: `${p.color}30`, background: (p as { highlight?: boolean }).highlight ? `${p.color}08` : undefined }}>
                {(p as { highlight?: boolean }).highlight && (
                  <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: p.color }}>Most Popular</div>
                )}
                <h3 className="text-white font-black mb-1">{p.tier}</h3>
                <div className="text-2xl font-black mb-4" style={{ color: p.color }}>{p.price}</div>
                <ul className="space-y-1.5 flex-1">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-white/55">
                      <svg className="w-3 h-3 flex-shrink-0" style={{ color: p.color }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="#enquiry" className="mt-4 text-center py-2 rounded-xl text-white font-bold text-xs transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(135deg,${p.color}cc,${p.color}55)` }}>
                  Get Quote →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry form */}
      <section id="enquiry" className="relative z-10 py-14 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black mb-2">Get Your Free Quote</h2>
            <p className="text-white/40 text-sm">Tell us what you need. We respond within 24 hours with a detailed proposal.</p>
          </div>

          {submitted ? (
            <div className="glass rounded-2xl p-10 text-center border border-[#06B6D4]/25">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-white font-black text-xl mb-2">Enquiry Received!</h3>
              <p className="text-white/50 text-sm mb-4">We'll review your requirements and get back to you within 24 hours with a detailed quote.</p>
              <p className="text-white/30 text-xs">Check your email ({form.email}) for confirmation.</p>
              <div className="mt-6 flex gap-3 justify-center">
                <Link href="/" className="btn-glow text-white font-bold px-5 py-2.5 rounded-xl text-sm">Back to Home</Link>
                <button onClick={() => setSubmitted(false)} className="text-white/40 hover:text-white text-sm border border-white/10 px-5 py-2.5 rounded-xl transition-colors">Submit Another</button>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(6,182,212,0.2)" }}>
              <div className="h-[2px]" style={{ background: "linear-gradient(90deg,transparent,#06B6D4,transparent)" }} />
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/55 text-xs font-semibold mb-1.5 block">Your Name *</label>
                    <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Raj Sharma"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#06B6D4]/50 placeholder-white/20" />
                  </div>
                  <div>
                    <label className="text-white/55 text-xs font-semibold mb-1.5 block">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="raj@business.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#06B6D4]/50 placeholder-white/20" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/55 text-xs font-semibold mb-1.5 block">Phone</label>
                    <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#06B6D4]/50 placeholder-white/20" />
                  </div>
                  <div>
                    <label className="text-white/55 text-xs font-semibold mb-1.5 block">Project Type *</label>
                    <select value={form.projectType} onChange={(e) => set("projectType", e.target.value)}
                      className="w-full bg-[#07071A] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#06B6D4]/50 text-white/80">
                      <option value="">Select project type</option>
                      {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/55 text-xs font-semibold mb-1.5 block">Budget Range</label>
                    <select value={form.budget} onChange={(e) => set("budget", e.target.value)}
                      className="w-full bg-[#07071A] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#06B6D4]/50 text-white/80">
                      <option value="">Select budget</option>
                      {BUDGET_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/55 text-xs font-semibold mb-1.5 block">Deadline</label>
                    <input value={form.deadline} onChange={(e) => set("deadline", e.target.value)} placeholder="e.g., 2 weeks / 1 month / Flexible"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#06B6D4]/50 placeholder-white/20" />
                  </div>
                </div>

                <div>
                  <label className="text-white/55 text-xs font-semibold mb-1.5 block">Existing Website (if any)</label>
                  <input value={form.existingWebsite} onChange={(e) => set("existingWebsite", e.target.value)} placeholder="https://yoursite.com (or leave blank)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#06B6D4]/50 placeholder-white/20" />
                </div>

                <div>
                  <label className="text-white/55 text-xs font-semibold mb-1.5 block">Project Description *</label>
                  <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5}
                    placeholder="Describe your project — what does your business do, who are your customers, what pages/features do you need, any reference sites you like…"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm resize-none focus:outline-none focus:border-[#06B6D4]/50 placeholder-white/20" />
                </div>

                {error && <p className="text-red-400 text-xs">{error}</p>}

                <button type="submit" disabled={submitting}
                  className="w-full py-3.5 rounded-xl text-white font-black text-sm transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#06B6D4,#0EA5E9)" }}>
                  {submitting
                    ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Sending…</span>
                    : "Send Enquiry — Get Free Quote →"}
                </button>
                <p className="text-white/20 text-xs text-center">We respond within 24 hours · No spam, ever</p>
              </form>
            </div>
          )}
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-8 px-6 text-center">
        <Link href="/" className="text-white/30 hover:text-white text-xs transition-colors">← Back to ProCareerLaunchpad</Link>
      </footer>
    </div>
  );
}
