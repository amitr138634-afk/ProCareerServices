import { NextRequest, NextResponse } from "next/server";
import {
  saveBlog, updateBlog, getPublishedBlogs, getAllBlogsAdmin,
  getBlogBySlug, deleteBlog,
} from "@/lib/db";

const isAdmin = (req: NextRequest) => {
  const pw = process.env.ADMIN_PASSWORD;
  const em = process.env.ADMIN_EMAIL;
  const okPw = pw ? req.headers.get("x-admin-password") === pw : false;
  const okEm = !em || req.headers.get("x-admin-email")?.toLowerCase() === em.toLowerCase();
  return okPw && okEm;
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const blog = await getBlogBySlug(slug);
    if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ blog });
  }

  if (isAdmin(req)) {
    const blogs = await getAllBlogsAdmin();
    return NextResponse.json({ blogs });
  }
  const blogs = await getPublishedBlogs();
  return NextResponse.json({ blogs });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { title, excerpt, content, coverImage = "", tags = [], author = "ProCareerLaunchpad Team", published = false } = body;
    if (!title || !content) return NextResponse.json({ error: "title and content required" }, { status: 400 });
    const slug = body.slug?.trim() || slugify(title);
    const blog = await saveBlog({ title, slug, excerpt: excerpt || "", content, coverImage, tags, author, published });
    return NextResponse.json({ blog }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await updateBlog(id, updates);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deleteBlog(id);
  return NextResponse.json({ ok: true });
}
