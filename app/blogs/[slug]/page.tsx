"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface Blog {
  id: string; title: string; slug: string; excerpt: string;
  content: string; coverImage: string; tags: string[];
  author: string; createdAt: string;
}

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${i}`} className="space-y-1.5 mb-5 pl-4">
          {listItems.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-white/65 text-sm leading-relaxed">
              <span className="text-brand-teal mt-1.5 flex-shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("# ")) {
      flushList();
      elements.push(<h1 key={i} className="text-2xl md:text-3xl font-black text-white mb-4 mt-6">{line.slice(2)}</h1>);
    } else if (line.startsWith("## ")) {
      flushList();
      elements.push(<h2 key={i} className="text-xl font-black text-white mb-3 mt-6">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      flushList();
      elements.push(<h3 key={i} className="text-base font-black text-white mb-2 mt-4" style={{ color: "#10B981" }}>{line.slice(4)}</h3>);
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      listItems.push(line.slice(2));
    } else if (line.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote key={i} className="border-l-2 border-brand-teal pl-4 py-1 my-4 italic text-white/55 text-sm leading-relaxed">
          {line.slice(2)}
        </blockquote>
      );
    } else if (line.trim() === "") {
      flushList();
      if (i > 0) elements.push(<div key={i} className="mb-3" />);
    } else if (line.trim() === "---") {
      flushList();
      elements.push(<hr key={i} className="border-white/10 my-6" />);
    } else {
      flushList();
      elements.push(
        <p key={i} className="text-white/65 text-sm leading-relaxed mb-2"
          dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      );
    }
    i++;
  }
  flushList();
  return elements;
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-white/80 italic">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-white/8 text-brand-teal px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/blogs?slug=${encodeURIComponent(slug)}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((d) => { if (d?.blog) setBlog(d.blog); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-white">
        <div className="text-5xl mb-4">📭</div>
        <h1 className="text-2xl font-black mb-2">Blog post not found</h1>
        <Link href="/blogs" className="text-brand-teal hover:underline text-sm">← Back to all blogs</Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-brand-bg text-white overflow-x-hidden">
      <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      <div className="noise-overlay" />
      <Navbar />

      <article className="relative z-10 pt-28 pb-16 px-6">
        <div className="max-w-2xl mx-auto">

          {/* Back link */}
          <Link href="/blogs" className="inline-flex items-center gap-1.5 text-white/35 hover:text-white text-xs mb-8 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All Blogs
          </Link>

          {/* Tags */}
          {blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.map((t) => (
                <span key={t} className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-brand-teal/30 bg-brand-teal/8 text-brand-teal">{t}</span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">{blog.title}</h1>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/8">
            <div className="w-8 h-8 rounded-full btn-glow flex items-center justify-center text-white font-black text-xs">S</div>
            <div>
              <p className="text-white/70 text-xs font-semibold">{blog.author}</p>
              <p className="text-white/30 text-[10px]">
                {new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Cover image */}
          {blog.coverImage && (
            <img src={blog.coverImage} alt={blog.title}
              className="w-full rounded-2xl mb-8 border border-white/8"
              style={{ maxHeight: "400px", objectFit: "cover" }}
            />
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            {renderContent(blog.content)}
          </div>

          {/* CTA */}
          <div className="mt-12 glass rounded-2xl p-6 border border-brand-teal/20 text-center"
            style={{ background: "linear-gradient(135deg,#10B98110,#0EA5E908)" }}>
            <p className="text-brand-teal font-black text-sm mb-1">Ready to take action?</p>
            <p className="text-white/50 text-xs mb-4">Use our AI tools to optimize your profile and get more interviews.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/optimize" className="btn-glow text-white font-bold px-5 py-2.5 rounded-xl text-sm">LinkedIn Optimizer →</Link>
              <Link href="/naukri" className="text-white font-bold px-5 py-2.5 rounded-xl text-sm border border-white/15 hover:bg-white/5 transition-colors">Naukri Optimizer →</Link>
            </div>
          </div>

          {/* Back */}
          <div className="mt-8 text-center">
            <Link href="/blogs" className="text-white/30 hover:text-white text-xs transition-colors">← More articles</Link>
          </div>
        </div>
      </article>
    </div>
  );
}
