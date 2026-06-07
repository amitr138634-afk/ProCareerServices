import { NextRequest, NextResponse } from "next/server";
import { sendEmailTo, marketingTemplate } from "@/lib/email";

function checkAdmin(req: NextRequest) {
  const pw = process.env.ADMIN_PASSWORD;
  const em = process.env.ADMIN_EMAIL;
  const okPw = pw ? req.headers.get("x-admin-password") === pw : false;
  const okEm = !em || req.headers.get("x-admin-email")?.toLowerCase() === em.toLowerCase();
  return okPw && okEm;
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { to, subject, body, attachment } = await req.json();

    if (!to || !subject || !body)
      return NextResponse.json({ error: "to, subject, and body are required" }, { status: 400 });

    const recipients: string[] = Array.isArray(to) ? to : [to];
    if (recipients.length === 0)
      return NextResponse.json({ error: "No recipients" }, { status: 400 });

    // Resend allows max 50 recipients per call — chunk if needed
    const CHUNK = 50;
    for (let i = 0; i < recipients.length; i += CHUNK) {
      const chunk = recipients.slice(i, i + CHUNK);
      await sendEmailTo({ to: chunk, subject, html: marketingTemplate(subject, body), attachment });
    }

    return NextResponse.json({ success: true, sent: recipients.length });
  } catch (err: unknown) {
    console.error("send-email error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to send" }, { status: 500 });
  }
}
