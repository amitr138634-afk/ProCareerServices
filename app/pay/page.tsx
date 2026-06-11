"use client";

import { useState } from "react";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const SERVICES = [
  { value: "portfolio",  label: "Portfolio Creation" },
  { value: "resume",     label: "Resume Writing" },
  { value: "content",    label: "Content Creation" },
  { value: "linkedin",   label: "LinkedIn Optimizer" },
  { value: "naukri",     label: "Naukri Optimizer" },
  { value: "ats",        label: "ATS Scanner" },
  { value: "counseling", label: "Career Counseling" },
  { value: "other",      label: "Other" },
];

const SVC_COLOR: Record<string, string> = {
  portfolio: "#F59E0B", resume: "#0EA5E9", content: "#EC4899",
  linkedin: "#10B981", naukri: "#FF6B35", ats: "#8B5CF6",
  counseling: "#6366F1", other: "#9CA3AF",
};

type Step = "form" | "paying" | "success" | "error";

export default function PayPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", service: "portfolio", requirements: "", amount: "",
  });
  const [step, setStep] = useState<Step>("form");
  const [paymentId, setPaymentId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const loadRazorpay = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(form.amount);
    if (!amt || amt < 1) { setErrorMsg("Please enter a valid amount."); return; }

    setStep("paying");
    setErrorMsg("");

    const loaded = await loadRazorpay();
    if (!loaded) { setStep("error"); setErrorMsg("Payment gateway failed to load. Check internet connection."); return; }

    const res = await fetch("/api/pay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amt }),
    });
    const { orderId } = await res.json();
    if (!orderId) { setStep("error"); setErrorMsg("Failed to initiate payment."); return; }

    new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amt * 100,
      currency: "INR",
      order_id: orderId,
      name: "Shyam Pro Services",
      description: SERVICES.find((s) => s.value === form.service)?.label ?? form.service,
      prefill: { name: form.name, email: form.email, contact: form.phone },
      theme: { color: "#10B981" },
      handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
        const verify = await fetch("/api/pay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            name: form.name,
            email: form.email,
            phone: form.phone,
            service: form.service,
            requirements: form.requirements,
            amount: amt,
          }),
        });
        const v = await verify.json();
        if (v.verified) { setPaymentId(v.paymentId); setStep("success"); }
        else { setStep("error"); setErrorMsg("Payment verification failed. Contact us with your payment ID."); }
      },
      modal: { ondismiss: () => setStep("form") },
    }).open();
  };

  const accentColor = SVC_COLOR[form.service] ?? "#10B981";

  return (
    <div className="min-h-screen bg-brand-bg text-white">
      {/* Nav */}
      <div className="glass-dark border-b border-white/8 px-6 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 btn-glow rounded-lg flex items-center justify-center text-white font-black text-xs">S</div>
          <span className="font-black text-white">Shyam Pro <span className="text-brand-teal">Services</span></span>
        </a>
        <a href="/" className="text-white/35 hover:text-white/70 text-xs transition-colors">← Back to home</a>
      </div>

      <div className="max-w-xl mx-auto px-6 py-14">

        {/* Success */}
        {step === "success" && (
          <div className="glass rounded-2xl border border-brand-teal/20 p-10 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-brand-teal/15 border border-brand-teal/30 flex items-center justify-center text-3xl mx-auto">✓</div>
            <h1 className="text-white font-black text-2xl">Payment Received!</h1>
            <p className="text-white/50 text-sm leading-relaxed">
              Thank you, <span className="text-white font-bold">{form.name}</span>. Your payment of{" "}
              <span className="text-brand-teal font-black">₹{Number(form.amount).toLocaleString("en-IN")}</span> for{" "}
              <span className="text-white font-bold">{SERVICES.find((s) => s.value === form.service)?.label}</span> has been confirmed.
            </p>
            <p className="text-white/30 text-xs">Our team will reach out to <span className="text-white/60">{form.email}</span> within 24 hours to get started.</p>
            {paymentId && <p className="text-white/20 font-mono text-[10px]">Ref: {paymentId}</p>}
            <a href="/" className="inline-block mt-2 px-6 py-3 btn-glow rounded-xl text-white font-black text-sm">Back to Home →</a>
          </div>
        )}

        {/* Error */}
        {step === "error" && (
          <div className="glass rounded-2xl border border-red-500/20 p-10 text-center space-y-4">
            <div className="text-4xl">⚠️</div>
            <h2 className="text-red-400 font-black text-xl">Something went wrong</h2>
            <p className="text-white/40 text-sm">{errorMsg}</p>
            <button onClick={() => setStep("form")} className="px-6 py-3 btn-glow rounded-xl text-white font-black text-sm">Try Again</button>
          </div>
        )}

        {/* Form */}
        {(step === "form" || step === "paying") && (
          <>
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 mb-3">
                <div className="w-9 h-9 btn-glow rounded-xl flex items-center justify-center text-white font-black">S</div>
                <span className="font-black text-white text-xl">Shyam Pro <span style={{ color: accentColor }}>Services</span></span>
              </div>
              <h1 className="text-white font-black text-2xl mb-2">Service Payment</h1>
              <p className="text-white/40 text-sm">Fill in your details and pay securely via Razorpay.</p>
            </div>

            <form onSubmit={handlePay} className="glass-dark rounded-2xl border border-white/8 p-8 space-y-5">

              {/* Name */}
              <div>
                <label className="text-white/50 text-xs font-bold uppercase tracking-widest block mb-1.5">Full Name *</label>
                <input type="text" required placeholder="Amit Kumar" value={form.name} onChange={set("name")}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/20" />
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-widest block mb-1.5">Email *</label>
                  <input type="email" required placeholder="you@email.com" value={form.email} onChange={set("email")}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/20" />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-widest block mb-1.5">Phone *</label>
                  <input type="tel" required placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/20" />
                </div>
              </div>

              {/* Service */}
              <div>
                <label className="text-white/50 text-xs font-bold uppercase tracking-widest block mb-1.5">Service *</label>
                <select required value={form.service} onChange={set("service")}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                  style={{ borderColor: accentColor + "40" }}>
                  {SERVICES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* Requirements */}
              <div>
                <label className="text-white/50 text-xs font-bold uppercase tracking-widest block mb-1.5">Requirements / Message</label>
                <textarea placeholder="Briefly describe what you need (optional)…" value={form.requirements} onChange={set("requirements")}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/20 resize-none" />
              </div>

              {/* Amount */}
              <div>
                <label className="text-white/50 text-xs font-bold uppercase tracking-widest block mb-1.5">Amount (₹) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm">₹</span>
                  <input
                    type="number" required min={1} step={1}
                    placeholder="Enter amount as quoted by us"
                    value={form.amount} onChange={set("amount")}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/20"
                    style={{ borderColor: form.amount ? accentColor + "50" : undefined }} />
                </div>
                {form.amount && Number(form.amount) > 0 && (
                  <p className="text-xs mt-1.5 font-bold" style={{ color: accentColor }}>
                    You will pay ₹{Number(form.amount).toLocaleString("en-IN")}
                  </p>
                )}
              </div>

              {errorMsg && <p className="text-red-400 text-xs bg-red-400/8 border border-red-400/20 rounded-lg px-3 py-2">{errorMsg}</p>}

              <button type="submit" disabled={step === "paying"}
                className="w-full py-3.5 rounded-xl font-black text-sm text-white transition-all disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)` }}>
                {step === "paying" ? "Opening payment…" : `Pay ₹${form.amount ? Number(form.amount).toLocaleString("en-IN") : "—"} →`}
              </button>

              <p className="text-white/20 text-[11px] text-center">Secured by Razorpay · UPI, Cards, Net Banking accepted · No data stored without consent</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
