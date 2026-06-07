"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { NAUKRI_STEPS } from "@/lib/naukri-steps";
import { usePaid } from "./PaidContext";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const FREE_STEPS_COUNT = 4;
const NAUKRI_COLOR = "#FF6B35";
const SESSION_KEY = "procareer_naukri_session";
const PAID_KEY = "naukri_optimizer_paid";
const IS_TEST_MODE = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith("rzp_test");

interface Message { id: string; role: "user" | "assistant"; content: string; }
interface Todo { id: string; action: string; completed: boolean; }

function AnimatedBackground() {
  return (
    <>
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="noise-overlay" />
    </>
  );
}

function TypingIndicator({ aiStep }: { aiStep?: boolean }) {
  return (
    <div className="flex items-start gap-3 message-animate">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-black"
        style={{ background: `linear-gradient(135deg,${NAUKRI_COLOR},#F97316)` }}>N</div>
      <div className="glass rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-white/40 rounded-full typing-dot" />
          <span className="w-2 h-2 bg-white/40 rounded-full typing-dot" />
          <span className="w-2 h-2 bg-white/40 rounded-full typing-dot" />
        </div>
        {aiStep && <span className="text-xs text-white/30">Analyzing your Naukri profile…</span>}
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-start gap-3 message-animate ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-black"
          style={{ background: `linear-gradient(135deg,${NAUKRI_COLOR},#F97316)` }}>N</div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser ? "rounded-tr-none text-white/90" : "glass rounded-tl-none text-white/80"
        }`}
        style={isUser ? { background: `rgba(255,107,53,0.12)`, border: `1px solid rgba(255,107,53,0.2)` } : undefined}
      >
        {msg.content}
      </div>
    </div>
  );
}

function PaywallCard({ profileData, onPayment, onSkip, isProcessing }: {
  profileData: Record<string, string>;
  onPayment: () => void; onSkip: () => void; isProcessing: boolean;
}) {
  const target = profileData["target-role"] || "your target role";
  return (
    <div className="message-animate my-2">
      <div style={{ border: `1px solid ${NAUKRI_COLOR}40`, borderRadius: "1rem", background: "rgba(255,107,53,0.04)" }}>
        <div className="rounded-[calc(1rem-1px)] p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🎉</span>
            <h3 className="text-lg font-black text-white">Free Analysis Complete!</h3>
          </div>
          <p className="text-white/40 text-sm mb-5">Here's what we've analyzed so far:</p>

          <div className="space-y-2 mb-5">
            {[
              { label: "Naukri Profile URL", note: "Verified" },
              { label: "Target Role", note: target.slice(0, 40) + (target.length > 40 ? "…" : "") },
              { label: "Experience Level", note: profileData["experience"] ? "Mapped" : "Noted" },
              { label: "CTC & Notice Period", note: "Strategy ready" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" style={{ color: NAUKRI_COLOR }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white/60">{item.label}:</span>
                <span className="text-white/90 font-medium">{item.note}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4 mb-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">🔒 Unlock 9 More Sections — ₹200</p>
            <div className="flex flex-wrap gap-1.5">
              {["Resume Headline", "Profile Summary", "Key Skills", "Work Experience", "IT Skills", "Projects", "Education", "Preferred Locations", "Online Profiles"].map((s) => (
                <span key={s} className="text-xs text-white/40 px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>{s}</span>
              ))}
            </div>
          </div>

          {IS_TEST_MODE && (
            <div className="rounded-xl p-3 mb-4" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)" }}>
              <p className="text-yellow-400 text-xs font-bold mb-1">⚠️ TEST MODE</p>
              <p className="text-yellow-300/60 text-xs">Card: 4111 1111 1111 1111 | Exp: 12/26 | CVV: 123 · UPI: success@razorpay</p>
            </div>
          )}

          <button onClick={onPayment} disabled={isProcessing}
            className="w-full text-white font-black py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg,${NAUKRI_COLOR},#F97316)` }}>
            {isProcessing
              ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Processing…</>
              : "Pay ₹200 to Unlock Full Report →"}
          </button>

          {IS_TEST_MODE && (
            <button onClick={onSkip}
              className="w-full mt-2 text-white/30 hover:text-white/60 text-xs py-2 rounded-xl transition-colors border border-white/5 hover:border-white/10">
              Skip Payment (Test Mode Only)
            </button>
          )}
          <p className="text-center text-white/20 text-xs mt-2">Secured by Razorpay · Instant access after payment</p>
        </div>
      </div>
    </div>
  );
}

function StepSidebar({ currentIndex, completedSteps, hasPaid }: {
  currentIndex: number; completedSteps: Set<number>; hasPaid: boolean;
}) {
  return (
    <div className="w-52 flex-shrink-0 glass-dark border-r border-white/5 overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs"
            style={{ background: `linear-gradient(135deg,${NAUKRI_COLOR},#F97316)` }}>N</div>
          <span className="text-xs font-black text-white/80 tracking-tight">Naukri<span style={{ color: NAUKRI_COLOR }}>.</span>Optimizer</span>
        </div>
      </div>

      <div className="py-2 flex-1">
        <div className="px-4 pt-2 pb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: NAUKRI_COLOR }}>Free</span>
        </div>
        {NAUKRI_STEPS.slice(0, FREE_STEPS_COUNT).map((step, i) => {
          const isDone = completedSteps.has(i);
          const isActive = i === currentIndex;
          return (
            <div key={step.id} className={`flex items-center justify-between px-4 py-2 text-[10px] font-bold tracking-wider transition-colors ${isActive ? "" : isDone ? "text-white/30" : "text-white/20"}`}
              style={isActive ? { color: NAUKRI_COLOR } : undefined}>
              <span>{step.label}</span>
              {isDone && (
                <svg className="w-3 h-3" style={{ color: NAUKRI_COLOR }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          );
        })}

        <div className="px-4 pt-3 pb-1">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${hasPaid ? "" : "text-white/20"}`}
            style={hasPaid ? { color: NAUKRI_COLOR } : undefined}>
            {hasPaid ? "Unlocked" : "🔒 Premium"}
          </span>
        </div>
        {NAUKRI_STEPS.slice(FREE_STEPS_COUNT).map((step, i) => {
          const absIndex = i + FREE_STEPS_COUNT;
          const isDone = completedSteps.has(absIndex);
          const isActive = absIndex === currentIndex;
          return (
            <div key={step.id} className={`flex items-center justify-between px-4 py-2 text-[10px] font-bold tracking-wider transition-colors ${!hasPaid ? "text-white/10" : isActive ? "" : isDone ? "text-white/30" : "text-white/20"}`}
              style={(hasPaid && isActive) ? { color: NAUKRI_COLOR } : undefined}>
              <span>{step.label}</span>
              {isDone && hasPaid && (
                <svg className="w-3 h-3" style={{ color: NAUKRI_COLOR }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TodoPanel({ todos, onToggle }: { todos: Todo[]; onToggle: (id: string) => void }) {
  const remaining = todos.filter((t) => !t.completed).length;
  return (
    <div className="w-60 flex-shrink-0 glass-dark border-l border-white/5 overflow-y-auto">
      <div className="p-4 border-b border-white/5">
        <h3 className="text-sm font-black text-white">Action Items</h3>
        <p className="text-[11px] text-white/30 mt-0.5">{remaining} remaining</p>
      </div>
      {todos.length === 0 ? (
        <div className="p-4 text-center text-white/20 text-xs pt-8">Recommendations will appear here as you progress.</div>
      ) : (
        <div className="p-3 space-y-2">
          {todos.map((todo) => (
            <div key={todo.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer group" onClick={() => onToggle(todo.id)}>
              <div className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${todo.completed ? "border-[#FF6B35]" : "border-white/20 group-hover:border-[#FF6B35]/60"}`}
                style={todo.completed ? { background: NAUKRI_COLOR, borderColor: NAUKRI_COLOR } : undefined}>
                {todo.completed && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className={`text-xs leading-relaxed ${todo.completed ? "line-through text-white/20" : "text-white/60"}`}>{todo.action}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NaukriOptimizer() {
  const serverIsPaid = usePaid();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, string>>({});
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [stepResponses, setStepResponses] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, role, content }]);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.messages?.length > 1) {
          setMessages(s.messages);
          setCurrentStepIndex(s.currentStepIndex ?? 0);
          setCompletedSteps(new Set(s.completedSteps ?? []));
          setProfileData(s.profileData ?? {});
          setTodos(s.todos ?? []);
          setStepResponses(s.stepResponses ?? {});
          setIsComplete(s.isComplete ?? false);
          const paid = serverIsPaid || s.hasPaid;
          setHasPaid(!!paid);
          return;
        }
      }
    } catch { /* start fresh */ }
    const paid = serverIsPaid;
    if (paid) setHasPaid(true);
    addMessage("assistant", NAUKRI_STEPS[0].question);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (messages.length === 0) return;
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        messages, currentStepIndex, completedSteps: [...completedSteps],
        profileData, todos, stepResponses, isComplete, hasPaid,
      }));
    } catch { /* storage full */ }
  }, [messages, currentStepIndex, completedSteps, profileData, todos, stepResponses, isComplete, hasPaid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, showPaywall]);

  const addTodos = (actions: string[]) => {
    setTodos((prev) => [...prev, ...actions.map((action) => ({ id: `${Date.now()}-${Math.random()}`, action, completed: false }))]);
  };

  const getLocalResponse = (stepId: string, userInput: string): { message: string; todos: string[] } => {
    switch (stepId) {
      case "naukri-url":
        return {
          message: "Got your profile URL — noted!\n\nI can't edit your Naukri profile directly, but I'll give you specific, actionable instructions for every section as we go.",
          todos: ["Open your Naukri profile in a separate tab — you'll be making changes as we go"],
        };
      case "target-role":
        return {
          message: `Targeting **${userInput}** — great. I'll tailor every optimization to help you rank in Naukri recruiter searches for this role.\n\nNow let's understand your experience level.`,
          todos: [],
        };
      case "experience":
        return {
          message: `Noted! ${userInput}.\n\nNow the most important question for Naukri — your CTC and notice period. These appear prominently on your profile and directly impact how many recruiter messages you receive.`,
          todos: [],
        };
      case "ctc-notice": {
        return {
          message: `Got it! Here's a quick CTC strategy:\n\n• **Current CTC**: Be accurate — recruiters verify. If your CTC includes variables, list fixed separately.\n• **Expected CTC**: Aim 30-40% above current for a switch — don't undersell.\n• **Notice Period**: If buyout is possible, mention it in your profile summary — it helps recruiters act faster.\n\nNow let's move into the full optimization. Unlock the next 9 sections for just ₹200.`,
          todos: ["Review and update your CTC on Naukri to match your actual current package", "Set your expected CTC 30-40% above current for a meaningful switch"],
        };
      }
      default:
        return { message: "Noted! Let's continue.", todos: [] };
    }
  };

  const progressToNextStep = useCallback((currentIdx: number) => {
    const newCompleted = new Set([...completedSteps, currentIdx]);
    setCompletedSteps(newCompleted);
    if (currentIdx === FREE_STEPS_COUNT - 1 && !hasPaid) {
      setShowPaywall(true);
      return;
    }
    if (currentIdx < NAUKRI_STEPS.length - 1) {
      const nextStep = NAUKRI_STEPS[currentIdx + 1];
      setTimeout(() => { addMessage("assistant", nextStep.question); setCurrentStepIndex(currentIdx + 1); }, 600);
    } else {
      setIsComplete(true);
      addMessage("assistant", "Congratulations! All sections of your Naukri profile are now optimized.\n\nCheck your Action Items panel and implement each one — you should start seeing more recruiter messages within 48-72 hours. Good luck!");
    }
  }, [completedSteps, hasPaid, addMessage]);

  const loadRazorpay = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const handlePaywallPayment = async () => {
    setIsPaymentProcessing(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { alert("Payment gateway failed to load."); return; }
      const orderRes = await fetch("/api/create-order", { method: "POST" });
      const orderData = await orderRes.json();
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount, currency: "INR",
        name: "ProCareerLaunchpad",
        description: "Naukri Profile Optimizer — 9 Sections",
        order_id: orderData.orderId,
        handler: async (response: Record<string, string>) => {
          const verifyRes = await fetch("/api/verify-payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(response) });
          const { verified } = await verifyRes.json();
          if (verified) {
            localStorage.setItem(PAID_KEY, "true");
            setHasPaid(true); setShowPaywall(false);
            addMessage("assistant", "Payment confirmed! Unlocking the full 9-section Naukri analysis. Let's continue!");
            const nextStep = NAUKRI_STEPS[FREE_STEPS_COUNT];
            setTimeout(() => { addMessage("assistant", nextStep.question); setCurrentStepIndex(FREE_STEPS_COUNT); }, 800);
          } else { alert("Payment verification failed. Please contact support."); }
        },
        prefill: { name: "", email: "" },
        theme: { color: NAUKRI_COLOR },
        modal: { ondismiss: () => setIsPaymentProcessing(false) },
      };
      new window.Razorpay(options).open();
    } catch { alert("Something went wrong. Please try again."); }
    finally { setIsPaymentProcessing(false); }
  };

  const handleSkipPayment = () => {
    localStorage.setItem(PAID_KEY, "true");
    setHasPaid(true); setShowPaywall(false);
    addMessage("assistant", "Payment skipped (test mode). Unlocking full analysis!");
    const nextStep = NAUKRI_STEPS[FREE_STEPS_COUNT];
    setTimeout(() => { addMessage("assistant", nextStep.question); setCurrentStepIndex(FREE_STEPS_COUNT); }, 600);
  };

  const handleSend = async (overrideText?: string) => {
    const currentStep = NAUKRI_STEPS[currentStepIndex];
    const text = overrideText ?? input.trim();
    if (!text) return;
    addMessage("user", text);
    setInput("");
    setIsLoading(true);
    const newProfileData = { ...profileData, [currentStep.id]: text };
    setProfileData(newProfileData);
    try {
      if (currentStep.aiAnalysis) {
        const res = await fetch("/api/naukri-optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: currentStep.id, userInput: text, profileData: newProfileData, isPremium: hasPaid }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        addMessage("assistant", data.response);
        setStepResponses((prev) => ({ ...prev, [currentStep.id]: data.response }));
        if (data.todos?.length) addTodos(data.todos);
      } else {
        const { message, todos: localTodos } = getLocalResponse(currentStep.id, text);
        addMessage("assistant", message);
        setStepResponses((prev) => ({ ...prev, [currentStep.id]: message }));
        if (localTodos.length) addTodos(localTodos);
      }
      progressToNextStep(currentStepIndex);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      const isBusy = msg.includes("busy") || msg.includes("quota") || msg.includes("unavailable");
      addMessage("assistant", isBusy ? "The AI is a bit busy right now. Please wait 10 seconds and try again." : "Sorry, something went wrong. Please try again.");
    } finally { setIsLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const currentStep = NAUKRI_STEPS[currentStepIndex];
  const progressPct = Math.round((completedSteps.size / NAUKRI_STEPS.length) * 100);

  return (
    <div className="relative flex h-screen bg-brand-bg text-white overflow-hidden">
      <AnimatedBackground />
      <StepSidebar currentIndex={currentStepIndex} completedSteps={completedSteps} hasPaid={hasPaid} />

      {/* Chat Column */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="glass-dark border-b border-white/5 px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-black text-white">Naukri Profile Optimizer</h1>
            <p className="text-[11px] text-white/30">
              Step {Math.min(currentStepIndex + 1, NAUKRI_STEPS.length)} / {NAUKRI_STEPS.length} — {currentStep.label}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!hasPaid && currentStepIndex < FREE_STEPS_COUNT && (
              <span className="text-[10px] font-bold uppercase tracking-widest glass px-3 py-1 rounded-full" style={{ color: NAUKRI_COLOR }}>Free</span>
            )}
            {hasPaid && <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: NAUKRI_COLOR }}>Full Access</span>}
            <div className="flex items-center gap-2">
              <div className="h-1 w-32 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%`, background: `linear-gradient(90deg,${NAUKRI_COLOR},#F97316)` }} />
              </div>
              <span className="text-[11px] text-white/30">{progressPct}%</span>
            </div>
            <button
              onClick={() => {
                if (!confirm("Start a new session? Your current progress will be cleared.")) return;
                localStorage.removeItem(SESSION_KEY);
                localStorage.removeItem(PAID_KEY);
                window.location.reload();
              }}
              className="text-[10px] text-white/20 hover:text-white/50 transition-colors ml-1"
              title="Start fresh"
            >↺ Reset</button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto chat-scroll px-6 py-5 space-y-4">
          {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
          {isLoading && <TypingIndicator aiStep={NAUKRI_STEPS[currentStepIndex]?.aiAnalysis} />}
          {showPaywall && !hasPaid && (
            <PaywallCard profileData={profileData} onPayment={handlePaywallPayment} onSkip={handleSkipPayment} isProcessing={isPaymentProcessing} />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {!isComplete && !showPaywall && (
          <div className="glass-dark border-t border-white/5 p-4">
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentStep.placeholder}
                rows={currentStep.inputType === "textarea" ? 3 : 1}
                disabled={isLoading}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 resize-none focus:outline-none focus:border-[#FF6B35]/40 disabled:opacity-50 transition-colors"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-30 transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg,${NAUKRI_COLOR},#F97316)` }}
              >
                <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-white/20 mt-2 px-1">Press Enter to send · Shift+Enter for new line</p>
          </div>
        )}

        {isComplete && (
          <div className="glass-dark border-t border-white/5 p-4 text-center">
            <p className="text-white/50 text-sm font-semibold">🎉 Your Naukri profile is fully optimized! Check your Action Items →</p>
          </div>
        )}
      </div>

      <TodoPanel todos={todos} onToggle={(id) => setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t))} />
    </div>
  );
}
