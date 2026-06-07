import { NextRequest, NextResponse } from "next/server";
import { saveFeedback, getApprovedFeedback, getAllFeedbackAdmin, approveFeedback } from "@/lib/db";
import { sendEmail, tableRow, emailTemplate } from "@/lib/email";

function checkAdmin(req: NextRequest) {
  const pw = process.env.ADMIN_PASSWORD;
  const em = process.env.ADMIN_EMAIL;
  const okPw = pw ? req.headers.get("x-admin-password") === pw : false;
  const okEm = !em || req.headers.get("x-admin-email")?.toLowerCase() === em.toLowerCase();
  return okPw && okEm;
}

export async function GET(req: NextRequest) {
  const admin = checkAdmin(req);
  const feedback = admin ? await getAllFeedbackAdmin() : await getApprovedFeedback();
  return NextResponse.json({ feedback });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, service, rating, message } = body;
  if (!name || !email || !rating || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const record = await saveFeedback({
    name, email,
    service: service || "general",
    rating: Number(rating),
    message,
  });

  // Email notification via Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const stars = "⭐".repeat(Number(rating));
      const rows = [
        tableRow("Name", name),
        tableRow("Email", email),
        tableRow("Service", service || "General"),
        tableRow("Rating", `${stars} (${rating}/5)`),
        tableRow("Feedback", message),
      ].join("");
      await sendEmail({
        subject: `⭐ New Feedback ${rating}/5 from ${name}`,
        html: emailTemplate("New Feedback Received", rows),
      });
    } catch { /* email optional */ }
  }

  return NextResponse.json({ success: true, id: record.id });
}

export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, approved } = await req.json();
  if (!id || approved === undefined) return NextResponse.json({ error: "id and approved required" }, { status: 400 });
  await approveFeedback(id, Boolean(approved));
  return NextResponse.json({ success: true });
}
