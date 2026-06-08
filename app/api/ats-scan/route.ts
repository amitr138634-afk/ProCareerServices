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
    model, messages: [{ role: "user", content: prompt }], max_tokens: 2000, temperature: 0.3,
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
    const r = await anthropicClient.messages.create({ model: CLAUDE_MODEL, max_tokens: 2000, messages: [{ role: "user", content: p }] });
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
  const depth = isPremium
    ? "Provide FULL detailed analysis with complete recommendations for every section."
    : "Provide BASIC analysis. Give only 2 specific recommendations and 3 missing keywords. For the rest, say they are available in the premium report.";

  return `You are an expert ATS (Applicant Tracking System) analyst and career coach.

Analyze this resume against the job description and return a JSON response ONLY (no markdown, no explanation outside JSON).

RESUME:
${resumeText.slice(0, 8000)}

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

${depth}

Return this exact JSON structure:
{
  "atsScore": <number 0-100>,
  "scoreBreakdown": {
    "keywordMatch": <number 0-30>,
    "formatting": <number 0-20>,
    "sections": <number 0-20>,
    "achievements": <number 0-15>,
    "readability": <number 0-15>
  },
  "keywordsFound": [<list of matching keywords from JD found in resume, max 15>],
  "keywordsMissing": ${isPremium ? "[<ALL missing important keywords from JD>]" : "[<top 3 missing keywords only>]"},
  "sectionAnalysis": {
    "contactInfo": { "present": <bool>, "score": <0-100>, "note": "<short note>" },
    "summary": { "present": <bool>, "score": <0-100>, "note": "<short note>" },
    "experience": { "present": <bool>, "score": <0-100>, "note": "<short note>" },
    "education": { "present": <bool>, "score": <0-100>, "note": "<short note>" },
    "skills": { "present": <bool>, "score": <0-100>, "note": "<short note>" }
  },
  "recommendations": ${isPremium
    ? `[<10-15 specific, actionable recommendations to improve ATS score. Each should be a specific action like "Add 'Agile' keyword to your Skills section" or "Quantify your sales achievement in line 2 of Job 1 with a percentage">]`
    : `[<exactly 2 specific recommendations. Be direct about what to fix.>, "🔒 Unlock 10+ more recommendations with Premium"]`
  },
  "topStrengths": [<3 things the resume does well for this JD>],
  "verdict": "<2 sentence overall verdict on ATS compatibility>"
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
