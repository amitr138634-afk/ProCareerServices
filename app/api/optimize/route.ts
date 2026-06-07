import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

// ── Provider clients (only initialised if key exists) ──────────────────────
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

// ── Model names (configurable via env) ────────────────────────────────────
const GROQ_MODEL            = process.env.GROQ_MODEL            || "llama-3.3-70b-versatile";
const GROQ_FALLBACK_MODEL   = process.env.GROQ_FALLBACK_MODEL   || "deepseek-r1-distill-llama-70b";
const GEMINI_MODEL          = process.env.GEMINI_MODEL          || "gemini-2.5-flash";
const OPENROUTER_MODEL      = process.env.OPENROUTER_MODEL      || "meta-llama/llama-3.3-70b-instruct:free";
const CLAUDE_MODEL          = process.env.CLAUDE_MODEL          || "claude-sonnet-4-5";
const OPENAI_MODEL          = process.env.OPENAI_MODEL          || "gpt-4o-mini";

// ── Helpers ────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isTransient(msg: string) {
  return (
    msg.includes("429") || msg.includes("503") ||
    msg.includes("rate_limit") || msg.includes("rate limit") ||
    msg.includes("quota") || msg.includes("high demand") ||
    msg.includes("busy") || msg.includes("overloaded")
  );
}

// ── Provider call functions ────────────────────────────────────────────────
async function tryGroq(prompt: string): Promise<string> {
  if (!groqClient) throw new Error("GROQ_API_KEY not set");
  const res = await groqClient.chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 900,
    temperature: 0.7,
  });
  return res.choices[0]?.message?.content || "";
}

async function tryGroqDeepSeek(prompt: string): Promise<string> {
  if (!groqClient) throw new Error("GROQ_API_KEY not set");
  const res = await groqClient.chat.completions.create({
    model: GROQ_FALLBACK_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 900,
    temperature: 0.7,
  });
  return res.choices[0]?.message?.content || "";
}

async function tryGemini(prompt: string): Promise<string> {
  if (!geminiClient) throw new Error("GEMINI_API_KEY not set");
  const model = geminiClient.getGenerativeModel({ model: GEMINI_MODEL });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function tryOpenRouter(prompt: string): Promise<string> {
  if (!openrouterClient) throw new Error("OPENROUTER_API_KEY not set");
  const res = await openrouterClient.chat.completions.create({
    model: OPENROUTER_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 900,
    temperature: 0.7,
  });
  return res.choices[0]?.message?.content || "";
}

async function tryClaude(prompt: string): Promise<string> {
  if (!anthropicClient) throw new Error("ANTHROPIC_API_KEY not set");
  const res = await anthropicClient.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 900,
    messages: [{ role: "user", content: prompt }],
  });
  const block = res.content[0];
  return block.type === "text" ? block.text : "";
}

async function tryOpenAI(prompt: string): Promise<string> {
  if (!openaiClient) throw new Error("OPENAI_API_KEY not set");
  const res = await openaiClient.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 900,
    temperature: 0.7,
  });
  return res.choices[0]?.message?.content || "";
}

// ── Smart fallback: retry each provider 3x before moving to next ───────────
type ProviderFn = (prompt: string) => Promise<string>;

async function runWithFallback(chain: [string, ProviderFn][], prompt: string): Promise<string> {
  for (const [name, fn] of chain) {
    let lastErr = "";
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[AI] ${name} attempt ${attempt}/3...`);
        const text = await fn(prompt);
        console.log(`[AI] ${name} succeeded on attempt ${attempt}`);
        return text;
      } catch (err: unknown) {
        lastErr = err instanceof Error ? err.message : String(err);
        if (isTransient(lastErr)) {
          console.warn(`[AI] ${name} rate-limited (attempt ${attempt}/3)`);
          if (attempt < 3) await sleep(1500 * attempt); // 1.5s, 3s between retries
        } else {
          // Hard error — skip remaining retries for this provider
          console.warn(`[AI] ${name} hard error, skipping:`, lastErr);
          break;
        }
      }
    }
    console.warn(`[AI] ${name} exhausted — moving to next provider`);
  }
  throw new Error("All AI providers are currently unavailable. Please try again in a moment.");
}

// ── Chain order ────────────────────────────────────────────────────────────
// Both free and premium use the same providers; premium just puts OpenAI first.
function buildChain(isPremium: boolean): [string, ProviderFn][] {
  const base: [string, ProviderFn][] = [
    ["Groq (Llama 3.3)",   tryGroq],
    ["Groq (DeepSeek R1)", tryGroqDeepSeek],
    ["Gemini 2.5 Flash",   tryGemini],
    ["OpenRouter",         tryOpenRouter],
    ["Claude Sonnet",      tryClaude],
    ["OpenAI",             tryOpenAI],
  ];
  if (isPremium) {
    return [
      ["OpenAI",             tryOpenAI],
      ["Claude Sonnet",      tryClaude],
      ["Groq (Llama 3.3)",   tryGroq],
      ["Groq (DeepSeek R1)", tryGroqDeepSeek],
      ["Gemini 2.5 Flash",   tryGemini],
      ["OpenRouter",         tryOpenRouter],
    ];
  }
  return base;
}

async function generateWithRetry(prompt: string, isPremium = false): Promise<string> {
  return runWithFallback(buildChain(isPremium), prompt);
}

function buildPrompt(
  step: string,
  userInput: string,
  profileData: Record<string, string>
): string {
  const target = profileData["target-position"] || "their target role";
  const competencies = profileData["competencies"] || "their key skills";

  const systemBase = `You are an expert LinkedIn profile optimizer and career coach.
You help professionals optimize their LinkedIn profiles to attract recruiters and land better jobs.
Target role: ${target}
Key competencies: ${competencies}
Be concise, actionable, and specific. Use bullet points where helpful.`;

  const prompts: Record<string, string> = {
    headline: `${systemBase}

The user's current LinkedIn headline: "${userInput}"

Provide:
1. A brief analysis of what's working and what's missing (2 sentences max)
2. Three improved headline options (max 220 chars each, keyword-rich, specific)
3. One clear action item in the format: "TODO: [action]"

Keep the tone professional yet conversational.`,

    achievements: `${systemBase}

The user's professional achievements: "${userInput}"

Provide:
1. Pick the top 3 most impactful for LinkedIn
2. Suggest how to quantify or strengthen each one (use [X%] or [number] as placeholder if needed)
3. Recommend where on LinkedIn to feature them (Featured section, About, Experience)
4. Two action items in the format: "TODO: [action]"`,

    "spelling-grammar": `${systemBase}

Review this LinkedIn text for spelling, grammar, and professional tone:
"${userInput}"

Provide:
1. List of specific errors (if any), or confirm it's error-free
2. The corrected version
3. One tone/professionalism suggestion
4. One action item: "TODO: [action]"`,

    "resume-match": `${systemBase}

Target job description:
"${userInput}"

Analyze this job description and provide:
1. Top 10 keywords/skills mentioned in the JD
2. Which of these are likely missing from the user's LinkedIn profile (based on their competencies: ${competencies})
3. Exactly where to add each missing keyword (headline / about / skills / experience)
4. Three action items: "TODO: [action]"`,

    "about-summary": `${systemBase}

Current LinkedIn About section:
"${userInput}"

Provide:
1. One-sentence analysis of the current About
2. A fully rewritten About section (200-280 words) that:
   - Opens with a compelling hook
   - Highlights ${competencies}
   - Uses keywords for ${target}
   - Ends with a call to action
3. Two action items: "TODO: [action]"`,

    experience: `${systemBase}

Current job description from LinkedIn:
"${userInput}"

Rewrite this job description:
1. Use strong action verbs (Led, Built, Delivered, Increased, etc.)
2. Add quantified achievements (use [X%] or [number] placeholders where metrics are missing)
3. Include keywords relevant to ${target}
4. Format as 4-5 impactful bullet points
5. Two action items: "TODO: [action]"`,

    "profile-photo": `${systemBase}

The user described their profile photo as: "${userInput}"

Analyze this and tell them EXACTLY what needs to be fixed:
1. What's wrong or missing with their current photo (be direct and specific)
2. Exact specifications for an ideal LinkedIn photo:
   - Framing (how much of the face/body should show)
   - Background (what color/style works best for ${target} roles)
   - Attire recommendation for their target role (${target})
   - Lighting tips
3. Free/cheap tools to get a professional photo (mention AI headshot tools like Aragon, HeadshotPro, or PhotoAI if they can't get a photographer)
4. One action item: "TODO: [action]"

Be direct about what needs to change, not just generic tips.`,

    banner: `${systemBase}

The user's current LinkedIn banner: "${userInput}"

Analyze this and give them a COMPLETE banner brief they can hand to a designer or replicate on Canva:

1. What's wrong with their current banner (1 sentence, be direct)
2. Exact content to include on their new banner tailored to ${target}:
   - Main text (their name + title/tagline)
   - Specific skill/tool logos to feature (based on competencies: ${competencies})
   - A one-line value proposition
3. Design specs:
   - Size: 1584×396px
   - Color palette recommendation (based on their industry)
   - Font style suggestion
4. Canva steps: Search "LinkedIn Banner" → pick a dark/professional template → customize
5. One action item: "TODO: [action]"

Make it so specific they can open Canva right now and build it.`,

    recommendations: `${systemBase}

The user's recommendation situation: "${userInput}"

Analyze this and provide:
1. Assessment: Are they above or below the recommended threshold (5+ recommendations)? What does this signal to recruiters?
2. Exactly WHO to ask for recommendations (types of people, seniority, relationship)
3. A word-for-word message template they can copy-paste to request a recommendation:
   ---
   Hi [Name], I hope you're doing well! I'm currently exploring ${target} opportunities and I'm working on strengthening my LinkedIn profile. Given that we worked together on [project/context], I'd be so grateful if you could write me a brief LinkedIn recommendation highlighting [specific skill/achievement]. I'm happy to write one for you as well! No pressure at all — let me know if you're comfortable with this.
   ---
4. What to tell them to mention (specific skills or achievements to highlight)
5. Two action items: "TODO: [action]"`,

    "age-discrimination": `${systemBase}

The user's age/discrimination concern: "${userInput}"

Analyze their situation and provide concrete, specific fixes:
1. Assess if this is a real risk based on what they shared
2. Specific profile changes to make:
   - What to REMOVE from their profile (graduation years, early job dates, outdated tech)
   - What to ADD (current skills, recent achievements)
   - How to reframe experience years in their headline/about
3. Photo and visual brand tips to appear current and modern
4. Keywords that signal "current" vs "outdated" for ${target} roles
5. Two action items: "TODO: [action]"

Be direct and specific — tell them exactly which sections to edit.`,

    skills: `${systemBase}

Current LinkedIn skills: "${userInput}"

Provide:
1. Top 15 recommended skills for ${target} (ordered by importance)
2. Skills to ADD that are not in their current list
3. Top 5 skills to get endorsements for first
4. Three action items: "TODO: [action]"`,
  };

  return prompts[step] || `${systemBase}\n\nUser input: "${userInput}"\n\nProvide helpful LinkedIn optimization advice for the "${step}" section. Include 1-2 action items as "TODO: [action]"`;
}

export async function POST(req: NextRequest) {
  try {
    const { step, userInput, profileData, isPremium } = await req.json();

    if (!userInput || !step) {
      return NextResponse.json({ error: "Missing step or userInput" }, { status: 400 });
    }

    const prompt = buildPrompt(step, userInput, profileData || {});

    const responseText = await generateWithRetry(prompt, isPremium === true);

    // Extract TODO items from the response
    const todos = responseText
      .split("\n")
      .filter((line) => line.trim().startsWith("TODO:"))
      .map((line) => line.replace("TODO:", "").trim());

    return NextResponse.json({ response: responseText, todos });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("OpenAI API error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
