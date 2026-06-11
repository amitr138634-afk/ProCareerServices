"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PaidStatus { isPaid: boolean; paidServices: string[]; }

const SERVICES = [
  {
    key: "linkedin",
    label: "LinkedIn Optimizer",
    desc: "AI analysis of your full LinkedIn profile — headline, about, experience, skills, and more.",
    href: "/optimize",
    color: "#10B981",
    bg: "from-[#10B981]/15 to-[#10B981]/5",
    border: "border-[#10B981]/20",
    icon: "in",
  },
  {
    key: "naukri",
    label: "Naukri Optimizer",
    desc: "Optimize your Naukri profile for maximum recruiter visibility in Indian job searches.",
    href: "/naukri",
    color: "#FF6B35",
    bg: "from-[#FF6B35]/15 to-[#FF6B35]/5",
    border: "border-[#FF6B35]/20",
    icon: "N",
  },
  {
    key: "ats",
    label: "ATS Resume Scanner",
    desc: "Check how your resume scores against Applicant Tracking Systems and get fix recommendations.",
    href: "/ats",
    color: "#8B5CF6",
    bg: "from-[#8B5CF6]/15 to-[#8B5CF6]/5",
    border: "border-[#8B5CF6]/20",
    icon: "✓",
  },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [paidStatus, setPaidStatus] = useState<PaidStatus>({ isPaid: false, paidServices: [] });
  const [loadingPaid, setLoadingPaid] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login?callbackUrl=/dashboard");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/check-session")
      .then((r) => r.json())
      .then((d) => setPaidStatus({ isPaid: d.isPaid, paidServices: d.paidServices ?? [] }))
      .finally(() => setLoadingPaid(false));
  }, [status]);

  if (status === "loading" || status === "unauthenticated") {
    return <div className="min-h-screen bg-brand-bg flex items-center justify-center"><div className="w-6 h-6 border-2 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin" /></div>;
  }

  const user = session?.user;

  return (
    <div className="min-h-screen bg-brand-bg text-white">
      {/* Nav */}
      <div className="glass-dark border-b border-white/8 px-6 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 btn-glow rounded-lg flex items-center justify-center text-white font-black text-xs">S</div>
          <span className="font-black text-white">Shyam Pro <span className="text-brand-teal">Services</span></span>
        </a>
        <div className="flex items-center gap-4">
          <a href="/" className="text-white/40 hover:text-white/70 text-xs transition-colors">← Home</a>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="text-white/30 hover:text-white/60 text-xs transition-colors">Sign out</button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-10">
          {user?.image
            ? <img src={user.image} alt="" className="w-14 h-14 rounded-full border-2 border-white/10" />
            : <div className="w-14 h-14 rounded-full bg-brand-teal/15 flex items-center justify-center text-brand-teal font-black text-xl border border-brand-teal/20">
                {(user?.name || user?.email || "U")[0].toUpperCase()}
              </div>}
          <div>
            <h1 className="text-white font-black text-xl">{user?.name || "Welcome"}</h1>
            <p className="text-white/40 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Services */}
        <div className="mb-6">
          <h2 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Your Services</h2>
          <div className="space-y-3">
            {SERVICES.map((svc) => {
              const hasAccess = !loadingPaid && paidStatus.paidServices.includes(svc.key);
              return (
                <div key={svc.key}
                  className={`glass rounded-2xl border ${svc.border} bg-gradient-to-r ${svc.bg} p-5 flex items-center gap-5`}>
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                    style={{ background: svc.color + "20", color: svc.color, border: `1px solid ${svc.color}30` }}>
                    {svc.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-white font-black text-sm">{svc.label}</h3>
                      {loadingPaid
                        ? <span className="w-12 h-4 bg-white/10 rounded-full animate-pulse" />
                        : hasAccess
                          ? <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: svc.color + "20", color: svc.color }}>Active</span>
                          : <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/8 text-white/30">Not purchased</span>}
                    </div>
                    <p className="text-white/40 text-xs leading-relaxed">{svc.desc}</p>
                  </div>

                  {/* CTA */}
                  <div className="flex-shrink-0">
                    {hasAccess ? (
                      <a href={svc.href}
                        className="px-4 py-2 rounded-xl text-xs font-black transition-all"
                        style={{ background: svc.color + "20", color: svc.color, border: `1px solid ${svc.color}40` }}>
                        Open →
                      </a>
                    ) : (
                      <a href={svc.href}
                        className="px-4 py-2 rounded-xl text-xs font-black bg-white/8 text-white/50 border border-white/10 hover:text-white hover:bg-white/12 transition-all">
                        Get Access
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manual services note */}
        <div className="glass rounded-2xl border border-white/6 p-5">
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3">Other Services</p>
          <div className="flex flex-wrap gap-2">
            {["Resume Writing", "Portfolio Creation", "Content Creation"].map((s) => (
              <span key={s} className="px-3 py-1.5 rounded-lg bg-white/4 border border-white/8 text-white/30 text-xs font-bold">{s}</span>
            ))}
          </div>
          <p className="text-white/20 text-xs mt-3">These services are handled personally by our team. <a href="/#contact" className="text-brand-teal/60 hover:text-brand-teal underline transition-colors">Contact us</a> to enquire.</p>
        </div>
      </div>
    </div>
  );
}
