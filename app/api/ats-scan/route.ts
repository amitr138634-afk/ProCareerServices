import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

// ── Same provider clients as optimize route ────────────────────────────────
const groqClient = process.env.GROQ_API_KEY
  ? new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" })
  : null;
const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;
const openrouterClient = process.env.OPENROUTER_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: "https://openrouter.ai/api/v1" })
  : null;
const anthropicClient = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;
const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const GROQ_MODEL       = process.env.GROQ_MODEL          || "llama-3.3-70b-versatile";
const GROQ_FB_MODEL    = process.env.GROQ_FALLBACK_MODEL  || "deepseek-r1-distill-llama-70b";
const GEMINI_MODEL     = process.env.GEMINI_MODEL         || "gemini-2.5-flash";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL     || "meta-llama/llama-3.3-70b-instruct:free";
const CLAUDE_MODEL     = process.env.CLAUDE_MODEL         || "claude-sonnet-4-5";
const OPENAI_MODEL     = process.env.OPENAI_MODEL         || "gpt-4o-mini";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isTransient(msg: string) {
  return msg.includes("429") || msg.includes("503") || msg.includes("rate_limit") ||
    msg.includes("rate limit") || msg.includes("quota") || msg.includes("high demand") ||
    msg.includes("busy") || msg.includes("overloaded");
}

type ProviderFn = (prompt: string) => Promise<string>;

async function callOpenAICompat(client: OpenAI, model: string, prompt: string) {
  const res = await client.chat.completions.create({
    model, messages: [{ role: "user", content: prompt }], max_tokens: 3500, temperature: 0.3,
  });
  return res.choices[0]?.message?.content || "";
}

const providers: [string, ProviderFn][] = [
  ["Groq (Llama)", (p) => { if (!groqClient) throw new Error("no key"); return callOpenAICompat(groqClient, GROQ_MODEL, p); }],
  ["Groq (DeepSeek)", (p) => { if (!groqClient) throw new Error("no key"); return callOpenAICompat(groqClient, GROQ_FB_MODEL, p); }],
  ["Gemini", async (p) => {
    if (!geminiClient) throw new Error("no key");
    const m = geminiClient.getGenerativeModel({ model: GEMINI_MODEL });
    return (await m.generateContent(p)).response.text();
  }],
  ["OpenRouter", (p) => { if (!openrouterClient) throw new Error("no key"); return callOpenAICompat(openrouterClient, OPENROUTER_MODEL, p); }],
  ["Claude", async (p) => {
    if (!anthropicClient) throw new Error("no key");
    const r = await anthropicClient.messages.create({ model: CLAUDE_MODEL, max_tokens: 3500, messages: [{ role: "user", content: p }] });
    const b = r.content[0]; return b.type === "text" ? b.text : "";
  }],
  ["OpenAI", (p) => { if (!openaiClient) throw new Error("no key"); return callOpenAICompat(openaiClient, OPENAI_MODEL, p); }],
];

async function generate(prompt: string): Promise<string> {
  for (const [name, fn] of providers) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const text = await fn(prompt);
        console.log(`[ATS] ${name} succeeded`);
        return text;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (isTransient(msg)) {
          if (attempt < 3) await sleep(1500 * attempt);
        } else break;
      }
    }
    console.warn(`[ATS] ${name} exhausted`);
  }
  throw new Error("All AI providers unavailable.");
}

// ── Resume text extraction ─────────────────────────────────────────────────
// pdf-parse is excluded from webpack via serverComponentsExternalPackages so
// Node.js native require() is used — no Object.defineProperty bundling error.
async function extractText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (file.name.endsWith(".pdf")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return (data.text as string) || "";
  }

  if (file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return buffer.toString("utf-8");
}

// ── ATS prompt ─────────────────────────────────────────────────────────────
function buildATSPrompt(resumeText: string, jobDescription: string, isPremium: boolean): string {
  return `You are the world's most advanced ATS resume analyzer, trained on rejection and success patterns from Taleo, Workday, Greenhouse, iCIMS, Lever, and SAP SuccessFactors. You know exactly why resumes fail screening.

CRITICAL ATS FACTS YOU APPLY:
• 75% of resumes are auto-rejected before a human reads them
• Multi-column/table layouts scramble parse order — ATS reads columns as one jumbled line
• Special bullet symbols (★ ● ■ ▪ → ✓) convert to garbage text or get stripped
• Headers and footers are INVISIBLE to all major ATS — never place contact info there
• Fancy fonts render as garbled symbols; only Arial, Calibri, Times, Georgia are safe
• Non-text PDFs (scanned/image) = 0 parseable content; DOCX is safest format
• ATS keyword matching: exact match + intelligent synonyms ("led team" = "team leadership")
• Non-standard section headers confuse ATS parsers ("Career Journey" ≠ "Work Experience")
• Achievements with metrics (%, $, numbers) score 3–5× higher in AI resume screeners
• Keyword density matters: each critical skill should appear 2–3× across sections

RESUME:
${resumeText.slice(0, 8000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

SCORING — be brutally precise, not generous:
• keywordMatch (0–30): Count critical JD skills found in resume. ~1.5 pts each. Synonyms count.
• formatting (0–20): Deduct: multi-column (-8), tables (-6), special symbols (-3), non-standard headers (-2), likely image-heavy (-5). Clean plain-text = 20.
• sections (0–20): Presence AND quality of all 5 standard sections. Thin/missing sections = heavy deductions.
• achievements (0–15): % of experience bullets with hard numbers/% /$: 80%+=15, 60%+=11, 40%+=8, 20%+=5, <20%=2
• readability (0–15): Strong varied action verbs, no passive voice, concise sentences, professional tone.
Calibrate to reality: a resume with zero metrics MUST score 2–5 on achievements. Do NOT cluster scores 70–85.

${isPremium
  ? "PREMIUM MODE: Deliver complete analysis — all missing keywords, 12–15 tagged recommendations, full formatting audit, bullet strength count."
  : "FREE MODE: 2 specific recommendations only, top 3 missing keywords only. Everything else mark as premium-locked."}

Return ONLY valid JSON — no markdown fences, no text outside the JSON object:
{
  "atsScore": <integer 0-100>,
  "industryDetected": "<e.g. Software Engineering | Product Management | Digital Marketing | Finance | HR | Sales>",
  "scoreBreakdown": {
    "keywordMatch": <0-30>,
    "formatting": <0-20>,
    "sections": <0-20>,
    "achievements": <0-15>,
    "readability": <0-15>
  },
  "keywordsFound": [<keywords from JD present in resume — exact words, max 20>],
  "keywordsMissing": ${isPremium
    ? "[<ALL important keywords from JD that are absent, ordered by how many times they appear in the JD>]"
    : "[<top 3 most critical missing keywords only>]"},
  "sectionAnalysis": {
    "contactInfo": { "present": <bool>, "score": <0-100>, "note": "<specific: what's present or missing — email, phone, LinkedIn URL, location>" },
    "summary": { "present": <bool>, "score": <0-100>, "note": "<specific: length, keyword density, hook quality>" },
    "experience": { "present": <bool>, "score": <0-100>, "note": "<specific: metrics present, action verb quality, relevance to JD>" },
    "education": { "present": <bool>, "score": <0-100>, "note": "<specific: degree, institution, year, relevance>" },
    "skills": { "present": <bool>, "score": <0-100>, "note": "<specific: coverage of JD's required skills vs listed skills>" }
  },
  "formattingFlags": [${isPremium
    ? `
    { "issue": "<exact formatting problem detected or likely present>", "severity": "critical", "fix": "<concrete fix instruction>" },
    // Add as many as apply. severity = critical (breaks ATS parsing) | warning (hurts ranking) | info (best practice tip)
    // If resume looks clean, return: { "issue": "No critical formatting issues detected", "severity": "info", "fix": "Resume appears ATS-safe. Ensure file is saved as .docx or text-selectable PDF." }`
    : "/* empty — available in premium */"}
  ],
  "bulletStrength": {
    "total": <estimated count of bullet points in experience section>,
    "withMetrics": <estimated count of bullets containing numbers, %, $, or time ranges>,
    "percentage": <rounded integer percentage>
  },
  "impactScore": <integer 0-100: how impressive and role-relevant are the achievements — 90+ = outstanding, 70+ = good, 50+ = average, <50 = weak>,
  "recommendations": [${isPremium
    ? `
    // 12-15 items. EACH must:
    // 1. Start with [HIGH], [MEDIUM], or [LOW] impact tag
    // 2. Name the EXACT section and what to change
    // 3. Give the actual fix or example text
    // E.g.: "[HIGH] Add 'Agile/Scrum' to your Skills section — it appears 5× in the JD and is completely absent. Add: 'Agile · Scrum · Sprint Planning'"
    // E.g.: "[HIGH] Experience bullet 'Worked on backend systems' → Rewrite as 'Architected and deployed RESTful microservices handling [X]K req/day, reducing latency by [X]%'"
    // E.g.: "[MEDIUM] Your summary has 45 words — expand to 80-100 words adding keywords: [list 3 missing keywords from JD]"
    "<recommendation 1>",
    "<recommendation 2>"
    // ... up to 15`
    : `
    "<ultra-specific recommendation 1 — name the exact section and fix>",
    "<ultra-specific recommendation 2 — name the exact section and fix>",
    "🔒 Unlock 13+ more tagged recommendations, formatting audit & complete keyword gap analysis with Premium"`}
  ],
  "topStrengths": [
    "<strength 1 — specific to THIS resume for THIS role, not generic>",
    "<strength 2>",
    "<strength 3>"
  ],
  "verdict": "<Sentence 1: honest bottom-line assessment with actual score context. Sentence 2: the single most impactful change they should make TODAY.>"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    const jobDescription = formData.get("jobDescription") as string || "";
    const isPremium = formData.get("isPremium") === "true";

    if (!file) return NextResponse.json({ error: "No resume file uploaded" }, { status: 400 });
    if (!jobDescription.trim()) return NextResponse.json({ error: "Job description is required" }, { status: 400 });

    const resumeText = await extractText(file);
    if (!resumeText.trim()) return NextResponse.json({ error: "Could not extract text from resume. Use PDF or DOCX." }, { status: 400 });

    const prompt = buildATSPrompt(resumeText, jobDescription, isPremium);
    const raw = await generate(prompt);

    // Strip markdown code fences if AI wraps JSON in them
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const result = JSON.parse(cleaned);

    // ── Section presence safety-net ───────────────────────────────────────────
    // Run regex over the FULL extracted text (not the sliced prompt text) so
    // truncation can never cause a real section to be marked as missing.
    const fullText = resumeText.toLowerCase();
    const SECTION_PATTERNS: Record<string, RegExp> = {
      contactInfo: /\b(email|phone|mobile|linkedin|github|contact)\b|@[a-z]/,
      summary:     /\b(summary|objective|profile|about me|professional profile|career objective)\b/,
      experience:  /\b(experience|employment|work history|internship|worked at|professional experience)\b/,
      education:   /\b(education|academic|degree|university|college|institute|b\.tech|b\.e\b|bachelor|master|mba|bsc|msc|phd|10th|12th|school|cgpa|gpa|graduation)\b/,
      skills:      /\b(skills|technical skills|competencies|technologies|proficient|tools)\b/,
    };
    for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(fullText) && result.sectionAnalysis?.[key]) {
        result.sectionAnalysis[key].present = true;
        // If AI scored a clearly-present section below 60, floor it at 60
        if (result.sectionAnalysis[key].score < 60) {
          result.sectionAnalysis[key].score = 60;
        }
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    // ── Section-driven score correction ──────────────────────────────────────
    // If all 5 resume sections score >= 80, the overall ATS score must be >= 90.
    // This prevents the AI from under-scoring well-structured resumes.
    if (result.sectionAnalysis) {
      const sectionScores: number[] = Object.values(result.sectionAnalysis).map(
        (s) => (s as { score: number }).score ?? 0
      );
      const allSectionsStrong = sectionScores.length === 5 && sectionScores.every((s) => s >= 80);

      if (allSectionsStrong && result.atsScore < 90) {
        // Compute how much we need to lift the overall score
        const lift = 90 - result.atsScore;
        result.atsScore = 90;

        // Distribute the lift proportionally across breakdown sub-scores
        // so the breakdown still sums to atsScore and looks coherent
        const bd = result.scoreBreakdown;
        const maxes = { keywordMatch: 30, formatting: 20, sections: 20, achievements: 15, readability: 15 };
        const headroom = Object.entries(maxes).reduce(
          (acc, [k, max]) => { acc[k] = max - (bd[k] ?? 0); return acc; },
          {} as Record<string, number>
        );
        const totalHeadroom = Object.values(headroom).reduce((a, b) => a + b, 0);
        if (totalHeadroom > 0) {
          for (const key of Object.keys(maxes)) {
            const add = Math.round((headroom[key] / totalHeadroom) * lift);
            bd[key] = Math.min((bd[key] ?? 0) + add, maxes[key as keyof typeof maxes]);
          }
        }

        // Also ensure the sections breakdown sub-score reflects strong section scores
        const avgSection = sectionScores.reduce((a, b) => a + b, 0) / sectionScores.length;
        bd.sections = Math.max(bd.sections ?? 0, Math.round((avgSection / 100) * 20));
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    return NextResponse.json({ ...result, isPremium });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[ATS] Error:", msg);
    if (msg.includes("JSON")) return NextResponse.json({ error: "AI returned unexpected format. Please try again." }, { status: 500 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
