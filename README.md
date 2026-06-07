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
5. [Deploy on Render](#deploy-on-render)
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
| Deployment | Render (Node.js server) |

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
git clone <your-repo-url>
cd linkedinoptmization
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
   - `https://your-render-domain.onrender.com/api/auth/callback/google` (production)
7. Copy the Client ID and Client Secret

### How to get MongoDB URI
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster
3. Click **Connect → Drivers**
4. Copy the connection string and replace `<password>` with your DB user password

---

## Deploy on Render

### 1. Push your code to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### 2. Create a new Web Service on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Configure the service:

| Setting | Value |
|---|---|
| **Name** | `procareerlaunchpad` (or any name) |
| **Region** | Singapore (closest to India) |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Free (or Starter for better performance) |

### 3. Add environment variables on Render

In your Render service dashboard:
1. Go to **Environment** tab
2. Click **Add Environment Variable** for each variable
3. Add **all** variables from the [Environment Variables](#environment-variables) table above
4. For `NEXTAUTH_URL`, use your Render domain: `https://your-service.onrender.com`

> **Important:** Never commit `.env.local` to GitHub. It contains secret keys.

### 4. Add a `render.yaml` (optional — for one-click deploy)

Create a file `render.yaml` in your project root:

```yaml
services:
  - type: web
    name: procareerlaunchpad
    runtime: node
    region: singapore
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: NEXTAUTH_URL
        fromService:
          type: web
          name: procareerlaunchpad
          property: host
```

### 5. Update Google OAuth redirect URI for production

After your Render URL is live (e.g. `https://procareerlaunchpad.onrender.com`):

1. Go back to [Google Cloud Console](https://console.cloud.google.com) → Credentials
2. Edit your OAuth 2.0 client
3. Add the production redirect URI:
   ```
   https://procareerlaunchpad.onrender.com/api/auth/callback/google
   ```
4. Save

### 6. Update Razorpay webhook (if using webhooks)

In your Razorpay dashboard → Webhooks, add:
```
https://procareerlaunchpad.onrender.com/api/pay/verify
```

### Common Render Issues

| Issue | Fix |
|---|---|
| Build fails with "out of memory" | Upgrade to Starter instance |
| `NEXTAUTH_URL` mismatch error | Make sure the env var matches your exact Render domain including `https://` |
| PDF parsing error | Ensure `pdf-parse` is in `dependencies`, not `devDependencies` |
| Cold start is slow | Free tier sleeps after 15 min inactivity — upgrade to Starter to avoid |
| MongoDB connection timeout | Whitelist `0.0.0.0/0` in MongoDB Atlas → Network Access |

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

- [ ] All environment variables are set on Render
- [ ] `NEXT_PUBLIC_SKIP_PAYMENT` is `false` or removed
- [ ] `NEXTAUTH_URL` points to your live Render domain
- [ ] Google OAuth redirect URI updated for production domain
- [ ] MongoDB Atlas network access allows `0.0.0.0/0`
- [ ] Razorpay is using **live** keys (not test keys)
- [ ] Admin email and password are changed to something secure
- [ ] Social media URLs updated in env vars
- [ ] Tawk.to property ID added (optional but recommended for live chat)

---

*Built with Next.js 14 · Powered by AI · ProCareerLaunchpad*
