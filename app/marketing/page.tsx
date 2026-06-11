"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";

type Service = {
  slug: string;
  label: string;
  short: string;
  blurb: string;
  gradient: string;
  accent: string;
};

const SERVICES: Record<string, Service> = {
  seo: {
    slug: "seo",
    label: "Search Engine Optimization",
    short: "SEO",
    blurb:
      "Rank higher on Google and pull in steady organic traffic — on-page, technical, and content SEO done right.",
    gradient: "linear-gradient(90deg,#22C55E,#10B981)",
    accent: "#22C55E",
  },
  smm: {
    slug: "smm",
    label: "Social Media Marketing",
    short: "SMM",
    blurb:
      "Grow and engage your audience across Instagram, Facebook, and LinkedIn with a managed social strategy.",
    gradient: "linear-gradient(90deg,#38BDF8,#0EA5E9)",
    accent: "#38BDF8",
  },
  "google-ads": {
    slug: "google-ads",
    label: "Google Ads",
    short: "Google Ads",
    blurb:
      "High-intent Search, Display, and YouTube campaigns tuned to bring you qualified leads at the lowest cost.",
    gradient: "linear-gradient(90deg,#EF4444,#F59E0B)",
    accent: "#EF4444",
  },
  "meta-ads": {
    slug: "meta-ads",
    label: "Meta Ads",
    short: "Meta Ads",
    blurb:
      "Facebook & Instagram ad campaigns with sharp targeting, creatives, and funnels that convert.",
    gradient: "linear-gradient(90deg,#3B82F6,#6366F1)",
    accent: "#3B82F6",
  },
  "email-marketing": {
    slug: "email-marketing",
    label: "Email Marketing",
    short: "Email Marketing",
    blurb:
      "Automated email funnels, newsletters, and broadcasts that nurture leads and drive repeat business.",
    gradient: "linear-gradient(90deg,#FB7185,#EC4899)",
    accent: "#FB7185",
  },
};

const DEFAULT_SERVICE: Service = {
  slug: "digital-marketing",
  label: "Digital Marketing",
  short: "Digital Marketing",
  blurb:
    "Tell us what you're after and our team will put together a tailored growth plan for your business.",
  gradient: "linear-gradient(90deg,#10B981,#0EA5E9)",
  accent: "#10B981",
};

function MarketingForm() {
  const params = useSearchParams();
  const key = (params.get("service") ?? "").toLowerCase();
  const service = SERVICES[key] ?? DEFAULT_SERVICE;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();
    const contactNumber = form.contactNumber.trim();

    if (!firstName || !lastName || !email || !contactNumber) {
      setError("All fields are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setError("");

    const body = new FormData();
    body.append("name", `${firstName} ${lastName}`);
    body.append("email", email);
    body.append("phone", contactNumber);
    body.append("serviceType", service.slug);
    body.append("message", `Lead enquiry for ${service.label}.`);

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

  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none placeholder-white/20 transition-colors";

  return (
    <div className="relative z-10 max-w-2xl mx-auto px-6 pt-32 pb-16">
      {/* Hero */}
      <div className="text-center mb-10">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 border"
          style={{
            borderColor: `${service.accent}55`,
            background: `${service.accent}14`,
            color: service.accent,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: service.accent }}
          />
          FREE CONSULTATION · NO UPFRONT COST
        </div>
        <h1 className="text-3xl md:text-5xl font-black mb-4">
          <span
            style={{
              background: service.gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {service.label}
          </span>
        </h1>
        <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed">
          {service.blurb}
        </p>
      </div>

      {/* Form / Success */}
      {submitted ? (
        <div className="glass rounded-2xl p-10 text-center border border-white/10">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
            style={{ background: `${service.accent}26` }}
          >
            ✅
          </div>
          <h2 className="text-white font-black text-xl mb-2">Thank you!</h2>
          <p className="text-white/50 text-sm mb-6">
            We&#39;ve received your enquiry for{" "}
            <strong className="text-white">{service.short}</strong>. Our team will
            reach out to <strong className="text-white">{form.email}</strong> within
            24 hours.
          </p>
          <a
            href="/"
            className="text-white font-bold px-6 py-3 rounded-xl text-sm inline-block transition-all hover:opacity-90"
            style={{ background: service.gradient }}
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
              <label className="text-white/60 text-xs font-semibold mb-1.5 block">
                First Name *
              </label>
              <input
                required
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                placeholder="Priya"
                className={inputCls}
                style={{ borderColor: undefined }}
              />
            </div>
            <div>
              <label className="text-white/60 text-xs font-semibold mb-1.5 block">
                Last Name *
              </label>
              <input
                required
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                placeholder="Sharma"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="text-white/60 text-xs font-semibold mb-1.5 block">
              Email Address *
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="priya@email.com"
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-white/60 text-xs font-semibold mb-1.5 block">
              Contact Number *
            </label>
            <input
              required
              type="tel"
              value={form.contactNumber}
              onChange={(e) => set("contactNumber", e.target.value)}
              placeholder="+91 9876543210"
              className={inputCls}
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl font-black text-sm text-white disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: service.gradient }}
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
              "Request Free Consultation →"
            )}
          </button>

          <p className="text-white/25 text-xs text-center">
            Response within 24 hours · info@procareerlaunchpad.com
          </p>
        </form>
      )}
    </div>
  );
}

export default function MarketingPage() {
  return (
    <div className="relative min-h-screen bg-brand-bg text-white overflow-x-hidden">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="noise-overlay" />
      <Navbar />
      <Suspense
        fallback={
          <div className="relative z-10 max-w-2xl mx-auto px-6 pt-32 pb-16 text-center text-white/40">
            Loading…
          </div>
        }
      >
        <MarketingForm />
      </Suspense>
    </div>
  );
}
