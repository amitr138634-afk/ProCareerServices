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
    msg.includes("rate limit") || msg.includes("quota") || msg.includes("busy") || msg.includes("overloaded");
}

async function tryGroq(prompt: string)       { if (!groqClient) throw new Error("no key"); const r = await groqClient.chat.completions.create({ model: GROQ_MODEL, messages: [{ role: "user", content: prompt }], max_tokens: 900, temperature: 0.7 }); return r.choices[0]?.message?.content || ""; }
async function tryGroqDs(prompt: string)     { if (!groqClient) throw new Error("no key"); const r = await groqClient.chat.completions.create({ model: GROQ_FALLBACK_MODEL, messages: [{ role: "user", content: prompt }], max_tokens: 900, temperature: 0.7 }); return r.choices[0]?.message?.content || ""; }
async function tryGemini(prompt: string)     { if (!geminiClient) throw new Error("no key"); const m = geminiClient.getGenerativeModel({ model: GEMINI_MODEL }); const r = await m.generateContent(prompt); return r.response.text(); }
async function tryOpenRouter(prompt: string) { if (!openrouterClient) throw new Error("no key"); const r = await openrouterClient.chat.completions.create({ model: OPENROUTER_MODEL, messages: [{ role: "user", content: prompt }], max_tokens: 900, temperature: 0.7 }); return r.choices[0]?.message?.content || ""; }
async function tryClaude(prompt: string)     { if (!anthropicClient) throw new Error("no key"); const r = await anthropicClient.messages.create({ model: CLAUDE_MODEL, max_tokens: 900, messages: [{ role: "user", content: prompt }] }); const b = r.content[0]; return b.type === "text" ? b.text : ""; }
async function tryOpenAI(prompt: string)     { if (!openaiClient) throw new Error("no key"); const r = await openaiClient.chat.completions.create({ model: OPENAI_MODEL, messages: [{ role: "user", content: prompt }], max_tokens: 900, temperature: 0.7 }); return r.choices[0]?.message?.content || ""; }

type ProviderFn = (prompt: string) => Promise<string>;

async function runWithFallback(chain: [string, ProviderFn][], prompt: string): Promise<string> {
  for (const [name, fn] of chain) {
    let lastErr = "";
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const text = await fn(prompt);
        return text;
      } catch (err: unknown) {
        lastErr = err instanceof Error ? err.message : String(err);
        if (isTransient(lastErr)) { if (attempt < 3) await sleep(1500 * attempt); }
        else break;
      }
    }
    console.warn(`[NaukriAI] ${name} exhausted — moving to next:`, lastErr);
  }
  throw new Error("All AI providers are currently unavailable. Please try again.");
}

function buildChain(isPremium: boolean): [string, ProviderFn][] {
  const base: [string, ProviderFn][] = [
    ["Groq (Llama 3.3)", tryGroq], ["Groq (DeepSeek R1)", tryGroqDs],
    ["Gemini 2.5 Flash", tryGemini], ["OpenRouter", tryOpenRouter],
    ["Claude Sonnet", tryClaude], ["OpenAI", tryOpenAI],
  ];
  if (isPremium) return [["OpenAI", tryOpenAI], ["Claude Sonnet", tryClaude], ...base.slice(0, 4)];
  return base;
}

function buildPrompt(step: string, userInput: string, profileData: Record<string, string>): string {
  const target = profileData["target-role"] || "their target role";
  const experience = profileData["experience"] || "experienced professional";

  const base = `You are an expert Naukri profile optimizer and Indian career coach.
You help professionals optimize their Naukri profiles to attract more recruiter calls and land better jobs in India.
Target role: ${target}
Experience: ${experience}
Be concise, actionable, and specific. Use bullet points where helpful. Focus on Indian job market context.`;

  const prompts: Record<string, string> = {
    "resume-headline": `${base}

Current Naukri resume headline: "${userInput}"

Provide:
1. Brief analysis of what's working and what's missing (2 sentences)
2. Three improved headline options (max 200 chars each, keyword-rich, role-specific)
   - Option 1: Experience-focused (mentions years + key skills)
   - Option 2: Achievement-focused (highlights an outcome or impact)
   - Option 3: Keyword-dense (targets ATS/recruiter search)
3. One action item: "TODO: [action]"`,

    "profile-summary": `${base}

Current Naukri profile summary: "${userInput}"

Provide:
1. One-sentence analysis of the current summary
2. A fully rewritten summary (180-250 words) that:
   - Opens with a strong value-driven hook (not "I am a...")
   - Highlights key achievements with numbers where possible
   - Uses keywords that Naukri recruiters search for targeting ${target}
   - Ends with availability + contact/location signal
3. Two action items: "TODO: [action]"`,

    "key-skills": `${base}

Current Naukri key skills: "${userInput}"

Provide:
1. Top 15 recommended skills for ${target} in the Indian job market (ordered by recruiter demand)
2. Skills to ADD that are missing from their list
3. Skills to REMOVE if they're outdated or irrelevant
4. Which 5 skills to prioritize first (Naukri weights skills that get endorsements)
5. Three action items: "TODO: [action]"`,

    "work-experience": `${base}

Current Naukri job description: "${userInput}"

Rewrite this as 4-5 impactful bullet points:
1. Use strong action verbs (Led, Built, Delivered, Reduced, Increased, Automated, etc.)
2. Quantify achievements (use [X%] or [number] placeholders where metrics are missing)
3. Include keywords relevant to ${target}
4. Each bullet should answer: What did you do? How? With what result?
5. Two action items: "TODO: [action]"`,

    "it-skills": `${base}

IT skills listed: "${userInput}"

Provide:
1. Assessment of the current IT skills for ${target} roles
2. Missing technologies/tools that are in-demand for ${target} in India
3. Recommended proficiency levels for each major skill
4. Certifications that would boost their Naukri profile for ${target}
5. Two action items: "TODO: [action]"`,

    projects: `${base}

Project description: "${userInput}"

Provide:
1. Assessment: is this project impressive for ${target} roles?
2. Rewrite the project description using the STAR format (Situation, Task, Action, Result)
3. Specific metrics or outcomes to add (use [placeholder] if unknown)
4. What tech stack keywords to highlight for ${target}
5. One action item: "TODO: [action]"`,

    education: `${base}

Education details: "${userInput}"

Provide:
1. Assessment of how this education positions them for ${target}
2. How to present their education on Naukri for maximum impact
3. Additional certifications or courses that would strengthen their profile for ${target} in India (mention specific platforms: Coursera, Udemy, NPTEL, etc.)
4. One action item: "TODO: [action]"`,

    "preferred-locations": `${base}

Preferred locations and employment preferences: "${userInput}"

Provide:
1. Assessment — is this location preference competitive for ${target} in India?
2. Recommended locations to add based on where ${target} jobs are concentrated in India
3. Salary range guidance for ${target} in their preferred cities (rough LPA ranges)
4. Tips on shift preference, employment type, and functional area settings on Naukri
5. One action item: "TODO: [action]"`,

    "online-profiles": `${base}

Online profiles/work samples: "${userInput}"

Provide:
1. Assessment of their current online presence for ${target}
2. How to add these to Naukri profile (Work Samples section) for maximum visibility
3. Specific things to add to their GitHub / portfolio that would impress ${target} recruiters
4. Recommended certifications or badges to display (AWS, Google, Microsoft, etc.)
5. Two action items: "TODO: [action]"`,
  };

  return prompts[step] || `${base}\n\nUser input: "${userInput}"\n\nProvide helpful Naukri profile optimization advice for the "${step}" section. Include 1-2 action items as "TODO: [action]"`;
}

export async function POST(req: NextRequest) {
  try {
    const { step, userInput, profileData, isPremium } = await req.json();
    if (!userInput || !step) return NextResponse.json({ error: "Missing step or userInput" }, { status: 400 });

    const prompt = buildPrompt(step, userInput, profileData || {});
    const responseText = await runWithFallback(buildChain(isPremium === true), prompt);

    const todos = responseText
      .split("\n")
      .filter((line) => line.trim().startsWith("TODO:"))
      .map((line) => line.replace("TODO:", "").trim());

    return NextResponse.json({ response: responseText, todos });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
