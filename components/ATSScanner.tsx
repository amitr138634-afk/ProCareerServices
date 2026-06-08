"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePaid } from "./PaidContext";
import ProfessionalHelpButton from "./ProfessionalHelpButton";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const IS_TEST_MODE = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith("rzp_test");
const SCAN_STAGES = [
  "Extracting text from resume…",
  "Matching keywords against job description…",
  "Checking section structure and completeness…",
  "Evaluating achievement strength…",
  "Generating recommendations…",
];

const ATS_SESSION_KEY = "procareer_ats_session";

const JD_TEMPLATES: Record<string, string> = {
  "Software Engineer": `We are looking for a Software Engineer to join our team.
Requirements:
- 3+ years of experience in software development
- Proficiency in Python, JavaScript, or Java
- Experience with REST APIs and microservices
- Familiarity with cloud platforms (AWS, GCP, or Azure)
- Strong understanding of data structures and algorithms
- Experience with Git and CI/CD pipelines
- Agile/Scrum experience preferred
- Strong problem-solving and communication skills`,

  "Product Manager": `We are hiring a Product Manager to lead our product roadmap.
Requirements:
- 3+ years of product management experience
- Experience with Agile methodologies and sprint planning
- Strong data analysis skills (SQL, analytics tools)
- Ability to write PRDs and user stories
- Cross-functional collaboration with engineering and design
- Experience with A/B testing and product metrics
- Excellent communication and stakeholder management`,

  "Data Scientist": `Looking for a Data Scientist to drive insights and ML solutions.
Requirements:
- 2+ years of experience in data science or machine learning
- Proficiency in Python (pandas, scikit-learn, TensorFlow/PyTorch)
- Experience with SQL and big data tools (Spark, Hadoop)
- Strong statistics and probability foundations
- Experience building and deploying ML models
- Data visualization skills (Matplotlib, Tableau, Power BI)
- NLP or computer vision experience is a plus`,

  "Marketing Manager": `We are seeking a Marketing Manager to scale our growth.
Requirements:
- 4+ years of digital marketing experience
- Expertise in SEO, SEM, social media marketing
- Experience with Google Analytics, Meta Ads, and HubSpot
- Content strategy and brand management skills
- Email marketing and marketing automation experience
- Strong analytical skills to measure campaign performance
- Budget management and ROI optimization`,

  "HR Manager": `HR Manager needed to lead our people operations.
Requirements:
- 5+ years of HR experience including talent acquisition
- Strong knowledge of labor laws and compliance
- Experience with HRIS systems (Workday, SAP, or BambooHR)
- Employee relations and performance management expertise
- Organizational development and L&D experience
- Recruitment and onboarding process design
- Strong interpersonal and conflict resolution skills`,

  "Sales Manager": `Sales Manager to lead our B2B sales team.
Requirements:
- 4+ years of B2B sales experience with quota achievement
- CRM proficiency (Salesforce, HubSpot)
- Experience managing and mentoring a sales team
- Strong negotiation and closing skills
- Pipeline management and forecasting
- Account management and client relationship skills
- SaaS or enterprise software sales experience preferred`,
};

interface SectionScore { present: boolean; score: number; note: string; }
interface FormattingFlag { issue: string; severity: "critical" | "warning" | "info"; fix: string; }
interface ATSResult {
  atsScore: number;
  industryDetected?: string;
  scoreBreakdown: { keywordMatch: number; formatting: number; sections: number; achievements: number; readability: number };
  keywordsFound: string[];
  keywordsMissing: string[];
  sectionAnalysis: { contactInfo: SectionScore; summary: SectionScore; experience: SectionScore; education: SectionScore; skills: SectionScore };
  formattingFlags?: FormattingFlag[];
  bulletStrength?: { total: number; withMetrics: number; percentage: number };
  impactScore?: number;
  recommendations: string[];
  topStrengths: string[];
  verdict: string;
  isPremium: boolean;
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#10B981" : score >= 50 ? "#F59E0B" : "#EF4444";
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="white"
        fontSize={size * 0.22} fontWeight="900" style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>{score}</text>
      <text x="50%" y="66%" textAnchor="middle" dominantBaseline="middle" fill={color}
        fontSize={size * 0.1} fontWeight="600" style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>/ 100</text>
    </svg>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  const color = pct >= 70 ? "from-brand-teal to-brand-blue" : pct >= 40 ? "from-yellow-500 to-orange-400" : "from-red-500 to-rose-400";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/60">{label}</span>
        <span className="text-white/80 font-semibold">{value}/{max}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ATSScanner() {
  const serverIsPaid = usePaid();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState("");
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState("");
  const [hasPaid, setHasPaid] = useState(serverIsPaid);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const scanStageRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore session on mount; context value is source of truth
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ATS_SESSION_KEY);
      const s = raw ? JSON.parse(raw) : {};
      if (s.result) setResult(s.result);
      if (s.jobDescription) setJobDescription(s.jobDescription);
      if (s.selectedTemplate) setSelectedTemplate(s.selectedTemplate);
      if (s.fileName) setFileName(s.fileName);
      const paid = serverIsPaid || s.hasPaid;
      setHasPaid(!!paid);
    } catch { /* corrupted */ }
  }, [serverIsPaid]);

  // Save session on change
  useEffect(() => {
    if (!result && !jobDescription) return;
    try {
      localStorage.setItem(ATS_SESSION_KEY, JSON.stringify({ result, jobDescription, selectedTemplate, fileName, hasPaid }));
    } catch { /* full */ }
  }, [result, jobDescription, selectedTemplate, fileName, hasPaid]);

  const handleFile = (f: File) => {
    const ok = f.name.endsWith(".pdf") || f.name.endsWith(".docx") || f.name.endsWith(".doc");
    if (!ok) { setError("Please upload a PDF or DOCX file."); return; }
    setFile(f); setFileName(f.name); setError("");
    // Clear old result so a fresh scan is required for the new file
    setResult(null);
    try { localStorage.removeItem(ATS_SESSION_KEY); } catch { /* ignore */ }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onTemplateSelect = (t: string) => { setSelectedTemplate(t); setJobDescription(JD_TEMPLATES[t] || ""); };

  const loadRazorpay = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const handleUpgradePayment = async () => {
    setIsPaymentProcessing(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { alert("Payment gateway failed to load. Please try again."); return; }
      const orderRes = await fetch("/api/create-order", { method: "POST" });
      const orderData = await orderRes.json();
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount, currency: "INR",
        name: "ProCareerLaunchpad",
        description: "ATS Scanner — Full Premium Report",
        order_id: orderData.orderId,
        handler: async (response: Record<string, string>) => {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const { verified } = await verifyRes.json();
          if (verified) {
            setHasPaid(true);
            // Re-scan immediately as premium to get full results
            if (file && jobDescription.trim()) handleScan(true);
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: { name: "", email: "" },
        theme: { color: "#10B981" },
        modal: { ondismiss: () => setIsPaymentProcessing(false) },
      };
      new window.Razorpay(options).open();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleScan = async (premiumOverride?: boolean) => {
    if (!file || !jobDescription.trim()) { setError("Upload a resume and add a job description."); return; }
    const isPremium = premiumOverride ?? hasPaid;
    setIsScanning(true); setError(""); setResult(null);

    // Cycle through progress stage messages so users know what's happening
    let stageIdx = 0;
    setScanStage(SCAN_STAGES[0]);
    scanStageRef.current = setInterval(() => {
      stageIdx = Math.min(stageIdx + 1, SCAN_STAGES.length - 1);
      setScanStage(SCAN_STAGES[stageIdx]);
    }, 4000);

    const form = new FormData();
    form.append("resume", file);
    form.append("jobDescription", jobDescription);
    form.append("isPremium", String(isPremium));
    try {
      const res = await fetch("/api/ats-scan", { method: "POST", body: form });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      if (scanStageRef.current) clearInterval(scanStageRef.current);
      setScanStage("");
      setIsScanning(false);
    }
  };

  const scoreLabel = (s: number) => s >= 75 ? "Excellent" : s >= 60 ? "Good" : s >= 40 ? "Needs Work" : "Poor";
  const scoreColor = (s: number) => s >= 75 ? "text-brand-teal" : s >= 60 ? "text-yellow-400" : s >= 40 ? "text-orange-400" : "text-red-400";

  const downloadReport = () => {
    if (!result) return;
    const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const sectionLabels: Record<string, string> = { contactInfo: "Contact Info", summary: "Professional Summary", experience: "Work Experience", education: "Education", skills: "Skills" };
    const scoreBarHtml = (label: string, value: number, max: number) => {
      const pct = Math.round((value / max) * 100);
      const color = pct >= 70 ? "#10B981" : pct >= 40 ? "#F59E0B" : "#EF4444";
      return `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:#555">${label}</span><span style="font-weight:700;color:#333">${value}/${max}</span></div><div style="height:6px;background:#eee;border-radius:4px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${color};border-radius:4px"></div></div></div>`;
    };
    const scoreClr = result.atsScore >= 75 ? "#10B981" : result.atsScore >= 60 ? "#F59E0B" : result.atsScore >= 40 ? "#FB923C" : "#EF4444";

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>ATS Report — ProCareerLaunchpad</title><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;background:#fff;padding:40px;max-width:800px;margin:0 auto}
      @media print{body{padding:20px}@page{margin:15mm}}
      .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #10B981;padding-bottom:16px;margin-bottom:24px}
      .brand{font-size:18px;font-weight:900;color:#10B981;letter-spacing:-0.5px}
      .brand span{color:#0EA5E9}
      .meta{text-align:right;font-size:11px;color:#888;line-height:1.6}
      .score-section{display:flex;align-items:center;gap:32px;background:#f8fffe;border:2px solid #10B98130;border-radius:12px;padding:20px 24px;margin-bottom:20px}
      .score-ring{text-align:center;flex-shrink:0}
      .score-number{font-size:52px;font-weight:900;line-height:1;color:${scoreClr}}
      .score-label{font-size:13px;font-weight:700;color:${scoreClr};margin-top:2px}
      .score-denom{font-size:16px;color:#aaa;font-weight:600}
      .verdict{font-size:13px;color:#555;line-height:1.6;margin-top:8px}
      .section{background:#fafafa;border:1px solid #eee;border-radius:10px;padding:16px 20px;margin-bottom:16px}
      .section-title{font-size:13px;font-weight:800;color:#333;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;display:flex;align-items:center;gap:8px}
      .section-title span{color:#10B981}
      .tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
      .tag-found{background:#dcfce7;color:#166534;border:1px solid #bbf7d0;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:600}
      .tag-missing{background:#fee2e2;color:#991b1b;border:1px solid #fecaca;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:600}
      .rec-item{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #f0f0f0}
      .rec-item:last-child{border-bottom:none}
      .rec-num{flex-shrink:0;width:22px;height:22px;background:#8B5CF620;color:#8B5CF6;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;margin-top:1px}
      .rec-text{font-size:12px;color:#444;line-height:1.6}
      .strength-item{display:flex;gap:8px;padding:4px 0;font-size:12px;color:#444;align-items:flex-start}
      .strength-check{color:#10B981;font-weight:900;flex-shrink:0;margin-top:1px}
      .sections-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;text-align:center}
      .sec-cell{padding:10px 4px}
      .sec-icon{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;margin:0 auto 6px}
      .sec-icon.present{background:#dcfce7;color:#166534}
      .sec-icon.missing{background:#fee2e2;color:#991b1b}
      .sec-name{font-size:10px;font-weight:700;color:#555}
      .sec-score{font-size:12px;font-weight:900;margin-top:2px}
      .footer{margin-top:32px;padding-top:16px;border-top:1px solid #eee;text-align:center;font-size:11px;color:#aaa}
      .footer a{color:#10B981;text-decoration:none;font-weight:600}
    </style></head><body>
      <div class="header">
        <div><div class="brand">ProCareer<span>Launchpad</span></div><div style="font-size:12px;color:#888;margin-top:2px">ATS Resume Scan Report</div></div>
        <div class="meta"><div>${date}</div>${fileName ? `<div>Resume: <b>${fileName}</b></div>` : ""}</div>
      </div>

      <div class="score-section">
        <div class="score-ring">
          <div class="score-number">${result.atsScore}<span class="score-denom">/100</span></div>
          <div class="score-label">${scoreLabel(result.atsScore)}</div>
        </div>
        <div style="flex:1">
          <div style="font-size:15px;font-weight:900;color:#1a1a1a;margin-bottom:6px">ATS Compatibility Score</div>
          <div class="verdict">${result.verdict}</div>
          <div style="margin-top:14px">
            ${scoreBarHtml("Keyword Match", result.scoreBreakdown.keywordMatch, 30)}
            ${scoreBarHtml("Formatting", result.scoreBreakdown.formatting, 20)}
            ${scoreBarHtml("Sections", result.scoreBreakdown.sections, 20)}
            ${scoreBarHtml("Achievements", result.scoreBreakdown.achievements, 15)}
            ${scoreBarHtml("Readability", result.scoreBreakdown.readability, 15)}
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title"><span>✓</span> Keywords Found (${result.keywordsFound.length})</div>
        <div class="tags">${result.keywordsFound.map(k => `<span class="tag-found">${k}</span>`).join("") || '<span style="color:#aaa;font-size:12px">No matching keywords found.</span>'}</div>
      </div>

      <div class="section">
        <div class="section-title" style="color:#991b1b"><span>✗</span> Missing Keywords (${result.keywordsMissing.length})</div>
        <div class="tags">${result.keywordsMissing.map(k => `<span class="tag-missing">${k}</span>`).join("") || '<span style="color:#aaa;font-size:12px">None detected.</span>'}</div>
      </div>

      <div class="section">
        <div class="section-title">Section Analysis</div>
        <div class="sections-grid">
          ${Object.entries(result.sectionAnalysis).map(([key, val]) => `
            <div class="sec-cell">
              <div class="sec-icon ${val.present ? "present" : "missing"}">${val.present ? "✓" : "✗"}</div>
              <div class="sec-name">${sectionLabels[key] ?? key}</div>
              <div class="sec-score" style="color:${val.score >= 70 ? "#10B981" : val.score >= 40 ? "#F59E0B" : "#EF4444"}">${val.score}/100</div>
              <div style="font-size:10px;color:#888;margin-top:3px;line-height:1.4">${val.note}</div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="section">
        <div class="section-title">⚡ Recommendations</div>
        <div>${result.recommendations.map((rec, i) => `<div class="rec-item"><div class="rec-num">${i + 1}</div><div class="rec-text">${rec}</div></div>`).join("")}</div>
      </div>

      <div class="section">
        <div class="section-title">★ Top Strengths</div>
        <div>${result.topStrengths.map(s => `<div class="strength-item"><span class="strength-check">✓</span><span>${s}</span></div>`).join("")}</div>
      </div>

      <div class="footer">Generated by <a href="https://procareerservices.vercel.app">ProCareerLaunchpad</a> · ${date} · Not for redistribution</div>
    </body></html>`;

    const printHtml = html.replace("</body>", `<script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body>`);
    const blob = new Blob([printHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  return (
    <div className="min-h-screen" style={{ background: "#07071A" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob" style={{ top: "5%", left: "10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)" }} />
        <div className="blob blob-2" style={{ bottom: "10%", right: "5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8 gap-2">
          <Link href="/" className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="hidden sm:inline">Back</span>
          </Link>
          <span className="text-[10px] md:text-xs font-bold tracking-widest truncate" style={{ background: "linear-gradient(90deg,#10B981,#0EA5E9,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            PROCAREERLAUNCHPAD
          </span>
          <button
            onClick={() => { setResult(null); setFile(null); setFileName(""); setJobDescription(""); setSelectedTemplate(""); localStorage.removeItem(ATS_SESSION_KEY); }}
            className="text-white/20 hover:text-white/50 text-[11px] transition-colors flex-shrink-0"
          >
            ↺ Reset
          </button>
        </div>

        {/* Hero */}
        <div className="text-center mb-7 md:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-teal/30 bg-brand-teal/5 text-brand-teal text-xs font-semibold mb-3 md:mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
            ATS RESUME SCANNER
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white mb-3">
            Beat the <span style={{ background: "linear-gradient(90deg,#10B981,#0EA5E9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ATS Filter</span>
          </h1>
          <p className="text-white/50 text-sm max-w-md mx-auto">Upload your resume, paste the job description, and get an ATS compatibility score with actionable fixes.</p>
          {!hasPaid && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs text-center">
              Free scan: score + 2 recommendations · Pay ₹200 for full report
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-5 md:mb-6">
          {/* Upload */}
          <div className="glass-dark rounded-2xl p-5">
            <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-teal/20 text-brand-teal text-[10px] font-black flex items-center justify-center">1</span>
              Upload Resume
            </h2>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging ? "border-brand-teal bg-brand-teal/5" : file ? "border-brand-teal/50 bg-brand-teal/5" : "border-white/10 hover:border-white/25"}`}
              onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              {file ? (
                <div>
                  <div className="w-10 h-10 rounded-xl bg-brand-teal/20 flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-brand-teal" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="text-brand-teal font-semibold text-sm">{file.name}</p>
                  <p className="text-white/30 text-xs mt-1">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
                </div>
              ) : fileName ? (
                <div>
                  <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-brand-teal/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="text-brand-teal/70 font-semibold text-sm">{fileName}</p>
                  <p className="text-yellow-400/70 text-xs mt-1 font-semibold">⚠ Re-upload required to scan again</p>
                </div>
              ) : (
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <p className="text-white/50 text-sm">Drag & drop or click to upload</p>
                  <p className="text-white/25 text-xs mt-1">PDF, DOCX · Max 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* JD */}
          <div className="glass-dark rounded-2xl p-5">
            <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-blue/20 text-brand-blue text-[10px] font-black flex items-center justify-center">2</span>
              Job Description
            </h2>
            <div className="mb-3">
              <p className="text-white/40 text-[11px] mb-2">Quick templates:</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(JD_TEMPLATES).map((t) => (
                  <button key={t} onClick={() => onTemplateSelect(t)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${selectedTemplate === t ? "bg-brand-blue/20 border-brand-blue/50 text-brand-blue" : "border-white/10 text-white/40 hover:border-white/25 hover:text-white/70"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <textarea value={jobDescription} onChange={(e) => { setJobDescription(e.target.value); setSelectedTemplate(""); }}
              placeholder="Paste the full job description here, or pick a template above…" rows={8}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white/80 text-xs resize-none focus:outline-none focus:border-brand-blue/50 placeholder-white/20" />
            <div className="flex justify-between items-center mt-1.5 px-1">
              <span className="text-white/20 text-[10px]">More text = better analysis</span>
              <span className={`text-[10px] font-semibold ${jobDescription.length > 2800 ? "text-yellow-400" : "text-white/20"}`}>
                {jobDescription.length}/3000 chars
              </span>
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}
        <div className="text-center mb-8 md:mb-10">
          <button onClick={() => handleScan()} disabled={isScanning || !file || !jobDescription.trim()}
            className="w-full sm:w-auto px-10 py-3.5 rounded-xl font-black text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all relative overflow-hidden group"
            style={{ background: "linear-gradient(135deg, #10B981, #0EA5E9)" }}>
            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all" />
            <span className="relative flex items-center gap-2">
              {isScanning ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>{scanStage || "Scanning…"}</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>Scan Resume</>
              )}
            </span>
          </button>
        </div>

        {result && (
          <div className="space-y-5">
            <div className="glass-dark rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0 relative">
                  <ScoreRing score={result.atsScore} size={110} />
                  {result.impactScore !== undefined && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: result.impactScore >= 70 ? "#10B98120" : "#F59E0B20", color: result.impactScore >= 70 ? "#10B981" : "#F59E0B", border: `1px solid ${result.impactScore >= 70 ? "#10B98140" : "#F59E0B40"}` }}>
                        Impact {result.impactScore}/100
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h2 className="text-white font-black text-xl">ATS Score</h2>
                    <span className={`text-sm font-black ${scoreColor(result.atsScore)}`}>{scoreLabel(result.atsScore)}</span>
                    {result.industryDetected && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-purple/10 border border-brand-purple/25 text-brand-purple font-bold">{result.industryDetected}</span>
                    )}
                    {hasPaid && (
                      <button onClick={downloadReport}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-brand-teal/30 bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/20 transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download Report
                      </button>
                    )}
                  </div>
                  <p className="text-white/50 text-sm mb-4">{result.verdict}</p>
                  <div className="grid grid-cols-1 gap-2">
                    <ScoreBar label="Keyword Match" value={result.scoreBreakdown.keywordMatch} max={30} />
                    <ScoreBar label="Formatting" value={result.scoreBreakdown.formatting} max={20} />
                    <ScoreBar label="Sections" value={result.scoreBreakdown.sections} max={20} />
                    <ScoreBar label="Achievements" value={result.scoreBreakdown.achievements} max={15} />
                    <ScoreBar label="Readability" value={result.scoreBreakdown.readability} max={15} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="glass-dark rounded-2xl p-5">
                <h3 className="text-brand-teal font-bold text-sm mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Keywords Found ({result.keywordsFound.length})
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywordsFound.map((k, i) => <span key={i} className="px-2.5 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-xs font-semibold">{k}</span>)}
                  {result.keywordsFound.length === 0 && <p className="text-white/30 text-xs">No matching keywords found.</p>}
                </div>
              </div>
              <div className="glass-dark rounded-2xl p-5">
                <h3 className="text-red-400 font-bold text-sm mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  Missing Keywords
                  {!result.isPremium && <span className="ml-auto text-[10px] text-yellow-400 font-normal">Showing 3 of many</span>}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywordsMissing.map((k, i) => <span key={i} className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">{k}</span>)}
                  {!result.isPremium && <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/20 text-xs font-semibold blur-[3px] select-none">React Hooks</span>}
                </div>
                {!result.isPremium && <p className="text-white/30 text-[11px] mt-2">🔒 Full keyword list in premium report</p>}
              </div>
            </div>

            <div className="glass-dark rounded-2xl p-5">
              <h3 className="text-white font-bold text-sm mb-4">Section Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(result.sectionAnalysis).map(([key, val]) => {
                  const labels: Record<string, string> = { contactInfo: "Contact", summary: "Summary", experience: "Experience", education: "Education", skills: "Skills" };
                  return (
                    <div key={key} className="text-center">
                      <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-black ${val.present ? "bg-brand-teal/15 text-brand-teal" : "bg-red-500/10 text-red-400"}`}>{val.present ? "✓" : "✗"}</div>
                      <p className="text-white/70 text-[11px] font-semibold">{labels[key]}</p>
                      <p className={`text-[11px] font-black ${scoreColor(val.score)}`}>{val.score}/100</p>
                      <p className="text-white/30 text-[10px] mt-0.5 leading-tight">{val.note}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Formatting Audit — premium only */}
            {result.isPremium && result.formattingFlags && result.formattingFlags.length > 0 && (
              <div className="glass-dark rounded-2xl p-5">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Formatting Audit
                  {result.formattingFlags.filter(f => f.severity === "critical").length > 0 && (
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/25 font-bold">
                      {result.formattingFlags.filter(f => f.severity === "critical").length} Critical
                    </span>
                  )}
                </h3>
                <div className="space-y-2.5">
                  {result.formattingFlags.map((flag, i) => {
                    const colors = {
                      critical: { bg: "bg-red-500/8 border-red-500/20", badge: "bg-red-500/15 text-red-400 border-red-500/25", dot: "#EF4444" },
                      warning:  { bg: "bg-yellow-500/8 border-yellow-500/20", badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25", dot: "#F59E0B" },
                      info:     { bg: "bg-brand-blue/5 border-brand-blue/15", badge: "bg-brand-blue/10 text-brand-blue border-brand-blue/25", dot: "#0EA5E9" },
                    };
                    const c = colors[flag.severity];
                    return (
                      <div key={i} className={`rounded-xl border p-3.5 ${c.bg}`}>
                        <div className="flex items-start gap-2.5">
                          <span className={`flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded-full border font-black uppercase tracking-wide mt-0.5 ${c.badge}`}>{flag.severity}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white/80 text-xs font-semibold mb-1">{flag.issue}</p>
                            <p className="text-white/40 text-[11px] leading-relaxed">Fix: {flag.fix}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bullet Strength meter */}
            {result.bulletStrength && (
              <div className="glass-dark rounded-2xl p-5">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-brand-blue" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  Achievement Strength
                </h3>
                <div className="flex items-center gap-5">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-white/50">Bullets with measurable metrics</span>
                      <span className={`font-black ${result.bulletStrength.percentage >= 60 ? "text-brand-teal" : result.bulletStrength.percentage >= 30 ? "text-yellow-400" : "text-red-400"}`}>
                        {result.bulletStrength.percentage}%
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${result.bulletStrength.percentage >= 60 ? "bg-gradient-to-r from-brand-teal to-brand-blue" : result.bulletStrength.percentage >= 30 ? "bg-gradient-to-r from-yellow-500 to-orange-400" : "bg-gradient-to-r from-red-500 to-rose-400"}`}
                        style={{ width: `${result.bulletStrength.percentage}%` }}
                      />
                    </div>
                    <p className="text-white/30 text-[10px] mt-1.5">
                      {result.bulletStrength.withMetrics} of {result.bulletStrength.total} bullets have numbers/% · Target: 70%+
                    </p>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <div className={`text-2xl font-black ${result.bulletStrength.percentage >= 60 ? "text-brand-teal" : result.bulletStrength.percentage >= 30 ? "text-yellow-400" : "text-red-400"}`}>
                      {result.bulletStrength.percentage >= 60 ? "Strong" : result.bulletStrength.percentage >= 30 ? "Average" : "Weak"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="glass-dark rounded-2xl p-5">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-purple" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Recommendations
                {!result.isPremium && <span className="ml-auto text-[10px] text-yellow-400 font-normal">Showing 2 of 13+</span>}
              </h3>
              <div className="space-y-2">
                {result.recommendations.map((rec, i) => {
                  const isLocked = !result.isPremium && i >= 2;
                  const impactTag = rec.startsWith("[HIGH]") ? "HIGH" : rec.startsWith("[MEDIUM]") ? "MEDIUM" : rec.startsWith("[LOW]") ? "LOW" : null;
                  const recText = impactTag ? rec.replace(/^\[(HIGH|MEDIUM|LOW)\]\s*/, "") : rec;
                  const tagColors: Record<string, string> = { HIGH: "bg-red-500/15 text-red-400 border-red-500/25", MEDIUM: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25", LOW: "bg-brand-blue/10 text-brand-blue border-brand-blue/25" };
                  return (
                    <div key={i} className={`flex gap-3 p-3 rounded-xl ${isLocked ? "bg-white/2 border border-white/5" : "bg-white/5"}`}>
                      <div className="flex-shrink-0 mt-0.5">
                        {isLocked
                          ? <span className="text-white/20 text-xs">🔒</span>
                          : impactTag
                            ? <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-black uppercase tracking-wide ${tagColors[impactTag]}`}>{impactTag}</span>
                            : <span className="w-5 h-5 rounded-full bg-brand-purple/20 text-brand-purple text-[10px] font-black flex items-center justify-center">{i + 1}</span>
                        }
                      </div>
                      <p className={`text-xs leading-relaxed ${isLocked ? "text-white/15 blur-[4px] select-none" : "text-white/80"}`}>
                        {isLocked ? "Quantify your achievements with specific metrics to significantly boost your ATS ranking for this role." : recText}
                      </p>
                    </div>
                  );
                })}
              </div>
              {!result.isPremium && (
                <div className="mt-4 p-4 rounded-xl border border-brand-teal/20 bg-brand-teal/5 text-center">
                  <p className="text-white/70 text-xs mb-3">Unlock <strong className="text-white">13+ tagged recommendations</strong>, formatting audit, bullet strength analysis & PDF</p>
                  <button
                    onClick={handleUpgradePayment}
                    disabled={isPaymentProcessing}
                    className="px-6 py-2 rounded-lg font-bold text-sm text-white disabled:opacity-60 flex items-center gap-2 mx-auto transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#10B981,#0EA5E9)" }}
                  >
                    {isPaymentProcessing
                      ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Processing…</>
                      : IS_TEST_MODE ? "Upgrade — ₹200 (Test)" : "Upgrade — ₹200"
                    }
                  </button>
                </div>
              )}
            </div>

            <div className="glass-dark rounded-2xl p-5">
              <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                Top Strengths
              </h3>
              <div className="space-y-2">
                {result.topStrengths.map((s, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-brand-teal text-xs mt-0.5">✓</span>
                    <p className="text-white/70 text-xs">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {hasPaid && (
              <div className="glass-dark rounded-2xl px-5 pb-2 pt-1">
                <ProfessionalHelpButton service="ATS Scanner" />
              </div>
            )}

            <div className="text-center pb-8">
              <button onClick={() => { setResult(null); setFile(null); setFileName(""); setJobDescription(""); setSelectedTemplate(""); localStorage.removeItem(ATS_SESSION_KEY); }}
                className="text-white/40 hover:text-white/70 text-sm transition-colors">
                ← Scan a different resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
