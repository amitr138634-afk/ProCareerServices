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
    max_tokens: 1800,
    temperature: 0.7,
  });
  return res.choices[0]?.message?.content || "";
}

async function tryGroqDeepSeek(prompt: string): Promise<string> {
  if (!groqClient) throw new Error("GROQ_API_KEY not set");
  const res = await groqClient.chat.completions.create({
    model: GROQ_FALLBACK_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1800,
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
    max_tokens: 1800,
    temperature: 0.7,
  });
  return res.choices[0]?.message?.content || "";
}

async function tryClaude(prompt: string): Promise<string> {
  if (!anthropicClient) throw new Error("ANTHROPIC_API_KEY not set");
  const res = await anthropicClient.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1800,
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
    max_tokens: 1800,
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
        const text = await fn(prompt);
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

  const systemBase = `You are the world's best LinkedIn profile optimizer, trained on thousands of successful profiles that attracted top recruiters. You know LinkedIn's 2025 algorithm inside-out.
Target role: ${target}
Key competencies: ${competencies}

LINKEDIN ALGORITHM FACTS YOU APPLY:
• Recruiters use Boolean search: "Java AND (Spring OR Microservices) AND (Pune OR Bangalore)"
• Keyword weight: Headline (3×) > Skills section (2×) > About (1.5×) > Experience (1×)
• First 40 chars of headline show in search results on mobile — make them count
• Profiles with 500+ connections rank higher in recruiter search results
• LinkedIn SSI (Social Selling Index) above 70 gets profiles shown to 3× more recruiters
• About sections under 200 words look incomplete to LinkedIn's algorithm
• Experience bullets with numbers get 60% more profile views on average
• 5+ endorsements per skill = "proven" badge in recruiter filters
Be brutally specific — give COMPLETE rewrites they can copy-paste immediately.`;

  const prompts: Record<string, string> = {
    headline: `${systemBase}

Current LinkedIn headline: "${userInput}"

Provide a COMPLETE optimization — not just advice, but copy-paste ready output:

**DIAGNOSIS** (2 sentences max): What's hurting this headline in recruiter search? Be specific about which keywords are missing or where it fails the 40-char mobile preview test.

**THREE COMPLETE HEADLINE REWRITES:**
Option A — SEARCH-OPTIMIZED (pack exact recruiter search terms, hits all Boolean filters):
[Write the full headline — max 220 chars]

Option B — ACHIEVEMENT-LED (opens with a metric or result that hooks attention):
[Write the full headline — max 220 chars]

Option C — NICHE-AUTHORITY (positions them as the go-to expert in a specific area):
[Write the full headline — max 220 chars]

**PICK THIS ONE**: Tell them which option to use and exactly why it will rank higher for ${target} searches.

**ALGORITHM TIP**: One specific LinkedIn insight about headline optimization they probably don't know.

TODO: Replace your current headline with Option [X] within the next 10 minutes
TODO: Check recruiter search rank using LinkedIn's "Open to Work" or Sales Navigator after 48 hours`,

    achievements: `${systemBase}

Professional achievements: "${userInput}"

Transform every achievement into LinkedIn gold — complete rewrites ready to copy-paste:

**REWRITTEN ACHIEVEMENTS** (use formula: Strong Verb + What + How + Measurable Result):
For each achievement the user shared, provide:
→ Original: [their text]
→ LinkedIn Version: [rewritten with metrics. If no metric given, use realistic placeholders like [X%], [$X], [X people]]
→ Placement: [exactly where on LinkedIn: Featured / About / Experience at [Company]]

**TOP 3 PICKS** for ${target} roles and why they're the most powerful.

**ALGORITHM TIP**: LinkedIn's feed algorithm boosts posts with specific numbers — posts with "increased by 40%" get 3× more reach than vague claims.

**FEATURED SECTION BRIEF**: Write a 1-paragraph Featured section intro they can use right now.

TODO: Add the top achievement to your About section opening paragraph
TODO: Pin a post about your #1 achievement in the Featured section`,

    "spelling-grammar": `${systemBase}

Text to review:
"${userInput}"

Provide a COMPLETE edit — not just identify errors, fix them:

**ERRORS FOUND**: List every spelling, grammar, and tone issue with the exact location.

**CORRECTED VERSION**: The full text rewritten — clean, professional, and ready to paste.

**TONE UPGRADE**: Rewrite it one more time with stronger professional impact — replace weak phrases ("responsible for", "helped with", "worked on") with power language ("led", "drove", "delivered").

**KEYWORD INJECTION**: Identify 2-3 keywords relevant to ${target} that can be naturally woven in without sounding forced. Show the exact placement.

TODO: Replace current text with the Corrected Version
TODO: Consider using the Tone Upgrade version if you want to stand out more`,

    "resume-match": `${systemBase}

Job description to match against:
"${userInput}"

Perform a FULL keyword gap analysis — complete and actionable:

**TOP 15 KEYWORDS FROM THIS JD** (ranked by frequency and importance):
List each keyword with: [keyword] — appears X times — [Hard skill/Soft skill/Tool/Domain]

**KEYWORD GAP ANALYSIS** (based on competencies: ${competencies}):
✓ Already present: [keywords likely in their profile]
✗ MISSING — CRITICAL: [keywords that appear 3+ times in JD — these are dealbreakers]
✗ MISSING — IMPORTANT: [keywords that appear 1-2 times]

**WHERE TO ADD EACH MISSING KEYWORD** (specific instructions):
• [Keyword 1] → Add to: Headline + Skills section + About paragraph 2
• [Keyword 2] → Add to: Skills section + Experience at [most recent role]
(Continue for all critical missing keywords)

**PROFILE STRENGTH vs THIS JD**: Score out of 100 and explain.

TODO: Add the top 5 missing keywords to your Skills section today
TODO: Rewrite your headline to include the #1 missing keyword
TODO: Update your About section to naturally include 3 more missing keywords`,

    "about-summary": `${systemBase}

Current About section:
"${userInput}"

Provide a COMPLETE rewrite — ready to copy-paste:

**DIAGNOSIS**: What's wrong with the current version? Score it on: Hook strength / Keyword density / CTA presence (each out of 10).

**FULL REWRITE** (220-280 words — LinkedIn's algorithm treats under 200 words as incomplete):
---
[Write the complete About section. Structure:
- Line 1: Powerful hook (NOT "I am a..."). Lead with value, impact, or an intriguing statement.
- Para 1: Professional identity + core expertise. Include 3-4 keywords for ${target}.
- Para 2: Top 2-3 achievements with metrics. Use numbers.
- Para 3: What you bring to ${target} roles. Include ${competencies}.
- Last line: Clear CTA — "Open to [role] opportunities. Let's connect: [email or just 'DM me']"
]
---

**ALGORITHM NOTE**: First 300 characters show before "see more" — make them count. We've front-loaded your best hook.

TODO: Replace your About section with the rewrite above
TODO: Add 2-3 relevant hashtags at the bottom (#OpenToWork #[Industry] #[Skill])`,

    experience: `${systemBase}

Current job description:
"${userInput}"

Provide a COMPLETE rewrite of this experience entry — ready to paste into LinkedIn:

**DIAGNOSIS**: What's weak? (passive voice / no metrics / missing keywords / wrong format?)

**FULLY REWRITTEN VERSION**:
Company: [keep as-is]
Title: [keep as-is, or suggest a stronger title if warranted]
---
[Write 5 powerful bullet points using this formula for each:
• [Strong past-tense verb] + [what you owned/built/led] + [method/tool/technology] + [quantified result]
Examples: "Architected", "Drove", "Reduced", "Generated", "Automated", "Spearheaded"
Use [X%] or [X] placeholders if metrics are unknown.]
---

**KEYWORD INJECTION**: List 3 keywords from ${target} job descriptions that naturally fit this role and show exactly where to add them.

**TITLE OPTIMISATION**: If the job title doesn't match ${target} search terms, suggest an alternate title they can add in parentheses (e.g., "Senior Developer (Full-Stack | React | Node.js)").

TODO: Replace experience description with the rewritten version above
TODO: Add a "Key Achievement" highlight using LinkedIn's media attachment feature`,

    "profile-photo": `${systemBase}

Profile photo description: "${userInput}"

Give them an ACTIONABLE photo fix plan — not generic tips:

**HONEST ASSESSMENT**: What's working and what's not (be direct — vague feedback is useless).

**PHOTO REQUIREMENTS FOR ${target.toUpperCase()} ROLES**:
• Framing: Face should fill 60-70% of frame. Crop from mid-chest up.
• Background: [Specific recommendation based on ${target} industry — e.g., clean white/grey for tech, outdoor/natural for creative roles]
• Attire: [Specific clothing recommendation for ${target} — business casual / formal / smart casual]
• Expression: Confident, approachable — slight smile, direct eye contact with camera
• Lighting: Soft natural light from a window at a 45° angle is ideal. Avoid harsh shadows.

**FREE AI HEADSHOT TOOLS** (ranked best to worst):
1. Aragon.ai (~$29) — most professional results
2. HeadshotPro.com — good for corporate looks
3. ProfilePictureMaker.com — free, basic but decent

**DIY IN 10 MINUTES**: Stand near a bright window. Use portrait mode on any modern smartphone. Take 20 shots in slightly different poses. Pick the one where you look most confident.

TODO: Retake your photo using the DIY guide above this week
TODO: If budget allows, invest in Aragon.ai for an instant professional headshot`,

    banner: `${systemBase}

Current LinkedIn banner: "${userInput}"

Provide a COMPLETE Canva-ready banner brief:

**WHAT'S WRONG**: One direct sentence about why the current banner isn't working.

**YOUR NEW BANNER BRIEF** — Open Canva right now and follow this:
• Size: 1584 × 396px (LinkedIn Banner template in Canva)
• Background: [Specific color or style based on ${target} industry]
• Left side (40% of banner): Your name in large bold font + title: "${target}"
• Center: Your value statement — "[competency 1] · [competency 2] · [competency 3]" based on ${competencies}
• Right side (30%): [Industry-specific visual: code editor screenshot / data visualization / etc.]
• Color palette: [Specific hex colors based on their industry]
• Font: Bold sans-serif (Montserrat or Poppins in Canva)

**CANVA STEPS**:
1. canva.com → search "LinkedIn Banner"
2. Pick a dark/professional template
3. Replace text with above content
4. Download as PNG
5. Upload to LinkedIn → Edit profile → Background photo

TODO: Create your banner on Canva using this brief (takes 15 minutes)
TODO: Use a consistent color scheme that matches your profile photo background`,

    recommendations: `${systemBase}

Recommendation situation: "${userInput}"

Provide a COMPLETE recommendations strategy with copy-paste templates:

**ASSESSMENT**: Are they above/below threshold? (5+ recommendations = recruiter trust signal. LinkedIn shows this number prominently.)

**WHO TO ASK** (priority order for ${target} roles):
1. [Most valuable person type — e.g., direct manager, client, senior colleague]
2. [Second most valuable]
3. [Third most valuable]
Avoid: peers at same level without context, people who barely knew your work.

**COPY-PASTE REQUEST MESSAGE**:
---
Subject: Quick LinkedIn recommendation request?

Hi [Name],

Hope you're doing well! I'm currently exploring ${target} opportunities and strengthening my LinkedIn profile.

Given we worked together on [specific project/context], I was hoping you might write a brief LinkedIn recommendation highlighting my [specific skill/achievement relevant to ${target}].

I'd especially love it if you could mention: [specific thing they witnessed — e.g., "how I reduced the deployment time by X%" or "my ability to handle high-pressure client situations"].

Happy to return the favour with a recommendation for you. No pressure at all!

Thanks so much,
[Name]
---

**WHAT TO TELL THEM TO WRITE**: Give them 3 specific talking points they can pass along.

TODO: Send the above message to your top 3 priority contacts this week
TODO: Offer to write a recommendation for them in return (increases yes rate by 70%)`,

    "age-discrimination": `${systemBase}

Age/discrimination concern: "${userInput}"

Provide a COMPLETE profile modernisation plan — specific sections to edit:

**RISK ASSESSMENT**: Based on what they shared, is this a real concern? What's the estimated impact on their search ranking?

**WHAT TO REMOVE** (sections/details that reveal age):
• Graduation years before 2000? → Remove the year from Education
• Experience older than 15 years? → Either remove old roles or list them as "[Role] at [Company]" with no dates
• Outdated tech (Cobol, Visual Basic 6, IE6 testing)? → Remove or replace with modern equivalents
• Old-format photo (scanned, formal portrait from 2005)? → Retake immediately

**WHAT TO ADD** (signals you're current):
• Recent certifications: AWS, Google Cloud, Coursera, LinkedIn Learning badges
• Modern tech stack keywords relevant to ${target}
• Posts/articles published in the last 6 months
• Recent projects or side work

**HEADLINE REWRITE** (age-neutral, achievement-forward):
[Write a complete headline that removes age signals and leads with value]

**ABOUT REWRITE** (first paragraph only — sets the tone):
[Write 3 sentences that project current expertise without dates]

TODO: Remove graduation year and dates from roles older than 15 years
TODO: Add at least one recent certification badge to your profile this month`,

    skills: `${systemBase}

Current LinkedIn skills: "${userInput}"

Provide a COMPLETE skills strategy — not just a list:

**SKILLS AUDIT**:
✓ Keep (relevant to ${target}): [list from their current skills]
✗ Remove (outdated or irrelevant): [list]
+ Add immediately (must-have for ${target}): [ordered by recruiter search frequency]

**TOP 20 SKILLS FOR ${target.toUpperCase()} IN 2025** (ordered by LinkedIn search volume):
1. [Skill] — appears in X% of ${target} job postings
2. [Skill]
... continue to 20

**SKILLS TO ENDORSE FIRST** (top 5 — endorsement count visible to recruiters):
1. [Skill] — ask [type of person — e.g., "engineers you've shipped code with"]
2. [Skill] — ask [person type]
... continue to 5

**ENDORSEMENT STRATEGY**: How to get 10+ endorsements per top skill fast — give them a specific plan.

**ALGORITHM NOTE**: LinkedIn lets recruiters filter by skills with 5+ endorsements. This filter eliminates 80% of candidates — being in the top 20% here is critical.

TODO: Add the top 10 missing skills from the list above immediately
TODO: Message 5 connections asking them to endorse your top 3 skills (offer to endorse theirs)
TODO: Reorder skills — put your top 3 target-role skills first (they show in search previews)`,
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
