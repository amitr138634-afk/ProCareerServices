# ProCareerLaunchpad — Technical Architecture

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Home Page   │  │  AI Tools    │  │  Chat Widget (all pages) │  │
│  │  /           │  │  /optimize   │  │  Floating bottom-right   │  │
│  │  /blogs      │  │  /ats        │  │  AI → Human handoff      │  │
│  │  /dashboard  │  │  /naukri     │  └──────────────────────────┘  │
│  └──────────────┘  └──────────────┘                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 14 APP SERVER                            │
│                    (Node.js on Render/Vercel)                       │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    APP ROUTER                                │   │
│  │  Server Components (SSR)  +  Client Components ("use client")│   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    API ROUTES                                │   │
│  │                                                              │   │
│  │  /api/optimize          /api/chat                           │   │
│  │  /api/ats-scan          /api/feedback                       │   │
│  │  /api/naukri-optimize   /api/service-request                │   │
│  │  /api/create-order      /api/stories                        │   │
│  │  /api/pay/verify        /api/blogs                          │   │
│  │  /api/check-session     /api/admin/*                        │   │
│  │  /api/auth/*                                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────┬────────────┬───────────────┬──────────────┬──────────────────┘
       │            │               │              │
       ▼            ▼               ▼              ▼
 ┌──────────┐ ┌──────────┐  ┌──────────────┐ ┌──────────────┐
 │ MongoDB  │ │ Razorpay │  │ AI Providers │ │    Resend    │
 │  Atlas   │ │ Payments │  │   (chain)    │ │    Email     │
 └──────────┘ └──────────┘  └──────────────┘ └──────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
         ┌────────┐          ┌──────────┐         ┌──────────┐
         │  Groq  │          │  Claude  │         │  Gemini  │
         │ Llama  │          │ Sonnet   │         │  Flash   │
         └────────┘          └──────────┘         └──────────┘
              ▼                                        ▼
         ┌──────────┐                          ┌──────────────┐
         │ DeepSeek │                          │  OpenRouter  │
         │    R1    │                          │   (Llama)    │
         └──────────┘                          └──────────────┘
                                                      ▼
                                               ┌──────────────┐
                                               │    OpenAI    │
                                               │  (last resort)│
                                               └──────────────┘
```

---

## AI Provider Fallback Chain

Every AI feature uses the same ordered fallback — if one provider fails (rate limit, quota, error), the next one is tried automatically. Each provider gets up to 3 retry attempts for transient errors.

```
Request comes in
      │
      ▼
┌─────────────────────────┐
│ 1. Groq — Llama 3.3 70B │  ← Free, fastest (~1-2s)
│    (3 retries)          │
└──────────┬──────────────┘
           │ fail
           ▼
┌──────────────────────────────┐
│ 2. Groq — DeepSeek R1 Distill│  ← Free fallback
│    (3 retries)               │
└──────────┬───────────────────┘
           │ fail
           ▼
┌──────────────────────────┐
│ 3. Google Gemini 2.5 Flash│  ← Free tier available
│    (3 retries)            │
└──────────┬───────────────┘
           │ fail
           ▼
┌──────────────────────────┐
│ 4. OpenRouter — Llama 3.3 │  ← Free models available
│    (3 retries)            │
└──────────┬───────────────┘
           │ fail
           ▼
┌──────────────────────────┐
│ 5. Claude Sonnet 4.5     │  ← Paid (Anthropic credits)
│    (3 retries)           │
└──────────┬───────────────┘
           │ fail
           ▼
┌──────────────────────────┐
│ 6. OpenAI GPT-4o Mini    │  ← Paid (last resort)
│    (3 retries)           │
└──────────┬───────────────┘
           │ all fail
           ▼
     Error: "All AI providers unavailable"
```

**Transient error detection:** 429 (rate limit), 503 (service unavailable), "quota", "overloaded", "high demand" → retried with backoff.  
**Other errors:** Break immediately and move to next provider.

---

## Database Schema (MongoDB)

### Collection: `users`
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "name": "User Name",
  "image": "https://...",
  "createdAt": ISODate
}
```

### Collection: `sessions`
Tracks which services a user has paid for / been granted access to.
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "paidServices": ["linkedin", "ats", "naukri"],
  "updatedAt": ISODate
}
```

### Collection: `orders`
One record per Razorpay payment.
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "service": "linkedin",
  "amount": 20000,
  "currency": "INR",
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "paymentStatus": "paid",
  "createdAt": ISODate
}
```

### Collection: `payments`
Detailed payment records (created when payment is verified).
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "service": "linkedin",
  "paymentId": "pay_xxx",
  "amount": 200,
  "createdAt": ISODate
}
```

### Collection: `feedback`
Contact form + chat widget lead submissions.
```json
{
  "_id": ObjectId,
  "name": "User Name",
  "email": "user@example.com",
  "message": "...",
  "rating": 5,
  "createdAt": ISODate
}
```

### Collection: `stories`
Customer success stories shown on the home page.
```json
{
  "_id": ObjectId,
  "name": "Priya S.",
  "role": "Software Engineer",
  "company": "TCS",
  "story": "...",
  "rating": 5,
  "createdAt": ISODate
}
```

### Collection: `blogs`
Blog posts managed from the admin panel.
```json
{
  "_id": ObjectId,
  "title": "...",
  "slug": "url-friendly-slug",
  "excerpt": "...",
  "content": "...",
  "coverImage": "https://...",
  "tags": ["career", "linkedin"],
  "author": "ProCareerLaunchpad Team",
  "createdAt": ISODate
}
```

---

## Payment Flow — Sequence Diagram

```
Browser                  Next.js Server              Razorpay
   │                          │                          │
   │─── POST /api/create-order ──►│                      │
   │    { service, email }        │                      │
   │                          │──── Create Order ───────►│
   │                          │◄─── { order_id, amount } ─│
   │◄── { orderId, key, amount } ─│                      │
   │                              │                      │
   │─── Open Razorpay Checkout ──────────────────────────►│
   │◄─── Payment Success ─────────────────────────────────│
   │    { payment_id, order_id, signature }               │
   │                              │                      │
   │─── POST /api/pay/verify ────►│                      │
   │    { payment_id, order_id,   │                      │
   │      signature, service }    │──── Verify Signature │
   │                          │   │    (HMAC-SHA256)     │
   │                          │   │                      │
   │                          ├── upsertUser(email)      │
   │                          ├── createOrder(email,     │
   │                          │    service, paymentId)   │
   │                          └── markUserPaid(email,    │
   │                               service, paymentId)   │
   │◄──── { success: true } ──────│                      │
   │                              │                      │
   │─── Redirect to tool page ───►│                      │
```

---

## Authentication Flow

```
User clicks "Sign in with Google"
          │
          ▼
NextAuth → /api/auth/signin → Google OAuth 2.0
          │
          ▼
Google returns authorization code
          │
          ▼
NextAuth → /api/auth/callback/google
          │
          ▼
Session created (JWT in cookie)
          │
          ▼
User is redirected back to site
          │
          ▼
Client calls /api/check-session with user email
          │
          ▼
Server returns: { paidServices: ["linkedin", "ats"] }
          │
          ▼
UI shows access to paid tools
```

---

## Admin Authentication

All `/api/admin/*` routes require both headers on every request:

```
x-admin-email: info@procareerlaunchpad.com   (from ADMIN_EMAIL env var)
x-admin-password: <password>                  (from ADMIN_PASSWORD env var)
```

The admin panel page stores credentials in `sessionStorage` (cleared on tab close) and sends them with every API call.

---

## PDF Report Generation (jsPDF)

Two PDF types are generated client-side (no server load):

```
handleDownloadReport()
      │
      ▼
generatePDFReport(analysisData)    ← lib/generateReport.ts (or inline)
      │
      ├── Cover page (dark background, candidate name, date)
      ├── Section scores (progress bars)
      ├── Detailed recommendations per section
      └── Save as: ProCareerLaunchpad_LinkedIn_Analysis_<name>.pdf


handleDownloadActionGuide()
      │
      ▼
POST /api/optimize/action-guide    ← Server calls AI
      │
      ▼
generateActionGuide(guide)         ← lib/generateActionGuide.ts
      │
      ├── Cover page (phases overview table)
      ├── Phase headers (colour-coded: red, orange, teal, blue, purple)
      ├── Step cards (numbered, with EXAMPLE and WARNING callout boxes)
      └── Save as: ProCareerLaunchpad_LinkedInStepByStep_<name>.pdf
```

---

## Chat Widget Architecture

```
User opens chat
      │
      ▼
ChatWidget.tsx (client component, loaded in layout.tsx on every page)
      │
      ├── Shows greeting message
      ├── Shows quick-reply chips
      │
      ▼
User sends message
      │
      ▼
POST /api/chat
      │
      ├── System prompt: all service info, prices, FAQs
      ├── Last 8 messages as conversation context
      ├── AI providers: Groq → Gemini → OpenRouter → Claude
      ├── Max tokens: 200 (keeps replies short and fast)
      │
      ▼
AI reply displayed
      │
User clicks "Talk to a human agent"
      │
      ▼
Contact capture overlay slides up
      │
      ├── User enters email or phone
      ├── POST /api/feedback (saves to MongoDB + notifies admin)
      ├── Shows confirmation with user's contact
      └── If Tawk.to configured → opens live chat
```

---

## Key Technical Decisions

| Decision | Reason |
|---|---|
| `pdf-parse@1.1.1` (not v2) | v2 changed to class-based API requiring browser Worker API; v1 works in Node.js with simple function call |
| `experimental.serverComponentsExternalPackages: ["pdf-parse"]` | Prevents webpack from bundling `pdf-parse`; uses Node.js native `require()` instead — avoids "Object.defineProperty" error |
| AI fallback chain | No single free provider is reliable enough; chaining 6 providers means near-100% uptime |
| Client-side PDF generation | Offloads rendering to the browser; server doesn't need to handle large PDF jobs |
| `grantServiceAccess` vs `markUserPaid` | Admin granting access should NOT create a payment record; these are two separate DB operations |
| JWT sessions (NextAuth) | Stateless; no session DB needed; works well on serverless/ephemeral deployments |
| `sessionStorage` for admin creds | Never stored permanently; cleared when browser tab closes; more secure than `localStorage` |

---

## Render vs Vercel — Deployment Comparison

```
┌──────────────────────┬──────────────────────────┬──────────────────────────┐
│ Factor               │ Render                   │ Vercel                   │
├──────────────────────┼──────────────────────────┼──────────────────────────┤
│ Next.js support      │ Good (runs npm start)    │ Best (made by Next.js    │
│                      │                          │ team, native support)    │
├──────────────────────┼──────────────────────────┼──────────────────────────┤
│ Function timeout     │ NO LIMIT on web server   │ FREE: 10s limit ❌       │
│                      │ (runs as Node.js process)│ PRO: 300s limit          │
├──────────────────────┼──────────────────────────┼──────────────────────────┤
│ AI routes (60s)      │ ✅ Works on free tier     │ ❌ Fails on free tier    │
│                      │                          │ (10s timeout exceeded)   │
├──────────────────────┼──────────────────────────┼──────────────────────────┤
│ Cold starts          │ ~15-30s on free tier     │ ~1-3s (serverless)       │
│                      │ (sleeps after 15 min)    │                          │
├──────────────────────┼──────────────────────────┼──────────────────────────┤
│ Free tier bandwidth  │ 100 GB/month             │ 100 GB/month             │
├──────────────────────┼──────────────────────────┼──────────────────────────┤
│ Custom domain        │ ✅ Free                   │ ✅ Free                  │
├──────────────────────┼──────────────────────────┼──────────────────────────┤
│ Environment vars     │ Simple dashboard UI      │ Simple dashboard UI      │
├──────────────────────┼──────────────────────────┼──────────────────────────┤
│ Build speed          │ Slower (shared servers)  │ Faster (global CDN)      │
├──────────────────────┼──────────────────────────┼──────────────────────────┤
│ Price (paid)         │ $7/month (Starter)       │ $20/month (Pro)          │
└──────────────────────┴──────────────────────────┴──────────────────────────┘

VERDICT FOR THIS APP: ✅ Render is better

Reason: The AI routes (/api/optimize, /api/ats-scan, /api/chat) have
maxDuration = 60 seconds. On Vercel's free tier, API functions timeout
at 10 seconds — your AI calls would fail every time. On Render's free
tier, the app runs as a real Node.js process with no function timeout.

If you want to use Vercel, you must be on the Pro plan ($20/month).
```

---

*ProCareerLaunchpad Technical Documentation*
