import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const TO = process.env.SMTP_TO ?? "info@procareerlaunchpad.com";
const FROM = process.env.SMTP_FROM ?? "ProCareerLaunchpad <onboarding@resend.dev>";

export async function sendEmail({
  subject,
  html,
}: {
  subject: string;
  html: string;
}) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: [TO],
    subject,
    html,
  });
  if (error) throw new Error(error.message);
}

export async function sendEmailTo({
  to,
  subject,
  html,
  attachment,
}: {
  to: string | string[];
  subject: string;
  html: string;
  attachment?: { name: string; base64: string; mimeType: string } | null;
}) {
  const recipients = Array.isArray(to) ? to : [to];
  const payload: Parameters<typeof resend.emails.send>[0] = {
    from: FROM,
    to: recipients,
    subject,
    html,
  };
  if (attachment?.base64) {
    payload.attachments = [{
      filename: attachment.name,
      content: Buffer.from(attachment.base64, "base64"),
    }];
  }
  const { error } = await resend.emails.send(payload);
  if (error) throw new Error(error.message);
}

export function marketingTemplate(subject: string, bodyHtml: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#07071A;font-family:sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#0d0d2b;border:1px solid #1e1e40;border-radius:12px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#10B981,#0EA5E9);padding:20px 24px">
      <h1 style="margin:0;color:#fff;font-size:18px">ProCareerLaunchpad</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px">${subject}</p>
    </div>
    <div style="padding:28px 24px;color:#ddd;font-size:15px;line-height:1.7">${bodyHtml}</div>
    <div style="padding:16px 24px;border-top:1px solid #1e1e40;text-align:center">
      <p style="margin:0;color:#555;font-size:12px">© ProCareerLaunchpad · <a href="${SITE_URL}" style="color:#10B981;text-decoration:none">${SITE_URL.replace(/https?:\/\//, "")}</a></p>
      <p style="margin:4px 0 0;color:#444;font-size:11px">You're receiving this because you signed up for our career tools.</p>
    </div>
  </div>
</body></html>`;
}

export function tableRow(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 12px;border:1px solid #2a2a3a;background:#12122a;color:#aaa;white-space:nowrap;font-weight:600">${label}</td>
    <td style="padding:8px 12px;border:1px solid #2a2a3a;color:#eee">${value || "—"}</td>
  </tr>`;
}

export function emailTemplate(title: string, rows: string, extra = "") {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#07071A;font-family:sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#0d0d2b;border:1px solid #1e1e40;border-radius:12px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#10B981,#0EA5E9);padding:20px 24px">
      <h1 style="margin:0;color:#fff;font-size:18px">ProCareerLaunchpad</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px">${title}</p>
    </div>
    <div style="padding:24px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      ${extra}
    </div>
    <div style="padding:16px 24px;border-top:1px solid #1e1e40;text-align:center">
      <p style="margin:0;color:#555;font-size:12px"><a href="${SITE_URL}" style="color:#10B981;text-decoration:none">${SITE_URL.replace(/https?:\/\//, "")}</a></p>
    </div>
  </div>
</body></html>`;
}
