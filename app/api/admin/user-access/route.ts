import { NextRequest, NextResponse } from "next/server";
import { grantServiceAccess, revokeUserService } from "@/lib/db";

function checkAdmin(req: NextRequest) {
  const pw = process.env.ADMIN_PASSWORD;
  const em = process.env.ADMIN_EMAIL;
  const okPw = pw ? req.headers.get("x-admin-password") === pw : false;
  const okEm = !em || req.headers.get("x-admin-email")?.toLowerCase() === em.toLowerCase();
  return okPw && okEm;
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, service, grant } = await req.json();
  if (!email || !service || grant === undefined)
    return NextResponse.json({ error: "email, service and grant required" }, { status: 400 });

  if (grant) {
    await grantServiceAccess(email, service);
  } else {
    await revokeUserService(email, service);
  }

  return NextResponse.json({ success: true });
}
