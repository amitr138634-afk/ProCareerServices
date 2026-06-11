import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

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

const GROQ_MODEL          = process.env.GROQ_MODEL          || "llama-3.3-70b-versatile";
const GROQ_FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || "deepseek-r1-distill-llama-70b";
const GEMINI_MODEL        = process.env.GEMINI_MODEL        || "gemini-2.5-flash";
const OPENROUTER_MODEL    = process.env.OPENROUTER_MODEL    || "meta-llama/llama-3.3-70b-instruct:free";
const CLAUDE_MODEL        = process.env.CLAUDE_MODEL        || "claude-sonnet-4-5";
const OPENAI_MODEL        = process.env.OPENAI_MODEL        || "gpt-4o-mini";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
function isTransient(msg: string) {
  return msg.includes("429") || msg.includes("503") || msg.includes("rate_limit") ||
    msg.includes("quota") || msg.includes("busy") || msg.includes("overloaded");
}

async function tryGroq(prompt: string, tokens: number): Promise<string> {
  if (!groqClient) throw new Error("no key");
  const res = await groqClient.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: tokens,
    temperature: 0.5,
  });
  return res.choices[0]?.message?.content || "";
}
async function tryGroqFallback(prompt: string, tokens: number): Promise<string> {
  if (!groqClient) throw new Error("no key");
  const res = await groqClient.chat.completions.create({
    model: GROQ_FALLBACK_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: tokens,
    temperature: 0.5,
  });
  return res.choices[0]?.message?.content || "";
}
async function tryGemini(prompt: string): Promise<string> {
  if (!geminiClient) throw new Error("no key");
  const model = geminiClient.getGenerativeModel({ model: GEMINI_MODEL });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
async function tryOpenRouter(prompt: string, tokens: number): Promise<string> {
  if (!openrouterClient) throw new Error("no key");
  const res = await openrouterClient.chat.completions.create({
    model: OPENROUTER_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: tokens,
    temperature: 0.5,
  });
  return res.choices[0]?.message?.content || "";
}
async function tryClaude(prompt: string, tokens: number): Promise<string> {
  if (!anthropicClient) throw new Error("no key");
  const res = await anthropicClient.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: tokens,
    messages: [{ role: "user", content: prompt }],
  });
  const block = res.content[0];
  return block.type === "text" ? block.text : "";
}
async function tryOpenAI(prompt: string, tokens: number): Promise<string> {
  if (!openaiClient) throw new Error("no key");
  const res = await openaiClient.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: tokens,
    temperature: 0.5,
  });
  return res.choices[0]?.message?.content || "";
}

type ProviderFn = (p: string, t: number) => Promise<string>;

async function runWithFallback(chain: [string, ProviderFn][], prompt: string, tokens: number): Promise<string> {
  for (const [name, fn] of chain) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const text = await fn(prompt, tokens);
        if (text) return text;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (isTransient(msg) && attempt < 2) await sleep(2000);
        else break;
      }
    }
  }
  throw new Error("All AI providers unavailable.");
}

function buildPrompt(profileData: Record<string, string>, stepResponses: Record<string, string>): string {
  const name = profileData["candidate-name"] || profileData["linkedin-url"]?.split("/in/")?.[1]?.replace(/-/g, " ") || "the candidate";
  const targetRole = profileData["target-position"] || "Target Role";
  const competencies = profileData["competencies"] || "";
  const headline = profileData["headline"] || "";

  const analysisLines: string[] = [];
  for (const [key, val] of Object.entries(stepResponses)) {
    if (val) analysisLines.push(`[${key.toUpperCase()}]: ${val.substring(0, 400)}`);
  }
  const analysis = analysisLines.join("\n\n");

  return `You are a senior LinkedIn career coach at Shyam Pro Services, India's leading career optimization platform.

Based on this candidate's LinkedIn profile analysis, generate a highly personalized Step-by-Step Action Guide JSON.

CANDIDATE DETAILS:
- Name: ${name}
- Target Role: ${targetRole}
- Current Headline: ${headline}
- Key Competencies: ${competencies}

AI ANALYSIS PER SECTION:
${analysis || "Comprehensive profile review completed. Generate standard optimization steps."}

Generate a JSON object with this EXACT structure (no markdown, no explanation, just valid JSON):
{
  "candidateName": "use actual name if available, else 'You'",
  "targetRole": "${targetRole}",
  "totalSteps": <number 15-22>,
  "estimatedTime": "e.g. 5-7 hrs",
  "phases": [
    {
      "number": 1,
      "title": "URGENT FIXES",
      "description": "Complete before anything else",
      "estimatedTime": "30 mins",
      "steps": [
        {
          "title": "Concise action title (max 8 words)",
          "instructions": "1. Do this exactly.\\n2. Then do this.\\n3. Result should look like X.",
          "example": "Specific example text showing exactly what to type/write, tailored to this candidate (or null)",
          "warning": "Critical note or important tip specific to this step (or null)"
        }
      ]
    }
  ]
}

PHASES to include (adapt based on analysis):
- Phase 1: URGENT FIXES (critical profile errors, missing photo, misleading info) — 2-4 steps
- Phase 2: PROFILE FOUNDATION (headline, about/summary, experience rewriting) — 4-5 steps
- Phase 3: SKILLS & CREDIBILITY (skills cleanup, projects, GitHub, certifications) — 4-6 steps
- Phase 4: VISIBILITY SETTINGS (Open to Work, custom URL, keyword optimization) — 2-3 steps
- Phase 5: SOCIAL PROOF & POLISH (recommendations, final checklist) — 3-4 steps

RULES:
- Make every step SPECIFIC to this candidate based on the AI analysis
- Instructions must be numbered and actionable (tell exactly what to click, what to type)
- Examples must show EXACT text the candidate should use, not generic placeholders
- Warnings highlight critical mistakes or important context
- Base the content on ACTUAL issues found in the analysis
- Keep instructions clear and brief (3-6 numbered points per step)
- Return ONLY valid JSON`;
}

export async function POST(req: NextRequest) {
  try {
    const { profileData, stepResponses } = await req.json();

    const prompt = buildPrompt(profileData ?? {}, stepResponses ?? {});
    const TOKENS = 3500;

    const chain: [string, ProviderFn][] = [
      ["Groq",        (p, t) => tryGroq(p, t)],
      ["Claude",      (p, t) => tryClaude(p, t)],
      ["Gemini",      (p) => tryGemini(p)],
      ["GroqFallback",(p, t) => tryGroqFallback(p, t)],
      ["OpenRouter",  (p, t) => tryOpenRouter(p, t)],
      ["OpenAI",      (p, t) => tryOpenAI(p, t)],
    ];

    const raw = await runWithFallback(chain, prompt, TOKENS);

    // Extract JSON from response (strip markdown if any)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in AI response");

    const guide = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ guide });
  } catch (err) {
    console.error("action-guide error:", err);
    return NextResponse.json({ error: "Failed to generate action guide" }, { status: 500 });
  }
}
