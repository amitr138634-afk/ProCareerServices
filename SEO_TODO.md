# SEO & Growth To-Do — Shyam Pro Services

Goal: **get indexed by Google + grow online reach and leads.**

Legend: `[x]` done · `[ ]` to do · 🤖 = Claude can build it in code · 🧑 = you do it (account/content/ads) · ⚡ = quick win, high impact

---

## ✅ DONE — Technical SEO (live on the site)

- [x] 🤖 `app/sitemap.ts` → `/sitemap.xml` (all pages + every blog post) — **verified live (HTTP 200)**
- [x] 🤖 `app/robots.ts` → `/robots.txt` (crawl rules + sitemap link; blocks admin/api/dashboard/pay/login) — **live**
- [x] 🤖 `metadataBase` + global **Open Graph** + **Twitter card** in `app/layout.tsx`
- [x] 🤖 `app/opengraph-image.tsx` — branded 1200×630 social share image
- [x] 🤖 JSON-LD structured data: **Organization** + **WebSite** + **FAQPage** + **BlogPosting**
- [x] 🤖 Unique `<title>` + description + canonical for every public page (per-route `layout.tsx`)
- [x] 🤖 Per-post title/description/OG for blog articles
- [x] 🤖 GA4 wired in (`components/GoogleAnalytics.tsx`)

## ✅ DONE — Accounts & verification

- [x] 🧑 **Google Search Console — VERIFIED** (via the Google Analytics method)
- [x] 🧑 **Sitemap submitted** in Search Console
- [x] 🧑 **Google Analytics 4 live** — `G-KD3CJK21ZF` (keep this tag on the site — it's also what verifies Search Console)

> ⏳ Note: code changes are on the live site but **not yet committed to git**. (Ask Claude to commit & push so your repo matches.)

---

## 🔜 NEXT — quick account setup (free, you, ~30 min)

- [ ] 🧑 ⚡ **Request indexing** for key pages: Search Console → URL Inspection → paste URL → Request Indexing (do home, `/marketing`, `/optimize`, `/ats`)
- [ ] 🧑 **Bing Webmaster Tools** — import directly from Search Console (1 click, free Bing traffic)
- [ ] 🧑 **List your free AI tools on global directories** — [There's An AI For That](https://theresanaiforthat.com), Futurepedia, Toolify (huge free traffic for AI tools)
- [ ] 🧑 **Launch the free ATS tool on Product Hunt** — global traffic spike + a strong backlink
- [ ] 🧑 **List on AlternativeTo, SaaSHub, Crunchbase** — backlinks + discovery
- [ ] 🧑 *(later)* Custom domain (e.g. `shyamproservices.com`) → update `NEXT_PUBLIC_SITE_URL` in Vercel. Better branding/trust than `.vercel.app`.

> ⛔ **Skipped on purpose:** Google Business Profile + Justdial/Sulekha. Those are for **local** businesses and need a phone/address — you're **worldwide + online + email-only**, so they don't fit.

---

## 📣 PROMOTION & REACH — the growth plan

### 🥇 Tier 1 — start THIS WEEK (free, highest ROI)

- [ ] 🧑 ⚡ **LinkedIn — post 3–5×/week from your personal profile.** Tips, before/after profile rewrites, client wins, "5 resume mistakes". Comment 15 min/day on job-seeker & HR posts. *(This is your #1 channel — your audience lives here.)*
- [ ] 🧑 ⚡ **Push your FREE tools as the hook** — *"Free ATS resume check — see why you're getting rejected."* Free tools get shared; "we offer resume writing" doesn't.
- [ ] 🧑 **Short-form video** — Reels / YouTube Shorts / Insta: 30-sec career tips. Huge free reach in India.
- [ ] 🧑 **Answer where people ask** — Quora, Reddit (r/developersIndia, r/india), Telegram job groups, FB job-seeker groups. Help genuinely + drop the free tool.
- [ ] 🧑 **Publish 1–2 blog posts/week** (engine already built) — see content ideas below.

### 🥈 Tier 2 — trust & distribution (free)

- [ ] 🧑 **Collect Google reviews + testimonials** from every happy client (feeds your Success Stories).
- [ ] 🧑 **WhatsApp** *(optional)* — use a **dedicated business number** (second SIM / virtual number) so your personal number stays private; then Claude adds a click-to-chat button. *(You also already have Tawk.to live chat — no number needed.)*
- [x] 🤖 **Email capture — BUILT** ✅ — newsletter signup is live in the footer; subscribers are stored. **You:** export the list any time via admin API `GET /api/newsletter?format=csv` (send header `x-admin-password`) and send a weekly tips email.
- [ ] 🧑 **Partnerships** — college placement cells, coaching institutes, career communities → discount for their members.
- [ ] 🧑 **Referral program** — "Refer a friend, both get ₹100 off."

### 🥉 Tier 3 — paid (only after free channels convert)

- [ ] 🧑💰 **Google Search Ads** — high-intent keywords ("resume writing service India", "LinkedIn optimization").
- [ ] 🧑💰 **Meta retargeting** — cheap ads following visitors who didn't buy.
- [ ] 🧑💰 **Micro-influencers** — small career/student creators on LinkedIn/Insta.

### 🎯 The growth loop that fits your business
> **Free tool** (ATS check / LinkedIn audit) → **captures email** → **nurture email + retarget** → **paid service** → **ask for review + referral** → repeat.

---

## 🤖 What Claude can build to power this (pick any)

- [ ] **Social share buttons** on blog posts + auto share image per article
- [x] **Email newsletter capture** (footer) + list storage — ✅ BUILT (`/api/newsletter`, `components/NewsletterSignup.tsx`)
- [ ] **Referral system** (unique codes + discount)
- [ ] **WhatsApp chat button** (click-to-chat)
- [ ] **"Free ATS check" lead-magnet landing page** (optimized for ads/social)
- [ ] **Auto review-request email** after a service is delivered
- [ ] **Blog RSS feed**
- [ ] **Internal linking** — blog posts ↔ service pages
- [ ] **Core Web Vitals / image optimization** pass (`next/image`, WebP/AVIF, lazy-load)
- [ ] Help **write the first 5 blog posts + matching LinkedIn posts**

---

## ✍️ Content ideas (blog + repurpose to LinkedIn/Insta)

- How to optimize your LinkedIn profile for recruiters in India (2026)
- Why your resume gets rejected by ATS — and how to fix it (free checker)
- Naukri profile tips to get more recruiter calls
- Resume mistakes that cost you interviews
- SEO vs Google Ads — which is right for a small business?
- How we grew a client's LinkedIn from 0 → X recruiter messages (case study)

> Keyword research (free): Google autocomplete, "People also ask", Google Trends, and your Search Console **Performance** queries once data appears. Target long-tail, low-competition phrases first.

---

## 📅 Simple weekly rhythm
- **Daily:** 1 LinkedIn post or comment thread (15 min)
- **2×/week:** 1 blog post → repurpose into a Reel + a carousel
- **Weekly:** check Search Console (Performance + Pages) and GA4 → see what's working, do more of it

---

## My top recommendation
Start with **LinkedIn daily** + **promoting the free ATS tool** — both cost ₹0 and fit your business perfectly. Everything else amplifies them.
