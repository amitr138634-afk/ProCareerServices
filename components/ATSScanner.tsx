"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePaid } from "./PaidContext";

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
interface ATSResult {
  atsScore: number;
  scoreBreakdown: { keywordMatch: number; formatting: number; sections: number; achievements: number; readability: number };
  keywordsFound: string[];
  keywordsMissing: string[];
  sectionAnalysis: { contactInfo: SectionScore; summary: SectionScore; experience: SectionScore; education: SectionScore; skills: SectionScore };
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
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState("");
  const [hasPaid, setHasPaid] = useState(serverIsPaid);
  const fileRef = useRef<HTMLInputElement>(null);

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
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onTemplateSelect = (t: string) => { setSelectedTemplate(t); setJobDescription(JD_TEMPLATES[t] || ""); };

  const handleScan = async () => {
    if (!file || !jobDescription.trim()) { setError("Upload a resume and add a job description."); return; }
    setIsScanning(true); setError(""); setResult(null);
    const form = new FormData();
    form.append("resume", file);
    form.append("jobDescription", jobDescription);
    form.append("isPremium", String(hasPaid));
    try {
      const res = await fetch("/api/ats-scan", { method: "POST", body: form });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally { setIsScanning(false); }
  };

  const scoreLabel = (s: number) => s >= 75 ? "Excellent" : s >= 60 ? "Good" : s >= 40 ? "Needs Work" : "Poor";
  const scoreColor = (s: number) => s >= 75 ? "text-brand-teal" : s >= 60 ? "text-yellow-400" : s >= 40 ? "text-orange-400" : "text-red-400";

  return (
    <div className="min-h-screen" style={{ background: "#07071A" }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob" style={{ top: "5%", left: "10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)" }} />
        <div className="blob blob-2" style={{ bottom: "10%", right: "5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
          </Link>
          <span className="text-xs font-bold tracking-widest" style={{ background: "linear-gradient(90deg,#10B981,#0EA5E9,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            PROCAREERLAUNCHPAD
          </span>
          <button
            onClick={() => { setResult(null); setFile(null); setFileName(""); setJobDescription(""); setSelectedTemplate(""); localStorage.removeItem(ATS_SESSION_KEY); }}
            className="text-white/20 hover:text-white/50 text-[11px] transition-colors"
          >
            ↺ Reset
          </button>
        </div>

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-teal/30 bg-brand-teal/5 text-brand-teal text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
            ATS RESUME SCANNER
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            Beat the <span style={{ background: "linear-gradient(90deg,#10B981,#0EA5E9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ATS Filter</span>
          </h1>
          <p className="text-white/50 text-sm max-w-md mx-auto">Upload your resume, paste the job description, and get an ATS compatibility score with actionable fixes.</p>
          {!hasPaid && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
              Free scan: score + 2 recommendations · Pay ₹200 for full report
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
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
                  <p className="text-white/25 text-xs mt-1">Last scanned file · Click to re-upload</p>
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
          </div>
        </div>

        {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}
        <div className="text-center mb-10">
          <button onClick={handleScan} disabled={isScanning || !file || !jobDescription.trim()}
            className="px-10 py-3.5 rounded-xl font-black text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all relative overflow-hidden group"
            style={{ background: "linear-gradient(135deg, #10B981, #0EA5E9)" }}>
            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all" />
            <span className="relative flex items-center gap-2">
              {isScanning ? (<><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Scanning…</>) : (<><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>Scan Resume</>)}
            </span>
          </button>
        </div>

        {result && (
          <div className="space-y-5">
            <div className="glass-dark rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0"><ScoreRing score={result.atsScore} size={130} /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-white font-black text-xl">ATS Score</h2>
                    <span className={`text-sm font-black ${scoreColor(result.atsScore)}`}>{scoreLabel(result.atsScore)}</span>
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

            <div className="glass-dark rounded-2xl p-5">
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-purple" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Recommendations
                {!result.isPremium && <span className="ml-auto text-[10px] text-yellow-400 font-normal">Showing 2 of 12+</span>}
              </h3>
              <div className="space-y-2">
                {result.recommendations.map((rec, i) => {
                  const isLocked = !result.isPremium && i >= 2;
                  return (
                    <div key={i} className={`flex gap-3 p-3 rounded-xl ${isLocked ? "bg-white/2 border border-white/5" : "bg-white/5"}`}>
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5 ${isLocked ? "bg-white/5 text-white/20" : "bg-brand-purple/20 text-brand-purple"}`}>{isLocked ? "🔒" : i + 1}</div>
                      <p className={`text-xs leading-relaxed ${isLocked ? "text-white/15 blur-[4px] select-none" : "text-white/75"}`}>{isLocked ? "Add quantified metrics to your experience section to improve ATS ranking significantly." : rec}</p>
                    </div>
                  );
                })}
              </div>
              {!result.isPremium && (
                <div className="mt-4 p-4 rounded-xl border border-brand-teal/20 bg-brand-teal/5 text-center">
                  <p className="text-white/70 text-xs mb-3">Unlock <strong className="text-white">10+ more recommendations</strong>, full keyword analysis & downloadable PDF</p>
                  <button className="px-6 py-2 rounded-lg font-bold text-sm text-white" style={{ background: "linear-gradient(135deg,#10B981,#0EA5E9)" }}>Upgrade — ₹200</button>
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
