import { NextRequest, NextResponse } from "next/server";
import { saveServiceRequest } from "@/lib/db";
import { sendEmail, tableRow, emailTemplate } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let name = "", email = "", phone = "", serviceType = "general", profileType = "", message = "", resumeFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      name        = (form.get("name") as string) ?? "";
      email       = (form.get("email") as string) ?? "";
      phone       = (form.get("phone") as string) ?? "";
      serviceType = (form.get("serviceType") as string) ?? "general";
      profileType = (form.get("profileType") as string) ?? "";
      message     = (form.get("message") as string) ?? "";
      resumeFile  = form.get("resume") as File | null;
    } else {
      const body  = await req.json();
      name        = body.name ?? "";
      email       = body.email ?? "";
      phone       = body.phone ?? "";
      serviceType = body.serviceType ?? "general";
      profileType = body.profileType ?? "";
      message     = body.message ?? "";
    }

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const record = await saveServiceRequest({
      name, email, phone, serviceType, profileType, message, hasResume: !!resumeFile,
    });

    // Send email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const rows = [
          tableRow("Name", name),
          tableRow("Email", email),
          tableRow("Phone", phone),
          tableRow("Service", serviceType),
          profileType ? tableRow("Profile / Project Type", profileType) : "",
          tableRow("Message", message),
          tableRow("Resume Attached", resumeFile ? "Yes" : "No"),
          tableRow("Request ID", record.id),
        ].join("");

        await sendEmail({
          subject: `📩 New ${serviceType} enquiry from ${name}`,
          html: emailTemplate(`New Enquiry — ${serviceType}`, rows),
        });
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
      }
    }

    return NextResponse.json({ success: true, id: record.id });
  } catch (err) {
    console.error("service-request error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
