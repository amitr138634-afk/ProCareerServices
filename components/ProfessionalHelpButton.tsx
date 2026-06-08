"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function ProfessionalHelpButton({ service }: { service: string }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/service-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          serviceType: `${service} — Professional Help`,
          message: form.message || "User requested professional assistance.",
        }),
      });
      if (res.ok) setStatus("done");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="mt-4 p-4 rounded-xl border border-brand-teal/20 bg-brand-teal/5 text-center">
        <p className="text-brand-teal text-sm font-bold">✓ Request sent!</p>
        <p className="text-white/40 text-xs mt-1">Our team will reach out to <span className="text-white/60">{form.email}</span> within 24 hours.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full py-2.5 rounded-xl text-xs text-white/35 hover:text-white/60 border border-white/8 hover:border-white/15 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Need professional help? Our experts can do this for you — optional
        </button>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-white/70 text-xs font-bold">Get Expert Help</p>
            <button onClick={() => setOpen(false)} className="text-white/25 hover:text-white/50 text-xs">✕ close</button>
          </div>
          <p className="text-white/35 text-[11px]">We'll review your profile and personally help you optimise it. Our team will contact you within 24 hours.</p>

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                required type="text" placeholder="Your name"
                value={form.name} onChange={set("name")}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-teal/40 placeholder-white/20"
              />
              <input
                required type="email" placeholder="Your email"
                value={form.email} onChange={set("email")}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-teal/40 placeholder-white/20"
              />
            </div>
            <input
              type="tel" placeholder="Phone number (optional)"
              value={form.phone} onChange={set("phone")}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand-teal/40 placeholder-white/20"
            />
            <textarea
              placeholder="What specific help do you need? (optional)"
              value={form.message} onChange={set("message")}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs resize-none focus:outline-none focus:border-brand-teal/40 placeholder-white/20"
            />
            {status === "error" && <p className="text-red-400 text-[11px]">Something went wrong. Please try again.</p>}
            <button
              type="submit" disabled={status === "sending"}
              className="w-full py-2 rounded-lg btn-glow text-white text-xs font-bold disabled:opacity-50"
            >
              {status === "sending" ? "Sending…" : "Request Expert Help →"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
