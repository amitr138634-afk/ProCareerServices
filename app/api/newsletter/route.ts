import { NextRequest, NextResponse } from "next/server";
import { saveSubscriber, getAllSubscribers } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public: subscribe to the newsletter / tips list.
export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();
    if (!email || !EMAIL_RE.test(String(email))) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    const { created } = await saveSubscriber(String(email), String(source || "newsletter"));
    return NextResponse.json({ success: true, created });
  } catch (err) {
    console.error("newsletter subscribe error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Admin only: export the subscriber list. Send header `x-admin-password`.
// Add ?format=csv to download a CSV for import into any email tool.
export async function GET(req: NextRequest) {
  const pass = req.headers.get("x-admin-password");
  if (!pass || pass !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subs = await getAllSubscribers();

  if (new URL(req.url).searchParams.get("format") === "csv") {
    const rows = ["email,source,createdAt", ...subs.map((s) => `${s.email},${s.source},${s.createdAt}`)];
    return new NextResponse(rows.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=subscribers.csv",
      },
    });
  }

  return NextResponse.json({ count: subs.length, subscribers: subs });
}
