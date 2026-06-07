import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, upsertUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password)
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });

    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    const existing = await getUserByEmail(email.toLowerCase());
    if (existing?.passwordHash)
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    await upsertUser({ email: email.toLowerCase(), name, phone: phone?.trim() || undefined, passwordHash });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("signup error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
