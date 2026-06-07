import { NextRequest, NextResponse } from "next/server";
import { upsertUser, markUserPaid } from "@/lib/db";

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
    const { name, email, phone, services } = await req.json();

    if (!name || !email)
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });

    await upsertUser({ email: email.toLowerCase(), name, phone: phone?.trim() || undefined });

    if (Array.isArray(services)) {
      for (const svc of services) {
        await markUserPaid(email.toLowerCase(), svc);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("add-user error:", err);
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
  }
}
