# ProCareerLaunchpad — AI Career Platform

> **Everything You Need to Win Professionally.**  
> Career · Business · Legal — Powered by AI

A full-stack Next.js 14 platform offering AI-powered career tools, payment processing, user authentication, admin management, and an AI chatbot.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Features Overview](#features-overview)
3. [Run Locally](#run-locally)
4. [Environment Variables](#environment-variables)
5. [Deploy on Vercel](#deploy-on-vercel)
6. [Admin Panel Guide](#admin-panel-guide)
7. [Folder Structure](#folder-structure)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | MongoDB Atlas |
| Auth | NextAuth v4 (Google OAuth) |
| Payments | Razorpay |
| AI Providers | Groq · Claude · Gemini · OpenRouter · OpenAI |
| Email | Resend |
| PDF Export | jsPDF |
| Resume Parsing | pdf-parse · mammoth |
| Deployment | Vercel (serverless, free tier) |

---

## Features Overview

### 1. LinkedIn Profile Optimizer — `/optimize`
**Price: ₹200 (one-time)**

Analyzes a user's LinkedIn profile section by section using AI and returns 20+ specific, actionable improvements.

**How it works:**
1. User signs in with Google
2. Fills in profile sections (headline, summary, experience, skills, etc.) step by step
3. AI processes the entire profile using a fallback chain: Groq → Claude → Gemini → OpenRouter → OpenAI
4. Analysis report displays with scores, improvements, and recommendations per section
5. User can download a **Full AI Analysis PDF** report
6. User can download a **Step-by-Step Action Guide PDF** (phased, colour-coded plan)
7. A **Restart** button clears all data and lets the user start fresh

**Payment gate:** Users must pay ₹200 via Razorpay before accessing the full analysis. Free preview shows limited results.

---

### 2. ATS Resume Scanner — `/ats`
**Price: ₹200 (one-time)**

Scans a resume (PDF or DOCX) against a job description and returns an ATS compatibility score with detailed feedback.

**How it works:**
1. User uploads their resume (PDF/DOCX) and pastes the job description
2. Text is extracted server-side using `pdf-parse` (PDF) or `mammoth` (DOCX)
3. AI returns a JSON report with:
   - ATS score (0–100)
   - Score breakdown across 5 dimensions
   - Keywords found vs. missing
   - Section-by-section analysis
   - 10–15 recommendations (premium) or 2 (free preview)

**Supported file types:** `.pdf`, `.docx`, `.doc`, `.txt`

---

### 3. Naukri Profile Optimizer — `/naukri`
**Price: ₹200 (one-time)**

AI audit of a Naukri.com profile to boost search visibility and recruiter response rates.

**How it works:** Same step-by-step form flow as LinkedIn Optimizer, but tailored for Naukri-specific fields (resume headline, key skills, profile summary, etc.).

---

### 4. Resume Creation — `/resume`
Contact-based service (custom pricing). User fills a form with name, role, experience, and skills. Request is sent to the team via email.

---

### 5. Social Media Marketing — `/content`
Monthly retainer service. User submits their social media goals and current presence. Team follows up with a proposal.

---

### 6. Portfolio Website — `/portfolio`
Custom portfolio website design and development service. User fills a brief; team delivers in 3 business days.

---

### 7. Career Counseling — `/career`
1-on-1 counseling sessions. User submits their career goals, experience level, and concerns. Team books a session.

---

### 8. Payment Flow — `/pay`
Centralized payment page for all services.

**Flow:**
1. User selects a service and quantity
2. Razorpay order is created via `/api/create-order`
3. Razorpay checkout opens (UPI, cards, net banking)
4. On success, `/api/pay/verify` verifies the payment signature
5. User's `paidServices` array is updated in MongoDB
6. User appears in the Admin Customers tab automatically

---

### 9. AI Chatbot Widget
A floating chat bubble (bottom-right corner) available on every page.

**Behaviour:**
- "Hey! Need any help? 👋" hint appears after 3 seconds for new visitors
- AI knows all service prices, descriptions, and FAQs
- Falls back to human handoff if it can't answer
- **"Talk to a human agent"** button shows a contact capture form:
  - User enters email or phone number
  - Saved to the feedback system so the admin team gets notified
  - If Tawk.to is configured, it opens automatically

---

### 10. Blog — `/blogs`
Admin-managed blog. Posts can be created, edited, and deleted from the admin panel. Publicly readable without login.

---

### 11. Success Stories
User testimonials displayed on the home page. Admin can add, edit, and delete stories from the admin panel.

---

### 12. User Dashboard — `/dashboard`
After login, users can see:
- Their active services
- Payment history
- Quick links to their tools

---

### 13. Admin Panel — `/admin`
Password-protected admin dashboard. See the [Admin Panel Guide](#admin-panel-guide) section below.

---

## Run Locally

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher
- A MongoDB Atlas account (free M0 cluster is enough)
- A Google Cloud project with OAuth 2.0 credentials

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/amitr138634-afk/ProCareerServices.git
cd ProCareerServices
```

**2. Install dependencies**
```bash
npm install
```

**3. Create the environment file**

Copy the template below into a new file called `.env.local` in the project root and fill in your values:

```env
# See the full Environment Variables section below for all required keys
NEXT_PUBLIC_SKIP_PAYMENT=false
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
OPENROUTER_API_KEY=your_openrouter_key
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
NEXT_PUBLIC_AMOUNT=20000
NEXT_PUBLIC_AMOUNT_DISPLAY=200
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=any_long_random_string
NEXTAUTH_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://...
MONGODB_DB=procareerlaunchpad
ADMIN_EMAIL=info@procareerlaunchpad.com
ADMIN_PASSWORD=your_admin_password
RESEND_API_KEY=your_resend_key
SMTP_TO=info@procareerlaunchpad.com
SMTP_FROM=info@procareerlaunchpad.com
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/procareerlaunchpad
NEXT_PUBLIC_LINKEDIN_URL=https://www.linkedin.com/company/procareerlaunchpad
NEXT_PUBLIC_FACEBOOK_URL=https://www.facebook.com/procareerlaunchpad
NEXT_PUBLIC_TAWKTO_PROPERTY_ID=
NEXT_PUBLIC_TAWKTO_WIDGET_ID=
```

**4. Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**5. (Optional) Skip payment gate for testing**

Set in `.env.local`:
```env
NEXT_PUBLIC_SKIP_PAYMENT=true
```
This lets you access all AI tools without paying. **Remove this before going live.**

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SKIP_PAYMENT` | No | Set `true` to bypass payment for local dev |
| `GROQ_API_KEY` | Yes | Groq API key — primary AI provider (free). Get at [console.groq.com](https://console.groq.com) |
| `GROQ_MODEL` | No | Defaults to `llama-3.3-70b-versatile` |
| `GROQ_FALLBACK_MODEL` | No | Defaults to `deepseek-r1-distill-llama-70b` |
| `GEMINI_API_KEY` | Yes | Google Gemini key. Get at [aistudio.google.com](https://aistudio.google.com) |
| `GEMINI_MODEL` | No | Defaults to `gemini-2.5-flash` |
| `OPENROUTER_API_KEY` | Yes | OpenRouter key (free models available). Get at [openrouter.ai](https://openrouter.ai) |
| `ANTHROPIC_API_KEY` | No | Claude API key. Get at [console.anthropic.com](https://console.anthropic.com) |
| `OPENAI_API_KEY` | No | OpenAI key — last fallback |
| `RAZORPAY_KEY_ID` | Yes | Razorpay live/test key ID |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay secret (server-side only, never expose) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | Same as `RAZORPAY_KEY_ID` — exposed to browser for checkout |
| `NEXT_PUBLIC_AMOUNT` | Yes | Price in paise (e.g. `20000` = ₹200) |
| `NEXT_PUBLIC_AMOUNT_DISPLAY` | Yes | Display price (e.g. `200`) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Full URL of the site — used in emails, PDFs, and AI chatbot links. `http://localhost:3000` locally, your Vercel URL in production |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `NEXTAUTH_SECRET` | Yes | Any random 32+ character string for session encryption |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` locally, your live URL in production |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `MONGODB_DB` | Yes | Database name (e.g. `procareerlaunchpad`) |
| `ADMIN_EMAIL` | Yes | Admin login email |
| `ADMIN_PASSWORD` | Yes | Admin login password |
| `RESEND_API_KEY` | Yes | Resend email API key. Get at [resend.com](https://resend.com) |
| `SMTP_TO` | Yes | Email address that receives contact form submissions |
| `SMTP_FROM` | Yes | Sender email address |
| `NEXT_PUBLIC_INSTAGRAM_URL` | No | Instagram profile URL |
| `NEXT_PUBLIC_LINKEDIN_URL` | No | LinkedIn company page URL |
| `NEXT_PUBLIC_FACEBOOK_URL` | No | Facebook page URL |
| `NEXT_PUBLIC_TAWKTO_PROPERTY_ID` | No | Tawk.to property ID for live chat human handoff |
| `NEXT_PUBLIC_TAWKTO_WIDGET_ID` | No | Tawk.to widget ID |

### How to get Google OAuth credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client IDs**
5. Application type: **Web application**
6. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (local)
   - `https://your-app.vercel.app/api/auth/callback/google` (production)
7. Copy the Client ID and Client Secret

### How to get MongoDB URI
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster
3. Click **Connect → Drivers**
4. Copy the connection string and replace `<password>` with your DB user password

---

## Deploy on Vercel

Vercel is the recommended deployment platform — it's made by the same team as Next.js and the free Hobby tier is sufficient for this project.

### 1. Push your code to GitHub

If not already done:
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/your-username/ProCareerServices.git
git push -u origin main
```

If code is already on GitHub (this project is at `amitr138634-afk/ProCareerServices`):
```bash
git add .
git commit -m "your message"
git push
```

### 2. Import the project into Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (use GitHub login — it's free)
2. Click **Add New → Project**
3. Click **Import** next to `amitr138634-afk/ProCareerServices`
4. Framework is auto-detected as **Next.js** — leave as-is
5. Root directory: leave blank (project root)

### 3. Add environment variables

Before clicking **Deploy**, expand **Environment Variables** and add every key from the [Environment Variables](#environment-variables) table. Key values for production:

| Key | Production value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` *(set after first deploy)* |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` *(set after first deploy)* |
| `NEXT_PUBLIC_SKIP_PAYMENT` | `false` |
| All API keys | Same as your `.env.local` values |

> **Tip:** You can also add env vars later in **Project Settings → Environment Variables** and then redeploy.

### 4. Click Deploy

Vercel builds and deploys automatically. Build takes about 2–3 minutes. When done, you get a URL like `https://procareerservices.vercel.app`.

### 5. Update NEXTAUTH_URL and NEXT_PUBLIC_SITE_URL

Once you have your Vercel URL:
1. Go to **Project Settings → Environment Variables** in Vercel
2. Update `NEXTAUTH_URL` → `https://your-app.vercel.app`
3. Update `NEXT_PUBLIC_SITE_URL` → `https://your-app.vercel.app`
4. Go to **Deployments** tab → click the three dots → **Redeploy**

### 6. Update Google OAuth redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials**
2. Edit your OAuth 2.0 client
3. Under **Authorized redirect URIs**, add:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
4. Click **Save**

### 7. Update MongoDB Atlas network access

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → **Network Access**
2. Click **Add IP Address → Allow Access from Anywhere** (`0.0.0.0/0`)
3. This is required because Vercel uses dynamic IPs for serverless functions

### 8. (Optional) Add a custom domain

In Vercel → **Project Settings → Domains**, add your own domain (e.g. `procareerlaunchpad.com`). Vercel provisions an SSL certificate automatically.

After adding a custom domain:
- Update `NEXTAUTH_URL` → `https://procareerlaunchpad.com`
- Update `NEXT_PUBLIC_SITE_URL` → `https://procareerlaunchpad.com`
- Add `https://procareerlaunchpad.com/api/auth/callback/google` to Google OAuth
- Redeploy

### Function timeout configuration

The `vercel.json` in the project root already sets extended timeouts for heavy AI routes:

```json
{
  "functions": {
    "app/api/ats-scan/route.ts":        { "maxDuration": 60 },
    "app/api/linkedin/route.ts":        { "maxDuration": 60 },
    "app/api/chat/route.ts":            { "maxDuration": 30 },
    "app/api/generate-report/route.ts": { "maxDuration": 30 }
  },
  "regions": ["sin1"]
}
```

`sin1` = Singapore region (fastest from India). No changes needed.

### Common Vercel Issues

| Issue | Fix |
|---|---|
| `NEXTAUTH_URL` mismatch / login redirect loop | Update `NEXTAUTH_URL` env var to exact Vercel domain including `https://`, then redeploy |
| Google sign-in fails | Add the Vercel domain to Google OAuth Authorized redirect URIs |
| MongoDB connection timeout | Whitelist `0.0.0.0/0` in MongoDB Atlas → Network Access |
| PDF parsing fails in production | Ensure `pdf-parse` and `mammoth` are in `dependencies` (not `devDependencies`) in `package.json` |
| Environment variable not available | `NEXT_PUBLIC_*` vars must be set before build — if you add them after, you must redeploy |
| AI routes timing out | The 60s limit in `vercel.json` covers most cases; if still failing, check AI provider keys |

---

## Admin Panel Guide

Access the admin panel at `/admin`.

**Login:** Enter both your admin email and password (set in `.env.local` as `ADMIN_EMAIL` and `ADMIN_PASSWORD`).

### Customers Tab
- View all registered users and their paid services
- Toggle LinkedIn / Naukri / ATS access ON or OFF for any user for free (no payment created — admin grant)
- View payment status

### Orders Tab
- View all Razorpay payment orders
- See which user paid for what and when

### Feedback Tab
- View all contact form submissions and chat widget leads
- Includes the chat transcript when user clicked "Talk to a human"

### Stories Tab
- Add / edit / delete customer success stories shown on the home page

### Blogs Tab
- Create, edit, and delete blog posts
- Posts are publicly visible at `/blogs`

### Add User Tab
- Manually add a user and grant them service access

### Send Email Tab
- Send a broadcast email to all users or a specific user

---

## Folder Structure

```
├── app/
│   ├── page.tsx              # Home page
│   ├── layout.tsx            # Root layout (ChatWidget lives here)
│   ├── optimize/             # LinkedIn Optimizer
│   ├── ats/                  # ATS Resume Scanner
│   ├── naukri/               # Naukri Optimizer
│   ├── pay/                  # Payment page
│   ├── dashboard/            # User dashboard
│   ├── admin/                # Admin panel
│   ├── blogs/                # Blog listing + post pages
│   ├── login/                # Login page
│   ├── resume/               # Resume creation service
│   ├── content/              # Social media marketing service
│   ├── portfolio/            # Portfolio website service
│   ├── career/               # Career counseling service
│   └── api/
│       ├── optimize/         # LinkedIn AI analysis + action guide
│       ├── ats-scan/         # ATS resume scanner
│       ├── naukri-optimize/  # Naukri AI analysis
│       ├── chat/             # AI chatbot endpoint
│       ├── create-order/     # Razorpay order creation
│       ├── pay/verify/       # Razorpay payment verification
│       ├── check-session/    # Check user's paid services
│       ├── feedback/         # Contact form submissions
│       ├── service-request/  # Non-AI service inquiries
│       ├── admin/            # Admin data APIs
│       ├── blogs/            # Blog CRUD
│       ├── stories/          # Success stories CRUD
│       └── auth/             # NextAuth Google OAuth
│
├── components/
│   ├── LinkedInOptimizer.tsx # Main LinkedIn optimizer UI
│   ├── ChatWidget.tsx        # AI chat + human handoff widget
│   ├── ContactForm.tsx       # Home page contact form
│   ├── Navbar.tsx            # Site navigation
│   ├── SessionProvider.tsx   # NextAuth session wrapper
│   └── SpaceBackground.tsx   # Animated background
│
├── lib/
│   ├── db.ts                 # MongoDB data store (users, sessions, orders)
│   └── generateActionGuide.ts # jsPDF action guide generator
│
├── next.config.mjs           # Next.js config (pdf-parse external package)
├── tailwind.config.ts        # Tailwind theme (brand colors)
└── .env.local                # Local environment variables (never commit)
```

---

## Quick Start Checklist

Before going live, verify:

- [ ] All environment variables are set in Vercel → Project Settings → Environment Variables
- [ ] `NEXT_PUBLIC_SKIP_PAYMENT` is `false` (or not set)
- [ ] `NEXTAUTH_URL` points to your live Vercel domain (e.g. `https://your-app.vercel.app`)
- [ ] `NEXT_PUBLIC_SITE_URL` matches `NEXTAUTH_URL`
- [ ] Google OAuth redirect URI updated for production domain
- [ ] MongoDB Atlas network access allows `0.0.0.0/0`
- [ ] Razorpay is using **live** keys (not test keys)
- [ ] Admin email and password are set to something secure
- [ ] Social media URLs updated in env vars (`NEXT_PUBLIC_INSTAGRAM_URL`, etc.)
- [ ] Tawk.to property ID added (optional but recommended for live chat)
- [ ] Redeployed after updating `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL`

---

*Built with Next.js 14 · Powered by AI · ProCareerLaunchpad*
