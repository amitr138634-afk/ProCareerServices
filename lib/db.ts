import { getMongoClient, DB_NAME, hasMongo } from "./mongodb";
import fs from "fs";
import path from "path";

// Payment is permanent per service — no TTL
const DATA_DIR = path.join(process.cwd(), ".data");

// ── File-based persistence (MemoryStore only) ─────────────────────────────────

function readData<T>(filename: string): T | null {
  try {
    const p = path.join(DATA_DIR, filename);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch { return null; }
}

function writeData(filename: string, data: unknown): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
  } catch { /* ignore */ }
}

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface UserRecord {
  email: string; name: string; image?: string; phone?: string; passwordHash?: string; createdAt: string; lastSeen: string;
}
export interface PaymentRecord {
  id: string; email: string; service: string; amount: number; razorpayId?: string; createdAt: string;
}
export interface ServiceRequest {
  id: string; name: string; email: string; phone?: string; serviceType: string;
  profileType?: string; message: string; hasResume: boolean; createdAt: string;
  status: "new" | "contacted" | "completed";
}
export interface FeedbackRecord {
  id: string; name: string; email: string; service: string;
  rating: number; message: string; createdAt: string; approved: boolean;
}
export interface StoryRecord {
  id: string; name: string; role: string; result: string;
  story: string; imageUrl: string; createdAt: string;
}
export interface BlogRecord {
  id: string; title: string; slug: string; excerpt: string;
  content: string; coverImage: string; tags: string[];
  author: string; published: boolean; createdAt: string; updatedAt: string;
}
export type OrderService = "linkedin" | "naukri" | "ats" | "resume" | "portfolio" | "content";
export type OrderStatus = "new" | "in_progress" | "review" | "done" | "cancelled";
export type PaymentStatus = "pending" | "paid";
export interface OrderRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  service: OrderService;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  handledBy: string;
  notes?: string;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
}

interface DataStore {
  markUserPaid(email: string, service: string, razorpayId?: string, amount?: number): Promise<void>;
  grantServiceAccess(email: string, service: string): Promise<void>;
  revokeUserService(email: string, service: string): Promise<void>;
  getUserPaidStatus(email: string, service?: string): Promise<{ isPaid: boolean; paidServices: string[] }>;
  upsertUser(user: Omit<UserRecord, "createdAt" | "lastSeen">): Promise<void>;
  getUserByEmail(email: string): Promise<UserRecord | null>;
  getAllUsers(): Promise<UserRecord[]>;
  getAllPayments(): Promise<PaymentRecord[]>;
  deletePayment(id: string): Promise<void>;
  getAllRequests(): Promise<ServiceRequest[]>;
  saveServiceRequest(req: Omit<ServiceRequest, "id" | "createdAt" | "status">): Promise<ServiceRequest>;
  updateRequestStatus(id: string, status: ServiceRequest["status"]): Promise<void>;
  deleteRequest(id: string): Promise<void>;
  saveFeedback(r: Omit<FeedbackRecord, "id" | "createdAt" | "approved">): Promise<FeedbackRecord>;
  getApprovedFeedback(): Promise<FeedbackRecord[]>;
  getAllFeedbackAdmin(): Promise<FeedbackRecord[]>;
  approveFeedback(id: string, approved: boolean): Promise<void>;
  deleteFeedback(id: string): Promise<void>;
  saveStory(r: Omit<StoryRecord, "id" | "createdAt">): Promise<StoryRecord>;
  getAllStories(): Promise<StoryRecord[]>;
  deleteStory(id: string): Promise<void>;
  updateStory(id: string, updates: Partial<Omit<StoryRecord, "id" | "createdAt">>): Promise<void>;
  saveBlog(r: Omit<BlogRecord, "id" | "createdAt" | "updatedAt">): Promise<BlogRecord>;
  updateBlog(id: string, updates: Partial<Omit<BlogRecord, "id" | "createdAt">>): Promise<void>;
  getPublishedBlogs(): Promise<BlogRecord[]>;
  getAllBlogsAdmin(): Promise<BlogRecord[]>;
  getBlogBySlug(slug: string): Promise<BlogRecord | null>;
  deleteBlog(id: string): Promise<void>;
  deleteUser(email: string): Promise<void>;
  // Orders (manual CRM)
  createOrder(r: Omit<OrderRecord, "id" | "createdAt" | "updatedAt">): Promise<OrderRecord>;
  updateOrder(id: string, updates: Partial<Omit<OrderRecord, "id" | "createdAt">>): Promise<void>;
  getAllOrders(): Promise<OrderRecord[]>;
  deleteOrder(id: string): Promise<void>;
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Seed data (fallback only when no persisted file exists) ──────────────────

const SEED_STORIES: StoryRecord[] = [
  { id: "seed_1", name: "Priya Sharma", role: "Software Engineer · TCS → Flipkart", result: "3x salary hike in 6 weeks", story: "I was stuck at TCS for 2 years with barely any recruiter interest on LinkedIn. After Shyam Pro Services rewrote my headline and about section, I started getting 5 InMails a week. Landed at Flipkart in 6 weeks with a 3x salary jump!", imageUrl: "", createdAt: "2025-03-10T10:00:00.000Z" },
  { id: "seed_2", name: "Rahul Verma", role: "Data Analyst · Freshers", result: "First job offer in 3 weeks", story: "As a fresher with no industry contacts, I was sending 50 applications a week and hearing nothing. The ATS Scanner showed my resume was scoring 23/100. After fixing the keywords and formatting, I got 4 interview calls in the first week and landed my first job!", imageUrl: "", createdAt: "2025-04-05T09:00:00.000Z" },
  { id: "seed_3", name: "Anjali Mehta", role: "Product Manager · Mid-career switch", result: "Switched from engineering to PM", story: "I had been trying to break into Product Management for 18 months. Career Counseling helped me reframe my entire engineering experience as product thinking. Got offers from 2 startups within 2 months of the session!", imageUrl: "", createdAt: "2025-05-01T11:00:00.000Z" },
  { id: "seed_4", name: "Vikram Nair", role: "DevOps Engineer · Pune", result: "40% salary increase, remote role", story: "My Naukri profile was outdated and my resume was getting auto-rejected. Shyam Pro Services's ATS optimization and Naukri profile rewrite transformed my job search. Went from zero callbacks to 6 interviews in 2 weeks. Now fully remote at 40% higher CTC!", imageUrl: "", createdAt: "2025-05-20T14:00:00.000Z" },
  { id: "seed_5", name: "Sneha Iyer", role: "UX Designer · Freelancer → Full-time", result: "Portfolio landed 3 client leads", story: "I had skills but no way to showcase them. The portfolio website Shyam Pro Services built for me was stunning — clients actually message me through it now. Within a month I converted 3 freelance inquiries into retainer contracts.", imageUrl: "", createdAt: "2025-06-02T08:00:00.000Z" },
  { id: "seed_6", name: "Arjun Kapur", role: "MBA Graduate · Marketing", result: "Dream company, 2x package", story: "I was applying to marketing roles for 4 months post-MBA with no luck. The LinkedIn Optimizer completely rewrote my about section and experience bullets — suddenly recruiters were reaching out. Got placed at my dream FMCG company at 2x my previous offer!", imageUrl: "", createdAt: "2025-06-08T10:00:00.000Z" },
];

const SEED_BLOGS: BlogRecord[] = [
  {
    id: "blog_seed_1", title: "How to Optimize Your LinkedIn Profile in 2025", slug: "optimize-linkedin-profile-2025",
    excerpt: "A step-by-step guide to writing a LinkedIn headline, about section, and experience bullets that get you 3x more recruiter messages.",
    content: `# Why Your LinkedIn Profile Isn't Getting Results

Most professionals set up their LinkedIn profile once and forget it. The result? A generic, keyword-poor profile that recruiters scroll past in seconds.

In 2025, LinkedIn's algorithm has become significantly more sophisticated. Recruiters use Boolean search strings, skill filters, and location targeting. If your profile isn't optimised for these, you're invisible.

## The 5 Sections That Matter Most

### 1. Your Headline
Your headline is your billboard. It appears in every search result, every notification, and every connection request. Most people write their job title. That's a mistake.

Instead, pack it with keywords your target recruiters are searching. A strong headline looks like:

**"Full-Stack Developer | React · Node.js · AWS | Building scalable web apps | Open to Senior roles in Bangalore"**

### 2. The About Section
Think of your About section as a cover letter that works 24/7. Open with a strong hook — not "I am a software engineer with 5 years of experience." That's how everyone starts.

Start with your biggest career win: "In the past 2 years, I've shipped 4 products used by 500K+ users across India."

### 3. Experience Bullets
Every bullet in your experience section should answer: What did you do? How? What was the result?

- ❌ "Responsible for backend development"
- ✓ "Led backend redesign for payment module, reducing transaction failure rate by 43%"

### 4. Skills Section
LinkedIn ranks profiles with endorsed skills higher in recruiter searches. Your top 10 skills should match the keywords in your target job descriptions exactly.

### 5. Recommendations
Even 2-3 strong recommendations from managers significantly improve recruiter trust. Don't skip this.

## Quick Action Plan

- Rewrite your headline today (use our LinkedIn Optimizer — free for the first 5 sections)
- Update your About section with a hook + achievement + CTA
- Add 5 missing keywords to your skills section
- Request one recommendation from your most recent manager

The ROI on 2 hours of LinkedIn optimization can be life-changing.`,
    coverImage: "", tags: ["LinkedIn", "Career", "Job Search"], author: "Shyam Pro Services Team",
    published: true, createdAt: "2025-05-15T10:00:00.000Z", updatedAt: "2025-05-15T10:00:00.000Z",
  },
  {
    id: "blog_seed_2", title: "Top 10 ATS Tips to Beat Resume Filters in 2025", slug: "ats-tips-beat-resume-filters-2025",
    excerpt: "98% of large employers use ATS to filter resumes before a human reads them. Here's exactly how to pass the filter and reach the hiring manager.",
    content: `# What Is ATS and Why It's Rejecting Your Resume

Applicant Tracking Systems (ATS) are software tools used by 98% of Fortune 500 companies and most large Indian employers to filter resumes before a human ever reads them.

If your resume doesn't pass the ATS filter, it goes straight to the trash — regardless of how qualified you are.

## The 10 Rules to Beat ATS

### 1. Use Standard Section Headers
ATS looks for specific keywords to identify sections. Use: "Work Experience", "Education", "Skills" — not creative alternatives like "My Journey" or "What I've Done."

### 2. Match Keywords from the Job Description
Copy-paste exact keywords from the job description into your resume. If the JD says "project management" and you've written "managing projects", ATS won't match it.

### 3. Avoid Tables and Columns
Most ATS systems read resumes linearly. Tables and columns confuse them and your data gets scrambled. Use a single-column layout.

### 4. Use Standard Fonts
Stick to Arial, Calibri, Times New Roman, or Georgia. Fancy fonts may not parse correctly.

### 5. No Headers and Footers for Critical Info
ATS often skips headers and footers. Never put your contact info there.

### 6. Use Both Long Form and Abbreviations
Write "Search Engine Optimization (SEO)" — not just "SEO". ATS might search for either form.

### 7. Quantify Everything
Numbers stand out to both ATS and human reviewers: "Increased sales by 34%", "Managed team of 12", "Reduced cost by ₹2L/month."

### 8. Save as .docx or ATS-friendly PDF
Submit .docx when possible. If PDF is required, save it as "Print to PDF" not "Export to PDF" from design tools.

### 9. Include a Skills Section
A dedicated skills section near the top gives ATS a quick match zone. List 12-15 relevant skills.

### 10. Tailor for Every Application
One-size-fits-all resumes are dead. Spend 10 minutes customising the keywords for each role. Our ATS Scanner makes this easy.

## How to Check Your ATS Score

Use our free ATS Resume Scanner at Shyam Pro Services. Upload your resume, paste the job description, and get an instant score with specific fix recommendations. The first scan is completely free.`,
    coverImage: "", tags: ["ATS", "Resume", "Job Search"], author: "Shyam Pro Services Team",
    published: true, createdAt: "2025-05-28T10:00:00.000Z", updatedAt: "2025-05-28T10:00:00.000Z",
  },
  {
    id: "blog_seed_3", title: "Naukri vs LinkedIn: Which Platform Gets You More Interviews?", slug: "naukri-vs-linkedin-which-gets-more-interviews",
    excerpt: "A data-driven comparison of Naukri and LinkedIn for Indian job seekers — and how to optimise both for maximum recruiter visibility.",
    content: `# Naukri or LinkedIn? You Need Both

If you're a job seeker in India, you've probably wondered: should I focus on Naukri or LinkedIn? The answer is: both — but for different reasons.

## What Naukri Does Better

**Volume of Indian job listings**: Naukri has 5x more Indian job listings than LinkedIn. If you're targeting domestic roles, Naukri is where recruiters post first.

**Recruiter outreach**: Indian corporate and IT recruiters actively search Naukri daily. If your profile is optimised, expect 3-5 InMails per week from relevant companies.

**Salary transparency**: Naukri's CTC fields mean recruiters pre-qualify you on salary before reaching out — fewer wasted conversations.

**Fresher-friendly**: Naukri has dedicated fresher sections, campus drives, and entry-level filters that LinkedIn lacks.

## What LinkedIn Does Better

**International and MNC visibility**: If you're targeting MNCs, product companies, or international roles, LinkedIn is the primary platform.

**Personal branding**: LinkedIn allows you to publish posts, articles, and build a following. Thought leadership builds long-term career equity.

**Referral network**: LinkedIn's connection graph makes warm introductions possible. Referrals get hired 4x faster than cold applicants.

**Profile richness**: LinkedIn allows recommendations, featured sections, skill endorsements, and activity signals that Naukri doesn't.

## Our Recommendation

**For active job search (next 3 months)**: Optimize Naukri first. Update your resume headline, profile summary, key skills, and CTC. Then optimize LinkedIn.

**For long-term career growth**: Invest in LinkedIn content and networking consistently.

## The Shyam Pro Services Solution

We offer dedicated AI optimizers for both platforms:
- **LinkedIn Optimizer**: 15-section AI analysis, ₹200 one-time
- **Naukri Optimizer**: 13-section AI analysis, ₹200 one-time

Both have free sections so you can see the quality before paying. Start with whichever platform is more urgent for your job search.`,
    coverImage: "", tags: ["Naukri", "LinkedIn", "Career", "India"], author: "Shyam Pro Services Team",
    published: true, createdAt: "2025-06-01T10:00:00.000Z", updatedAt: "2025-06-01T10:00:00.000Z",
  },
];

// ── MongoDB implementation ────────────────────────────────────────────────────

class MongoStore implements DataStore {
  private indexed = false;

  private async db() {
    const client = await getMongoClient()!;
    const db = client.db(DB_NAME);
    if (!this.indexed) {
      this.indexed = true;
      await Promise.all([
        db.collection("sessions").createIndex({ paidUntil: 1 }, { expireAfterSeconds: 0 }),
        db.collection("users").createIndex({ email: 1 }, { unique: true }),
        db.collection("requests").createIndex({ id: 1 }, { unique: true }),
        db.collection("payments").createIndex({ id: 1 }, { unique: true }),
        db.collection("feedback").createIndex({ id: 1 }, { unique: true }),
        db.collection("stories").createIndex({ id: 1 }, { unique: true }),
        db.collection("blogs").createIndex({ id: 1 }, { unique: true }),
        db.collection("blogs").createIndex({ slug: 1 }, { unique: true }),
        db.collection("orders").createIndex({ id: 1 }, { unique: true }),
      ]).catch(() => {});
    }
    return db;
  }

  async markUserPaid(email: string, service: string, razorpayId?: string, amount = 200): Promise<void> {
    const db = await this.db();
    await db.collection("sessions").updateOne(
      { email },
      { $addToSet: { paidServices: service }, $set: { email } },
      { upsert: true }
    );
    await db.collection("payments").insertOne({ id: newId("pay"), email, service, amount, razorpayId: razorpayId ?? "", createdAt: new Date().toISOString() });
  }

  async grantServiceAccess(email: string, service: string): Promise<void> {
    const db = await this.db();
    await db.collection("sessions").updateOne(
      { email },
      { $addToSet: { paidServices: service }, $set: { email } },
      { upsert: true }
    );
    // No payment record — admin is granting free access
  }

  async revokeUserService(email: string, service: string): Promise<void> {
    const db = await this.db();
    // Remove specific service from paidServices array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.collection("sessions").updateOne({ email }, { $pull: { paidServices: service } as any });
  }

  async getUserPaidStatus(email: string, service?: string): Promise<{ isPaid: boolean; paidServices: string[] }> {
    const db = await this.db();
    const doc = await db.collection("sessions").findOne({ email });
    const paidServices: string[] = doc?.paidServices ?? [];
    const isPaid = service ? paidServices.includes(service) : paidServices.length > 0;
    return { isPaid, paidServices };
  }

  async upsertUser(user: Omit<UserRecord, "createdAt" | "lastSeen">): Promise<void> {
    const db = await this.db();
    const now = new Date().toISOString();
    const setFields: Partial<UserRecord> = { email: user.email, name: user.name, lastSeen: now };
    if (user.image) setFields.image = user.image;
    if (user.phone) setFields.phone = user.phone;
    if (user.passwordHash) setFields.passwordHash = user.passwordHash;
    await db.collection("users").updateOne(
      { email: user.email },
      { $set: setFields, $setOnInsert: { createdAt: now } },
      { upsert: true }
    );
  }

  async getUserByEmail(email: string): Promise<UserRecord | null> {
    const db = await this.db();
    return db.collection<UserRecord>("users").findOne({ email }, { projection: { _id: 0 } }) ?? null;
  }

  async getAllUsers(): Promise<UserRecord[]> {
    const db = await this.db();
    return db.collection<UserRecord>("users").find({}, { projection: { _id: 0 } }).sort({ lastSeen: -1 }).toArray();
  }

  async deleteUser(email: string): Promise<void> {
    const db = await this.db();
    await Promise.all([
      db.collection("users").deleteOne({ email }),
      db.collection("sessions").deleteOne({ email }),
    ]);
  }

  async getAllPayments(): Promise<PaymentRecord[]> {
    const db = await this.db();
    return db.collection<PaymentRecord>("payments").find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  }

  async deletePayment(id: string): Promise<void> {
    const db = await this.db();
    await db.collection("payments").deleteOne({ id });
  }

  async getAllRequests(): Promise<ServiceRequest[]> {
    const db = await this.db();
    return db.collection<ServiceRequest>("requests").find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  }

  async saveServiceRequest(req: Omit<ServiceRequest, "id" | "createdAt" | "status">): Promise<ServiceRequest> {
    const db = await this.db();
    const record: ServiceRequest = { ...req, id: newId("req"), createdAt: new Date().toISOString(), status: "new" };
    await db.collection("requests").insertOne({ ...record });
    return record;
  }

  async updateRequestStatus(id: string, status: ServiceRequest["status"]): Promise<void> {
    const db = await this.db();
    await db.collection("requests").updateOne({ id }, { $set: { status } });
  }

  async deleteRequest(id: string): Promise<void> {
    const db = await this.db();
    await db.collection("requests").deleteOne({ id });
  }

  async saveFeedback(r: Omit<FeedbackRecord, "id" | "createdAt" | "approved">): Promise<FeedbackRecord> {
    const db = await this.db();
    const record: FeedbackRecord = { ...r, id: newId("fb"), createdAt: new Date().toISOString(), approved: false };
    await db.collection("feedback").insertOne({ ...record });
    return record;
  }

  async getApprovedFeedback(): Promise<FeedbackRecord[]> {
    const db = await this.db();
    return db.collection<FeedbackRecord>("feedback").find({ approved: true }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  }

  async getAllFeedbackAdmin(): Promise<FeedbackRecord[]> {
    const db = await this.db();
    return db.collection<FeedbackRecord>("feedback").find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  }

  async approveFeedback(id: string, approved: boolean): Promise<void> {
    const db = await this.db();
    await db.collection("feedback").updateOne({ id }, { $set: { approved } });
  }

  async deleteFeedback(id: string): Promise<void> {
    const db = await this.db();
    await db.collection("feedback").deleteOne({ id });
  }

  async saveStory(r: Omit<StoryRecord, "id" | "createdAt">): Promise<StoryRecord> {
    const db = await this.db();
    const record: StoryRecord = { ...r, id: newId("st"), createdAt: new Date().toISOString() };
    await db.collection("stories").insertOne({ ...record });
    return record;
  }

  async getAllStories(): Promise<StoryRecord[]> {
    const db = await this.db();
    return db.collection<StoryRecord>("stories").find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  }

  async deleteStory(id: string): Promise<void> {
    const db = await this.db();
    await db.collection("stories").deleteOne({ id });
  }

  async updateStory(id: string, updates: Partial<Omit<StoryRecord, "id" | "createdAt">>): Promise<void> {
    const db = await this.db();
    await db.collection("stories").updateOne({ id }, { $set: updates });
  }

  async saveBlog(r: Omit<BlogRecord, "id" | "createdAt" | "updatedAt">): Promise<BlogRecord> {
    const db = await this.db();
    const now = new Date().toISOString();
    const record: BlogRecord = { ...r, id: newId("blg"), createdAt: now, updatedAt: now };
    await db.collection("blogs").insertOne({ ...record });
    return record;
  }

  async updateBlog(id: string, updates: Partial<Omit<BlogRecord, "id" | "createdAt">>): Promise<void> {
    const db = await this.db();
    await db.collection("blogs").updateOne({ id }, { $set: { ...updates, updatedAt: new Date().toISOString() } });
  }

  async getPublishedBlogs(): Promise<BlogRecord[]> {
    const db = await this.db();
    return db.collection<BlogRecord>("blogs").find({ published: true }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  }

  async getAllBlogsAdmin(): Promise<BlogRecord[]> {
    const db = await this.db();
    return db.collection<BlogRecord>("blogs").find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  }

  async getBlogBySlug(slug: string): Promise<BlogRecord | null> {
    const db = await this.db();
    const doc = await db.collection<BlogRecord>("blogs").findOne({ slug, published: true }, { projection: { _id: 0 } });
    return doc ?? null;
  }

  async deleteBlog(id: string): Promise<void> {
    const db = await this.db();
    await db.collection("blogs").deleteOne({ id });
  }

  async createOrder(r: Omit<OrderRecord, "id" | "createdAt" | "updatedAt">): Promise<OrderRecord> {
    const db = await this.db();
    const now = new Date().toISOString();
    const record: OrderRecord = { ...r, id: newId("ord"), createdAt: now, updatedAt: now };
    await db.collection("orders").insertOne({ ...record });
    return record;
  }

  async updateOrder(id: string, updates: Partial<Omit<OrderRecord, "id" | "createdAt">>): Promise<void> {
    const db = await this.db();
    await db.collection("orders").updateOne({ id }, { $set: { ...updates, updatedAt: new Date().toISOString() } });
  }

  async getAllOrders(): Promise<OrderRecord[]> {
    const db = await this.db();
    return db.collection<OrderRecord>("orders").find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  }

  async deleteOrder(id: string): Promise<void> {
    const db = await this.db();
    await db.collection("orders").deleteOne({ id });
  }
}

// ── In-memory + file-persisted implementation ─────────────────────────────────

class MemoryStore implements DataStore {
  private sessions = new Map<string, { paidServices: string[] }>();
  private users = new Map<string, UserRecord>();
  private payments: PaymentRecord[] = [];
  private requests: ServiceRequest[] = [];
  private feedback: FeedbackRecord[];
  private stories: StoryRecord[];
  private blogs: BlogRecord[];
  private orders: OrderRecord[];

  constructor() {
    // Load persisted data; fall back to seeds only when no file exists yet
    this.stories = readData<StoryRecord[]>("stories.json") ?? [...SEED_STORIES];
    this.blogs   = readData<BlogRecord[]>("blogs.json")   ?? [...SEED_BLOGS];
    this.feedback = readData<FeedbackRecord[]>("feedback.json") ?? [];
    this.orders   = readData<OrderRecord[]>("orders.json") ?? [];
  }

  async markUserPaid(email: string, service: string, razorpayId?: string, amount = 200): Promise<void> {
    const existing = this.sessions.get(email);
    const paidServices = new Set(existing?.paidServices ?? []);
    paidServices.add(service);
    this.sessions.set(email, { paidServices: [...paidServices] });
    this.payments.unshift({ id: newId("pay"), email, service, amount, razorpayId: razorpayId ?? "", createdAt: new Date().toISOString() });
  }

  async grantServiceAccess(email: string, service: string): Promise<void> {
    const existing = this.sessions.get(email);
    const paidServices = new Set(existing?.paidServices ?? []);
    paidServices.add(service);
    this.sessions.set(email, { paidServices: [...paidServices] });
    // No payment record — admin is granting free access
  }

  async revokeUserService(email: string, service: string): Promise<void> {
    const s = this.sessions.get(email);
    if (!s) return;
    this.sessions.set(email, { paidServices: s.paidServices.filter((p) => p !== service) });
  }

  async getUserPaidStatus(email: string, service?: string): Promise<{ isPaid: boolean; paidServices: string[] }> {
    const s = this.sessions.get(email);
    const paidServices = s?.paidServices ?? [];
    const isPaid = service ? paidServices.includes(service) : paidServices.length > 0;
    return { isPaid, paidServices };
  }

  async upsertUser(user: Omit<UserRecord, "createdAt" | "lastSeen">): Promise<void> {
    const now = new Date().toISOString();
    const existing = this.users.get(user.email);
    this.users.set(user.email, { ...existing, ...user, createdAt: existing?.createdAt ?? now, lastSeen: now });
  }

  async getUserByEmail(email: string): Promise<UserRecord | null> {
    return this.users.get(email) ?? null;
  }

  async getAllUsers(): Promise<UserRecord[]> {
    return [...this.users.values()].sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
  }

  async deleteUser(email: string): Promise<void> {
    this.users.delete(email);
    this.sessions.delete(email);
  }

  async getAllPayments(): Promise<PaymentRecord[]> { return this.payments; }
  async deletePayment(id: string): Promise<void> { this.payments = this.payments.filter((p) => p.id !== id); }
  async getAllRequests(): Promise<ServiceRequest[]> { return this.requests; }
  async deleteRequest(id: string): Promise<void> { this.requests = this.requests.filter((r) => r.id !== id); }

  async saveServiceRequest(req: Omit<ServiceRequest, "id" | "createdAt" | "status">): Promise<ServiceRequest> {
    const record: ServiceRequest = { ...req, id: newId("req"), createdAt: new Date().toISOString(), status: "new" };
    this.requests.unshift(record);
    return record;
  }

  async updateRequestStatus(id: string, status: ServiceRequest["status"]): Promise<void> {
    const r = this.requests.find((x) => x.id === id);
    if (r) r.status = status;
  }

  async saveFeedback(r: Omit<FeedbackRecord, "id" | "createdAt" | "approved">): Promise<FeedbackRecord> {
    const record: FeedbackRecord = { ...r, id: newId("fb"), createdAt: new Date().toISOString(), approved: false };
    this.feedback.unshift(record);
    writeData("feedback.json", this.feedback);
    return record;
  }

  async getApprovedFeedback(): Promise<FeedbackRecord[]> {
    return this.feedback.filter((f) => f.approved);
  }

  async getAllFeedbackAdmin(): Promise<FeedbackRecord[]> { return this.feedback; }

  async approveFeedback(id: string, approved: boolean): Promise<void> {
    const f = this.feedback.find((x) => x.id === id);
    if (f) { f.approved = approved; writeData("feedback.json", this.feedback); }
  }

  async deleteFeedback(id: string): Promise<void> {
    this.feedback = this.feedback.filter((f) => f.id !== id);
    writeData("feedback.json", this.feedback);
  }

  async saveStory(r: Omit<StoryRecord, "id" | "createdAt">): Promise<StoryRecord> {
    const record: StoryRecord = { ...r, id: newId("st"), createdAt: new Date().toISOString() };
    this.stories.unshift(record);
    writeData("stories.json", this.stories);
    return record;
  }

  async getAllStories(): Promise<StoryRecord[]> { return this.stories; }

  async deleteStory(id: string): Promise<void> {
    this.stories = this.stories.filter((s) => s.id !== id);
    writeData("stories.json", this.stories);
  }

  async updateStory(id: string, updates: Partial<Omit<StoryRecord, "id" | "createdAt">>): Promise<void> {
    const s = this.stories.find((x) => x.id === id);
    if (s) { Object.assign(s, updates); writeData("stories.json", this.stories); }
  }

  async saveBlog(r: Omit<BlogRecord, "id" | "createdAt" | "updatedAt">): Promise<BlogRecord> {
    const now = new Date().toISOString();
    const record: BlogRecord = { ...r, id: newId("blg"), createdAt: now, updatedAt: now };
    this.blogs.unshift(record);
    writeData("blogs.json", this.blogs);
    return record;
  }

  async updateBlog(id: string, updates: Partial<Omit<BlogRecord, "id" | "createdAt">>): Promise<void> {
    const b = this.blogs.find((x) => x.id === id);
    if (b) { Object.assign(b, updates, { updatedAt: new Date().toISOString() }); writeData("blogs.json", this.blogs); }
  }

  async getPublishedBlogs(): Promise<BlogRecord[]> {
    return this.blogs.filter((b) => b.published).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getAllBlogsAdmin(): Promise<BlogRecord[]> {
    return this.blogs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getBlogBySlug(slug: string): Promise<BlogRecord | null> {
    return this.blogs.find((b) => b.slug === slug && b.published) ?? null;
  }

  async deleteBlog(id: string): Promise<void> {
    this.blogs = this.blogs.filter((b) => b.id !== id);
    writeData("blogs.json", this.blogs);
  }

  async createOrder(r: Omit<OrderRecord, "id" | "createdAt" | "updatedAt">): Promise<OrderRecord> {
    const now = new Date().toISOString();
    const record: OrderRecord = { ...r, id: newId("ord"), createdAt: now, updatedAt: now };
    this.orders.unshift(record);
    writeData("orders.json", this.orders);
    return record;
  }

  async updateOrder(id: string, updates: Partial<Omit<OrderRecord, "id" | "createdAt">>): Promise<void> {
    const o = this.orders.find((x) => x.id === id);
    if (o) { Object.assign(o, updates, { updatedAt: new Date().toISOString() }); writeData("orders.json", this.orders); }
  }

  async getAllOrders(): Promise<OrderRecord[]> {
    return [...this.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async deleteOrder(id: string): Promise<void> {
    this.orders = this.orders.filter((o) => o.id !== id);
    writeData("orders.json", this.orders);
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

const g = globalThis as unknown as { __memStore?: MemoryStore };
const store: DataStore = hasMongo ? new MongoStore() : (g.__memStore ??= new MemoryStore());

export const isPersistent = hasMongo;

// ── Public API ────────────────────────────────────────────────────────────────

export const markUserPaid = (email: string, service: string = "linkedin", razorpayId?: string, amount?: number) => store.markUserPaid(email, service, razorpayId, amount);
export const grantServiceAccess = (email: string, service: string) => store.grantServiceAccess(email, service);
export const getUserPaidStatus = (email: string, service?: string) => store.getUserPaidStatus(email, service);
export const revokeUserService = (email: string, service: string) => store.revokeUserService(email, service);
export const upsertUser = (user: Omit<UserRecord, "createdAt" | "lastSeen">) => store.upsertUser(user);
export const getUserByEmail = (email: string) => store.getUserByEmail(email);
export const getAllUsers = () => store.getAllUsers();
export const deleteUser = (email: string) => store.deleteUser(email);
export const getAllPayments = () => store.getAllPayments();
export const deletePayment = (id: string) => store.deletePayment(id);
export const getAllRequests = () => store.getAllRequests();
export const saveServiceRequest = (req: Omit<ServiceRequest, "id" | "createdAt" | "status">) => store.saveServiceRequest(req);
export const updateRequestStatus = (id: string, status: ServiceRequest["status"]) => store.updateRequestStatus(id, status);
export const deleteRequest = (id: string) => store.deleteRequest(id);
export const saveFeedback = (r: Omit<FeedbackRecord, "id" | "createdAt" | "approved">) => store.saveFeedback(r);
export const getApprovedFeedback = () => store.getApprovedFeedback();
export const getAllFeedbackAdmin = () => store.getAllFeedbackAdmin();
export const approveFeedback = (id: string, approved: boolean) => store.approveFeedback(id, approved);
export const deleteFeedback = (id: string) => store.deleteFeedback(id);
export const saveStory = (r: Omit<StoryRecord, "id" | "createdAt">) => store.saveStory(r);
export const getAllStories = () => store.getAllStories();
export const deleteStory = (id: string) => store.deleteStory(id);
export const updateStory = (id: string, updates: Partial<Omit<StoryRecord, "id" | "createdAt">>) => store.updateStory(id, updates);
export const saveBlog = (r: Omit<BlogRecord, "id" | "createdAt" | "updatedAt">) => store.saveBlog(r);
export const updateBlog = (id: string, updates: Partial<Omit<BlogRecord, "id" | "createdAt">>) => store.updateBlog(id, updates);
export const getPublishedBlogs = () => store.getPublishedBlogs();
export const getAllBlogsAdmin = () => store.getAllBlogsAdmin();
export const getBlogBySlug = (slug: string) => store.getBlogBySlug(slug);
export const deleteBlog = (id: string) => store.deleteBlog(id);
export const createOrder = (r: Omit<OrderRecord, "id" | "createdAt" | "updatedAt">) => store.createOrder(r);
export const updateOrder = (id: string, updates: Partial<Omit<OrderRecord, "id" | "createdAt">>) => store.updateOrder(id, updates);
export const getAllOrders = () => store.getAllOrders();
export const deleteOrder = (id: string) => store.deleteOrder(id);
