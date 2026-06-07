import { NextRequest, NextResponse } from "next/server";
import { saveStory, getAllStories, deleteStory } from "@/lib/db";

function checkAdmin(req: NextRequest) {
  const pw = process.env.ADMIN_PASSWORD;
  const em = process.env.ADMIN_EMAIL;
  const okPw = pw ? req.headers.get("x-admin-password") === pw : false;
  const okEm = !em || req.headers.get("x-admin-email")?.toLowerCase() === em.toLowerCase();
  return okPw && okEm;
}

export async function GET() {
  const stories = await getAllStories();
  return NextResponse.json({ stories });
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Support both JSON and FormData (for image upload)
  const contentType = req.headers.get("content-type") ?? "";
  let name = "", role = "", result = "", story = "", imageUrl = "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    name = String(form.get("name") ?? "");
    role = String(form.get("role") ?? "");
    result = String(form.get("result") ?? "");
    story = String(form.get("story") ?? "");
    imageUrl = String(form.get("imageUrl") ?? "");
    const file = form.get("image") as File | null;
    if (file && file.size > 0) {
      const buf = await file.arrayBuffer();
      const b64 = Buffer.from(buf).toString("base64");
      imageUrl = `data:${file.type};base64,${b64}`;
    }
  } else {
    const body = await req.json();
    ({ name, role, result, story, imageUrl } = body);
  }

  if (!name || !story) return NextResponse.json({ error: "name and story required" }, { status: 400 });

  const record = await saveStory({ name, role, result, story, imageUrl });
  return NextResponse.json({ success: true, story: record });
}

export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deleteStory(id);
  return NextResponse.json({ success: true });
}
