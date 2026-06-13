import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getPublishedBlogs } from "@/lib/db";

// Public, indexable routes. Private/app routes (admin, dashboard, pay, login, api) are excluded.
const ROUTES: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, freq: "daily" },
  { path: "/optimize", priority: 0.9, freq: "weekly" },
  { path: "/ats", priority: 0.9, freq: "weekly" },
  { path: "/naukri", priority: 0.9, freq: "weekly" },
  { path: "/resume", priority: 0.9, freq: "weekly" },
  { path: "/marketing", priority: 0.9, freq: "weekly" },
  { path: "/portfolio", priority: 0.8, freq: "weekly" },
  { path: "/career", priority: 0.8, freq: "weekly" },
  { path: "/webdev", priority: 0.8, freq: "weekly" },
  { path: "/courses", priority: 0.6, freq: "monthly" },
  { path: "/erp", priority: 0.6, freq: "monthly" },
  { path: "/legal-ai", priority: 0.6, freq: "monthly" },
  { path: "/blogs", priority: 0.7, freq: "daily" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const blogs = await getPublishedBlogs();
    blogPages = blogs.map((b) => ({
      url: `${SITE_URL}/blogs/${b.slug}`,
      lastModified: new Date(b.updatedAt || b.createdAt || now),
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    // If the data store is unavailable at build time, ship the static sitemap.
  }

  return [...staticPages, ...blogPages];
}
