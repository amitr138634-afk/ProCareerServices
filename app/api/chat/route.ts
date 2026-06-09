import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

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

const GROQ_MODEL       = process.env.GROQ_MODEL         || "llama-3.3-70b-versatile";
const GEMINI_MODEL     = process.env.GEMINI_MODEL        || "gemini-2.5-flash";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL    || "meta-llama/llama-3.3-70b-instruct:free";
const CLAUDE_MODEL     = process.env.CLAUDE_MODEL        || "claude-sonnet-4-5";

const SYSTEM_PROMPT = `You are ProCareer AI — the friendly assistant for ProCareerLaunchpad, an AI-powered platform for career growth, business operations, and legal guidance.

SERVICES & PRICING:
━━━━━━━━━━━━━━━━━━
🔵 LinkedIn Profile Optimizer — ₹200 (one-time)
   AI analyzes your LinkedIn profile and gives 20+ specific, actionable improvements. Covers headline, summary, experience, skills, recommendations, and profile strength. Takes 2–5 minutes.

🔵 ATS Resume Scanner — ₹200 (one-time)
   Scans your resume against a job description. Returns ATS score (0–100), missing keywords, section analysis, and 10–15 recommendations to beat ATS filters.

🔵 Naukri Profile Optimizer — ₹200 (one-time)
   Full AI audit of your Naukri.com profile to boost search visibility and recruiter responses.

📞 Resume Creation — ₹200 (pay after delivery, contact us to order)
📞 Content Creation (LinkedIn, Instagram, Facebook, reels, posts, blogs) — ₹500/week
📞 Portfolio Website — ₹1,099 one-time (contact us to order)
📞 Career Counseling — Custom pricing (contact us)

🔜 Coming Soon:
   - ERP Business Services (SAP, inventory, HR automation)
   - Legal AI Assistant (contracts, workplace disputes, legal guidance)

CONTACT:
━━━━━━━
📧 info@procareerlaunchpad.com
📅 Free 15-min discovery call: https://calendar.app.google/HbKg3j7UYVZXKxxaA
🌐 ${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}

HOW TO PAY:
━━━━━━━━━━
Visit the website → select service → pay ₹200 via Razorpay (UPI, cards, net banking) → instant access. 100% secure.

RULES:
━━━━━
- Keep replies to 2–4 short sentences max. Be warm, helpful, and direct.
- For ₹200 AI tools (LinkedIn, ATS, Naukri), state the exact price confidently.
- For other services, say "Contact us for a custom quote — email info@procareerlaunchpad.com or book a free call."
- If asked about ERP or Legal, say they're "coming soon — drop your email at info@procareerlaunchpad.com to get early access."
- If you don't know the answer or the query is personal/complex, reply: "Great question — let me connect you with our team right away! Click 'Talk to a Human' below for instant help."
- Never make up prices, timelines, or guarantees you aren't sure about.
- Always be encouraging. Users are job seekers and professionals trying to grow.`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isTransient(msg: string) {
  return msg.includes("429") || msg.includes("503") || msg.includes("rate_limit") ||
    msg.includes("quota") || msg.includes("overloaded");
}

interface ChatMessage { role: "user" | "assistant"; text: string; }

async function generateReply(message: string, history: ChatMessage[]): Promise<string> {
  const recent = history.slice(-6); // last 3 exchanges for context
  const conversationText = recent.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`).join("\n");
  const fullPrompt = conversationText
    ? `Previous conversation:\n${conversationText}\n\nUser: ${message}`
    : `User: ${message}`;

  const openaiMessages: { role: "system" | "user"; content: string }[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: fullPrompt },
  ];

  const providers: [string, () => Promise<string>][] = [
    ["Groq", async () => {
      if (!groqClient) throw new Error("no key");
      const r = await groqClient.chat.completions.create({
        model: GROQ_MODEL, messages: openaiMessages, max_tokens: 200, temperature: 0.5,
      });
      return r.choices[0]?.message?.content || "";
    }],
    ["Gemini", async () => {
      if (!geminiClient) throw new Error("no key");
      const m = geminiClient.getGenerativeModel({ model: GEMINI_MODEL });
      const r = await m.generateContent(`${SYSTEM_PROMPT}\n\n${fullPrompt}`);
      return r.response.text();
    }],
    ["OpenRouter", async () => {
      if (!openrouterClient) throw new Error("no key");
      const r = await openrouterClient.chat.completions.create({
        model: OPENROUTER_MODEL, messages: openaiMessages, max_tokens: 200, temperature: 0.5,
      });
      return r.choices[0]?.message?.content || "";
    }],
    ["Claude", async () => {
      if (!anthropicClient) throw new Error("no key");
      const r = await anthropicClient.messages.create({
        model: CLAUDE_MODEL, max_tokens: 200,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: fullPrompt }],
      });
      const b = r.content[0];
      return b.type === "text" ? b.text : "";
    }],
  ];

  for (const [name, fn] of providers) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const text = await fn();
        if (text.trim()) { console.log(`[Chat] ${name} ok`); return text.trim(); }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (isTransient(msg) && attempt < 2) await sleep(1000);
        else break;
      }
    }
  }
  return "I'm having trouble right now — please click 'Talk to a Human' below and our team will help you immediately!";
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json() as { message: string; history: ChatMessage[] };
    if (!message?.trim()) return NextResponse.json({ reply: "" }, { status: 400 });
    const reply = await generateReply(message.trim(), history);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[Chat]", err);
    return NextResponse.json({ reply: "Something went wrong. Click 'Talk to a Human' for instant support!" }, { status: 500 });
  }
}
