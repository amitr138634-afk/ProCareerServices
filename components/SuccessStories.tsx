"use client";

import { useState, useEffect, useCallback } from "react";

interface Story { id: string; name: string; role: string; result: string; story: string; imageUrl: string; }
interface Feedback { id: string; name: string; service: string; rating: number; message: string; }

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i <= n ? "text-amber-400" : "text-white/20"}`}
          fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ name, imageUrl, size = 14 }: { name: string; imageUrl?: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  if (imageUrl && imageUrl.length > 0) {
    return (
      <img src={imageUrl} alt={name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    );
  }
  const colors = ["#10B981", "#8B5CF6", "#0EA5E9", "#EC4899", "#F59E0B", "#6366F1"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0 font-black text-white"
      style={{ width: `${size * 4}px`, height: `${size * 4}px`, background: bg, fontSize: `${size * 1.4}px` }}>
      {initials}
    </div>
  );
}

export default function SuccessStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetch("/api/stories").then((r) => r.json()).then((d) => setStories(d.stories ?? [])).catch(() => {});
    fetch("/api/feedback").then((r) => r.json()).then((d) => setFeedback(d.feedback ?? [])).catch(() => {});
  }, []);

  const total = stories.length;
  const next = useCallback(() => setSlide((s) => (s + 1) % Math.max(total, 1)), [total]);
  const prev = useCallback(() => setSlide((s) => (s - 1 + Math.max(total, 1)) % Math.max(total, 1)), [total]);

  useEffect(() => {
    if (paused || total < 2) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next, total]);

  const shown3 = feedback.slice(0, 3);

  return (
    <section id="stories" className="relative z-10 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/25 bg-amber-400/8 text-amber-400 text-xs font-bold mb-4">
            ⭐ Real People. Real Results.
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3">Success Stories</h2>
          <p className="text-white/40 text-sm max-w-md mx-auto">Hear from job seekers who transformed their career with ProCareerLaunchpad.</p>
        </div>

        {/* ── Stories carousel ── */}
        {stories.length === 0 ? (
          <div className="glass rounded-3xl border border-white/8 p-12 text-center mb-10">
            <div className="text-5xl mb-4">🌟</div>
            <p className="text-white/40 text-sm">Success stories will appear here.</p>
            <p className="text-white/25 text-xs mt-1">Added by admin panel → Stories tab.</p>
          </div>
        ) : (
          <div
            className="relative mb-10"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="relative overflow-hidden rounded-3xl h-[340px] sm:h-[280px]">
              {stories.map((s, i) => {
                const diff = ((i - slide) % total + total) % total;
                const x = diff === 0 ? 0 : diff === 1 ? 100 : diff === total - 1 ? -100 : diff < total / 2 ? 200 : -200;
                return (
                  <div
                    key={s.id}
                    className="absolute inset-0 transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(${x}%)`, willChange: "transform" }}
                  >
                    <div className="h-full glass border border-white/10 rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-8">
                      <Avatar name={s.name} imageUrl={s.imageUrl} size={20} />
                      <div className="flex-1 text-center sm:text-left">
                        <blockquote className="text-white/70 text-sm leading-relaxed italic mb-4">
                          &ldquo;{s.story}&rdquo;
                        </blockquote>
                        <div className="font-black text-white text-base">{s.name}</div>
                        {s.role && <div className="text-white/45 text-xs mt-0.5">{s.role}</div>}
                        {s.result && (
                          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/25 text-brand-teal text-xs font-bold">
                            ✓ {s.result}
                          </div>
                        )}
                      </div>
                      <div className="text-[80px] leading-none font-black text-white/5 select-none hidden sm:block">&ldquo;</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {total > 1 && (
              <>
                <button onClick={prev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 glass w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white border border-white/10 transition-all z-10">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={next}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 glass w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white border border-white/10 transition-all z-10">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
                <div className="flex justify-center gap-1.5 mt-4">
                  {stories.map((_, i) => (
                    <button key={i} onClick={() => { setSlide(i); setPaused(true); }}
                      className="rounded-full transition-all duration-300"
                      style={i === slide
                        ? { background: "#10B981", width: "20px", height: "6px" }
                        : { background: "rgba(255,255,255,0.15)", width: "6px", height: "6px" }} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── 3 feedback testimonial cards ── */}
        {shown3.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4">
            {shown3.map((fb) => (
              <div key={fb.id} className="glass rounded-2xl p-5 border border-white/8 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <Stars n={fb.rating} />
                  <span className="text-white/25 text-[10px] uppercase tracking-wider">{fb.service}</span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed flex-1 italic">
                  &ldquo;{fb.message}&rdquo;
                </p>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                  <Avatar name={fb.name} size={8} />
                  <span className="text-white font-semibold text-xs">{fb.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {shown3.length === 0 && stories.length > 0 && (
          <p className="text-center text-white/25 text-xs mt-4">
            Testimonials appear here after admin approval.
          </p>
        )}
      </div>
    </section>
  );
}
