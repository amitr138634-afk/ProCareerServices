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

async function tryGroq(prompt: string)       { if (!groqClient) throw new Error("no key"); const r = await groqClient.chat.completions.create({ model: GROQ_MODEL, messages: [{ role: "user", content: prompt }], max_tokens: 1800, temperature: 0.7 }); return r.choices[0]?.message?.content || ""; }
async function tryGroqDs(prompt: string)     { if (!groqClient) throw new Error("no key"); const r = await groqClient.chat.completions.create({ model: GROQ_FALLBACK_MODEL, messages: [{ role: "user", content: prompt }], max_tokens: 1800, temperature: 0.7 }); return r.choices[0]?.message?.content || ""; }
async function tryGemini(prompt: string)     { if (!geminiClient) throw new Error("no key"); const m = geminiClient.getGenerativeModel({ model: GEMINI_MODEL }); const r = await m.generateContent(prompt); return r.response.text(); }
async function tryOpenRouter(prompt: string) { if (!openrouterClient) throw new Error("no key"); const r = await openrouterClient.chat.completions.create({ model: OPENROUTER_MODEL, messages: [{ role: "user", content: prompt }], max_tokens: 1800, temperature: 0.7 }); return r.choices[0]?.message?.content || ""; }
async function tryClaude(prompt: string)     { if (!anthropicClient) throw new Error("no key"); const r = await anthropicClient.messages.create({ model: CLAUDE_MODEL, max_tokens: 1800, messages: [{ role: "user", content: prompt }] }); const b = r.content[0]; return b.type === "text" ? b.text : ""; }
async function tryOpenAI(prompt: string)     { if (!openaiClient) throw new Error("no key"); const r = await openaiClient.chat.completions.create({ model: OPENAI_MODEL, messages: [{ role: "user", content: prompt }], max_tokens: 1800, temperature: 0.7 }); return r.choices[0]?.message?.content || ""; }

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

  const base = `You are India's best Naukri profile optimizer, trained on thousands of profiles that attracted top recruiters from MNCs and Indian companies.
Target role: ${target}
Experience: ${experience}

NAUKRI ALGORITHM FACTS YOU APPLY:
• Naukri ranks profiles by: Profile completeness (100% = 3× more views) + Keyword match + Profile freshness (update at least once a week to stay in "active" filter)
• Recruiter Boolean searches: "Java AND (Spring OR Hibernate) AND Bangalore" — exact keyword match matters
• "Resume Headline" is the first thing recruiters see in search results — 220 chars max, front-load keywords
• Naukri gives 2× weight to skills listed in the dedicated Key Skills section vs skills buried in text
• Profiles with 6+ skills listed rank higher in skill-filtered searches
• Naukri "Profile Score" shows recruiters — aim for 100% completion (each section adds %)
• Average Indian recruiter spends 6 seconds on a profile before shortlisting — hook them in the summary first 3 lines
• CTC and notice period are the #2 and #3 filter recruiters use after location — fill these fields correctly
• "Open to Relocation" setting increases profile visibility by 40% in pan-India searches

Give COMPLETE rewrites — not just advice. Every section should be copy-paste ready.`;

  const prompts: Record<string, string> = {
    "resume-headline": `${base}

Current Naukri resume headline: "${userInput}"

Provide a COMPLETE optimization — copy-paste ready:

**DIAGNOSIS** (2 sentences): What's hurting this headline in Naukri recruiter search? Name specific missing keywords.

**THREE COMPLETE HEADLINE REWRITES** (max 220 chars each):

Option A — EXPERIENCE-LED (years of experience + core skills that match ${target} recruiter searches):
[Write the complete headline]

Option B — ACHIEVEMENT-LED (opens with a quantified result or impact that gets instant attention):
[Write the complete headline]

Option C — KEYWORD-DENSE (packs maximum Naukri search terms for ${target} Boolean filters):
[Write the complete headline]

**PICK THIS ONE**: Tell them which headline to use and exactly why it will rank higher.

**NAUKRI TIP**: One specific Naukri algorithm insight about how headline keywords affect search rank.

TODO: Replace your headline with Option [X] immediately — takes 30 seconds
TODO: Update your profile at least once a week (edit and save any field) to stay in "active profiles" filter`,

    "profile-summary": `${base}

Current Naukri profile summary: "${userInput}"

Provide a COMPLETE rewrite — copy-paste ready:

**DIAGNOSIS**: Score the current summary on Hook (1-10) / Keyword density (1-10) / Clarity (1-10). What's failing?

**FULLY REWRITTEN SUMMARY** (200-260 words — Naukri shows first 3 lines before "Read More", make them count):
---
[Write the complete summary. Structure:
- Line 1-2: Powerful opening — NOT "I am a ${target}". Lead with your value or biggest achievement. Include the exact role title recruiters search.
- Para 1: Professional identity + ${experience} years of experience + top 3 skills. Include 4-5 keywords for ${target}.
- Para 2: Top 2-3 achievements with numbers. Formula: [Strong Verb] + [what] + [how] + [result]. Use [X%]/[X LPA]/[X people] placeholders if needed.
- Para 3: Domain expertise areas. Natural keyword injection for ${target} recruiter searches.
- Last 2 lines: Current status — "Currently open to ${target} opportunities in [cities]. Notice period: [X weeks/immediately available]."
]
---

**KEYWORD INJECTION**: List 3 additional keywords naturally woven in that will boost search rank.

TODO: Replace your summary with the rewrite above
TODO: Check Naukri profile score — summary completion adds ~15% to overall score`,

    "key-skills": `${base}

Current Naukri key skills: "${userInput}"

Provide a COMPLETE skills strategy — not just a list:

**SKILLS AUDIT**:
✓ Keep (high demand for ${target} in India): [list from their current skills]
✗ Remove (outdated/irrelevant/too generic): [list with reason]
+ Add immediately (must-have for ${target}): [list in priority order]

**TOP 20 SKILLS FOR ${target.toUpperCase()} IN INDIA 2025** (ordered by Naukri search frequency):
1. [Skill] — appears in ~X% of ${target} job postings on Naukri
2. [Skill]
... continue to 20

**NAUKRI SKILL LIMIT**: Naukri allows max 50 skills — here's your optimized 30-skill list for ${target}:
[List 30 ordered skills, most searched first]

**ENDORSEMENT PRIORITY** (top 5 to get colleagues to endorse first — shown prominently in profile):
1. [Skill] — ask [who: ex-colleagues, managers, clients]
2. [Skill]
... continue to 5

**NAUKRI TIP**: Profiles with 15+ endorsed skills get shown in 40% more recruiter searches.

TODO: Delete irrelevant skills and add the top 10 missing skills immediately
TODO: Ask 3 former colleagues to endorse your top 5 skills this week`,

    "work-experience": `${base}

Current Naukri job description: "${userInput}"

Provide a COMPLETE rewrite — copy-paste ready for Naukri experience section:

**DIAGNOSIS**: What's weak? (passive language / no numbers / missing ${target} keywords / too short?)

**FULLY REWRITTEN EXPERIENCE ENTRY**:
Company: [keep]
Designation: [keep, or suggest stronger title variant in parentheses]
---
• [Strong past-tense verb: Architected/Spearheaded/Drove/Reduced/Automated/Generated/Scaled] + [what you owned/built/led] + [method/tech/tool] + [quantified result: X%, ₹X Cr, X users, X hours saved]. Use [X] placeholders if metric unknown.
• [Bullet 2 — cross-functional impact or team/process improvement]
• [Bullet 3 — technical depth or domain expertise relevant to ${target}]
• [Bullet 4 — innovation, cost saving, or revenue impact]
• [Bullet 5 — leadership, mentoring, or scale of responsibility]
---

**KEYWORD INJECTION**: 3 keywords from ${target} job descriptions added naturally to the above bullets.

**TITLE OPTIMISATION**: If designation doesn't match recruiter search terms for ${target}, suggest an alternate title format: "Senior Developer (Full Stack | React | Node.js)".

**NAUKRI TIP**: Recruiters filter by "Current Designation" — make sure the title field exactly matches the job title they search for.

TODO: Replace experience description with the rewrite above
TODO: Verify your designation title matches what recruiters type in search (check Naukri job postings for exact wording)`,

    "it-skills": `${base}

IT skills listed: "${userInput}"

Provide a COMPLETE IT skills optimization for Naukri:

**CURRENT SKILLS ASSESSMENT** for ${target} roles in India:
✓ In-demand and keep: [list]
✗ Outdated — remove or don't highlight: [list with reason — e.g., "jQuery — superseded by React/Vue in most ${target} postings"]
+ Must add: [list with urgency level]

**TOP IN-DEMAND TECHNOLOGIES FOR ${target} IN INDIA 2025**:
Tier 1 — CRITICAL (appear in 80%+ of ${target} job posts):
[List 5-8 technologies]

Tier 2 — IMPORTANT (appear in 50-79% of posts):
[List 5-8 technologies]

Tier 3 — DIFFERENTIATORS (appear in <50% but highly valued):
[List 3-5 technologies]

**PROFICIENCY LEVELS TO CLAIM** (be honest — recruiters test these):
• Expert: [skills where they have 3+ years hands-on]
• Intermediate: [skills where they have 1-2 years]
• Beginner: [skills recently learned — still valuable to list]

**HIGH-VALUE CERTIFICATIONS FOR ${target} IN INDIA**:
1. [Certification name] — offered by [org] — ~₹[cost] or free — [how it impacts salary/rank]
2. [Certification]
... list top 5 with Indian-market impact

**NAUKRI TIP**: IT Skills section has a dedicated "Tools" and "Technologies" subsection — fill both for maximum coverage.

TODO: Update proficiency levels honestly — overstating gets caught in technical interviews
TODO: Enrol in the top certification above — add it to Naukri before you complete it (show "In Progress")`,

    projects: `${base}

Project description: "${userInput}"

Provide a COMPLETE project rewrite and strategy:

**IMPACT ASSESSMENT**: Is this project impressive for ${target} roles? What's its weak point — scope, tech stack, results, or presentation?

**FULLY REWRITTEN PROJECT DESCRIPTION** (STAR format with Naukri recruiter lens):
Project Title: [Suggest a stronger, keyword-rich title if needed]
Tech Stack: [Extracted/inferred from their description — list all relevant technologies]
Duration: [Keep as-is]

Situation: [1 sentence — business problem or gap this project solved]
Task: [1 sentence — your specific role and ownership]
Action: [2-3 sentences — what you built, technologies used, design decisions made]
Result: [1-2 sentences — quantified outcome. Use [X%], [X users], [₹X saved], [X days reduced] as placeholders]

**WHY THIS WORKS FOR ${target}**: Name 3 specific keywords or signals in the rewrite that will resonate with ${target} recruiters.

**PORTFOLIO ENHANCEMENT**: One specific thing to add to make this project more impressive (GitHub README, live demo link, architecture diagram, test coverage numbers).

**NAUKRI TIP**: Projects section adds ~10% to profile completeness score. Add at least 2-3 projects for maximum visibility.

TODO: Replace project description with the STAR rewrite above
TODO: Add a GitHub/live demo link to the project entry`,

    education: `${base}

Education details: "${userInput}"

Provide a COMPLETE education optimization for Naukri:

**ASSESSMENT**: How does this education position them for ${target} in the Indian market? Is it a strength, neutral, or a potential concern?

**HOW TO PRESENT ON NAUKRI FOR MAXIMUM IMPACT**:
• Degree title to enter: [exact format Naukri expects — e.g., "B.Tech / B.E." not "Bachelor of Engineering"]
• Course/Specialization: [what to enter — make it keyword-relevant to ${target}]
• Institution display: [keep full official name — some MNCs filter by institution tier]
• Score format: [CGPA X.X/10 or X% — both are fine; X.X/10 is preferred on Naukri]

**CERTIFICATIONS TO ADD** (ranked by ${target} recruiter impact in India):
1. [Certification] — Platform: [Coursera/Udemy/NPTEL/Google/AWS/Microsoft] — Cost: ₹[X] or Free — Timeline: [X weeks]
2. [Certification]
3. [Certification]
... list top 6

**NAUKRI EDUCATION HACK**: Add relevant online courses and certifications in the "Certifications" section — each adds to profile completeness AND shows up in skill-based recruiter searches.

**IF EDUCATION IS NOT FROM A TIER-1 INSTITUTION**: How to compensate — specific work experience signals and skills that outweigh institute prestige for ${target} roles.

TODO: Verify your degree entry matches Naukri's standardized formats (affects ATS parsing)
TODO: Add at least one certification this month — even "In Progress" status boosts profile`,

    "preferred-locations": `${base}

Preferred locations and employment preferences: "${userInput}"

Provide a COMPLETE location and preferences optimization:

**LOCATION STRATEGY FOR ${target} IN INDIA**:
Top cities by job volume for ${target} (2025 data):
1. [City] — ~X% of ${target} openings nationally — avg CTC: ₹X-Y LPA
2. [City] — ~X%
3. [City] — ~X%
4. [City]
5. [City]

**RECOMMENDATION**: Based on "${userInput}" and ${target} market demand, here's what to set:
• Primary location: [recommendation with reason]
• Secondary locations to add: [2-3 more cities they should list to increase visibility]
• Open to Relocation: [Yes/No — and why]

**SALARY RANGE GUIDANCE** for ${target} in India (2025 market rates):
• Freshers (0-2 years): ₹X-Y LPA
• Mid-level (3-6 years): ₹X-Y LPA
• Senior (7-12 years): ₹X-Y LPA
• Lead/Manager (12+ years): ₹X-Y LPA
→ Based on ${experience}, suggest current CTC and expected CTC to enter on Naukri

**NAUKRI SETTINGS TO OPTIMIZE**:
• Employment Type: [Full Time / Part Time / Both — recommendation for ${target}]
• Shift Preference: [Day / Night / Flexible — what most ${target} roles require]
• Functional Area: [exact Naukri category for ${target} — e.g., "IT Software - Application Programming, Maintenance" for software engineers]
• Industry: [exact Naukri industry filter — e.g., "IT-Software/Software Services" or "BFSI"]

TODO: Add 3 more cities to preferred locations to increase profile reach by ~40%
TODO: Update current CTC and expected CTC fields — recruiters won't call without this data`,

    "online-profiles": `${base}

Online profiles/work samples: "${userInput}"

Provide a COMPLETE online presence strategy for Naukri:

**CURRENT PRESENCE ASSESSMENT** for ${target}: What's strong, what's missing, what's hurting them?

**HOW TO ADD TO NAUKRI** (step-by-step):
Naukri → Edit Profile → "Work Samples / Portfolio / Website" section:
• LinkedIn URL: [how to format — linkedin.com/in/username — keep it clean]
• GitHub/Portfolio: [how to present — include a 1-line description of what's there]
• Certification URLs: [include direct links to Credly/Coursera certificates]

**WHAT TO ADD TO GITHUB/PORTFOLIO** to impress ${target} recruiters:
1. [Specific project type with tech stack that ${target} companies look for]
2. [Another specific project — open source contribution, tool, or demo]
3. [Third signal — README quality, test coverage, CI/CD setup]

**HIGH-VALUE CERTIFICATIONS/BADGES TO DISPLAY** for ${target} in India:
1. [Certification] — [Issuer] — [Why it impresses ${target} recruiters] — Free: [Y/N]
2. [Certification]
3. [Certification]
4. [Certification]
5. [Certification]

**NAUKRI TIP**: Profiles with Work Samples get 2.5× more recruiter messages. A GitHub link alone adds credibility — even with just 3-5 repos.

TODO: Add your GitHub/LinkedIn/portfolio links to the Naukri Work Samples section today
TODO: Pin your 3 best projects on GitHub and write a proper README for each`,
  };

  return prompts[step] || `${base}\n\nUser input: "${userInput}"\n\nProvide comprehensive Naukri profile optimization for the "${step}" section with complete rewrites, Indian market specifics, and actionable TODOs.`;
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
