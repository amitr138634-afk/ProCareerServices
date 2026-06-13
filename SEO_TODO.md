# SEO & Reach To-Do — Shyam Pro Services

Goal: **increase organic reach / traffic** to the website.

Legend: `[ ]` not done · `[x]` done · 🤖 = Claude can implement in code · 🧑 = you do it (account/content/ads) · ⚡ = quick win, high impact

---

## ✅ DONE IN CODE (already implemented — ships on next deploy)

- [x] `app/sitemap.ts` — auto sitemap of all pages + every published blog post → `/sitemap.xml`
- [x] `app/robots.ts` — crawl rules + sitemap link, blocks `/admin /api /dashboard /pay /login` → `/robots.txt`
- [x] `metadataBase` + global Open Graph + Twitter card metadata in `app/layout.tsx`
- [x] `app/opengraph-image.tsx` — branded 1200×630 social share image → `/opengraph-image`
- [x] JSON-LD structured data: **Organization** + **WebSite** (root), **FAQPage** (homepage FAQ), **BlogPosting** (each blog post)
- [x] Unique `<title>` + meta description + canonical for every public page (optimize, ats, resume, marketing, naukri, webdev, portfolio, career, courses, blogs, erp, legal-ai) via per-route `layout.tsx`
- [x] Per-post title/description/OG for blog articles (`app/blogs/[slug]/layout.tsx`)
- [x] GA4 component wired in (`components/GoogleAnalytics.tsx`) — **activates once you set `NEXT_PUBLIC_GA_ID`**

**Still needs you (accounts / content / ads):** see Phase 3, 4, 5, 6 below. 👇

---

## Phase 1 — Technical SEO foundations (do first, ~1 day) ⚡ — ✅ DONE

These are the highest-leverage fixes. Right now Google can crawl the site but has no sitemap, no rich previews, and most pages share one title — this caps your reach.

- [ ] 🤖 ⚡ **Add `app/sitemap.ts`** — auto-list every page + every blog slug so Google can discover and index all URLs.
- [ ] 🤖 ⚡ **Add `app/robots.ts`** — allow crawling, point to the sitemap, block `/admin` and `/api`.
- [ ] 🤖 ⚡ **Set `metadataBase`** in `app/layout.tsx` (to `NEXT_PUBLIC_SITE_URL`) so OG/canonical URLs resolve to absolute paths.
- [ ] 🤖 ⚡ **Add Open Graph + Twitter Card** metadata in root layout (title, description, image, site name) → link previews on WhatsApp / LinkedIn / X look professional and get more clicks.
- [ ] 🤖 **Add an `app/opengraph-image.tsx`** (1200×630 branded share image) — currently links share with no preview image.
- [ ] 🤖 **Add JSON-LD structured data:**
  - `Organization` (name, logo, URL, social profiles) in root layout
  - `Service` schema for each service (LinkedIn, ATS, Resume, Marketing…)
  - `FAQPage` schema on the FAQ section → can win rich snippets in Google
  - `BlogPosting`/`Article` schema on each blog post → eligible for article rich results
- [ ] 🤖 **Add canonical URLs** per page to avoid duplicate-content dilution.

## Phase 2 — Per-page on-page SEO (~1 day) ⚡

Problem: 15 pages are client components (`"use client"`) so they can't export `metadata` — they all inherit the homepage title. Each page needs a **unique title + description targeting one keyword**.

- [ ] 🤖 ⚡ **Give every route a unique `<title>` + meta description.** For client pages, split into a server `layout.tsx` (holds metadata) + the client `page.tsx`. Target keywords like:
  - `/optimize` → "AI LinkedIn Profile Optimizer (India) — Shyam Pro Services"
  - `/ats` → "Free ATS Resume Checker / Scanner — Score Your Resume"
  - `/resume` → "Professional ATS Resume Writing Service — ₹200"
  - `/naukri` → "Naukri Profile Optimization — Get More Recruiter Views" (already has a title ✅)
  - `/marketing` → "Digital Marketing Services — SEO, Ads, Social Media"
  - `/webdev`, `/portfolio`, `/career` → role/keyword-specific titles
- [ ] 🤖 **One clear `<h1>` per page** containing the target keyword (avoid multiple H1s).
- [ ] 🤖 **Descriptive `alt` text** on all meaningful images/icons.
- [ ] 🤖 **Internal linking** — link blog posts ↔ service pages (e.g. a "LinkedIn tips" post links to `/optimize`). Spreads ranking power and keeps visitors longer.

## Phase 3 — Measurement & indexing (~1 hour, do early) 🧑

You can't improve what you can't see. Set these up now so data accrues.

- [ ] 🧑 ⚡ **Google Search Console** — verify the domain, submit the sitemap, watch impressions/clicks/queries. (This is the #1 free SEO tool.)
- [ ] 🧑 **Bing Webmaster Tools** — same, takes 5 min, free traffic from Bing.
- [ ] 🧑 **Google Analytics 4** — create a property; 🤖 Claude can wire the GA4 tag into the app.
- [ ] 🧑 **Google Business Profile** — if you serve a city/region, create a free listing → shows up in Maps + local searches.

## Phase 4 — Content marketing (ongoing — the real reach engine) 🧑✍️

SEO traffic compounds through content. You already have a blog engine + admin — use it.

- [ ] 🧑 **Publish 1–2 blog posts/week** targeting what your audience searches, e.g.:
  - "How to optimize your LinkedIn profile for recruiters in India (2026)"
  - "Why your resume gets rejected by ATS — and how to fix it"
  - "Naukri profile tips to get more recruiter calls"
  - "SEO vs Google Ads — which is right for a small business?"
- [ ] 🧑 **Do keyword research** (free: Google autocomplete, "People also ask", Google Trends, Search Console queries). Write to long-tail, low-competition phrases first.
- [ ] 🧑 **Repurpose each post** into a LinkedIn post, an Instagram carousel, and an email → one piece of work, many channels.
- [ ] 🤖 Add a **blog RSS feed** + ensure blog posts have `Article` schema (Phase 1) for better distribution.

## Phase 5 — Off-page / promotion (build authority) 🧑

- [ ] 🧑 **Get backlinks** — guest posts on career/HR blogs, list your business in directories (Justdial, Sulekha, Clutch, Google Business), answer on Quora/Reddit with a link where relevant.
- [ ] 🧑 **Social media (SMM)** — post consistently on **LinkedIn** (your core audience), Instagram, Facebook. Share success stories, before/after, tips.
- [ ] 🧑 **Collect Google reviews** from happy clients → trust + local SEO.

## Phase 6 — Paid acceleration (optional, costs money) 🧑💰

Organic SEO is slow (3–6 months). Paid gets immediate reach while SEO builds.

- [ ] 🧑 **Google Search Ads** on high-intent keywords ("resume writing service", "LinkedIn optimization India").
- [ ] 🧑 **Meta Ads** (Instagram/Facebook) — awareness + retargeting visitors who didn't convert.
- [ ] 🧑 **Email marketing** — capture leads (you already collect emails via forms) and send a weekly tips newsletter to drive repeat visits.

---

## Performance & crawl health (supports rankings)

- [ ] 🤖 **Check Core Web Vitals** (PageSpeed Insights) — Next.js is fast, but verify images use `next/image`, and the hero/blobs aren't hurting LCP.
- [ ] 🤖 **Compress / lazy-load images**, serve modern formats (WebP/AVIF).
- [ ] 🤖 **Add `lang`, viewport, theme-color** meta (mostly present — verify).

---

## Suggested order (fastest path to more reach)

1. **Phase 3** (Search Console + GA4) — start collecting data today.
2. **Phase 1** (sitemap, robots, OG, JSON-LD) — let Google index everything properly.
3. **Phase 2** (unique per-page titles) — stop competing with yourself.
4. **Phase 4** (publish content weekly) — the long-term traffic engine.
5. **Phase 5 / 6** — promote and, if budget allows, accelerate with ads.

> 🤖 **Claude can implement everything marked 🤖 directly in this codebase** (sitemap, robots, OG image, JSON-LD, metadataBase, per-page metadata, GA4 tag). The 🧑 items need your accounts/content/ad budget. Say the word and I'll start with Phase 1.
