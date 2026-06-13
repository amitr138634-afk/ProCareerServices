import { NextRequest, NextResponse } from "next/server";
import { getAllSubscribers } from "@/lib/db";
import { sendNewsletter, marketingTemplate } from "@/lib/email";

// Admin only: send a newsletter to all subscribers (or a test to your own inbox).
// Header: x-admin-password. Body: { subject, body, test? }
export async function POST(req: NextRequest) {
  const pass = req.headers.get("x-admin-password");
  if (!pass || pass !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subject, body, test } = await req.json();
    if (!subject?.trim() || !body?.trim()) {
      return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
    }

    const html = marketingTemplate(subject, String(body).replace(/\n/g, "<br>"));

    if (test) {
      const me = process.env.SMTP_TO ?? "info@procareerlaunchpad.com";
      await sendNewsletter({ subject: `[TEST] ${subject}`, html, recipients: [me] });
      return NextResponse.json({ success: true, sent: 1, test: true });
    }

    const subs = await getAllSubscribers();
    const { sent } = await sendNewsletter({ subject, html, recipients: subs.map((s) => s.email) });
    return NextResponse.json({ success: true, sent });
  } catch (err) {
    console.error("send-newsletter error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send" },
      { status: 500 }
    );
  }
}
