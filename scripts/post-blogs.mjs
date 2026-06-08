const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const HEADERS = {
  "Content-Type": "application/json",
  "x-admin-email": process.env.ADMIN_EMAIL || "",
  "x-admin-password": process.env.ADMIN_PASSWORD || "",
};

const IMG = (id) => `https://images.unsplash.com/photo-${id}?w=800&auto=format&fit=crop&q=80`;

const BLOGS = [
  // ── 1
  {
    title: "How to Write a LinkedIn Headline That Gets 3× More Profile Views",
    excerpt: "Your LinkedIn headline is the most-read text on your profile. Here's the exact formula to write one that ranks higher and attracts recruiters.",
    coverImage: IMG("1611532736597-de2d4265fba3"),
    tags: ["LinkedIn", "Career"],
    author: "ProCareerLaunchpad Team",
    content: `## Your Headline Is Your Billboard

LinkedIn shows your headline in search results, connection requests, and every comment you post. It is the first thing a recruiter reads — and in most cases, the only thing they read before deciding whether to click.

The average LinkedIn user has: **Software Engineer at XYZ Company**. That gets ignored.

The LinkedIn algorithm uses your headline as a primary keyword signal for search ranking. A headline packed with relevant keywords can put you in the top 10 results for a recruiter search — without changing anything else on your profile.

---

## The Formula That Works

**[Role] | [Specialty #1] · [Specialty #2] | [Outcome or Value]**

Examples:

- Senior Data Scientist | Python · NLP · LLMs | Building AI products that scale
- Product Manager | B2B SaaS · Growth · Agile | 3× revenue in 2 years at Series B
- Full-Stack Developer | React · Node.js · AWS | Open to Bangalore/Remote roles

### Why This Formula Works

- **Role first** — matches what recruiters type into the search bar
- **Specialties** — the skills filter loves pipe-separated keywords
- **Outcome** — makes you memorable and differentiates you from 50 similar candidates

---

## What NOT to Write

- "Seeking new opportunities" — this signals desperation, not value
- "Passionate professional" — every single person says this
- Just your job title — misses 80% of the keyword opportunity
- More than 220 characters — LinkedIn truncates it in search results

---

## The 2025 Algorithm Update: Open To Work Impact

LinkedIn's 2025 algorithm gives a **search boost to profiles with Open To Work enabled** — but only if your headline is keyword-rich. The two signals amplify each other. Enable Open To Work (visible to recruiters only, not your current employer) AND update your headline using the formula above.

---

## Three Headline Rewrites — Pick the Style That Fits You

**Option A — Search-Optimized (best for active job seekers):**
> Data Engineer | Apache Spark · Kafka · dbt · AWS | Available for Pune / Bangalore roles

**Option B — Achievement-Led (best for senior professionals):**
> Engineering Manager | Scaled teams from 3 to 40 | Ex-Swiggy · Ex-Razorpay | Hiring top engineers

**Option C — Niche Authority (best for consultants and freelancers):**
> LinkedIn Growth Consultant | Helped 200+ professionals get 10× profile views in 30 days

---

## Action Steps

- Rewrite your headline using the formula above right now — it takes 5 minutes
- Use the exact job titles recruiters search for, not internal titles your company uses
- Check LinkedIn Search and type your target role — see what top profiles look like
- Update your headline every time you add a new major skill or change your target role

> **ProTip:** Use our free LinkedIn Optimizer to get three personalized headline rewrites based on your actual profile and target role.`,
  },

  // ── 2
  {
    title: "LinkedIn Algorithm 2025: What Actually Gets You Noticed by Recruiters",
    excerpt: "The LinkedIn algorithm changed significantly in 2025. Here's what it now rewards — and the outdated tactics you should stop immediately.",
    coverImage: IMG("1560250097-0b93528c311a"),
    tags: ["LinkedIn", "Career"],
    author: "ProCareerLaunchpad Team",
    content: `## How LinkedIn Decides Who Recruiters See

LinkedIn's recruiter search algorithm is not a simple keyword match. It uses a combination of profile completeness, activity signals, connection proximity, and keyword density to rank profiles. Understanding this ranking logic is the difference between appearing on page 1 and being invisible.

---

## The Six Ranking Factors in 2025

### 1. Profile Completeness Score
LinkedIn assigns a score from Beginner to All-Star based on how many sections you have filled out. Only **All-Star profiles** appear in the top results for recruiter searches. The sections that matter most:
- Profile photo
- Headline (with keywords)
- About/Summary (at least 40 words)
- Current position with description
- At least two past positions
- Education
- Minimum five skills with endorsements

### 2. Keyword Match
Recruiters filter by job title, location, skills, and years of experience. LinkedIn matches these filters against your headline, current job title, skills section, and about section — **in that order of priority**.

### 3. Connection Proximity
A 2nd-degree connection ranks higher than a 3rd-degree connection for the same recruiter. This means your network directly affects your search rank — even if you're more qualified than a 2nd-degree candidate.

### 4. Activity Recency
Profiles that have been **updated in the last 30 days** get an activity boost in search results. You do not need to post content — even updating your skills or adding a certification counts as recent activity.

### 5. Skills Endorsements
Skills with 10+ endorsements carry more weight than skills with zero. LinkedIn's 2025 algorithm now explicitly factors endorsement count into skill-match scoring for recruiter searches.

### 6. Open To Work Signal
Enabling Open To Work (recruiter-only visibility) sends a direct signal to LinkedIn's recruiter search system to surface your profile more prominently. This is confirmed by LinkedIn's official documentation.

---

## What No Longer Works

- **Keyword stuffing** in the About section — LinkedIn's spam filter now penalises profiles with unnaturally dense keyword repetition
- **Posting daily generic content** to game the feed algorithm — only relevant content with genuine engagement helps
- **Connection farming** — adding thousands of random connections — LinkedIn's 2025 update actively demotes profiles with very low engagement ratios relative to connection count

---

## The 30-Minute Profile Audit That Moves You Up in Search

1. Check your All-Star score — go to Edit Profile and look for the completeness indicator
2. Count your skills — aim for 25–50, with the top 3 pinned being role-critical keywords
3. Update at least one section (this triggers the "recently active" signal)
4. Enable Open To Work for recruiters only
5. Ask five recent colleagues for skill endorsements — it takes 30 seconds and has measurable impact

---

## Real Numbers from Our Clients

Profiles we optimized using these exact signals saw on average:

- **3.8× increase** in profile views within 2 weeks
- **62% more** recruiter InMail messages in 30 days
- **Moved from page 3 to page 1** in recruiter search results for target role keywords

> Use our AI LinkedIn Optimizer to get a personalized audit of your profile's algorithm score and exact steps to rank higher.`,
  },

  // ── 3
  {
    title: "The Perfect LinkedIn About Section: A Complete Rewrite Guide",
    excerpt: "Most LinkedIn About sections are either empty or a copy of the resume. Here's how to write one that hooks recruiters and converts views into conversations.",
    coverImage: IMG("1499750310107-5fef28a66643"),
    tags: ["LinkedIn", "Career"],
    author: "ProCareerLaunchpad Team",
    content: `## Why Your About Section Is a Missed Opportunity

The LinkedIn About section gives you **2,600 characters** to make a compelling case for why someone should hire you, work with you, or connect with you. Most people either leave it blank or paste their resume's objective statement — both are wasted opportunities.

A well-written About section does four things:
- Hooks the recruiter in the first two lines (before the "See more" cutoff)
- Tells a story that connects your past to your target role
- Drops the keywords recruiters search for
- Ends with a clear call to action

---

## The Structure That Works

### Line 1–2: The Hook (show before "see more")
Write one powerful sentence about who you are and what you do. Make it specific, not generic.

**Bad:** "Experienced software professional with a passion for technology."
**Good:** "I build ML systems that help fintech companies cut fraud by 40–60%. Currently at Razorpay, previously at CRED."

### Paragraph 2: Your Story
Connect your background to where you are now. This is not a timeline — it is a narrative. Why did you move into this field? What problem are you solving?

### Paragraph 3: What You're Good At
List 4–6 concrete strengths using the exact keywords your target role requires. Write in plain sentences, not a bullet dump.

### Final Line: Call to Action
Tell people what you want them to do. "Open to senior PM roles in Bangalore — feel free to message me." or "If you're hiring for data science leadership, let's talk."

---

## The Keyword Rule

Identify the top 5–8 keywords from job descriptions for your target role. These must appear naturally in your About section. For example, if every Data Scientist JD mentions "Python, machine learning, A/B testing, and stakeholder communication" — those four phrases should appear in your About.

---

## What to Avoid

- Writing in third person ("John is a passionate engineer who...") — sounds robotic
- Listing every technology you have ever touched — stick to what's relevant now
- No line breaks — walls of text get skipped; use short paragraphs
- Generic phrases: "results-driven," "team player," "passionate," "detail-oriented"

---

## A Before and After

**Before:**
"Experienced software developer with 7 years in the industry. I have worked on various projects and have skills in Java, Python, and SQL. Looking for new opportunities."

**After:**
"I design backend systems that handle 10M+ transactions a day. Seven years of backend engineering across fintech and e-commerce — currently leading a team of 6 at Juspay, previously at PhonePe.

My core strengths: distributed systems, Java + Spring Boot, PostgreSQL at scale, and translating product requirements into robust architecture.

Exploring Staff/Principal Engineer roles in Bangalore or remote. Building something interesting? Let's connect."

---

The difference is night and day. The first could be anyone. The second is a person a recruiter remembers.

> Our LinkedIn Optimizer rewrites your About section with AI — tailored to your exact target role, experience level, and the keywords recruiters are searching for.`,
  },

  // ── 4
  {
    title: "LinkedIn Skills Section: How to Rank Higher in Recruiter Searches",
    excerpt: "The skills section is LinkedIn's most under-used ranking lever. Here's exactly which skills to add, which to remove, and how to get endorsements that matter.",
    coverImage: IMG("1504384764579-621942f6da0a"),
    tags: ["LinkedIn", "Career"],
    author: "ProCareerLaunchpad Team",
    content: `## Skills Are LinkedIn's Search Filter — Treat Them That Way

When a recruiter searches on LinkedIn, they filter by skills. If a skill is not in your Skills section, you will not appear in that filtered search — even if you mention that skill in every other section of your profile.

This is the single most overlooked optimization on LinkedIn. Most professionals have 5–10 skills. The algorithm rewards profiles with **25–50 relevant skills** where the top 3 are pinned as your primary expertise.

---

## The Three-Layer Skills Strategy

### Layer 1: Core Technical Skills (top 3 pinned)
These should be your most in-demand, role-specific skills — the ones that appear in 80%+ of job descriptions for your target role.

Examples for a Data Scientist:
- Machine Learning
- Python (Programming Language)
- SQL

Pin these three to the top. They appear prominently on your profile and carry extra weight in search.

### Layer 2: Supporting Technical Skills (10–20 skills)
Add all adjacent skills that are relevant but not your primary expertise. Be honest — only add skills you could speak about in an interview.

Examples: TensorFlow, Apache Spark, Data Visualization, A/B Testing, Statistical Analysis

### Layer 3: Soft and Cross-Functional Skills (5–10 skills)
These help you appear in filtered searches that combine technical + behavioural criteria.

Examples: Cross-functional Collaboration, Stakeholder Management, Agile Methodologies, Product Thinking

---

## The Endorsement Multiplier

LinkedIn's 2025 algorithm weights endorsed skills more heavily than unendorsed ones. A skill with 10+ endorsements signals legitimacy. Here's how to get them without awkward cold requests:

1. **Endorse your connections first** — most people reciprocate within a week
2. **Message 5 specific people** who directly witnessed the skill in action — "Hey, would you mind endorsing my Python skill? You saw me use it on the fraud model project." Specific requests get specific responses.
3. **Update your skills list** — LinkedIn sometimes sends a notification to your connections when you add a new skill, naturally prompting endorsements

---

## Skills to Remove

- Skills from 10+ years ago that are no longer relevant to your target role
- Overly broad terms like "Microsoft Office" or "Internet" — they dilute your profile
- Skills you added to look well-rounded but would struggle to discuss in depth

---

## The 50 Skills Cap

LinkedIn allows a maximum of 50 skills. If you are not near that limit, you are leaving search real estate unused. Go to Edit Skills right now and add every relevant skill you have — tools, frameworks, methodologies, and domain expertise.

---

## Quick-Win Action Plan

- Open your target job description and highlight every skill mentioned
- Cross-reference against your LinkedIn skills — add every gap that you actually have
- Pin your three most important skills to the top
- Message five colleagues this week to exchange endorsements

> Our LinkedIn Optimizer analyses your skills section against real job descriptions and tells you exactly which skills to add to appear in more recruiter searches.`,
  },

  // ── 5
  {
    title: "How to Get LinkedIn Recommendations That Actually Convert",
    excerpt: "Recommendations are social proof that no other section can replicate. Here's how to request, write, and position recommendations to dramatically boost your credibility.",
    coverImage: IMG("1521791136064-7986c2920216"),
    tags: ["LinkedIn", "Career"],
    author: "ProCareerLaunchpad Team",
    content: `## Why Recommendations Are Your Most Powerful Trust Signal

Anyone can claim they increased revenue by 40%. But when a Director of Engineering writes that you "independently architected a system that handled our 10× Black Friday spike without a single incident" — that is a different level of credibility entirely.

LinkedIn profiles with **5+ recommendations** receive on average 4× more recruiter messages than profiles with zero. Yet less than 20% of LinkedIn users have more than 2 recommendations.

This is your competitive advantage.

---

## Who to Ask (in order of priority)

1. **Direct managers** from your last 2–3 roles — highest credibility, most impact
2. **Senior stakeholders** who saw your work across functions — cross-functional visibility
3. **Clients or external partners** — especially powerful for consultant and sales roles
4. **Direct reports** — demonstrates leadership capability
5. **Peers on high-visibility projects** — specific project evidence

---

## The Request Template That Gets a Yes

Most recommendation requests fail because they are vague. Here is a template that works:

---

*Hi [Name],*

*I'm updating my LinkedIn profile as I'm exploring [Senior Product Manager] roles. Your perspective on our work on [the checkout redesign project] would carry a lot of weight — you saw firsthand how we navigated the stakeholder challenges and the final impact on conversion.*

*If you're open to it, I'd be happy to draft something for you to edit and approve — it would take you less than 5 minutes. Completely understand if you're too busy.*

*Thanks either way!*

---

Three things this template does right:
- **Specific project** — makes it easy for them to write something concrete
- **Draft offer** — reduces their effort to near zero (most say yes when you offer this)
- **Low pressure exit** — makes them comfortable saying yes

---

## How to Write the Draft for Them

When you offer to write the draft, structure it as:

1. **Context** — how you worked together and for how long
2. **Specific achievement** — one concrete project or outcome with a number
3. **What made you stand out** — the skill or quality that separated you
4. **Forward-looking** — why they would recommend you for future roles

Keep it to 3–5 sentences. Your contact will almost always accept it with minor edits.

---

## Positioning Recommendations Strategically

- **Place the most impressive recommendation at the top** — LinkedIn shows only the first 2–3 unless someone clicks "show all"
- **Ensure your top recommendation speaks to your target role** — if you are moving into product management, lead with a recommendation that mentions PM skills
- **Mix seniority levels** — a recommendation from a VP plus one from a peer gives depth

---

## The Reciprocity Approach

Write unsolicited recommendations for 5 people you have genuinely worked with. Around 60% will write one back without being asked. This is the highest-conversion approach to building your recommendation count — and it builds goodwill in your network.

> Our LinkedIn Optimizer gives you personalised recommendations on who to ask, how to frame the request, and what your recommendation section should look like at your seniority level.`,
  },

  // ── 6
  {
    title: "Why Your Naukri Profile Isn't Getting Calls — And How to Fix It in 48 Hours",
    excerpt: "If your Naukri profile has been live for weeks with zero recruiter calls, something is wrong. Here are the seven most common reasons — and the exact fixes.",
    coverImage: IMG("1460925895917-afdab827c52f"),
    tags: ["Naukri", "Career", "India"],
    author: "ProCareerLaunchpad Team",
    content: `## The Painful Reality of Naukri Silence

You uploaded your resume, filled out your profile, and waited. Nothing. No calls, no InMails, barely any profile views. This is more common than you think — and almost always fixable.

Naukri's search algorithm works very differently from LinkedIn. Understanding how it ranks profiles is the fastest path from silence to a flood of recruiter calls.

---

## The Seven Reasons Recruiters Are Not Finding You

### 1. Your Resume Headline Has No Keywords
The resume headline on Naukri is one of the **top-three ranking factors** in recruiter search results. If your headline says "Experienced Professional Looking for Growth," you are invisible.

**Fix:** Rewrite it as a keyword-rich statement. Example:
> Java Developer | Spring Boot · Microservices · AWS | 5 Years | Open to Bangalore / Pune

### 2. Your Profile Is Not "Active"
Naukri's "Active" filter is used by almost every recruiter. Profiles that have not been modified in 30+ days get filtered out. Naukri does not tell you this.

**Fix:** Log in to Naukri at least once a week and update something — even changing a period to a comma counts as an update and resets your "last active" timestamp.

### 3. Your Key Skills Section Is Missing or Wrong
Naukri uses the Key Skills section as a primary keyword match for recruiter searches. If you have left it at 5 skills, you are losing to candidates with 15–20 relevant skills.

**Fix:** Add 15–20 skills. For each role, look at 10 job descriptions and extract every skill mentioned in more than half of them.

### 4. Your CTC Is Outside the Recruiter's Filter
Recruiters filter by expected CTC. If your expected CTC is set too high or too low relative to the role, you get filtered out before a human ever sees your profile.

**Fix:** Research current market rates for your role, experience, and city. Set your expected CTC to 25–35% above your current CTC for a job switch.

### 5. Your Notice Period Is Set to 60+ Days
Most recruiters add a notice period filter of ≤30 days. If you set your notice period to 3 months with no mention of buyout possibility, you lose a significant portion of search visibility.

**Fix:** If buyout is possible, set your notice period to the actual buyout number (often 15–30 days) and mention "negotiable / buyout possible" in your profile summary.

### 6. Your Profile Completeness Is Below 80%
Naukri's algorithm explicitly ranks complete profiles higher. A profile below 80% completeness is penalised in search ranking.

**Fix:** Go to your Naukri dashboard and find the completeness percentage. Fill every section — projects, certifications, online profiles, preferred locations — until you hit 90%+.

### 7. Your IT Skills Section Is Empty
For technical roles, Naukri has a separate "IT Skills" section that carries its own search weight. Many candidates skip this, thinking Key Skills is enough. It is not.

**Fix:** Add your tools, IDEs, databases, frameworks, and platforms to the IT Skills section with proficiency level and years of experience.

---

## The 48-Hour Fix Plan

**Day 1 (2 hours):**
- Rewrite your resume headline with keywords
- Add 15+ skills to Key Skills
- Fill IT Skills section completely
- Update your CTC and notice period

**Day 2 (1 hour):**
- Write a keyword-rich profile summary (150–200 words)
- Add any missing sections (projects, certifications, preferred locations)
- Refresh your profile by logging in and making one edit

Most of our clients see recruiter call volume increase within 72 hours of making these changes.

> Our AI Naukri Optimizer walks you through every section with personalized rewrites — tailored to your role, experience, and city.`,
  },

  // ── 7
  {
    title: "Naukri Profile Score: How to Hit 90%+ and Dominate Recruiter Searches",
    excerpt: "Naukri's profile completeness score directly affects how often you appear in recruiter searches. Here's the exact checklist to hit 90% and what it unlocks.",
    coverImage: IMG("1551288049-bebda4e38f71"),
    tags: ["Naukri", "Career", "India"],
    author: "ProCareerLaunchpad Team",
    content: `## What the Profile Score Actually Controls

Naukri's internal documentation confirms that profiles with higher completeness scores appear higher in recruiter search results for the same keywords. This is not just a cosmetic indicator — it is a ranking signal.

A profile at 60% completeness is actively being demoted in search results compared to an identical profile at 90%.

---

## The Completeness Breakdown

Naukri weighs these sections for the profile score:

| Section | Weight |
|---|---|
| Basic Details (name, headline, location) | High |
| Resume Upload | High |
| Work Experience (with descriptions) | High |
| Education | High |
| Key Skills (10+) | High |
| IT Skills | Medium |
| Projects | Medium |
| Certifications | Medium |
| Online Profiles (LinkedIn, GitHub) | Low |
| Preferred Locations | Low |
| Languages | Low |

---

## Section-by-Section Completion Guide

### Work Experience
Each position must have:
- Job title (use industry-standard titles, not internal ones)
- Company name and industry
- Employment dates (month and year)
- A description of at least 3 bullet points with **keywords and one number each**

Most people skip the description. This is the highest-impact field to fill.

### Education
Add your full education history including:
- Degree and specialisation
- Institution name
- Year of passing
- Percentage or CGPA (if above 6.5/60% — otherwise leave blank)
- For recent graduates: relevant coursework, projects, or thesis topic

### Certifications
Even free certifications from Coursera, Google, or LinkedIn Learning count. Add every relevant certification with the issuing body and date. This boosts completeness AND adds keywords.

### Projects
Add 2–3 significant projects with:
- Project name
- Your role
- Tools/technologies used
- The outcome or impact

This section is especially important for candidates with less than 5 years of experience.

### Online Profiles
Add your LinkedIn URL and GitHub/portfolio link. Naukri gives completeness credit for these — and recruiters click on them for technical roles.

---

## The "Always Active" Trick

Naukri's Active filter is used by 80% of recruiters. Here's the thing: you can stay "active" without applying to jobs every day.

**Weekly 60-second habit:** Log into Naukri, go to My Naukri → Edit Profile, change one word in any section (add a period, fix a typo, update a skill proficiency), and click save. This resets your "last active" timestamp.

Set a calendar reminder for every Monday morning. Do this consistently for 30 days and watch your call volume change.

---

## What Happens at 90%+

Our data from 300+ client profiles shows:
- Profile views increase by **2.3× on average** within one week of hitting 90%+
- Recruiter call volume increases by **1.8× in the first two weeks**
- Appearance in search results (as measured by view source) increases significantly for target role keywords

The investment is 2–3 hours. The return is months of better visibility.

> Our Naukri Optimizer uses AI to tell you exactly what to write in each section to maximize your score — no generic advice, just personalized content for your role and experience.`,
  },

  // ── 8
  {
    title: "What Is ATS and Why 75% of Resumes Never Reach a Human Recruiter",
    excerpt: "Most job applications are rejected before a human reads them. Here's how Applicant Tracking Systems work — and the exact resume format that gets through.",
    coverImage: IMG("1434030216411-0b793f4b4173"),
    tags: ["ATS", "Resume"],
    author: "ProCareerLaunchpad Team",
    content: `## The Invisible Gatekeeper Between You and Your Dream Job

You spent three hours polishing your resume. You applied to 40 jobs this month. You heard back from two.

The reason is almost certainly not your qualifications. It is your resume format.

**Applicant Tracking Systems (ATS)** are software tools used by 98% of Fortune 500 companies and by most Indian IT companies, MNCs, and startups with structured hiring processes. These systems automatically parse, score, and filter resumes before a single human recruiter looks at a single application.

If your resume does not pass the ATS filter, it goes into a digital trash folder — no matter how strong your experience is.

---

## How ATS Parsing Actually Works

When you submit your resume, the ATS does the following in order:

1. **Extracts text** from your PDF or DOCX file
2. **Identifies sections** — Contact, Summary, Experience, Education, Skills
3. **Matches keywords** from your resume against the job description
4. **Scores** your resume on keyword density, section completeness, and formatting compliance
5. **Ranks** your application against all other candidates
6. **Shows** only the top-ranked applications to the human recruiter

If the ATS cannot parse your resume correctly (due to formatting issues), your score is artificially low — and a more junior candidate with a cleanly formatted resume ranks above you.

---

## The Formatting Mistakes That Kill ATS Scores

### Tables and Columns
ATS parsers read text left to right, top to bottom. A two-column resume layout causes the parser to mix up your experience and education fields. Use a single-column layout.

### Headers and Footers
Contact information placed in the document header is often invisible to ATS parsers — which means your name and email may never be extracted. Put all contact info in the body of the document.

### Graphics and Icons
Profile photos, skill bars (those horizontal percentage meters), logos of past companies, and decorative icons cannot be read by ATS. They reduce parseable content and waste space.

### Non-Standard Section Headings
If you call your experience section "Professional Journey" or "Where I've Been," many ATS tools will fail to identify it as the experience section. Use standard headings: Work Experience, Education, Skills, Certifications.

### PDFs From Design Tools
Resumes created in Canva, Adobe Illustrator, or Figma often produce image-based PDFs where the text is not selectable. ATS cannot read these at all. Use Microsoft Word or Google Docs and export as a text-based PDF.

---

## What ATS Actually Scores

The scoring model varies by system, but broadly covers:

- **Keyword match (30%)** — how many job description keywords appear in your resume
- **Section structure (20%)** — do you have all the expected sections?
- **Formatting compliance (20%)** — single column, standard fonts, readable file format
- **Achievement quality (15%)** — bullet points with numbers, action verbs, measurable results
- **Readability (15%)** — appropriate length, font size, white space

---

## The ATS-Safe Resume Checklist

- Single-column layout only
- Standard section headings
- Contact info in the document body (not header/footer)
- Saved as a text-readable PDF or DOCX
- No tables, graphics, or images
- Keywords from the job description used naturally in your experience bullets
- Bullet points starting with strong action verbs (Built, Led, Increased, Reduced, Designed)

> Use our free ATS Resume Scanner to get your resume's ATS score in 60 seconds — with specific keyword gaps, section analysis, and formatting flags that explain exactly why you're being filtered out.`,
  },

  // ── 9
  {
    title: "ATS Resume Formatting: The Rules You Absolutely Cannot Break",
    excerpt: "Even strong resumes fail ATS filters due to formatting mistakes. Here are the non-negotiable formatting rules that determine whether a human ever sees your application.",
    coverImage: IMG("1586281380349-632531db7ed4"),
    tags: ["ATS", "Resume"],
    author: "ProCareerLaunchpad Team",
    content: `## Format Is as Important as Content

You can have the most impressive experience in the applicant pool. If your resume is formatted in a way that confuses the ATS parser, a less-qualified candidate with a cleaner format will rank above you — and get the recruiter's call.

These are the formatting rules that are non-negotiable for any role that uses an ATS — which is most corporate roles in India today.

---

## Rule 1: One Column, Always

Two-column resumes are a popular design trend. They look clean and professional to a human eye. ATS parsers hate them.

Most ATS tools read resumes as a single stream of text from top to bottom. In a two-column layout, the left and right columns get merged into a single garbled stream. Your contact information ends up mixed with your job titles, and your skills section lands in the middle of your work experience.

**The rule:** Use a single-column layout for any resume you are submitting online. You can keep a two-column version for in-person networking.

---

## Rule 2: Standard Fonts Only

Stick to these fonts: Calibri, Arial, Georgia, Garamond, Times New Roman, or Helvetica. Font size should be 10–12pt for body text and 14–16pt for your name.

Decorative or custom fonts sometimes get substituted by the ATS with a default font — which can collapse your carefully formatted spacing and make the whole document unreadable.

---

## Rule 3: No Headers, Footers, or Text Boxes

Contact information (name, phone, email, LinkedIn) must be in the main body of the document — **not in the header or footer** and not inside a text box.

Many ATS parsers skip header and footer content entirely, which means your contact information is never extracted. The recruiter cannot call you because the ATS does not know your phone number.

---

## Rule 4: Section Headings Must Be Standard

Use these exact headings (or close equivalents):
- Work Experience / Professional Experience
- Education
- Skills / Technical Skills
- Certifications
- Projects / Key Projects

Do not use creative alternatives like "My Journey," "Skills Toolkit," or "Academic Background." The ATS pattern-matches against a list of known heading formats — non-standard headings get misclassified.

---

## Rule 5: No Graphics, Icons, or Tables

Skill bars (horizontal progress bars showing "Python: 80%") cannot be read by ATS. They convey no information to the parser and waste valuable parseable space.

Company logos, profile photos, social media icons, and decorative separators are similarly invisible. Use text only.

Tables in MS Word are problematic because ATS parsers often fail to read table cell content correctly. Use tabs and spacing instead of tables for any alignment needs.

---

## Rule 6: File Format Matters

**DOCX is universally safe.** Almost every ATS system handles DOCX correctly.

**PDF is usually safe** — but only if it is a text-based PDF (you can select and copy text from it). Image-based PDFs (from scanned documents, Canva exports, or poorly exported design files) cannot be parsed at all.

**Never submit** a JPG, PNG, or image-only PDF of your resume.

---

## Rule 7: Appropriate Length

- 0–5 years experience: 1 page maximum
- 5–15 years experience: 1.5–2 pages maximum
- 15+ years: 2 pages maximum (3 only for C-suite or academic CVs)

ATS systems do not penalise length directly, but human recruiters who receive ATS-filtered applications spend an average of 6 seconds on the first pass. Long resumes increase the chance of your most important achievements being buried.

---

## The Safe Resume Template Structure

> NAME
> Phone | Email | LinkedIn | City
>
> PROFESSIONAL SUMMARY
> (3–4 sentences, keyword-rich)
>
> WORK EXPERIENCE
> Company Name | Job Title | Month Year – Month Year
> - Achievement bullet with number
> - Achievement bullet with number
>
> EDUCATION
> Degree | Institution | Year | CGPA/Percentage
>
> SKILLS
> Skill 1, Skill 2, Skill 3...
>
> CERTIFICATIONS
> Certification Name | Issuing Body | Year

This structure passes every major ATS system used by Indian companies.

> Use our ATS Scanner to test your actual resume against any job description — and get a score, formatting flags, and missing keywords in 60 seconds.`,
  },

  // ── 10
  {
    title: "How to Keyword-Optimize Your Resume for Any Job Description",
    excerpt: "Keyword optimization is the single highest-ROI resume activity. Here's a step-by-step system to extract the right keywords and weave them into your resume naturally.",
    coverImage: IMG("1455390582262-044cdead277a"),
    tags: ["ATS", "Resume"],
    author: "ProCareerLaunchpad Team",
    content: `## Why Keywords Are the Whole Game

ATS systems are fundamentally keyword-matching engines. The algorithm compares your resume text against the job description text and scores the overlap. The more relevant matches, the higher you rank.

This is not about stuffing random keywords — it is about strategically identifying the exact language the job description uses and reflecting it back in your resume naturally.

---

## Step 1: Extract the Right Keywords

Read the job description and highlight:

**Hard skills:** Technologies, tools, frameworks, methodologies, certifications
**Soft skills:** Stakeholder management, cross-functional collaboration, team leadership
**Role-specific terms:** The exact job titles, industry terms, and domain vocabulary used
**Outcome language:** The specific results the company wants (reduce costs, scale systems, improve retention)

Make a list of every highlighted term. This is your keyword universe.

---

## Step 2: Identify Must-Haves vs Nice-to-Haves

Not all keywords carry equal weight. Terms that appear:
- In the job title
- Multiple times in the JD
- In the "Required" or "Must Have" section

...are the highest-priority keywords. Terms that appear once in a list of "preferred" qualifications are lower priority.

Rank your extracted keywords into two groups: Core (appear in 60%+ of similar JDs) and Supporting (role-specific additions for this particular job).

---

## Step 3: Map Keywords to Your Experience

For each Core keyword, identify where in your experience it appears or could appear. You need to use each keyword in context — not just list it, but demonstrate it through your work.

**Weak (keyword listed only):** "Skills: Python, Machine Learning, AWS"

**Strong (keyword demonstrated in context):** "Built a Python-based ML model deployed on AWS that reduced fraud detection time from 4 hours to 8 minutes"

The second version matches the keyword AND tells a compelling achievement story. It satisfies both the ATS parser and the human recruiter.

---

## Step 4: The Mirror Language Technique

Use the exact phrasing from the job description, not your own equivalent.

If the JD says "cross-functional stakeholder management" — use that phrase, not "working across teams."

If the JD says "Agile/Scrum methodologies" — use that exact phrase, not just "Agile."

ATS systems often do exact or near-exact phrase matching. Synonyms do not always score.

---

## Step 5: Place Keywords Strategically

The ATS parser weights different sections differently. In order of importance:

1. **Professional Summary / Headline** — highest weight, first section parsed
2. **Work Experience bullet points** — highest volume of keyword opportunities
3. **Skills section** — dedicated keyword section, parsed separately
4. **Education and Certifications** — lower weight but still counted

Ensure your top 5 Core keywords appear in at least two of these sections.

---

## Step 6: The Gap Analysis

After placing keywords, do a final check: which Core keywords from the JD are still missing from your resume?

For each missing keyword:
- If you genuinely have this skill, add it to your Skills section and weave it into a relevant bullet
- If you have adjacent experience, reframe an existing bullet to reflect it
- If you truly do not have this skill, note it — these are the skills to acquire for your next career move

---

## Common Keyword Mistakes to Avoid

- Using acronyms without spelling them out (write "Natural Language Processing (NLP)" not just "NLP")
- Only listing skills once in the Skills section — use them in context in your bullets too
- Copying the JD verbatim into your resume — ATS systems now flag this as keyword stuffing
- Ignoring soft skill keywords — leadership, communication, and collaboration terms are now explicitly scored

> Upload your resume to our ATS Scanner and paste any job description — we'll show you exactly which keywords are present, which are missing, and what impact each gap has on your score.`,
  },

  // ── 11
  {
    title: "Resume Achievement Bullets: How to Quantify Your Impact Like a Pro",
    excerpt: "Generic resume bullets get ignored. Quantified achievement bullets get interviews. Here's the exact framework to rewrite your resume bullets with numbers and impact.",
    coverImage: IMG("1434626881859-194d67b2b86f"),
    tags: ["Resume", "Career"],
    author: "ProCareerLaunchpad Team",
    content: `## The Difference Between a Duty and an Achievement

Most resume bullets describe duties — what your job description said you were supposed to do. Recruiters know what a Product Manager does. They want to know what *you* did, and how well you did it.

**Duty:** Managed the product roadmap and worked with engineering teams.
**Achievement:** Reduced time-to-ship by 35% by introducing a two-week sprint cadence and cutting scope creep with a formal RFC process — shipped 12 features in Q3 vs 7 in Q2.

The second bullet tells a hiring manager three things in one sentence: you can execute, you know how to measure impact, and you made things meaningfully better.

---

## The CAR Framework

Every strong achievement bullet follows the **CAR** structure:

**C — Context:** The situation or challenge you faced
**A — Action:** What you specifically did (not your team — you)
**R — Result:** The measurable outcome

You do not always need to state the Context explicitly — often the Action + Result is enough:

> "Redesigned the checkout flow (A) → reduced cart abandonment from 68% to 41% (R), recovering ₹1.2 Cr in monthly lost revenue (R amplified)."

---

## The Quantification Question Set

For every bullet you are writing, ask these questions until you find a number:

- **How much / how many?** (volume, count, scale)
- **How fast?** (time saved, time to ship, turnaround improvement)
- **How often?** (frequency, reliability, uptime)
- **What percentage?** (improvement, reduction, growth)
- **Compared to what?** (before vs after, vs industry benchmark, vs previous quarter)
- **How big was the scope?** (team size, budget managed, users served)

One of these questions almost always produces a number. If you genuinely cannot find one, use a relative comparison: "reduced significantly" is weak; "reduced by more than half" is better; "reduced by 58%" is best.

---

## When You Don't Have Numbers

For roles where tracking metrics was not part of the culture, you can still quantify:

- **Team size:** "Led a team of 8 developers across 3 product squads"
- **Timeline:** "Delivered the migration 3 weeks ahead of the 6-month deadline"
- **Scale:** "System processes 2M API requests per day with 99.97% uptime"
- **Scope:** "Managed ₹40L quarterly marketing budget across 4 channels"

Estimates are acceptable if you flag them: "approximately," "over," "more than." Recruiters appreciate honest estimation over vague language.

---

## Strong Action Verbs by Function

**Engineering:** Built, Architected, Optimized, Migrated, Deployed, Reduced, Automated
**Product:** Launched, Shipped, Prioritized, Increased, Defined, Drove, Reduced
**Data/Analytics:** Modeled, Predicted, Analyzed, Identified, Quantified, Reduced, Built
**Sales/Business:** Grew, Closed, Expanded, Increased, Exceeded, Acquired, Retained
**Operations:** Streamlined, Reduced, Improved, Implemented, Cut, Scaled, Standardized

Start every bullet with one of these — never start with "Responsible for" or "Helped with."

---

## Before and After: Five Real Rewrites

| Before | After |
|---|---|
| Worked on improving app performance | Reduced app load time from 4.2s to 1.1s, improving Day-7 retention by 18% |
| Managed social media accounts | Grew LinkedIn following from 800 to 14,000 in 6 months through daily content — 3 posts received 50K+ impressions |
| Helped with onboarding new hires | Built an 8-session onboarding programme that reduced new-hire time-to-productivity from 12 weeks to 7 |
| Was part of cost reduction initiatives | Identified ₹28L in annual AWS spend savings through reserved instance optimization |
| Handled customer escalations | Resolved 95%+ of Tier-2 escalations within SLA, reducing churn from 8% to 4.5% over two quarters |

---

Every bullet on your resume should pass this test: if a recruiter read only this bullet, would they know the scale of your impact? If not, add a number.

> Our ATS Scanner measures your "achievement bullet strength" — the percentage of your bullets that have quantified impact — and gives you specific suggestions to improve.`,
  },

  // ── 12
  {
    title: "How We Helped Priya Land a ₹28 LPA Offer After 3 Months of Rejection",
    excerpt: "Priya had 7 years of product experience and was getting rejected at the resume screening stage. Here's exactly what we changed — and how the offer came 3 weeks later.",
    coverImage: IMG("1519389950473-47ba0277781c"),
    tags: ["Career", "LinkedIn"],
    author: "ProCareerLaunchpad Team",
    content: `## The Client

Priya is a Product Manager with 7 years of experience across fintech and e-commerce. She had worked at two well-known Indian startups, had led a team of 5, and had shipped products that genuinely moved business metrics.

She had been applying for Senior PM roles for 3 months. She had submitted over 60 applications. She had received 4 callbacks.

When she came to us, she was starting to doubt whether her experience was strong enough. It absolutely was. The problem was her resume and LinkedIn profile were failing to communicate it.

---

## What We Found

### The Resume

Priya's resume was a two-column PDF designed in Canva. It looked polished to the human eye. To an ATS, it was a parsing nightmare.

Our ATS scan gave it a score of **38/100**.

Key issues:
- Two-column layout causing section misidentification
- No quantified achievement bullets — every bullet described a duty, not an outcome
- Missing keywords: the top 5 keywords from Senior PM job descriptions (OKRs, go-to-market, stakeholder alignment, product-led growth, A/B testing) appeared zero times
- Skills section had 4 items — not enough to appear in skill-filtered searches

### The LinkedIn Profile

- Headline: "Product Manager at [Company] | Building great products" — no keywords, no target role signal
- About section: 2 sentences
- Skills: 6 items, no endorsements
- No recommendations

Her LinkedIn SSI (Social Selling Index) score was 19/100.

---

## What We Changed

### Week 1: Resume Overhaul

We rebuilt the resume in a single-column format in Google Docs. Then we rewrote every bullet using the CAR framework.

Before: "Worked with engineering to improve checkout experience"

After: "Defined and shipped a checkout redesign (3-sprint initiative, team of 8) that reduced cart abandonment from 71% to 44%, recovering ₹1.8 Cr in monthly lost GMV"

We added 14 targeted keywords from the job descriptions she was targeting. Skills section went from 4 to 22 items.

New ATS score: **78/100**.

### Week 2: LinkedIn Rebuild

New headline: "Senior Product Manager | Growth · Fintech · B2C | Ex-[Company] | Open to Senior PM roles in Bangalore / Remote"

Rewrote the About section with a clear narrative, her top 3 outcomes, and a call to action. Added 31 skills. Sent recommendation requests to her last 3 managers (we drafted the messages for her — all three agreed within a week).

### Week 3: Targeted Application Strategy

We identified 12 high-fit roles where her experience directly matched 80%+ of the requirements. We customized her resume for each role (keyword adjustments, one reordered bullet per role).

---

## The Result

- Week 1 after optimization: 3 recruiter callbacks
- Week 2: 4 interviews scheduled
- Week 3: First final-round interview
- **Day 21: Offer received — ₹28 LPA, 34% increase from her previous package**

Priya had the experience all along. She needed the right translation of that experience into a format that both ATS systems and human recruiters could recognize.

---

> If Priya's story sounds familiar, our AI LinkedIn Optimizer and ATS Scanner can run the same analysis on your profile in minutes — and give you the same targeted action plan she used.`,
  },

  // ── 13
  {
    title: "From 0 to 14 Interview Calls in 30 Days: Rahul's Job Search Transformation",
    excerpt: "Rahul was a 6-year backend engineer getting zero responses despite applying to 80+ jobs. One profile overhaul changed everything. Here's the full story.",
    coverImage: IMG("1573497019940-1c28c88b4f3e"),
    tags: ["Career", "Resume"],
    author: "ProCareerLaunchpad Team",
    content: `## The Background

Rahul is a backend engineer with 6 years of experience in Java, Spring Boot, and microservices. He had worked at two mid-sized companies and had led the migration of a monolith to microservices — a genuinely impressive technical achievement.

He had been applying to jobs for 6 weeks. 80+ applications. 0 callbacks. Not even automated rejections — just silence.

He reached out to us frustrated and starting to wonder if something was fundamentally wrong with his profile.

---

## The Diagnosis

We ran his resume through our ATS Scanner and ran a full LinkedIn audit.

**Resume ATS Score: 29/100**

Critical issues:
- He was using a beautiful Canva-designed resume with two columns, icons, and a skill bar chart
- The ATS parser was reading his contact information as part of his experience section
- His headline was "Java Backend Developer" — too short, missing the microservices and cloud keywords that were in every JD he was targeting
- 0 quantified bullets. Not one number across the entire resume
- Missing keywords: Kafka, Docker, Kubernetes, AWS, CI/CD, system design — all common in senior backend JDs — present in Rahul's experience but not written on his resume

**LinkedIn audit:**
- Profile was 52% complete — below the All-Star threshold
- Skills: 7 items (algorithm wants 25+)
- No About section
- No recommendations
- Not marked as Open to Work

---

## The Fix: What We Changed in 72 Hours

### Resume: Full Rebuild

We rebuilt it in a clean single-column Word format. Then we rewrote every bullet.

Before: "Led the migration to microservices architecture"

After: "Led end-to-end migration of a 4-year-old monolith to 12 microservices on AWS ECS — reduced deployment time from 2 hours to 8 minutes, increased system uptime from 97.1% to 99.94%"

We added Kafka, Docker, Kubernetes, Jenkins, AWS keywords — all skills Rahul had but had never written on his resume.

New ATS score: **74/100**.

### LinkedIn: 2-Hour Overhaul

New headline: "Backend Engineer | Java · Spring Boot · Microservices · Kafka · AWS | 6 Years | Open to Bangalore / Hyderabad / Remote"

Added 28 skills. Wrote a 180-word About section highlighting the monolith migration with the exact numbers. Enabled Open to Work for recruiters only.

Added two projects to the Projects section — the monolith migration and a side project he had built.

Profile completeness went from 52% to 91%.

### Application Strategy Change

Rahul had been applying to every job that had "Java" in the title. We helped him identify 15 high-fit roles (8+ out of 10 keyword match) and apply to those with customized resumes.

---

## 30-Day Results

| Week | Recruiter Contacts | Interviews |
|---|---|---|
| Week 1 | 6 | 1 |
| Week 2 | 4 | 3 |
| Week 3 | 3 | 4 |
| Week 4 | 1 | 3 |
| Total | 14 | 11 |

Rahul received 2 offers in week 5. He accepted a Staff Engineer role at a Series B fintech — ₹32 LPA, up from ₹19 LPA.

---

The transformation was not magic. Rahul had always been qualified. He just needed his profile to say so in the language that ATS systems and recruiters understand.

> Start your own transformation with our free ATS Scanner — see your exact score, keyword gaps, and formatting issues in 60 seconds.`,
  },

  // ── 14
  {
    title: "The Hidden Job Market: How 70% of Jobs Are Never Posted Online",
    excerpt: "Most professionals apply exclusively to posted jobs and compete against hundreds of candidates. Here's how to access the 70% of roles that are filled before they're ever advertised.",
    coverImage: IMG("1522071820081-009f0129c71c"),
    tags: ["Career"],
    author: "ProCareerLaunchpad Team",
    content: `## The Job Market You Can See vs. The One That Matters

When you search Naukri, LinkedIn Jobs, or Indeed, you are looking at roughly 30% of available roles. The other 70% — often the better-paying, better-fit, and less competitive roles — are filled through referrals, internal networks, headhunters, and direct outreach before a job description is ever written.

This is not a myth. LinkedIn's own research has consistently found that more than 70% of roles are filled through networking. For senior roles (10+ years experience), the number is closer to 85%.

If you are exclusively applying to posted jobs, you are competing in the hardest segment of the market.

---

## Why Companies Fill Roles Before Posting

Posting a job is expensive and slow. A well-trafficked job post generates hundreds of applications, most of which need to be screened. The screening process takes recruiter time — often 3–6 weeks before a strong candidate is found.

A referral from a trusted employee takes a phone call. The candidate is pre-screened by someone whose judgment the company trusts. The process moves in days, not weeks.

Companies prefer referrals. Their hiring processes are built around them.

---

## The Four Channels Into the Hidden Market

### 1. Internal Referrals
Every company with more than 50 employees has a referral programme. Your job is to be the person someone thinks of when their company has an open role.

How to activate this: Stay genuinely connected to former colleagues. Comment on their LinkedIn posts. Send them articles relevant to their work. When you are actively job searching, let 10–15 trusted former colleagues know — not with a generic "I'm looking" message, but with a specific ask: "If you hear of any senior PM roles in fintech in Bangalore, I'd love to know — I'm exploring."

### 2. Direct Outreach to Hiring Managers
LinkedIn makes it possible to identify the hiring manager for a role before applying — or even to reach out to them directly before the job is posted.

A thoughtful outreach message to a VP Engineering or Head of Product who leads the team you want to join can get you a conversation that bypasses the ATS and the recruiter queue entirely.

The message should be short, specific, and value-first: "I noticed your team is building [X]. I spent the last 3 years doing exactly that at [Company] — happy to share what we learned about [relevant challenge] if it's useful." No ask, no CV attachment in the first message.

### 3. Headhunters and Executive Recruiters
Specialized recruiters for your function and level receive exclusive mandates from companies — roles that are never posted publicly. Being on a good recruiter's radar means you get called when a role matches your profile.

How to get on their radar: Connect with 5–10 specialized recruiters on LinkedIn in your field. Send a brief, specific introduction: your role, experience, what you are looking for, and what you bring. Keep it to 3 sentences.

### 4. Community and Event Presence
Industry-specific communities — Slack groups, WhatsApp groups, Meetups, conferences — are where hiring decisions get made informally. Being present, helpful, and visible in these communities puts you in the conversation before a job is ever posted.

---

## The Referral Activation Message

When you are ready to activate your network, send this to your top 15–20 former colleagues:

*"Hey [Name] — hope things are going well at [Company]. I'm exploring my next move — looking for [Senior PM / Staff Engineer / Growth Lead] roles, ideally in [Bangalore / fintech / Series B+]. If you hear of anything or know anyone worth connecting with, I'd really appreciate the introduction. Happy to return the favour whenever."*

Send this as a personalised WhatsApp or LinkedIn message — not a group broadcast. Personalisation is everything.

---

The hidden job market is not inaccessible. It just requires a different strategy than refreshing Naukri every morning.

> Our career consulting service helps you build the exact outreach strategy and profile positioning to access the hidden job market in your industry.`,
  },

  // ── 15
  {
    title: "How to Negotiate Your Salary in India — Scripts That Actually Work",
    excerpt: "Most professionals in India accept the first offer. Here's how to negotiate effectively — with exact scripts, counter-offer frameworks, and the numbers that are reasonable to ask for.",
    coverImage: IMG("1554224155-6726b3ff858f"),
    tags: ["Career", "India"],
    author: "ProCareerLaunchpad Team",
    content: `## The Negotiation Gap in India

A 2024 study of 1,200 Indian professionals found that 67% accepted the first salary offer without negotiating. Of those who did negotiate, 84% received more than the initial offer — with an average increase of 12%.

That is a significant amount of lifetime earnings left on the table — simply from not asking.

Salary negotiation in India has cultural nuances that differ from Western markets. The advice below is specific to the Indian job market context.

---

## Before You Negotiate: Know Your Number

Do your research on three data sources:

1. **Levels.fyi** — for tech roles, the most accurate compensation data in India
2. **Glassdoor India** — broader coverage across functions
3. **Your network** — people in similar roles at similar companies are the most reliable source

You need to know:
- The market median for your role, experience level, and city
- The range (P25 to P75) — this tells you what "good" and "great" look like
- Whether the company is known to pay above or below market

Your target ask should be the P75 (top 25% of market) for your profile. You will rarely land above it, and you should never accept below the P25.

---

## The Timing Rules

**Rule 1: Never give a number first.** When asked "What is your current CTC?" or "What are your expectations?" — deflect and ask about the budget:

> "I'm flexible and more focused on finding the right fit. What's the range budgeted for this role?"

**Rule 2: Wait for an offer before negotiating.** Do not try to negotiate during interviews. The offer stage is when you have leverage — they want you, they have invested time.

**Rule 3: Never negotiate over email first.** Call or video. Voice negotiation is faster, harder to misinterpret, and easier to read.

---

## The Counter-Offer Script

You have received an offer of ₹18 LPA. Your research says the market P75 for your role is ₹22 LPA.

> "Thank you so much for the offer — I'm genuinely excited about the role and the team. I've done some research on market compensation for this level, and based on what I'm seeing for [Senior Data Scientist / Staff Engineer / etc.] roles in [Bangalore], the range is ₹20–24 LPA. Given my [specific experience or skill], I was hoping we could get to ₹22 LPA. Is that something you can work with?"

What this script does:
- Expresses enthusiasm (keeps relationship warm)
- References external data (not just "I want more")
- States a specific number (not a vague "higher")
- Ends with an open question (invites negotiation, not confrontation)

---

## What to Do When They Say "This Is Our Final Offer"

80% of the time, it is not. "This is our final offer" is a negotiating tactic, not a hard ceiling.

Your response:
> "I understand. Would it be possible to revisit the variable component or the joining bonus to bridge the gap? Or if the base is fixed, is there flexibility on the annual review cycle — could we look at a 9-month review instead of 12?"

Always have a secondary ask ready. If base salary is fixed, negotiate:
- Joining / signing bonus
- Variable target percentage
- Review cycle timing
- Remote work flexibility
- Learning and development budget
- Extra leave days

---

## The CTC Disclosure Question

Indian employers routinely ask for your current CTC. This is not legally required and you are not obligated to disclose. You can say:

> "I'd prefer not to share my current CTC — I'd rather evaluate this opportunity on its own merits and the market value for the role. What's the budget for this position?"

Not all companies will accept this deflection, but many will. And even when they insist, you can share a number that includes the full value of your package — base, variable, ESOPs, PF contributions, health insurance, and any other benefits.

---

## Do Not Negotiate Against Yourself

The most common mistake: accepting an offer immediately because it feels good, then realising two weeks later you left money on the table.

Wait 24 hours before accepting any offer. Use that time to research, consult your network, and decide whether to negotiate.

The job is not lost if you ask for more. A company that rescinds an offer over a polite counter-offer is a company you do not want to work for.

> Our career consulting service includes salary negotiation coaching — we'll help you research your market rate, craft your counter-offer, and practice the script before your call.`,
  },
];

async function postBlog(blog, idx) {
  const res = await fetch(`${BASE}/api/blogs`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ ...blog, published: true }),
  });
  const data = await res.json();
  if (res.ok) {
    console.log(`✓ [${idx + 1}] ${blog.title.slice(0, 60)}…`);
  } else {
    console.error(`✗ [${idx + 1}] FAILED: ${JSON.stringify(data)}`);
  }
}

for (let i = 0; i < BLOGS.length; i++) {
  await postBlog(BLOGS[i], i);
  await new Promise((r) => setTimeout(r, 300));
}
console.log("\nDone — batch 1 of 2 posted.");
