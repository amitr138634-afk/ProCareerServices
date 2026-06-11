"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "assistant" | "user";
  text: string;
  time?: string;
}

const TAWK_PROPERTY = process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID || "";
const TAWK_WIDGET   = process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID   || "default";
const TAWK_DIRECT   = `https://tawk.to/chat/${TAWK_PROPERTY}/${TAWK_WIDGET}`;
const FALLBACK_EMAIL = "info@procareerlaunchpad.com";

const GREETING: Message = {
  role: "assistant",
  text: "Hey there! 👋 I'm Shyam AI — your 24/7 guide to everything Shyam Pro Services.\n\nAsk me about pricing, services, or how we can help you grow. I'm here!",
};

const QUICK_REPLIES = [
  "What services do you offer?",
  "What's the price?",
  "How does LinkedIn Optimizer work?",
  "Tell me about ATS Scanner",
];

// ── Fallback stages ────────────────────────────────────────────────────────
// 1. AI chat (default)
// 2. Contact capture (ask email/phone when "Talk to human" clicked)
// 3. Tawk.to live chat  (opens embed or direct link)
// 4. Offline fallback   (agent unavailable → "we'll reach out" + email sent)
type Stage = "chat" | "capture" | "connecting" | "offline";

function timestamp() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTawk(): any { return (typeof window !== "undefined" ? (window as any).Tawk_API : null) ?? null; }

export default function ChatWidget() {
  const [open, setOpen]           = useState(false);
  const [stage, setStage]         = useState<Stage>("chat");
  const [messages, setMessages]   = useState<Message[]>([{ ...GREETING, time: timestamp() }]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [showHint, setShowHint]   = useState(false);
  const [unread, setUnread]       = useState(1);
  const [quickShow, setQuickShow] = useState(true);

  // Contact capture state
  const [contact, setContact]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);

  // ── Load Tawk.to — starts normally so agents see live visitors ────────────
  useEffect(() => {
    if (!TAWK_PROPERTY || typeof window === "undefined") return;
    if (document.querySelector('script[src*="tawk.to"]')) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Tawk_API = (window as any).Tawk_API || {};

    // Hide the default Tawk.to bubble BEFORE the script loads
    // We manage our own chat button / UI
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Tawk_API.onLoad = function () {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Tawk_API.hideWidget();
    };

    const s = document.createElement("script");
    s.async = true;
    s.src = `https://embed.tawk.to/${TAWK_PROPERTY}/${TAWK_WIDGET}`;
    s.charset = "UTF-8";
    s.setAttribute("crossorigin", "*");
    document.head.appendChild(s);
  }, []);

  // "Need help?" hint after 3 s
  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open) { setUnread(0); setShowHint(false); setTimeout(() => inputRef.current?.focus(), 150); }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, stage]);

  useEffect(() => {
    if (stage === "capture") setTimeout(() => contactRef.current?.focus(), 150);
  }, [stage]);

  // ── Send AI message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text?: string) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");
    setQuickShow(false);
    const userMsg: Message = { role: "user", text: userText, time: timestamp() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res  = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history: messages.slice(-8) }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        text: data.reply || "Great question — let me connect you with our team!",
        time: timestamp(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "Something went wrong. Click 'Talk to a Human' below and we'll help you right away!",
        time: timestamp(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  // ── Stage 2 → contact capture → Stage 3 Tawk.to ───────────────────────────
  const submitContact = useCallback(async () => {
    if (!contact.trim() || submitting) return;
    setSubmitting(true);

    // Save to feedback API so admin gets notified regardless of Tawk.to
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Chat Widget — Human Request",
          email: contact.includes("@") ? contact : FALLBACK_EMAIL,
          phone: !contact.includes("@") ? contact : "",
          message: `Human agent requested via AI chat widget.\nUser contact: ${contact}\n\nChat summary:\n${messages.slice(-6).map(m => `[${m.role}]: ${m.text}`).join("\n")}`,
          rating: 5,
        }),
      });
    } catch { /* non-blocking — always continue */ }

    setSubmitting(false);
    setStage("connecting");

    const tawk = getTawk();

    // Pass visitor's contact to Tawk.to so it shows in your agent dashboard
    if (tawk?.setAttributes) {
      tawk.setAttributes(
        {
          name: contact.includes("@") ? contact.split("@")[0] : contact,
          ...(contact.includes("@") ? { email: contact } : { phone: contact }),
        },
        () => {}
      );
    }

    if (tawk?.showWidget) {
      // showWidget + maximize opens the Tawk.to chat panel
      tawk.showWidget();
      tawk.maximize?.();
    } else if (TAWK_PROPERTY) {
      // Fallback: open the direct Tawk.to link in a popup
      window.open(TAWK_DIRECT, "tawkto_chat", "width=420,height=620,resizable=yes");
    }

    // After 12 s on the connecting screen with no Tawk.to interaction → offline fallback
    setTimeout(() => {
      setStage(prev => prev === "connecting" ? "offline" : prev);
    }, 12000);
  }, [contact, submitting, messages]);

  // ── Render helpers ─────────────────────────────────────────────────────────
  const panelContent = () => {
    // Stage 2 — contact form
    if (stage === "capture") return (
      <div className="flex-1 overflow-y-auto px-5 py-5" style={{ minHeight: 0 }}>
        <button onClick={() => setStage("chat")}
          className="text-white/30 hover:text-white/60 text-xs mb-5 flex items-center gap-1 transition-colors">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to chat
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
          style={{ background: "rgba(16,185,129,0.15)" }}>👤</div>
        <h3 className="text-white font-bold text-base mb-1">Connect with our team</h3>
        <p className="text-white/45 text-xs mb-5 leading-relaxed">
          Share your email or phone number and we&apos;ll connect you right away. If no agent is available, we&apos;ll reach out to you within a few hours.
        </p>
        <div className="space-y-3">
          <input
            ref={contactRef}
            value={contact}
            onChange={e => setContact(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submitContact()}
            placeholder="Email address or phone number"
            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            onFocus={e => (e.target.style.borderColor = "rgba(16,185,129,0.6)")}
            onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
          />
          <button
            onClick={submitContact}
            disabled={!contact.trim() || submitting}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg,#10B981,#6366F1)" }}
          >
            {submitting ? "Connecting…" : "Connect Me to a Human →"}
          </button>
          <p className="text-white/20 text-[10px] text-center">No spam · We reply within a few hours</p>
        </div>
      </div>
    );

    // Stage 3 — connecting (Tawk.to opened)
    if (stage === "connecting") return (
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 text-center" style={{ minHeight: 0 }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
          style={{ background: "rgba(16,185,129,0.15)", animation: "pulse 2s ease-in-out infinite" }}>
          <svg className="w-7 h-7 text-brand-teal" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z"/>
          </svg>
        </div>
        <h3 className="text-white font-bold text-base mb-2">Connecting you now…</h3>
        <p className="text-white/45 text-xs leading-relaxed">
          Opening Tawk.to live chat. If a pop-up didn&apos;t open,{" "}
          <a href={TAWK_PROPERTY ? TAWK_DIRECT : "#"} target="_blank" rel="noreferrer"
            className="text-brand-teal/80 hover:text-brand-teal underline">
            click here
          </a>
          .
        </p>
        <p className="text-white/25 text-[11px] mt-4">
          No answer? We&apos;ll fall back automatically in a few seconds.
        </p>
      </div>
    );

    // Stage 4 — offline fallback
    if (stage === "offline") return (
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 text-center" style={{ minHeight: 0 }}>
        <div className="text-3xl mb-4">📩</div>
        <h3 className="text-white font-bold text-base mb-2">Our team is offline right now</h3>
        <p className="text-white/50 text-xs leading-relaxed mb-4">
          Don&apos;t worry — we&apos;ve saved your contact{" "}
          <span className="text-white/80 font-medium">{contact}</span>
          {" "}and will personally reach out within a few hours.
        </p>
        <div className="w-full rounded-xl px-4 py-3 text-xs text-white/40 text-left space-y-1"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p>📧 Email us directly:</p>
          <a href={`mailto:${FALLBACK_EMAIL}`} className="text-brand-teal/80 hover:text-brand-teal transition-colors">
            {FALLBACK_EMAIL}
          </a>
          <p className="pt-1">📅 Or book a free call:</p>
          <a href="https://calendar.app.google/HbKg3j7UYVZXKxxaA" target="_blank" rel="noreferrer"
            className="text-brand-teal/80 hover:text-brand-teal transition-colors">
            Book a 15-min discovery call
          </a>
        </div>
        <button onClick={() => { setStage("chat"); setContact(""); }}
          className="mt-5 px-6 py-2 rounded-full text-xs text-white/35 hover:text-white/60 border border-white/10 hover:border-white/25 transition-all">
          ← Back to AI chat
        </button>
      </div>
    );

    // Stage 1 — normal AI chat
    return (
      <>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: 0 }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user" ? "text-white rounded-tr-sm" : "text-white/85 rounded-tl-sm"
                }`}
                style={
                  msg.role === "user"
                    ? { background: "linear-gradient(135deg,#10B981,#6366F1)" }
                    : { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.06)" }
                }
              >
                {msg.text}
              </div>
              {msg.time && <span className="text-white/20 text-[10px] mt-0.5 px-1">{msg.time}</span>}
            </div>
          ))}

          {loading && (
            <div className="flex items-start">
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex gap-1 items-center">
                  {[0,1,2].map(n => (
                    <span key={n} className="w-1.5 h-1.5 bg-white/40 rounded-full"
                      style={{ animation: `dotBounce 1.2s ease-in-out ${n * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {quickShow && messages.length === 1 && !loading && (
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_REPLIES.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/30 transition-all hover:bg-white/5">
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Human handoff button */}
        <div className="px-4 pt-1 flex-shrink-0">
          <button onClick={() => setStage("capture")}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-white/35 hover:text-white/70 border border-white/5 hover:border-white/15 transition-all hover:bg-white/5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            Talk to a human agent
          </button>
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2 flex-shrink-0">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Type your question…"
              className="flex-1 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              onFocus={e => (e.target.style.borderColor = "rgba(16,185,129,0.5)")}
              onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#10B981,#6366F1)" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-white/15 text-[10px] text-center mt-2">Powered by Shyam AI</p>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-3">

        {/* "Need help?" hint */}
        {showHint && !open && (
          <div
            className="flex items-center gap-2 bg-white text-gray-800 text-sm px-4 py-2.5 rounded-2xl rounded-br-none shadow-xl font-medium cursor-pointer select-none"
            onClick={() => setOpen(true)}
            style={{ animation: "slideInRight 0.3s ease" }}
          >
            <span>Hey! Need any help? 👋</span>
            <button onClick={e => { e.stopPropagation(); setShowHint(false); }}
              className="text-gray-400 hover:text-gray-600 ml-1 text-xs leading-none">✕</button>
          </div>
        )}

        {/* Chat panel */}
        {open && (
          <div
            className="w-[340px] rounded-2xl overflow-hidden shadow-2xl flex flex-col relative"
            style={{
              background: "#0d1117",
              border: "1px solid rgba(255,255,255,0.1)",
              maxHeight: "520px",
              animation: "slideUp 0.25s ease",
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#10B981 0%,#6366F1 100%)" }}>
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xl">
                  {stage === "chat" ? "🤖" : "👤"}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-none">
                  {stage === "chat" ? "Shyam AI" : "Human Support"}
                </p>
                <p className="text-white/70 text-xs mt-0.5">
                  {stage === "chat"    && "Online · Replies instantly"}
                  {stage === "capture" && "Tell us how to reach you"}
                  {stage === "connecting" && "Connecting to agent…"}
                  {stage === "offline" && "We'll reach out shortly"}
                </p>
              </div>
              <button onClick={() => setOpen(false)}
                className="text-white/60 hover:text-white transition-colors text-lg leading-none">✕</button>
            </div>

            {panelContent()}
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 relative"
          style={{
            background: open ? "rgba(99,102,241,0.9)" : "linear-gradient(135deg,#10B981 0%,#6366F1 100%)",
            boxShadow: "0 4px 24px rgba(16,185,129,0.4)",
          }}
          aria-label={open ? "Close chat" : "Open chat"}
        >
          {open ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          )}
          {!open && unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      </div>

      <style>{`
        @keyframes slideUp       { from{opacity:0;transform:translateY(20px) scale(.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes slideInRight  { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes dotBounce     { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        @keyframes pulse         { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
      `}</style>
    </>
  );
}
