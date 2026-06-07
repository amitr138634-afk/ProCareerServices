"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface Blog {
  id: string; title: string; slug: string; excerpt: string;
  coverImage: string; tags: string[]; author: string;
  published: boolean; createdAt: string;
}

function timeAgo(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

const TAG_COLORS: Record<string, string> = {
  LinkedIn: "text-brand-teal border-brand-teal/30 bg-brand-teal/8",
  Naukri: "text-orange-400 border-orange-400/30 bg-orange-400/8",
  ATS: "text-brand-purple border-brand-purple/30 bg-brand-purple/8",
  Resume: "text-blue-400 border-blue-400/30 bg-blue-400/8",
  Career: "text-pink-400 border-pink-400/30 bg-pink-400/8",
  India: "text-amber-400 border-amber-400/30 bg-amber-400/8",
};

function TagBadge({ tag }: { tag: string }) {
  const cls = TAG_COLORS[tag] || "text-white/50 border-white/15 bg-white/5";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>{tag}</span>
  );
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/blogs")
      .then((r) => r.json())
      .then((d) => setBlogs(d.blogs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = blogs.filter((b) =>
    !search ||
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative min-h-screen bg-brand-bg text-white overflow-x-hidden">
      <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      <div className="noise-overlay" />
      <Navbar />

      <section className="relative z-10 pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-teal/25 bg-brand-teal/8 text-brand-teal text-xs font-bold mb-4">
              ✍️ Career Insights & Tips
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3">
              The <span className="gradient-text">ProCareer</span> Blog
            </h1>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              Actionable career tips, job search strategies, and LinkedIn/Naukri optimization guides — written by our team of career experts.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-sm mx-auto mb-10">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search blogs or topics…"
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-teal/40 placeholder-white/25"
              />
            </div>
          </div>

          {/* Blog grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-2xl border border-white/6 overflow-hidden animate-pulse">
                  <div className="h-40 bg-white/5" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-white/10 rounded w-1/3" />
                    <div className="h-4 bg-white/10 rounded w-4/5" />
                    <div className="h-3 bg-white/5 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📝</div>
              <p className="text-white/40 text-sm">{search ? "No blogs match your search." : "No blogs published yet — check back soon!"}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blogs/${blog.slug}`}
                  className="group glass rounded-2xl border border-white/8 overflow-hidden hover:border-brand-teal/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex flex-col"
                >
                  {/* Cover */}
                  {blog.coverImage ? (
                    <img src={blog.coverImage} alt={blog.title} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="h-44 flex items-center justify-center relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg,#10B98112,#8B5CF608)" }}>
                      <svg className="w-12 h-12 text-brand-teal/20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    {blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {blog.tags.slice(0, 3).map((t) => <TagBadge key={t} tag={t} />)}
                      </div>
                    )}
                    <h2 className="text-white font-black text-base leading-snug mb-2 group-hover:text-brand-teal transition-colors line-clamp-2">
                      {blog.title}
                    </h2>
                    {blog.excerpt && (
                      <p className="text-white/45 text-xs leading-relaxed flex-1 line-clamp-3 mb-4">{blog.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/6">
                      <span className="text-white/30 text-[10px]">{blog.author}</span>
                      <span className="text-white/25 text-[10px]">{timeAgo(blog.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6 text-center">
        <Link href="/" className="text-white/30 hover:text-white text-xs transition-colors">← Back to ProCareerLaunchpad</Link>
      </footer>
    </div>
  );
}
