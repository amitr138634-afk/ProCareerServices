"use client";

import { useState, useEffect, useCallback } from "react";

interface Stats { totalUsers: number; paidUsers: number; totalRevenue: number; totalRequests: number; newRequests: number; }
interface User { email: string; name: string; image?: string; phone?: string; createdAt: string; lastSeen: string; isPaid: boolean; paidServices?: string[]; }
interface Payment { id: string; email: string; service: string; amount: number; razorpayId?: string; createdAt: string; }
interface ServiceRequest { id: string; name: string; email: string; phone?: string; serviceType: string; profileType?: string; message: string; hasResume: boolean; createdAt: string; status: "new" | "contacted" | "completed"; }
interface FeedbackItem { id: string; name: string; email: string; service: string; rating: number; message: string; createdAt: string; approved: boolean; }
interface StoryItem { id: string; name: string; role: string; result: string; story: string; imageUrl: string; createdAt: string; }
interface BlogItem { id: string; title: string; slug: string; excerpt: string; content: string; coverImage: string; tags: string[]; author: string; published: boolean; createdAt: string; updatedAt: string; }

type Tab = "overview" | "users" | "payments" | "email" | "requests" | "stories" | "feedback" | "blogs";
type OrderService = "linkedin" | "naukri" | "ats" | "resume" | "portfolio" | "content";
type OrderStatus = "new" | "in_progress" | "review" | "done" | "cancelled";
type PaymentStatus = "pending" | "paid";
interface Order {
  id: string; customerName: string; customerEmail: string; customerPhone?: string;
  service: OrderService; orderStatus: OrderStatus; paymentStatus: PaymentStatus;
  paymentAmount: number; handledBy: string; notes?: string; orderDate: string; createdAt: string; updatedAt: string;
}

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const STATUS_COLORS = {
  new: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  contacted: "bg-brand-blue/15 text-brand-blue border-brand-blue/30",
  completed: "bg-brand-teal/15 text-brand-teal border-brand-teal/30",
};

export default function AdminPage() {
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<{ stats: Stats; users: User[]; payments: Payment[]; requests: ServiceRequest[] } | null>(null);
  const [savedPw, setSavedPw] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [storyForm, setStoryForm] = useState({ name: "", role: "", result: "", story: "", imageUrl: "" });
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storySubmitting, setStorySubmitting] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [blogForm, setBlogForm] = useState({ title: "", slug: "", excerpt: "", content: "", coverImage: "", tags: "", author: "ProCareerLaunchpad Team", published: false });
  const [blogSubmitting, setBlogSubmitting] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [orderForm, setOrderForm] = useState<Omit<Order, "id" | "createdAt" | "updatedAt">>({
    customerName: "", customerEmail: "", customerPhone: "", service: "linkedin",
    orderStatus: "new", paymentStatus: "pending", paymentAmount: 200, handledBy: "", notes: "", orderDate: new Date().toISOString().split("T")[0],
  });
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderFilter, setOrderFilter] = useState<"all" | OrderService | OrderStatus>("all");
  const [custSearch, setCustSearch] = useState("");
  const [custFilterService, setCustFilterService] = useState<"all" | OrderService>("all");
  const [custFilterPayment, setCustFilterPayment] = useState<"all" | "paid" | "unpaid">("all");
  const [custSort, setCustSort] = useState<"newest" | "oldest" | "lastseen" | "revenue">("newest");
  const [paySearch, setPaySearch] = useState("");
  const [payFilterSvc, setPayFilterSvc] = useState("all");
  const [paySort, setPaySort] = useState<"newest" | "oldest" | "amount_desc" | "amount_asc">("newest");
  const [payGroup, setPayGroup] = useState(false);
  const [orderSearchQ, setOrderSearchQ] = useState("");
  const [orderFilterStatus, setOrderFilterStatus] = useState<"all" | OrderStatus>("all");
  const [orderFilterService, setOrderFilterService] = useState<"all" | OrderService>("all");
  const [orderFilterHandler, setOrderFilterHandler] = useState("all");
  const [orderFilterPayment, setOrderFilterPayment] = useState<"all" | PaymentStatus>("all");
  const [accessTogglingKey, setAccessTogglingKey] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserForm, setAddUserForm] = useState({ name: "", email: "", phone: "", services: [] as string[] });
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState("");
  const [emailForm, setEmailForm] = useState({ subject: "", body: "", filter: "all" as "all" | "paid" | "linkedin" | "naukri" | "ats" | "custom" | "selected", customEmails: "" });
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState("");
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  // Leads
  const [leadForm, setLeadForm] = useState({ name: "", email: "", phone: "" });
  const [leadAdding, setLeadAdding] = useState(false);
  const [leadResult, setLeadResult] = useState("");
  const [leadImportLoading, setLeadImportLoading] = useState(false);
  const [leadImportResult, setLeadImportResult] = useState("");
  // Checkbox selection & attachment
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [attachedFile, setAttachedFile] = useState<{ name: string; base64: string; mimeType: string } | null>(null);

  const toggleUserAccess = async (email: string, service: string, grant: boolean) => {
    const key = `${email}:${service}`;
    setAccessTogglingKey(key);
    try {
      await fetch("/api/admin/user-access", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
        body: JSON.stringify({ email, service, grant }),
      });
      // Update local state immediately
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.map((u) => {
            if (u.email !== email) return u;
            const current = new Set(u.paidServices ?? []);
            if (grant) current.add(service); else current.delete(service);
            const paidServices = [...current];
            return { ...u, paidServices, isPaid: paidServices.length > 0 };
          }),
        };
      });
    } finally {
      setAccessTogglingKey(null);
    }
  };

  const addUserManually = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError(""); setAddUserLoading(true);
    try {
      const res = await fetch("/api/admin/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
        body: JSON.stringify(addUserForm),
      });
      const json = await res.json();
      if (!res.ok) { setAddUserError(json.error); return; }
      setShowAddUser(false);
      setAddUserForm({ name: "", email: "", phone: "", services: [] });
      await fetchData(savedPw, savedEmail);
    } catch { setAddUserError("Failed to add user."); }
    finally { setAddUserLoading(false); }
  };

  const importCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true); setImportResult("");
    const text = await file.text();
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
    const nameIdx = header.findIndex((h) => h.includes("name"));
    const emailIdx = header.findIndex((h) => h.includes("email"));
    const phoneIdx = header.findIndex((h) => h.includes("phone") || h.includes("mobile"));
    if (emailIdx === -1) { setImportResult("CSV must have an 'email' column."); setImportLoading(false); return; }
    let added = 0, skipped = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const email = cols[emailIdx];
      if (!email || !email.includes("@")) { skipped++; continue; }
      const name = nameIdx >= 0 ? cols[nameIdx] : email.split("@")[0];
      const phone = phoneIdx >= 0 ? cols[phoneIdx] : undefined;
      await fetch("/api/admin/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
        body: JSON.stringify({ name, email, phone }),
      });
      added++;
    }
    setImportResult(`Imported ${added} users${skipped ? `, skipped ${skipped} invalid rows` : ""}.`);
    setImportLoading(false);
    e.target.value = "";
    await fetchData(savedPw, savedEmail);
  };

  const addLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.email) return;
    setLeadAdding(true); setLeadResult("");
    try {
      const res = await fetch("/api/admin/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
        body: JSON.stringify({ name: leadForm.name || leadForm.email.split("@")[0], email: leadForm.email, phone: leadForm.phone, services: [] }),
      });
      if (res.ok) { setLeadResult("✓ Lead added!"); setLeadForm({ name: "", email: "", phone: "" }); await fetchData(savedPw, savedEmail); }
      else { const j = await res.json(); setLeadResult(j.error || "Failed"); }
    } catch { setLeadResult("Error adding lead"); }
    setLeadAdding(false);
  };

  const importLeadsCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setLeadImportLoading(true); setLeadImportResult("");
    const text = await file.text();
    const lines = text.trim().split("\n");
    const header = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
    const emailIdx = header.findIndex(h => h.includes("email"));
    const nameIdx  = header.findIndex(h => h.includes("name"));
    const phoneIdx = header.findIndex(h => h.includes("phone"));
    if (emailIdx === -1) { setLeadImportResult("CSV must have an 'email' column."); setLeadImportLoading(false); return; }
    let added = 0, skipped = 0;
    for (const line of lines.slice(1)) {
      const cols = line.split(",").map(c => c.trim().replace(/"/g, ""));
      const email = cols[emailIdx];
      if (!email || !email.includes("@")) { skipped++; continue; }
      const name  = nameIdx  >= 0 ? cols[nameIdx]  : email.split("@")[0];
      const phone = phoneIdx >= 0 ? cols[phoneIdx] : "";
      try {
        await fetch("/api/admin/add-user", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
          body: JSON.stringify({ name, email, phone, services: [] }),
        });
        added++;
      } catch { skipped++; }
    }
    setLeadImportResult(`✓ Imported ${added} leads${skipped ? `, skipped ${skipped} invalid` : ""}.`);
    setLeadImportLoading(false);
    e.target.value = "";
    await fetchData(savedPw, savedEmail);
  };

  const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setAttachedFile({ name: file.name, base64, mimeType: file.type || "application/octet-stream" });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const toggleSelectEmail = (email: string) => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      next.has(email) ? next.delete(email) : next.add(email);
      return next;
    });
  };

  const selectAll = () => setSelectedEmails(new Set(users.map(u => u.email)));
  const clearAll  = () => setSelectedEmails(new Set());

  const EMAIL_TEMPLATES = [
    {
      label: "Payment Reminder",
      subject: "Complete your payment — {{service}} is waiting for you!",
      body: `<b>Hi there,</b><br/><br/>We noticed you haven't completed your payment for <b>{{service}}</b> yet.<br/><br/>Your ₹200 payment unlocks the full AI analysis — don't miss out!<br/><br/><a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/pay" style="background:#10B981;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Complete Payment →</a><br/><br/>Need help? Just reply to this email.<br/><br/>— ProCareerLaunchpad Team`,
    },
    {
      label: "Resume Delivered",
      subject: "Your Resume is Ready! 🎉",
      body: `<b>Hi there,</b><br/><br/>Great news — your professionally crafted resume is now ready!<br/><br/>Please find it attached to this email. We've tailored it to highlight your strengths and align with your target role.<br/><br/><b>What to do next:</b><br/>• Review the resume carefully<br/>• Reply if you'd like any revisions<br/>• Start applying — you're ready!<br/><br/>Best of luck with your applications!<br/><br/>— ProCareerLaunchpad Team`,
    },
    {
      label: "Follow-up / Check-in",
      subject: "How is your job search going? 👋",
      body: `<b>Hi there,</b><br/><br/>We wanted to check in and see how your job search is going after using our LinkedIn Optimizer!<br/><br/>Have you been getting more profile views or recruiter messages? We'd love to hear your experience.<br/><br/>If you need any further help — ATS resume scanning, career counseling, or portfolio creation — we're just a reply away.<br/><br/><a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}" style="background:#10B981;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Explore Services →</a><br/><br/>— ProCareerLaunchpad Team`,
    },
    {
      label: "Service Complete",
      subject: "Your order is complete ✅",
      body: `<b>Hi there,</b><br/><br/>We're happy to let you know that your service has been completed successfully!<br/><br/>If you have any questions or need revisions, please reply to this email directly.<br/><br/>Thank you for choosing ProCareerLaunchpad. We look forward to supporting your career journey!<br/><br/>— ProCareerLaunchpad Team`,
    },
  ];

  const sendMarketingEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.subject || !emailForm.body) return;
    setEmailSending(true); setEmailResult("");
    let recipients: string[] = [];
    if (emailForm.filter === "all")      recipients = users.map((u) => u.email);
    else if (emailForm.filter === "paid") recipients = users.filter((u) => u.isPaid).map((u) => u.email);
    else if (emailForm.filter === "selected") recipients = Array.from(selectedEmails);
    else if (emailForm.filter === "custom") recipients = emailForm.customEmails.split(/[\n,]/).map((e) => e.trim()).filter((e) => e.includes("@"));
    else recipients = users.filter((u) => u.paidServices?.includes(emailForm.filter)).map((u) => u.email);

    if (recipients.length === 0) { setEmailResult("No matching recipients."); setEmailSending(false); return; }
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
        body: JSON.stringify({ to: recipients, subject: emailForm.subject, body: emailForm.body, attachment: attachedFile }),
      });
      const json = await res.json();
      if (res.ok) setEmailResult(`✓ Sent to ${json.sent} recipients.`);
      else setEmailResult(`Error: ${json.error}`);
    } catch { setEmailResult("Failed to send."); }
    finally { setEmailSending(false); }
  };

  const sendEmailToUser = async (email: string) => {
    const subject = prompt("Subject:");
    if (!subject) return;
    const body = prompt("Message (plain text, will be wrapped in branded template):");
    if (!body) return;
    setSendingTo(email);
    try {
      await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
        body: JSON.stringify({ to: email, subject, body: `<p>${body.replace(/\n/g, "<br/>")}</p>` }),
      });
    } finally { setSendingTo(null); }
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSubmitting(true);
    try {
      await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
        body: JSON.stringify(orderForm),
      });
      setShowAddOrder(false);
      setOrderForm({ customerName: "", customerEmail: "", customerPhone: "", service: "linkedin", orderStatus: "new", paymentStatus: "pending", paymentAmount: 200, handledBy: "", notes: "", orderDate: new Date().toISOString().split("T")[0] });
      await fetchOrders(savedPw, savedEmail);
      if (orderForm.paymentStatus === "paid") await fetchData(savedPw, savedEmail);
    } finally { setOrderSubmitting(false); }
  };

  const patchOrder = async (id: string, updates: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, ...updates } : o));
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
      body: JSON.stringify({ id, ...updates }),
    });
    // If payment just got marked as paid, refresh payments tab data
    if (updates.paymentStatus === "paid") await fetchData(savedPw, savedEmail);
  };

  const deleteOrderById = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    setOrders((prev) => prev.filter((o) => o.id !== id));
    await fetch("/api/admin/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
      body: JSON.stringify({ id }),
    });
  };

  const deleteCustomer = async (email: string, name: string) => {
    if (!confirm(`Delete "${name || email}" and all their session data? This cannot be undone.`)) return;
    setData((prev) => prev ? { ...prev, users: prev.users.filter((u) => u.email !== email) } : prev);
    await fetch("/api/admin/delete-user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
      body: JSON.stringify({ email }),
    });
  };

  const createOrderForUser = async (u: User, service: string) => {
    const AUTO_PRICES: Record<string, number> = { linkedin: 200, naukri: 200, ats: 200 };
    const res = await fetch("/api/admin/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
      body: JSON.stringify({
        customerName: u.name || u.email,
        customerEmail: u.email,
        customerPhone: u.phone ?? "",
        service,
        orderStatus: "new",
        paymentStatus: "pending",
        paymentAmount: AUTO_PRICES[service] ?? 0,
        handledBy: "",
        orderDate: new Date().toISOString(),
      }),
    });
    if (res.ok) await fetchOrders(savedPw, savedEmail);
  };

  const adminHeaders = useCallback((pw: string, em: string) => ({
    "x-admin-password": pw,
    "x-admin-email": em,
  }), []);

  const fetchOrders = useCallback(async (pw: string, em: string) => {
    const res = await fetch("/api/admin/orders", { headers: adminHeaders(pw, em) });
    if (res.ok) { const j = await res.json(); setOrders(j.orders ?? []); }
  }, [adminHeaders]);

  const fetchData = useCallback(async (pw: string, em: string) => {
    setLoading(true);
    try {
      const hdrs = adminHeaders(pw, em);
      const [adminRes, fbRes, storiesRes, blogsRes] = await Promise.all([
        fetch("/api/admin", { headers: hdrs }),
        fetch("/api/feedback", { headers: hdrs }),
        fetch("/api/stories"),
        fetch("/api/blogs", { headers: hdrs }),
      ]);
      if (adminRes.status === 401) { setAuthError("Wrong email or password."); setAuthed(false); return; }
      const json = await adminRes.json();
      const fbJson = await fbRes.json();
      const stJson = await storiesRes.json();
      const blJson = await blogsRes.json();
      setData(json);
      setFeedback(fbJson.feedback ?? []);
      setStories(stJson.stories ?? []);
      setBlogs(blJson.blogs ?? []);
      setAuthed(true);
      setSavedPw(pw);
      setSavedEmail(em);
      await fetchOrders(pw, em);
    } catch {
      setAuthError("Failed to connect. Make sure admin env vars are set.");
    } finally { setLoading(false); }
  }, [fetchOrders, adminHeaders]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    await fetchData(password, adminEmail.trim().toLowerCase());
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
      body: JSON.stringify({ id, status }),
    });
    await fetchData(savedPw, savedEmail);
  };

  const toggleFeedbackApproval = async (id: string, approved: boolean) => {
    await fetch("/api/feedback", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
      body: JSON.stringify({ id, approved }),
    });
    await fetchData(savedPw, savedEmail);
  };

  const deleteFeedbackItem = async (id: string) => {
    if (!confirm("Delete this feedback permanently?")) return;
    setFeedback((prev) => prev.filter((f) => f.id !== id));
    await fetch("/api/feedback", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
      body: JSON.stringify({ id }),
    });
  };

  const deleteStory = async (id: string) => {
    await fetch("/api/stories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
      body: JSON.stringify({ id }),
    });
    await fetchData(savedPw, savedEmail);
  };

  const addStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyForm.name || !storyForm.story) return;
    setStorySubmitting(true);
    if (editingStoryId) {
      await fetch("/api/stories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
        body: JSON.stringify({ id: editingStoryId, ...storyForm }),
      });
      setEditingStoryId(null);
    } else {
      const body = new FormData();
      Object.entries(storyForm).forEach(([k, v]) => body.append(k, v));
      if (storyFile) body.append("image", storyFile);
      await fetch("/api/stories", { method: "POST", headers: adminHeaders(savedPw, savedEmail), body });
    }
    setStoryForm({ name: "", role: "", result: "", story: "", imageUrl: "" });
    setStoryFile(null);
    setStorySubmitting(false);
    await fetchData(savedPw, savedEmail);
  };

  const addBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.content) return;
    setBlogSubmitting(true);
    const tags = blogForm.tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (editingBlogId) {
      await fetch("/api/blogs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
        body: JSON.stringify({ id: editingBlogId, ...blogForm, tags }),
      });
      setEditingBlogId(null);
    } else {
      await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
        body: JSON.stringify({ ...blogForm, tags }),
      });
    }
    setBlogForm({ title: "", slug: "", excerpt: "", content: "", coverImage: "", tags: "", author: "ProCareerLaunchpad Team", published: false });
    setBlogSubmitting(false);
    await fetchData(savedPw, savedEmail);
  };

  const toggleBlogPublish = async (id: string, published: boolean) => {
    await fetch("/api/blogs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
      body: JSON.stringify({ id, published }),
    });
    await fetchData(savedPw, savedEmail);
  };

  const deleteBlog = async (id: string) => {
    if (!confirm("Delete this blog post permanently?")) return;
    await fetch("/api/blogs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...adminHeaders(savedPw, savedEmail) },
      body: JSON.stringify({ id }),
    });
    await fetchData(savedPw, savedEmail);
  };

  // Auto-refresh every 60s
  useEffect(() => {
    if (!authed) return;
    const id = setInterval(() => fetchData(savedPw, savedEmail), 60_000);
    return () => clearInterval(id);
  }, [authed, savedPw, savedEmail, fetchData]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 btn-glow rounded-lg flex items-center justify-center text-white font-black text-sm">P</div>
            <span className="font-black text-white text-lg">ProCareerLaunchpad</span>
          </div>
          <div className="glass-dark rounded-2xl p-8 border border-white/8">
            <h1 className="text-white font-black text-xl mb-1 text-center">Admin Panel</h1>
            <p className="text-white/35 text-xs text-center mb-6">Sign in with your admin credentials</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" required value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="Admin email" autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/20" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/20" />
              {authError && <p className="text-red-400 text-xs">{authError}</p>}
              <button type="submit" disabled={loading}
                className="w-full btn-glow text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50">
                {loading ? "Checking…" : "Sign In →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const { stats, users, payments, requests } = data!;

  const newOrdersCount = orders.filter((o) => o.orderStatus === "new").length;
  const TABS: { id: Tab; label: string; count?: number; highlight?: boolean }[] = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Customers", count: stats.totalUsers, highlight: newOrdersCount > 0 },
    { id: "payments", label: "Payments", count: payments.length },
    { id: "email", label: "Email" },
    { id: "requests", label: "Requests", count: stats.newRequests, highlight: stats.newRequests > 0 },
    { id: "stories", label: "Stories", count: stories.length },
    { id: "feedback", label: "Feedback", count: feedback.filter((f) => !f.approved).length },
    { id: "blogs", label: "Blogs", count: blogs.length },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-white">
      {/* Top bar */}
      <div className="glass-dark border-b border-white/8 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 btn-glow rounded-lg flex items-center justify-center text-white font-black text-xs">P</div>
          <span className="font-black text-white">Admin Panel</span>
          <span className="text-white/20 text-xs">· ProCareerLaunchpad</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchData(savedPw, savedEmail)} className="text-white/30 hover:text-white/70 text-xs transition-colors">↺ Refresh</button>
          <a href="/" className="text-white/30 hover:text-white/70 text-xs transition-colors">← Site</a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/3 rounded-xl p-1 w-fit">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${tab === t.id ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}>
              {t.label}
              {t.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${t.highlight ? "bg-yellow-500/20 text-yellow-400" : "bg-white/10 text-white/40"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ORDERS TAB removed — orders are now embedded per-customer in the Customers tab */}
        {false && (() => {
          const SVC_META: Record<string, { label: string; color: string; bg: string }> = {
            linkedin:  { label: "LinkedIn Optimizer", color: "#10B981", bg: "#10B98118" },
            naukri:    { label: "Naukri Optimizer",   color: "#FF6B35", bg: "#FF6B3518" },
            ats:       { label: "ATS Scanner",        color: "#8B5CF6", bg: "#8B5CF618" },
            resume:    { label: "Resume Writing",     color: "#0EA5E9", bg: "#0EA5E918" },
            portfolio: { label: "Portfolio Creation", color: "#F59E0B", bg: "#F59E0B18" },
            content:   { label: "Content Creation",   color: "#EC4899", bg: "#EC489918" },
          };
          const ORDER_STATUS_META: Record<OrderStatus, { label: string; color: string }> = {
            new:         { label: "New",         color: "#F59E0B" },
            in_progress: { label: "In Progress", color: "#0EA5E9" },
            review:      { label: "In Review",   color: "#8B5CF6" },
            done:        { label: "Done",        color: "#10B981" },
            cancelled:   { label: "Cancelled",   color: "#6B7280" },
          };
          const TEAM = ["Amit", "Baibhav", "Rahul", "Pooja", "Team"];

          const searchQ = orderSearchQ;
          const filterStatus = orderFilterStatus;
          const filterService = orderFilterService;
          const filterHandler = orderFilterHandler;
          const filterPayment = orderFilterPayment;

          const handlers = ["all", ...Array.from(new Set(orders.map((o) => o.handledBy).filter(Boolean)))];

          const filtered = orders.filter((o) => {
            if (filterStatus !== "all" && o.orderStatus !== filterStatus) return false;
            if (filterService !== "all" && o.service !== filterService) return false;
            if (filterHandler !== "all" && o.handledBy !== filterHandler) return false;
            if (filterPayment !== "all" && o.paymentStatus !== filterPayment) return false;
            if (searchQ) {
              const q = searchQ.toLowerCase();
              if (!o.customerName.toLowerCase().includes(q) && !o.customerEmail.toLowerCase().includes(q) && !(o.customerPhone ?? "").includes(q)) return false;
            }
            return true;
          });

          const totalRevenue = filtered.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.paymentAmount, 0);

          return (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-white font-black text-lg">Orders & Service Tracking</h2>
                  <p className="text-white/30 text-xs mt-0.5">
                    {filtered.length} orders · ₹{totalRevenue.toLocaleString("en-IN")} confirmed revenue
                  </p>
                </div>
                <button onClick={() => setShowAddOrder(true)}
                  className="px-5 py-2.5 btn-glow rounded-xl text-white text-sm font-black">
                  + New Order
                </button>
              </div>

              {/* Filters row */}
              <div className="glass rounded-2xl border border-white/6 p-4 flex flex-wrap gap-3 items-center">
                <input
                  type="text" placeholder="Search by name, email, phone…" value={orderSearchQ}
                  onChange={(e) => setOrderSearchQ(e.target.value)}
                  className="flex-1 min-w-[180px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-brand-teal/40 placeholder-white/20" />

                <select value={orderFilterService} onChange={(e) => setOrderFilterService(e.target.value as typeof orderFilterService)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none">
                  <option value="all">All Services</option>
                  {Object.entries(SVC_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>

                <select value={orderFilterStatus} onChange={(e) => setOrderFilterStatus(e.target.value as typeof orderFilterStatus)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none">
                  <option value="all">All Status</option>
                  {Object.entries(ORDER_STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>

                <select value={orderFilterPayment} onChange={(e) => setOrderFilterPayment(e.target.value as typeof orderFilterPayment)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none">
                  <option value="all">All Payments</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>

                <select value={orderFilterHandler} onChange={(e) => setOrderFilterHandler(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none">
                  {handlers.map((h) => <option key={h} value={h}>{h === "all" ? "All Handlers" : h}</option>)}
                </select>

                {(orderSearchQ || orderFilterStatus !== "all" || orderFilterService !== "all" || orderFilterHandler !== "all" || orderFilterPayment !== "all") && (
                  <button onClick={() => { setOrderSearchQ(""); setOrderFilterStatus("all"); setOrderFilterService("all"); setOrderFilterHandler("all"); setOrderFilterPayment("all"); }}
                    className="text-white/30 hover:text-white/60 text-xs font-bold transition-colors">✕ Clear</button>
                )}
              </div>

              {/* Orders list */}
              {filtered.length === 0 ? (
                <div className="glass rounded-2xl p-10 text-center text-white/30">No orders match the filters.</div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((o) => {
                    const svc = SVC_META[o.service] ?? { label: o.service, color: "#fff", bg: "#ffffff10" };
                    const stMeta = ORDER_STATUS_META[o.orderStatus];
                    return (
                      <div key={o.id} className="glass rounded-2xl border border-white/6 overflow-hidden">
                        {/* Order header */}
                        <div className="p-4 flex flex-wrap gap-4 items-start">
                          {/* Customer info */}
                          <div className="flex-1 min-w-[200px]">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-black text-sm">{o.customerName}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border"
                                style={{ color: stMeta.color, background: stMeta.color + "18", borderColor: stMeta.color + "40" }}>
                                {stMeta.label}
                              </span>
                              {o.paymentStatus === "paid"
                                ? <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-brand-teal/15 text-brand-teal border border-brand-teal/30">₹{o.paymentAmount} Paid</span>
                                : <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/25">₹{o.paymentAmount} Pending</span>}
                            </div>
                            <p className="text-white/40 text-xs">{o.customerEmail}</p>
                            {o.customerPhone && <p className="text-white/30 text-xs">📞 {o.customerPhone}</p>}
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold"
                                style={{ background: svc.bg, color: svc.color }}>{svc.label}</span>
                              <span className="text-white/20 text-[10px]">
                                {new Date(o.orderDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex flex-wrap gap-2 items-center flex-shrink-0">
                            {/* Order status dropdown */}
                            <select
                              value={o.orderStatus}
                              onChange={(e) => patchOrder(o.id, { orderStatus: e.target.value as OrderStatus })}
                              className="bg-white/5 border rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none transition-colors"
                              style={{ borderColor: stMeta.color + "50", color: stMeta.color }}>
                              <option value="new">New</option>
                              <option value="in_progress">In Progress</option>
                              <option value="review">In Review</option>
                              <option value="done">Done</option>
                              <option value="cancelled">Cancelled</option>
                            </select>

                            {/* Payment status toggle */}
                            <button
                              onClick={() => patchOrder(o.id, { paymentStatus: o.paymentStatus === "paid" ? "pending" : "paid" })}
                              className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all ${o.paymentStatus === "paid" ? "bg-brand-teal/15 border-brand-teal/40 text-brand-teal" : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"}`}>
                              {o.paymentStatus === "paid" ? "✓ Paid" : "Mark Paid"}
                            </button>

                            {/* Handled by */}
                            <select
                              value={o.handledBy}
                              onChange={(e) => patchOrder(o.id, { handledBy: e.target.value })}
                              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/60 focus:outline-none">
                              <option value="">Assign to…</option>
                              {TEAM.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>

                            {/* Delete */}
                            <button onClick={() => deleteOrderById(o.id)}
                              className="p-1.5 text-white/20 hover:text-red-400 transition-colors text-sm" title="Delete order">✕</button>
                          </div>
                        </div>

                        {/* Notes */}
                        {o.notes && (
                          <div className="px-4 pb-3 border-t border-white/4 pt-2">
                            <p className="text-white/30 text-[10px] uppercase tracking-wide font-bold mb-0.5">Notes</p>
                            <p className="text-white/50 text-xs">{o.notes}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* Add Order Modal — kept for potential future use, not shown via nav */}
        {showAddOrder && (() => {
          const SVC_OPTS = [
            { value: "linkedin",  label: "LinkedIn Optimizer" },
            { value: "naukri",    label: "Naukri Optimizer" },
            { value: "ats",       label: "ATS Scanner" },
            { value: "resume",    label: "Resume Writing" },
            { value: "portfolio", label: "Portfolio Creation" },
            { value: "content",   label: "Content Creation" },
          ];
          const TEAM = ["Amit", "Baibhav", "Rahul", "Pooja", "Team"];
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={() => setShowAddOrder(false)}>
              <div className="glass-dark rounded-2xl border border-white/10 p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-white font-black text-lg mb-5">New Order</h3>
                <form onSubmit={submitOrder} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Customer name *" required value={orderForm.customerName}
                      onChange={(e) => setOrderForm((f) => ({ ...f, customerName: e.target.value }))}
                      className="col-span-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/25" />
                    <input type="email" placeholder="Email *" required value={orderForm.customerEmail}
                      onChange={(e) => setOrderForm((f) => ({ ...f, customerEmail: e.target.value }))}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/25" />
                    <input type="tel" placeholder="Phone" value={orderForm.customerPhone ?? ""}
                      onChange={(e) => setOrderForm((f) => ({ ...f, customerPhone: e.target.value }))}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/25" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/40 text-[10px] uppercase tracking-wide font-bold block mb-1">Service *</label>
                      <select value={orderForm.service} onChange={(e) => setOrderForm((f) => ({ ...f, service: e.target.value as OrderService }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
                        {SVC_OPTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-white/40 text-[10px] uppercase tracking-wide font-bold block mb-1">Handled By</label>
                      <select value={orderForm.handledBy} onChange={(e) => setOrderForm((f) => ({ ...f, handledBy: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
                        <option value="">Unassigned</option>
                        {TEAM.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-white/40 text-[10px] uppercase tracking-wide font-bold block mb-1">Order Status</label>
                      <select value={orderForm.orderStatus} onChange={(e) => setOrderForm((f) => ({ ...f, orderStatus: e.target.value as OrderStatus }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">In Review</option>
                        <option value="done">Done</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white/40 text-[10px] uppercase tracking-wide font-bold block mb-1">Payment</label>
                      <select value={orderForm.paymentStatus} onChange={(e) => setOrderForm((f) => ({ ...f, paymentStatus: e.target.value as PaymentStatus }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-white/40 text-[10px] uppercase tracking-wide font-bold block mb-1">Amount (₹)</label>
                      <input type="number" value={orderForm.paymentAmount} min={0}
                        onChange={(e) => setOrderForm((f) => ({ ...f, paymentAmount: Number(e.target.value) }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50" />
                    </div>
                  </div>

                  <div>
                    <label className="text-white/40 text-[10px] uppercase tracking-wide font-bold block mb-1">Order Date</label>
                    <input type="date" value={orderForm.orderDate}
                      onChange={(e) => setOrderForm((f) => ({ ...f, orderDate: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50" />
                  </div>

                  <textarea placeholder="Notes (optional)" value={orderForm.notes ?? ""}
                    onChange={(e) => setOrderForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/25 resize-none" />

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowAddOrder(false)}
                      className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 text-sm font-bold hover:text-white/70 transition-colors">Cancel</button>
                    <button type="submit" disabled={orderSubmitting}
                      className="flex-1 btn-glow text-white font-black py-3 rounded-xl text-sm disabled:opacity-50">
                      {orderSubmitting ? "Saving…" : "Create Order →"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Total Users", value: stats.totalUsers, color: "text-brand-teal" },
                { label: "Active Paid", value: stats.paidUsers, color: "text-brand-blue" },
                { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, color: "text-brand-purple" },
                { label: "Service Requests", value: stats.totalRequests, color: "text-yellow-400" },
                { label: "New Requests", value: stats.newRequests, color: "text-pink-400" },
              ].map((s) => (
                <div key={s.label} className="glass rounded-2xl p-5 text-center border border-white/6">
                  <div className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}</div>
                  <p className="text-white/40 text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Recent requests */}
            {requests.filter((r) => r.status === "new").length > 0 && (
              <div className="glass rounded-2xl p-6 border border-yellow-500/15">
                <h2 className="text-white font-black mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  New Requests ({requests.filter((r) => r.status === "new").length})
                </h2>
                <div className="space-y-3">
                  {requests.filter((r) => r.status === "new").slice(0, 5).map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-4 p-3 bg-white/3 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">{r.name}</p>
                        <p className="text-white/40 text-xs">{r.email} · {r.serviceType} · {timeAgo(r.createdAt)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(r.id, "contacted")}
                          className="px-3 py-1 rounded-lg bg-brand-blue/15 text-brand-blue border border-brand-blue/25 text-xs font-bold">
                          Mark Contacted
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent payments */}
            <div className="glass rounded-2xl p-6 border border-white/6">
              <h2 className="text-white font-black mb-4">Recent Payments</h2>
              {payments.length === 0 ? (
                <p className="text-white/30 text-sm">No payments recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {payments.slice(0, 8).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-white/3 rounded-xl">
                      <div>
                        <p className="text-white text-sm font-semibold">{p.email}</p>
                        <p className="text-white/40 text-xs">{p.service} · {timeAgo(p.createdAt)}</p>
                      </div>
                      <span className="text-brand-teal font-black text-sm">₹{p.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={() => setShowAddUser(false)}>
            <div className="glass-dark rounded-2xl border border-white/10 p-7 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-white font-black text-lg mb-5">Add Customer</h3>
              <form onSubmit={addUserManually} className="space-y-3">
                <input type="text" placeholder="Full name *" required value={addUserForm.name}
                  onChange={(e) => setAddUserForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/25" />
                <input type="email" placeholder="Email address *" required value={addUserForm.email}
                  onChange={(e) => setAddUserForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/25" />
                <input type="tel" placeholder="Phone number (optional)" value={addUserForm.phone}
                  onChange={(e) => setAddUserForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/25" />
                <div>
                  <p className="text-white/40 text-xs mb-2 font-bold uppercase tracking-wide">Grant Service Access</p>
                  <div className="flex gap-3 flex-wrap">
                    {[{ key: "linkedin", label: "LinkedIn", color: "#10B981" }, { key: "naukri", label: "Naukri", color: "#FF6B35" }, { key: "ats", label: "ATS Scan", color: "#8B5CF6" }].map((svc) => {
                      const on = addUserForm.services.includes(svc.key);
                      return (
                        <button key={svc.key} type="button"
                          onClick={() => setAddUserForm((f) => ({ ...f, services: on ? f.services.filter((s) => s !== svc.key) : [...f.services, svc.key] }))}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                          style={on ? { background: svc.color + "20", borderColor: svc.color + "60", color: svc.color } : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.35)" }}>
                          {on ? "✓ " : ""}{svc.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {addUserError && <p className="text-red-400 text-xs">{addUserError}</p>}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddUser(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 text-sm font-bold hover:text-white/70 transition-colors">Cancel</button>
                  <button type="submit" disabled={addUserLoading}
                    className="flex-1 btn-glow text-white font-black py-3 rounded-xl text-sm disabled:opacity-50">
                    {addUserLoading ? "Adding…" : "Add Customer →"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users / Customers tab — combined customer + service orders */}
        {tab === "users" && (() => {
          // ── Filter + sort ──────────────────────────────────────────────
          let visibleUsers = [...users];

          if (custSearch.trim()) {
            const q = custSearch.toLowerCase();
            visibleUsers = visibleUsers.filter((u) =>
              u.name?.toLowerCase().includes(q) ||
              u.email.toLowerCase().includes(q) ||
              (u.phone ?? "").includes(q)
            );
          }

          if (custFilterService !== "all") {
            visibleUsers = visibleUsers.filter((u) =>
              orders.some((o) => o.customerEmail === u.email && o.service === custFilterService)
            );
          }

          if (custFilterPayment === "paid") {
            visibleUsers = visibleUsers.filter((u) => u.paidServices && u.paidServices.length > 0);
          } else if (custFilterPayment === "unpaid") {
            visibleUsers = visibleUsers.filter((u) => !u.paidServices || u.paidServices.length === 0);
          }

          visibleUsers.sort((a, b) => {
            if (custSort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (custSort === "lastseen") return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
            if (custSort === "revenue") {
              const revA = orders.filter((o) => o.customerEmail === a.email && o.paymentStatus === "paid").reduce((s, o) => s + o.paymentAmount, 0);
              const revB = orders.filter((o) => o.customerEmail === b.email && o.paymentStatus === "paid").reduce((s, o) => s + o.paymentAmount, 0);
              return revB - revA;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // newest
          });

          const hasFilters = custSearch || custFilterService !== "all" || custFilterPayment !== "all" || custSort !== "newest";
          // ──────────────────────────────────────────────────────────────

          const ALL_SVCS = [
            { key: "linkedin",  label: "LinkedIn Optimizer", color: "#10B981", isAuto: true },
            { key: "naukri",    label: "Naukri Optimizer",   color: "#FF6B35", isAuto: true },
            { key: "ats",       label: "ATS Scanner",        color: "#8B5CF6", isAuto: true },
            { key: "resume",    label: "Resume Writing",     color: "#0EA5E9", isAuto: false },
            { key: "portfolio", label: "Portfolio",          color: "#F59E0B", isAuto: false },
            { key: "content",   label: "Content Creation",   color: "#EC4899", isAuto: false },
          ];
          const TEAM = ["", "Amit", "Baibhav", "Rahul", "Pooja", "Team"];
          const STATUS_OPTS: { value: OrderStatus; label: string }[] = [
            { value: "new", label: "New" },
            { value: "in_progress", label: "In Progress" },
            { value: "review", label: "In Review" },
            { value: "done", label: "Done" },
            { value: "cancelled", label: "Cancelled" },
          ];

          return (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-white font-black text-lg">
                    Customers ({visibleUsers.length}{visibleUsers.length !== users.length ? ` of ${users.length}` : ""})
                  </h2>
                  <p className="text-white/25 text-xs mt-0.5">
                    Manage services, access &amp; payments per customer.
                    {newOrdersCount > 0 && <span className="text-yellow-400 ml-2">{newOrdersCount} new order{newOrdersCount > 1 ? "s" : ""} pending.</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {importResult && <span className="text-brand-teal text-xs font-bold">{importResult}</span>}
                  <label className={`px-4 py-2 rounded-xl border border-white/15 text-white/60 hover:text-white text-xs font-bold transition-colors cursor-pointer ${importLoading ? "opacity-50 pointer-events-none" : ""}`}>
                    {importLoading ? "Importing…" : "↑ Import CSV"}
                    <input type="file" accept=".csv" className="hidden" onChange={importCSV} />
                  </label>
                  <button onClick={() => { setShowAddUser(true); setAddUserError(""); }}
                    className="px-4 py-2 btn-glow rounded-xl text-white text-xs font-black">
                    + Add Customer
                  </button>
                </div>
              </div>

              {/* ── Filter bar ── */}
              <div className="glass rounded-2xl border border-white/6 p-3 flex flex-wrap gap-2 items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-[180px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-xs">⌕</span>
                  <input
                    type="text"
                    placeholder="Search name, email, phone…"
                    value={custSearch}
                    onChange={(e) => setCustSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-3 py-2 text-white text-xs focus:outline-none focus:border-brand-teal/40 placeholder-white/20"
                  />
                </div>

                {/* Service filter */}
                <select
                  value={custFilterService}
                  onChange={(e) => setCustFilterService(e.target.value as typeof custFilterService)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none">
                  <option value="all">All Services</option>
                  <option value="linkedin">LinkedIn Optimizer</option>
                  <option value="naukri">Naukri Optimizer</option>
                  <option value="ats">ATS Scanner</option>
                  <option value="resume">Resume Writing</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="content">Content Creation</option>
                </select>

                {/* Payment filter */}
                <select
                  value={custFilterPayment}
                  onChange={(e) => setCustFilterPayment(e.target.value as typeof custFilterPayment)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none">
                  <option value="all">All Customers</option>
                  <option value="paid">Has Paid Access</option>
                  <option value="unpaid">No Paid Access</option>
                </select>

                {/* Sort */}
                <select
                  value={custSort}
                  onChange={(e) => setCustSort(e.target.value as typeof custSort)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none">
                  <option value="newest">Sort: Newest first</option>
                  <option value="oldest">Sort: Oldest first</option>
                  <option value="lastseen">Sort: Last active</option>
                  <option value="revenue">Sort: Revenue ↓</option>
                </select>

                {/* Clear */}
                {hasFilters && (
                  <button
                    onClick={() => { setCustSearch(""); setCustFilterService("all"); setCustFilterPayment("all"); setCustSort("newest"); }}
                    className="px-3 py-2 text-white/30 hover:text-white/60 text-xs font-bold transition-colors rounded-xl border border-white/8 hover:border-white/20">
                    ✕ Clear
                  </button>
                )}
              </div>

              {users.length === 0 ? (
                <div className="glass rounded-2xl p-10 text-center text-white/30">No customers yet. Add one above or import a CSV.</div>
              ) : visibleUsers.length === 0 ? (
                <div className="glass rounded-2xl p-10 text-center text-white/30">No customers match the filters.</div>
              ) : (
                <div className="space-y-4">
                  {visibleUsers.map((u) => {
                    const paidServices = u.paidServices ?? [];
                    const userOrders = orders.filter((o) => o.customerEmail === u.email);
                    const paidOrders = userOrders.filter((o) => o.paymentStatus === "paid");
                    const totalRevenue = paidOrders.reduce((s, o) => s + o.paymentAmount, 0);

                    return (
                      <div key={u.email} className="glass rounded-2xl border border-white/6 overflow-hidden">

                        {/* ── Customer info header ── */}
                        <div className="p-5 flex flex-wrap gap-4 items-center">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {u.image
                              ? <img src={u.image} alt="" className="w-10 h-10 rounded-full border border-white/10 flex-shrink-0" />
                              : <div className="w-10 h-10 rounded-full bg-brand-teal/15 flex items-center justify-center text-brand-teal font-black flex-shrink-0">{(u.name || u.email)[0].toUpperCase()}</div>}
                            <div className="min-w-0">
                              <p className="text-white font-black text-sm">{u.name || "—"}</p>
                              <p className="text-white/40 text-xs truncate">{u.email}</p>
                              {u.phone && <p className="text-white/30 text-xs">📞 {u.phone}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-center flex-shrink-0 flex-wrap">
                            <div><p className="text-white/25 text-[10px] uppercase tracking-wide">Joined</p><p className="text-white/60 text-xs font-bold">{timeAgo(u.createdAt)}</p></div>
                            <div><p className="text-white/25 text-[10px] uppercase tracking-wide">Last seen</p><p className="text-white/60 text-xs font-bold">{timeAgo(u.lastSeen)}</p></div>
                            <div><p className="text-white/25 text-[10px] uppercase tracking-wide">Revenue</p><p className="text-brand-teal text-xs font-black">₹{totalRevenue.toLocaleString("en-IN")}</p></div>
                          </div>
                          <button onClick={() => sendEmailToUser(u.email)} disabled={sendingTo === u.email}
                            className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-white/10 text-white/35 hover:text-brand-teal hover:border-brand-teal/30 text-xs font-bold transition-all disabled:opacity-40">
                            {sendingTo === u.email ? "…" : "✉ Email"}
                          </button>
                          <button onClick={() => deleteCustomer(u.email, u.name)}
                            title="Delete customer"
                            className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-white/8 text-white/25 hover:text-red-400 hover:border-red-400/30 text-xs font-bold transition-all">
                            🗑
                          </button>
                        </div>

                        {/* ── Services table ── */}
                        <div className="border-t border-white/5 overflow-x-auto">
                          <table className="w-full text-xs min-w-[700px]">
                            <thead>
                              <tr className="border-b border-white/5 bg-white/2">
                                <th className="text-left px-4 py-2.5 text-white/30 font-bold uppercase tracking-widest text-[10px] w-36">Service</th>
                                <th className="text-center px-3 py-2.5 text-white/30 font-bold uppercase tracking-widest text-[10px] w-20">Availed</th>
                                <th className="text-left px-3 py-2.5 text-white/30 font-bold uppercase tracking-widest text-[10px] w-24">Amount</th>
                                <th className="text-left px-3 py-2.5 text-white/30 font-bold uppercase tracking-widest text-[10px] w-28">Payment</th>
                                <th className="text-left px-3 py-2.5 text-white/30 font-bold uppercase tracking-widest text-[10px] w-32">Order Status</th>
                                <th className="text-left px-3 py-2.5 text-white/30 font-bold uppercase tracking-widest text-[10px] w-28">Handled By</th>
                                <th className="text-center px-3 py-2.5 text-white/30 font-bold uppercase tracking-widest text-[10px] w-24">Access</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ALL_SVCS.map((svc) => {
                                const order = userOrders.find((o) => o.service === svc.key);
                                const hasAccess = paidServices.includes(svc.key);
                                const toggling = accessTogglingKey === `${u.email}:${svc.key}`;
                                const isChecked = !!order;

                                return (
                                  <tr key={svc.key} className={`border-b border-white/4 transition-colors ${isChecked ? "bg-white/2" : "opacity-60 hover:opacity-100"}`}>

                                    {/* Service name */}
                                    <td className="px-4 py-3">
                                      <span className="font-black text-xs" style={{ color: svc.color }}>{svc.label}</span>
                                    </td>

                                    {/* Checkbox — availed */}
                                    <td className="px-3 py-3 text-center">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => isChecked ? deleteOrderById(order!.id) : createOrderForUser(u, svc.key)}
                                        className="w-4 h-4 cursor-pointer rounded"
                                        style={{ accentColor: svc.color }}
                                      />
                                    </td>

                                    {/* Amount */}
                                    <td className="px-3 py-3">
                                      {order ? (
                                        <div className="flex items-center gap-1">
                                          <span className="text-white/30">₹</span>
                                          <input
                                            type="number" min={0}
                                            defaultValue={order.paymentAmount}
                                            onBlur={(e) => { const v = Number(e.target.value); if (v !== order.paymentAmount) patchOrder(order.id, { paymentAmount: v }); }}
                                            className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-brand-teal/40 text-xs" />
                                        </div>
                                      ) : <span className="text-white/20">—</span>}
                                    </td>

                                    {/* Payment status */}
                                    <td className="px-3 py-3">
                                      {order ? (
                                        <button
                                          onClick={() => patchOrder(order.id, { paymentStatus: order.paymentStatus === "paid" ? "pending" : "paid" })}
                                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all whitespace-nowrap ${order.paymentStatus === "paid" ? "bg-brand-teal/15 border-brand-teal/40 text-brand-teal" : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"}`}>
                                          {order.paymentStatus === "paid" ? "✓ Paid" : "Mark Paid"}
                                        </button>
                                      ) : <span className="text-white/20">—</span>}
                                    </td>

                                    {/* Order status dropdown */}
                                    <td className="px-3 py-3">
                                      {order ? (
                                        <select
                                          value={order.orderStatus}
                                          onChange={(e) => patchOrder(order.id, { orderStatus: e.target.value as OrderStatus })}
                                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white/70 text-xs focus:outline-none w-full max-w-[120px]">
                                          {STATUS_OPTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                        </select>
                                      ) : <span className="text-white/20">—</span>}
                                    </td>

                                    {/* Handled by */}
                                    <td className="px-3 py-3">
                                      {order ? (
                                        <select
                                          value={order.handledBy}
                                          onChange={(e) => patchOrder(order.id, { handledBy: e.target.value })}
                                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white/70 text-xs focus:outline-none w-full max-w-[110px]">
                                          {TEAM.map((t) => <option key={t} value={t}>{t || "Assign…"}</option>)}
                                        </select>
                                      ) : <span className="text-white/20">—</span>}
                                    </td>

                                    {/* Access toggle — only for LinkedIn / Naukri / ATS */}
                                    <td className="px-3 py-3 text-center">
                                      {svc.isAuto ? (
                                        <div className="flex items-center justify-center gap-1.5">
                                          <button
                                            onClick={() => toggleUserAccess(u.email, svc.key, !hasAccess)}
                                            disabled={toggling}
                                            className="relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50"
                                            style={{ background: hasAccess ? svc.color : "rgba(255,255,255,0.12)" }}>
                                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${hasAccess ? "translate-x-4" : "translate-x-0.5"}`} />
                                          </button>
                                          <span className="text-[10px] font-black w-5" style={{ color: hasAccess ? svc.color : "rgba(255,255,255,0.2)" }}>
                                            {toggling ? "…" : hasAccess ? "ON" : "OFF"}
                                          </span>
                                        </div>
                                      ) : <span className="text-white/15 text-[10px]">N/A</span>}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* Email Marketing tab */}
        {tab === "email" && (
          <div className="space-y-6">

            {/* ── Add Leads ── */}
            <div className="glass rounded-2xl border border-white/6 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-white font-black">Leads & Contacts</h3>
                  <p className="text-white/30 text-xs mt-0.5">Add leads manually or import from CSV — then select them for email campaigns</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-brand-teal hover:border-brand-teal/30 text-xs font-bold transition-all">
                    {leadImportLoading ? "Importing…" : "⬆ Import CSV"}
                    <input type="file" accept=".csv" className="hidden" onChange={importLeadsCSV} disabled={leadImportLoading} />
                  </label>
                  {leadImportResult && <span className={`text-xs font-bold ${leadImportResult.startsWith("✓") ? "text-brand-teal" : "text-red-400"}`}>{leadImportResult}</span>}
                </div>
              </div>

              {/* Add lead form */}
              <form onSubmit={addLead} className="px-5 py-4 border-b border-white/6 flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[140px]">
                  <label className="text-white/30 text-[10px] font-bold uppercase tracking-wide block mb-1">Name</label>
                  <input value={leadForm.name} onChange={e => setLeadForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Full name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/25" />
                </div>
                <div className="flex-1 min-w-[160px]">
                  <label className="text-white/30 text-[10px] font-bold uppercase tracking-wide block mb-1">Email *</label>
                  <input type="email" required value={leadForm.email} onChange={e => setLeadForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/25" />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="text-white/30 text-[10px] font-bold uppercase tracking-wide block mb-1">Phone</label>
                  <input value={leadForm.phone} onChange={e => setLeadForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 9876543210"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/25" />
                </div>
                <div className="flex flex-col gap-1">
                  <button type="submit" disabled={leadAdding}
                    className="px-5 py-2 rounded-xl btn-glow text-white font-bold text-sm disabled:opacity-50">
                    {leadAdding ? "Adding…" : "+ Add Lead"}
                  </button>
                  {leadResult && <span className={`text-[10px] font-bold text-center ${leadResult.startsWith("✓") ? "text-brand-teal" : "text-red-400"}`}>{leadResult}</span>}
                </div>
              </form>

              {/* User/lead list with checkboxes */}
              <div className="px-5 py-3 flex items-center gap-3 border-b border-white/6">
                <span className="text-white/30 text-xs">{selectedEmails.size} selected</span>
                <button onClick={selectAll} className="text-xs text-brand-teal/70 hover:text-brand-teal transition-colors">Select all</button>
                <button onClick={clearAll} className="text-xs text-white/30 hover:text-white/60 transition-colors">Clear</button>
                <span className="ml-auto text-white/20 text-xs">{users.length} total</span>
              </div>
              <div className="divide-y divide-white/4 max-h-[300px] overflow-y-auto">
                {users.map((u) => (
                  <div key={u.email}
                    className={`flex items-center gap-3 px-5 py-2.5 cursor-pointer transition-colors hover:bg-white/3 ${selectedEmails.has(u.email) ? "bg-brand-teal/5" : ""}`}
                    onClick={() => toggleSelectEmail(u.email)}>
                    <input type="checkbox" readOnly checked={selectedEmails.has(u.email)}
                      className="accent-brand-teal w-4 h-4 rounded flex-shrink-0 cursor-pointer" />
                    {u.image
                      ? <img src={u.image} alt="" className="w-7 h-7 rounded-full border border-white/10 flex-shrink-0" />
                      : <div className="w-7 h-7 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal font-black text-xs flex-shrink-0">{(u.name || u.email)[0].toUpperCase()}</div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate leading-tight">{u.name || "—"}</p>
                      <p className="text-white/35 text-xs truncate">{u.email}{u.phone ? ` · ${u.phone}` : ""}</p>
                    </div>
                    {(u.paidServices?.length ?? 0) > 0
                      ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-teal/15 text-brand-teal flex-shrink-0">paid</span>
                      : <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/6 text-white/25 flex-shrink-0">lead</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Compose ── */}
            <div className="glass rounded-2xl border border-white/6 p-6 space-y-4">
              <h2 className="text-white font-black">Compose & Send</h2>

              {/* Quick templates */}
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wide block mb-2">Quick Templates</label>
                <div className="flex flex-wrap gap-2">
                  {EMAIL_TEMPLATES.map(t => (
                    <button key={t.label} type="button"
                      onClick={() => setEmailForm(f => ({ ...f, subject: t.subject, body: t.body }))}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10 text-white/40 hover:text-brand-teal hover:border-brand-teal/30 transition-all">
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={sendMarketingEmail} className="space-y-4">
                {/* Recipient filter */}
                <div>
                  <label className="text-white/40 text-xs font-bold uppercase tracking-wide block mb-2">Send To</label>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { v: "selected", label: `Selected (${selectedEmails.size})` },
                      { v: "all",      label: `All (${users.length})` },
                      { v: "paid",     label: `Paid (${users.filter(u => u.isPaid).length})` },
                      { v: "linkedin", label: `LinkedIn (${users.filter(u => u.paidServices?.includes("linkedin")).length})` },
                      { v: "naukri",   label: `Naukri (${users.filter(u => u.paidServices?.includes("naukri")).length})` },
                      { v: "ats",      label: `ATS (${users.filter(u => u.paidServices?.includes("ats")).length})` },
                      { v: "custom",   label: "Custom list" },
                    ] as { v: typeof emailForm.filter; label: string }[]).map(opt => (
                      <button key={opt.v} type="button"
                        onClick={() => setEmailForm(f => ({ ...f, filter: opt.v }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${emailForm.filter === opt.v ? "bg-brand-teal/20 border-brand-teal/40 text-brand-teal" : "border-white/10 text-white/40 hover:text-white/60"}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {emailForm.filter === "custom" && (
                  <textarea
                    placeholder="Enter email addresses (one per line or comma-separated)"
                    value={emailForm.customEmails}
                    onChange={e => setEmailForm(f => ({ ...f, customEmails: e.target.value }))}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/25 resize-none" />
                )}

                <input type="text" placeholder="Subject line *" required value={emailForm.subject}
                  onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/25" />

                <textarea
                  placeholder="Email body (supports HTML: <b>, <br/>, <a href='...'>)…"
                  required
                  value={emailForm.body}
                  onChange={e => setEmailForm(f => ({ ...f, body: e.target.value }))}
                  rows={10}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-teal/50 placeholder-white/25 resize-none font-mono" />

                {/* File attachment */}
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 text-xs font-bold transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    Attach File
                    <input type="file" className="hidden" onChange={handleAttachFile} />
                  </label>
                  {attachedFile ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-teal/10 border border-brand-teal/20 text-xs text-brand-teal font-bold">
                      📎 {attachedFile.name}
                      <button type="button" onClick={() => setAttachedFile(null)}
                        className="text-brand-teal/50 hover:text-red-400 transition-colors ml-1">✕</button>
                    </div>
                  ) : (
                    <span className="text-white/20 text-xs">No file attached (optional — use for resume delivery)</span>
                  )}
                </div>

                {emailResult && (
                  <p className={`text-xs font-bold px-3 py-2 rounded-lg border ${emailResult.startsWith("✓") ? "text-brand-teal bg-brand-teal/8 border-brand-teal/20" : "text-red-400 bg-red-400/8 border-red-400/20"}`}>
                    {emailResult}
                  </p>
                )}

                <button type="submit" disabled={emailSending}
                  className="w-full btn-glow text-white font-black py-3 rounded-xl text-sm disabled:opacity-50">
                  {emailSending ? "Sending…" : `Send Email${attachedFile ? " with Attachment" : ""} →`}
                </button>
              </form>
            </div>

            {/* Tips */}
            <div className="glass rounded-2xl border border-white/6 p-5">
              <p className="text-white/40 text-xs font-bold uppercase tracking-wide mb-3">Tips</p>
              <ul className="space-y-1 text-white/30 text-xs list-disc list-inside">
                <li>Use <b className="text-white/50">Select</b> checkboxes above to pick specific leads/customers, then choose <b className="text-white/50">Selected</b> as the recipient filter.</li>
                <li>Import leads from CSV — file must have an <code className="text-white/50">email</code> column. Optional: <code className="text-white/50">name</code>, <code className="text-white/50">phone</code>.</li>
                <li>Body supports HTML: <code className="text-white/50">&lt;b&gt;</code>, <code className="text-white/50">&lt;br/&gt;</code>, <code className="text-white/50">&lt;a href="..."&gt;</code>.</li>
                <li>Attach a file (PDF, DOCX) to deliver resumes or documents directly via email.</li>
                <li>Resend limit is 50 recipients per call — bulk sends are auto-chunked.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Payments tab */}
        {tab === "payments" && (() => {
          const SVC_META: Record<string, { label: string; color: string; bg: string }> = {
            linkedin:  { label: "LinkedIn Optimizer", color: "#10B981", bg: "#10B98118" },
            naukri:    { label: "Naukri Optimizer",   color: "#FF6B35", bg: "#FF6B3518" },
            ats:       { label: "ATS Scanner",        color: "#8B5CF6", bg: "#8B5CF618" },
            resume:    { label: "Resume Writing",     color: "#0EA5E9", bg: "#0EA5E918" },
            portfolio: { label: "Portfolio",          color: "#F59E0B", bg: "#F59E0B18" },
            content:   { label: "Content Creation",   color: "#EC4899", bg: "#EC489918" },
          };

          // Build enriched list
          const enriched = payments.map((p) => ({
            ...p,
            user: users.find((u) => u.email === p.email),
            svc: SVC_META[p.service] ?? { label: p.service, color: "#aaa", bg: "#aaaaaa18" },
          }));

          let filtered = enriched;
          if (paySearch.trim()) {
            const q = paySearch.toLowerCase();
            filtered = filtered.filter((p) =>
              p.email.toLowerCase().includes(q) ||
              (p.user?.name ?? "").toLowerCase().includes(q) ||
              (p.user?.phone ?? "").includes(q) ||
              (p.razorpayId ?? "").toLowerCase().includes(q)
            );
          }
          if (payFilterSvc !== "all") filtered = filtered.filter((p) => p.service === payFilterSvc);

          filtered = [...filtered].sort((a, b) => {
            if (paySort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (paySort === "amount_desc") return (b.amount ?? 0) - (a.amount ?? 0);
            if (paySort === "amount_asc") return (a.amount ?? 0) - (b.amount ?? 0);
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });

          const filteredTotal = filtered.reduce((s, p) => s + (p.amount ?? 0), 0);

          // Group by user email
          const byUser = filtered.reduce<Record<string, typeof filtered>>((acc, p) => {
            (acc[p.email] ??= []).push(p); return acc;
          }, {});

          const exportCSV = () => {
            const rows = [
              ["Name", "Email", "Phone", "Service", "Amount", "Razorpay ID", "Date", "Time"],
              ...filtered.map((p) => [
                p.user?.name ?? "",
                p.email,
                p.user?.phone ?? "",
                p.svc.label,
                p.amount ?? 0,
                p.razorpayId ?? p.id,
                new Date(p.createdAt).toLocaleDateString("en-IN"),
                new Date(p.createdAt).toLocaleTimeString("en-IN"),
              ]),
            ];
            const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
            const a = document.createElement("a");
            a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
            a.download = `payments_${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
          };

          return (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-white font-black text-lg">Payments</h2>
                  <p className="text-white/30 text-xs mt-0.5">
                    {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
                    {filtered.length !== payments.length && ` (filtered from ${payments.length})`}
                    {" · "}
                    <span className="text-brand-teal font-black">₹{filteredTotal.toLocaleString("en-IN")} total</span>
                  </p>
                </div>
                <button onClick={exportCSV}
                  className="px-4 py-2 rounded-xl border border-white/15 text-white/60 hover:text-white text-xs font-bold transition-colors flex items-center gap-2">
                  ↓ Export CSV
                </button>
              </div>

              {/* Filter bar */}
              <div className="glass rounded-2xl border border-white/6 p-3 flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[180px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-xs">⌕</span>
                  <input type="text" placeholder="Search name, email, phone, Razorpay ID…"
                    value={paySearch} onChange={(e) => setPaySearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-3 py-2 text-white text-xs focus:outline-none focus:border-brand-teal/40 placeholder-white/20" />
                </div>

                <select value={payFilterSvc} onChange={(e) => setPayFilterSvc(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none">
                  <option value="all">All Services</option>
                  {Object.entries(SVC_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>

                <select value={paySort} onChange={(e) => setPaySort(e.target.value as typeof paySort)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none">
                  <option value="newest">Sort: Newest first</option>
                  <option value="oldest">Sort: Oldest first</option>
                  <option value="amount_desc">Sort: Amount ↓</option>
                  <option value="amount_asc">Sort: Amount ↑</option>
                </select>

                <button onClick={() => setPayGroup((g) => !g)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${payGroup ? "bg-brand-teal/15 border-brand-teal/40 text-brand-teal" : "border-white/10 text-white/40 hover:text-white/70"}`}>
                  Group by User
                </button>

                {(paySearch || payFilterSvc !== "all" || paySort !== "newest") && (
                  <button onClick={() => { setPaySearch(""); setPayFilterSvc("all"); setPaySort("newest"); }}
                    className="px-3 py-2 text-white/30 hover:text-white/60 text-xs font-bold transition-colors rounded-xl border border-white/8 hover:border-white/20">
                    ✕ Clear
                  </button>
                )}
              </div>

              {/* Summary chips */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(
                  filtered.reduce<Record<string, number>>((acc, p) => { acc[p.service] = (acc[p.service] ?? 0) + (p.amount ?? 0); return acc; }, {})
                ).map(([svc, total]) => {
                  const meta = SVC_META[svc];
                  return (
                    <div key={svc} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border"
                      style={{ background: meta?.bg ?? "#ffffff08", borderColor: (meta?.color ?? "#fff") + "30", color: meta?.color ?? "#fff" }}>
                      {meta?.label ?? svc}
                      <span className="font-black">₹{total.toLocaleString("en-IN")}</span>
                    </div>
                  );
                })}
              </div>

              {filtered.length === 0 ? (
                <div className="glass rounded-2xl p-10 text-center text-white/30">No payments match the filters.</div>
              ) : payGroup ? (
                /* ── Grouped by user ── */
                <div className="space-y-4">
                  {Object.entries(byUser).map(([email, userPayments]) => {
                    const u = userPayments[0].user;
                    const userTotal = userPayments.reduce((s, p) => s + (p.amount ?? 0), 0);
                    return (
                      <div key={email} className="glass rounded-2xl border border-white/6 overflow-hidden">
                        {/* User header */}
                        <div className="p-4 flex items-center gap-3 border-b border-white/5 bg-white/2">
                          {u?.image
                            ? <img src={u.image} alt="" className="w-9 h-9 rounded-full border border-white/10 flex-shrink-0" />
                            : <div className="w-9 h-9 rounded-full bg-brand-teal/15 flex items-center justify-center text-brand-teal font-black flex-shrink-0">{(u?.name || email)[0].toUpperCase()}</div>}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-black text-sm">{u?.name || "—"}</p>
                            <p className="text-white/40 text-xs">{email}</p>
                            {u?.phone && <p className="text-white/25 text-[10px]">📞 {u.phone}</p>}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-brand-teal font-black text-base">₹{userTotal.toLocaleString("en-IN")}</p>
                            <p className="text-white/30 text-[10px]">{userPayments.length} payment{userPayments.length > 1 ? "s" : ""}</p>
                          </div>
                          <button onClick={() => sendEmailToUser(email)} disabled={sendingTo === email}
                            className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-white/10 text-white/35 hover:text-brand-teal hover:border-brand-teal/30 text-xs font-bold transition-all disabled:opacity-40">
                            {sendingTo === email ? "…" : "✉ Email"}
                          </button>
                        </div>
                        {/* Payment rows */}
                        <div className="divide-y divide-white/4">
                          {userPayments.map((p) => {
                            const dt = new Date(p.createdAt);
                            return (
                              <div key={p.id} className="px-4 py-3 flex flex-wrap items-center gap-3">
                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ background: p.svc.bg, color: p.svc.color, border: `1px solid ${p.svc.color}30` }}>{p.svc.label}</span>
                                <span className="text-brand-teal font-black text-sm">₹{p.amount?.toLocaleString("en-IN") ?? "—"}</span>
                                <span className="text-white/40 text-xs">{dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                <span className="text-white/25 text-xs">{dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                                {p.razorpayId && <span className="text-white/20 font-mono text-[10px] ml-auto">{p.razorpayId}</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ── Flat list ── */
                <div className="glass rounded-2xl border border-white/6 overflow-hidden">
                  <table className="w-full text-xs min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/6 bg-white/2">
                        <th className="text-left px-5 py-3 text-white/30 font-bold uppercase tracking-widest text-[10px]">Customer</th>
                        <th className="text-left px-4 py-3 text-white/30 font-bold uppercase tracking-widest text-[10px]">Service</th>
                        <th className="text-left px-4 py-3 text-white/30 font-bold uppercase tracking-widest text-[10px]">Amount</th>
                        <th className="text-left px-4 py-3 text-white/30 font-bold uppercase tracking-widest text-[10px]">Date & Time</th>
                        <th className="text-left px-4 py-3 text-white/30 font-bold uppercase tracking-widest text-[10px]">Razorpay / Ref ID</th>
                        <th className="text-center px-4 py-3 text-white/30 font-bold uppercase tracking-widest text-[10px]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/4">
                      {filtered.map((p) => {
                        const dt = new Date(p.createdAt);
                        return (
                          <tr key={p.id} className="hover:bg-white/2 transition-colors">
                            <td className="px-5 py-3">
                              <p className="text-white font-bold">{p.user?.name || "—"}</p>
                              <p className="text-white/35 text-[10px]">{p.email}</p>
                              {p.user?.phone && <p className="text-white/20 text-[10px]">📞 {p.user.phone}</p>}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap"
                                style={{ background: p.svc.bg, color: p.svc.color, border: `1px solid ${p.svc.color}30` }}>
                                {p.svc.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-brand-teal font-black text-sm">₹{p.amount?.toLocaleString("en-IN") ?? "—"}</span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-white/60 font-bold">{dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                              <p className="text-white/25 text-[10px]">{dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-white/25 font-mono text-[10px] max-w-[140px] truncate" title={p.razorpayId || p.id}>
                                {p.razorpayId || p.id}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button onClick={() => sendEmailToUser(p.email)} disabled={sendingTo === p.email}
                                className="px-3 py-1.5 rounded-lg border border-white/10 text-white/35 hover:text-brand-teal hover:border-brand-teal/30 text-[10px] font-bold transition-all disabled:opacity-40 whitespace-nowrap">
                                {sendingTo === p.email ? "…" : "✉ Email"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()}

        {/* Requests tab */}
        {tab === "requests" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-black text-lg">Service Requests ({requests.length})</h2>
              <div className="flex gap-2 text-xs">
                {["new", "contacted", "completed"].map((s) => (
                  <span key={s} className={`px-2 py-0.5 rounded-full border ${STATUS_COLORS[s as keyof typeof STATUS_COLORS]}`}>
                    {s}: {requests.filter((r) => r.status === s).length}
                  </span>
                ))}
              </div>
            </div>
            {requests.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center text-white/30">No service requests yet.</div>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="glass rounded-2xl p-5 border border-white/6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-black">{r.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                        <span className="text-[10px] text-white/30 font-mono capitalize bg-white/5 px-2 py-0.5 rounded-full">{r.serviceType}</span>
                      </div>
                      <p className="text-white/50 text-xs">{r.email}{r.phone ? ` · ${r.phone}` : ""}{r.profileType ? ` · ${r.profileType}` : ""}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white/30 text-xs">{timeAgo(r.createdAt)}</p>
                      {r.hasResume && <span className="text-brand-teal text-[10px] font-semibold">📎 Resume</span>}
                    </div>
                  </div>
                  {r.message && <p className="text-white/50 text-xs leading-relaxed mb-4 bg-white/3 rounded-xl p-3">{r.message}</p>}
                  <div className="flex gap-2">
                    {r.status !== "contacted" && (
                      <button onClick={() => updateStatus(r.id, "contacted")}
                        className="px-3 py-1.5 rounded-lg bg-brand-blue/15 text-brand-blue border border-brand-blue/25 text-xs font-bold hover:bg-brand-blue/25 transition-colors">
                        Mark Contacted
                      </button>
                    )}
                    {r.status !== "completed" && (
                      <button onClick={() => updateStatus(r.id, "completed")}
                        className="px-3 py-1.5 rounded-lg bg-brand-teal/15 text-brand-teal border border-brand-teal/25 text-xs font-bold hover:bg-brand-teal/25 transition-colors">
                        Mark Completed
                      </button>
                    )}
                    <a href={`mailto:${r.email}`}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 border border-white/10 text-xs font-bold hover:text-white transition-colors">
                      Email Client
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Stories tab ── */}
        {tab === "stories" && (
          <div className="space-y-6">
            <h2 className="text-white font-black text-lg">Success Stories ({stories.length} / 6 max)</h2>

            {/* Add story form */}
            <form onSubmit={addStory} className="glass rounded-2xl p-6 border border-white/8 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/60 text-sm font-bold">{editingStoryId ? "Edit Story" : "Add New Story"}</p>
                {editingStoryId && (
                  <button type="button" onClick={() => { setEditingStoryId(null); setStoryForm({ name: "", role: "", result: "", story: "", imageUrl: "" }); }}
                    className="text-white/30 hover:text-white/60 text-xs transition-colors">✕ Cancel edit</button>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Name *</label>
                  <input value={storyForm.name} onChange={(e) => setStoryForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Priya Sharma"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-teal/40 placeholder-white/20" />
                </div>
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Role / Title</label>
                  <input value={storyForm.role} onChange={(e) => setStoryForm((f) => ({ ...f, role: e.target.value }))}
                    placeholder="Software Engineer at Google"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-teal/40 placeholder-white/20" />
                </div>
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Key Result</label>
                <input value={storyForm.result} onChange={(e) => setStoryForm((f) => ({ ...f, result: e.target.value }))}
                  placeholder="Got hired in 3 weeks after LinkedIn rewrite"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-teal/40 placeholder-white/20" />
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Story / Quote *</label>
                <textarea value={storyForm.story} onChange={(e) => setStoryForm((f) => ({ ...f, story: e.target.value }))}
                  rows={3} placeholder="Their testimonial quote…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/80 text-sm resize-none focus:outline-none focus:border-brand-teal/40 placeholder-white/20" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Photo URL (or upload below)</label>
                  <input value={storyForm.imageUrl} onChange={(e) => setStoryForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="https://…"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-teal/40 placeholder-white/20" />
                </div>
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Upload Photo File</label>
                  <input type="file" accept="image/*"
                    onChange={(e) => setStoryFile(e.target.files?.[0] ?? null)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/60 text-xs" />
                </div>
              </div>
              <button type="submit" disabled={storySubmitting}
                className="btn-glow text-white font-bold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50">
                {storySubmitting ? "Saving…" : editingStoryId ? "Save Changes →" : "Add Story →"}
              </button>
            </form>

            {/* Existing stories */}
            {stories.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center text-white/30">No stories yet. Add one above.</div>
            ) : (
              <div className="space-y-3">
                {stories.map((s) => (
                  <div key={s.id} className="glass rounded-2xl p-5 border border-white/6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
                      {s.imageUrl ? (
                        <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-black text-lg">{s.name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white font-bold text-sm">{s.name}</span>
                        {s.role && <span className="text-white/40 text-xs">{s.role}</span>}
                      </div>
                      {s.result && <span className="text-brand-teal text-xs">✓ {s.result}</span>}
                      <p className="text-white/55 text-xs mt-1 leading-relaxed line-clamp-2">&ldquo;{s.story}&rdquo;</p>
                    </div>
                    <button
                      onClick={() => { setEditingStoryId(s.id); setStoryForm({ name: s.name, role: s.role, result: s.result, story: s.story, imageUrl: s.imageUrl }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-brand-blue/10 text-brand-blue border border-brand-blue/25 text-xs font-bold hover:bg-brand-blue/20 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => deleteStory(s.id)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-colors">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Feedback tab ── */}
        {tab === "feedback" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-black text-lg">User Feedback ({feedback.length})</h2>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full border border-brand-teal/30 bg-brand-teal/10 text-brand-teal">
                  Approved: {feedback.filter((f) => f.approved).length}
                </span>
                <span className="px-2 py-0.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
                  Pending: {feedback.filter((f) => !f.approved).length}
                </span>
              </div>
            </div>
            {feedback.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center text-white/30">No feedback submitted yet.</div>
            ) : (
              feedback.map((fb) => (
                <div key={fb.id} className="glass rounded-2xl p-5 border border-white/6">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white font-bold text-sm">{fb.name}</span>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((i) => (
                            <svg key={i} className={`w-3 h-3 ${i <= fb.rating ? "text-amber-400" : "text-white/20"}`} fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>
                        {fb.approved
                          ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal border border-brand-teal/25 font-bold">Live</span>
                          : <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/25 font-bold">Pending</span>}
                      </div>
                      <p className="text-white/35 text-xs">{fb.email} · {fb.service} · {timeAgo(fb.createdAt)}</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed mb-3 bg-white/3 rounded-xl p-3">&ldquo;{fb.message}&rdquo;</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFeedbackApproval(fb.id, !fb.approved)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        fb.approved
                          ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/25 hover:bg-yellow-500/20"
                          : "bg-brand-teal/10 text-brand-teal border border-brand-teal/25 hover:bg-brand-teal/20"
                      }`}>
                      {fb.approved ? "Unpublish" : "Approve & Publish"}
                    </button>
                    <button
                      onClick={() => deleteFeedbackItem(fb.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {/* ── Blogs tab ── */}
        {tab === "blogs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-black text-lg">Blog Posts ({blogs.length})</h2>
              <a href="/blogs" target="_blank" className="text-xs text-brand-teal hover:underline">View public blog →</a>
            </div>

            {/* Write new blog */}
            <form onSubmit={addBlog} className="glass rounded-2xl p-6 border border-white/8 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/60 text-sm font-bold">{editingBlogId ? "Edit Blog Post" : "Write New Blog Post"}</p>
                {editingBlogId && (
                  <button type="button" onClick={() => { setEditingBlogId(null); setBlogForm({ title: "", slug: "", excerpt: "", content: "", coverImage: "", tags: "", author: "ProCareerLaunchpad Team", published: false }); }}
                    className="text-white/30 hover:text-white/60 text-xs transition-colors">✕ Cancel edit</button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Title *</label>
                  <input value={blogForm.title} onChange={(e) => { const title = e.target.value; setBlogForm((f) => ({ ...f, title, slug: f.slug || title.toLowerCase().replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-").slice(0,60) })); }}
                    placeholder="How to Optimize Your LinkedIn Profile"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-teal/40 placeholder-white/20" />
                </div>
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Slug (URL)</label>
                  <input value={blogForm.slug} onChange={(e) => setBlogForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="auto-generated from title"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-teal/40 placeholder-white/20 font-mono text-xs" />
                </div>
              </div>

              <div>
                <label className="text-white/50 text-xs mb-1 block">Excerpt (card preview)</label>
                <input value={blogForm.excerpt} onChange={(e) => setBlogForm((f) => ({ ...f, excerpt: e.target.value }))}
                  placeholder="One or two sentences summarizing the post…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-teal/40 placeholder-white/20" />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Cover Image URL</label>
                  <input value={blogForm.coverImage} onChange={(e) => setBlogForm((f) => ({ ...f, coverImage: e.target.value }))}
                    placeholder="https://…"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-teal/40 placeholder-white/20" />
                </div>
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Tags (comma-separated)</label>
                  <input value={blogForm.tags} onChange={(e) => setBlogForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="LinkedIn, Career, ATS"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-teal/40 placeholder-white/20" />
                </div>
                <div>
                  <label className="text-white/50 text-xs mb-1 block">Author</label>
                  <input value={blogForm.author} onChange={(e) => setBlogForm((f) => ({ ...f, author: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-teal/40" />
                </div>
              </div>

              <div>
                <label className="text-white/50 text-xs mb-1 block">Content * (Markdown supported: # H1, ## H2, **bold**, *italic*, - list, {">"} quote)</label>
                <textarea value={blogForm.content} onChange={(e) => setBlogForm((f) => ({ ...f, content: e.target.value }))}
                  rows={14} placeholder={"# Introduction\n\nYour blog content here...\n\n## Section 1\n\nWrite your paragraphs.\n\n- Bullet point 1\n- Bullet point 2"}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/80 text-sm resize-none focus:outline-none focus:border-brand-teal/40 placeholder-white/20 font-mono leading-relaxed" />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={blogForm.published} onChange={(e) => setBlogForm((f) => ({ ...f, published: e.target.checked }))}
                    className="w-4 h-4 accent-brand-teal" />
                  <span className="text-white/60 text-sm">Publish immediately (visible on /blogs)</span>
                </label>
                <button type="submit" disabled={blogSubmitting}
                  className="btn-glow text-white font-bold px-6 py-2.5 rounded-xl text-sm disabled:opacity-50">
                  {blogSubmitting ? "Saving…" : editingBlogId ? "Save Changes →" : blogForm.published ? "Publish Post →" : "Save as Draft →"}
                </button>
              </div>
            </form>

            {/* Existing blogs */}
            {blogs.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center text-white/30">No blog posts yet. Write your first one above.</div>
            ) : (
              <div className="space-y-3">
                {blogs.map((b) => (
                  <div key={b.id} className="glass rounded-2xl p-5 border border-white/6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-white font-bold text-sm">{b.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${b.published ? "bg-brand-teal/10 text-brand-teal border-brand-teal/25" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/25"}`}>
                            {b.published ? "Live" : "Draft"}
                          </span>
                          {b.tags.map((t) => (
                            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40">{t}</span>
                          ))}
                        </div>
                        <p className="text-white/35 text-xs font-mono">/blogs/{b.slug}</p>
                        {b.excerpt && <p className="text-white/45 text-xs mt-1 line-clamp-1">{b.excerpt}</p>}
                      </div>
                      <div className="flex gap-2 flex-shrink-0 flex-wrap">
                        {b.published
                          ? <a href={`/blogs/${b.slug}`} target="_blank" className="px-3 py-1.5 rounded-lg bg-brand-teal/10 text-brand-teal border border-brand-teal/25 text-xs font-bold hover:bg-brand-teal/20 transition-colors">View</a>
                          : null}
                        <button
                          onClick={() => { setEditingBlogId(b.id); setBlogForm({ title: b.title, slug: b.slug, excerpt: b.excerpt, content: b.content, coverImage: b.coverImage, tags: b.tags.join(", "), author: b.author, published: b.published }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className="px-3 py-1.5 rounded-lg bg-brand-blue/10 text-brand-blue border border-brand-blue/25 text-xs font-bold hover:bg-brand-blue/20 transition-colors">
                          Edit
                        </button>
                        <button onClick={() => toggleBlogPublish(b.id, !b.published)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${b.published ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/25 hover:bg-yellow-500/20" : "bg-brand-teal/10 text-brand-teal border border-brand-teal/25 hover:bg-brand-teal/20"}`}>
                          {b.published ? "Unpublish" : "Publish"}
                        </button>
                        <button onClick={() => deleteBlog(b.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
