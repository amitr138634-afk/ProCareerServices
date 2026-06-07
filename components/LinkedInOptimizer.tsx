"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { OPTIMIZATION_STEPS, COMPETENCY_OPTIONS } from "@/lib/steps";
import { generateProfileReport } from "@/lib/generateReport";
import { usePaid } from "./PaidContext";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const FREE_STEPS_COUNT = 5; // steps 0-4 are free

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Todo {
  id: string;
  action: string;
  completed: boolean;
}

// ─── Sub-components ────────────────────────────────────────────────

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
      <div className="w-8 h-8 rounded-full btn-glow flex items-center justify-center flex-shrink-0 text-white text-xs font-black">
        AI
      </div>
      <div className="glass rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-3">
        <div className="flex gap-1 items-center">
          <span className="w-2 h-2 bg-white/40 rounded-full typing-dot" />
          <span className="w-2 h-2 bg-white/40 rounded-full typing-dot" />
          <span className="w-2 h-2 bg-white/40 rounded-full typing-dot" />
        </div>
        {aiStep && (
          <span className="text-xs text-white/30">Analyzing with AI — may take a few seconds…</span>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-start gap-3 message-animate ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full btn-glow flex items-center justify-center flex-shrink-0 text-white text-xs font-black">
          AI
        </div>
      )}
      <div
        className={`max-w-[88%] md:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "rounded-tr-none text-white/90"
            : "glass rounded-tl-none text-white/80"
        }`}
        style={
          isUser
            ? {
                background: "rgba(14,165,233,0.12)",
                border: "1px solid rgba(14,165,233,0.2)",
              }
            : undefined
        }
      >
        {msg.content}
      </div>
    </div>
  );
}

const IS_TEST_MODE = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith("rzp_test");

function PaywallCard({
  profileData,
  onPayment,
  onSkip,
  isProcessing,
}: {
  profileData: Record<string, string>;
  onPayment: () => void;
  onSkip: () => void;
  isProcessing: boolean;
}) {
  const target = profileData["target-position"] || "your target role";
  const headline = profileData["headline"] || "";

  return (
    <div className="message-animate my-2">
      <div className="gradient-border-wrap">
        <div className="bg-brand-surface rounded-[calc(1rem-1px)] p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🎉</span>
            <h3 className="text-lg font-black text-white">Free Analysis Complete!</h3>
          </div>
          <p className="text-white/40 text-sm mb-5">
            Here's a snapshot of what we found in your profile:
          </p>

          <div className="space-y-2 mb-5">
            {[
              { label: "LinkedIn URL", note: "Verified" },
              { label: "Custom URL", note: "Checked" },
              { label: "Target Role", note: target.slice(0, 40) + (target.length > 40 ? "…" : "") },
              { label: "Competencies", note: profileData["competencies"] ? "Mapped" : "Identified" },
              {
                label: "Headline",
                note: headline ? "3 improved versions ready" : "Optimized",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm">
                <svg className="w-4 h-4 text-brand-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white/60">{item.label}:</span>
                <span className="text-white/90 font-medium">{item.note}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4 mb-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">
              🔒 Unlock 10 More Sections — ₹200
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["Profile Photo","Banner","Achievements","Grammar Check","Resume/JD Match","About Rewrite","Experience","Top 15 Skills","Recommendations","Age Tips"].map((s) => (
                <span key={s} className="text-xs text-white/40 px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Test mode notice */}
          {IS_TEST_MODE && (
            <div className="rounded-xl p-3 mb-4" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)" }}>
              <p className="text-yellow-400 text-xs font-bold mb-2">⚠️ TEST MODE — QR / real UPI won't work</p>
              <p className="text-yellow-300/60 text-xs leading-relaxed">
                In Razorpay test mode, use these credentials inside the payment popup:<br />
                <span className="font-mono font-bold text-yellow-300">Card:</span> 4111 1111 1111 1111 | Exp: 12/26 | CVV: 123<br />
                <span className="font-mono font-bold text-yellow-300">UPI ID:</span> success@razorpay
              </p>
            </div>
          )}

          <button
            onClick={onPayment}
            disabled={isProcessing}
            className="w-full btn-glow text-white font-black py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing…
              </>
            ) : (
              "Pay ₹200 to Unlock Full Report →"
            )}
          </button>

          {IS_TEST_MODE && (
            <button
              onClick={onSkip}
              className="w-full mt-2 text-white/30 hover:text-white/60 text-xs py-2 rounded-xl transition-colors border border-white/5 hover:border-white/10"
            >
              Skip Payment (Test Mode Only)
            </button>
          )}

          <p className="text-center text-white/20 text-xs mt-2">
            {IS_TEST_MODE ? "Test mode active" : "Secured by Razorpay • Instant access after payment"}
          </p>
        </div>
      </div>
    </div>
  );
}

function StepSidebar({
  currentIndex,
  completedSteps,
  hasPaid,
}: {
  currentIndex: number;
  completedSteps: Set<number>;
  hasPaid: boolean;
}) {
  return (
    <div className="hidden md:flex w-52 flex-shrink-0 glass-dark border-r border-white/5 overflow-y-auto flex-col">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 btn-glow rounded-lg flex items-center justify-center text-white font-black text-xs">P</div>
          <span className="text-xs font-black text-white/80 tracking-tight">ProCareer<span className="gradient-text">.</span></span>
        </div>
      </div>

      <div className="py-2 flex-1">
        {/* Free label */}
        <div className="px-4 pt-2 pb-1">
          <span className="text-[10px] font-bold text-brand-teal uppercase tracking-widest">Free</span>
        </div>
        {OPTIMIZATION_STEPS.slice(0, FREE_STEPS_COUNT).map((step, i) => {
          const isDone = completedSteps.has(i);
          const isActive = i === currentIndex;
          return (
            <div key={step.id} className={`flex items-center justify-between px-4 py-2 text-[10px] font-bold tracking-wider transition-colors ${isActive ? "text-brand-teal" : isDone ? "text-white/30" : "text-white/20"}`}>
              <span>{step.label}</span>
              {isDone && (
                <svg className="w-3 h-3 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          );
        })}

        {/* Paid label */}
        <div className="px-4 pt-3 pb-1">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${hasPaid ? "gradient-text" : "text-white/20"}`}>
            {hasPaid ? "Unlocked" : "🔒 Premium"}
          </span>
        </div>
        {OPTIMIZATION_STEPS.slice(FREE_STEPS_COUNT).map((step, i) => {
          const absIndex = i + FREE_STEPS_COUNT;
          const isDone = completedSteps.has(absIndex);
          const isActive = absIndex === currentIndex;
          return (
            <div key={step.id} className={`flex items-center justify-between px-4 py-2 text-[10px] font-bold tracking-wider transition-colors ${!hasPaid ? "text-white/10" : isActive ? "text-brand-teal" : isDone ? "text-white/30" : "text-white/20"}`}>
              <span>{step.label}</span>
              {isDone && (
                <svg className="w-3 h-3 text-brand-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
    <div className="hidden md:block w-60 flex-shrink-0 glass-dark border-l border-white/5 overflow-y-auto">
      <div className="p-4 border-b border-white/5">
        <h3 className="text-sm font-black text-white">Action Items</h3>
        <p className="text-[11px] text-white/30 mt-0.5">{remaining} remaining</p>
      </div>
      {todos.length === 0 ? (
        <div className="p-4 text-center text-white/20 text-xs pt-8">
          Recommendations will appear here as you progress.
        </div>
      ) : (
        <div className="p-3 space-y-2">
          {todos.map((todo) => (
            <div key={todo.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer group" onClick={() => onToggle(todo.id)}>
              <div className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${todo.completed ? "bg-brand-teal border-brand-teal" : "border-white/20 group-hover:border-brand-teal/60"}`}>
                {todo.completed && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-xs leading-relaxed ${todo.completed ? "line-through text-white/20" : "text-white/60"}`}>
                {todo.action}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export default function LinkedInOptimizer() {
  const serverIsPaid = usePaid();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, string>>({});
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);
  const [customCompetency, setCustomCompetency] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [stepResponses, setStepResponses] = useState<Record<string, string>>({});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [showMobileTodos, setShowMobileTodos] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, role, content }]);
  }, []);

  // ── Session persistence ──────────────────────────────────────────────────
  const SESSION_KEY = "procareer_linkedin_session";

  // Restore session on mount
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
          // serverIsPaid (from Redis) is the source of truth — overrides localStorage
          const paid = serverIsPaid || s.hasPaid;
          setHasPaid(!!paid);
          return; // skip fresh start
        }
      }
    } catch { /* corrupted storage — start fresh */ }

    // Fresh start
    const paid = serverIsPaid;
    if (paid) setHasPaid(true);
    addMessage("assistant", OPTIMIZATION_STEPS[0].question);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save session whenever key state changes
  useEffect(() => {
    if (messages.length === 0) return;
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        messages,
        currentStepIndex,
        completedSteps: [...completedSteps],
        profileData,
        todos,
        stepResponses,
        isComplete,
        hasPaid,
      }));
    } catch { /* storage full — ignore */ }
  }, [messages, currentStepIndex, completedSteps, profileData, todos, stepResponses, isComplete, hasPaid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, showPaywall]);

  const addTodos = (actions: string[]) => {
    setTodos((prev) => [
      ...prev,
      ...actions.map((action) => ({ id: `${Date.now()}-${Math.random()}`, action, completed: false })),
    ]);
  };

  const getLocalResponse = (stepId: string, userInput: string): { message: string; todos: string[] } => {
    switch (stepId) {
      case "linkedin-url": {
        const hasCustom = userInput.includes("/in/") && !/\/in\/[a-zA-Z0-9]{8,}-?[a-zA-Z0-9]+$/.test(userInput);
        return {
          message: hasCustom
            ? "You passed my first check — you have a custom LinkedIn URL, which looks professional!\n\nI cannot adjust your LinkedIn profile myself, but we will build a to-do list as we go along."
            : "Thanks for sharing! I notice your URL may not have a custom slug yet — we'll add that to your to-do list.\n\nI cannot adjust your profile directly, but I'll guide you step by step.",
          todos: hasCustom ? [] : ["Customize your LinkedIn URL: go to Edit public profile & URL"],
        };
      }
      case "custom-url":
        return {
          message: userInput.toLowerCase().includes("yes")
            ? "Great — a custom URL is a strong professional signal. You're ahead of most candidates!"
            : "No worries! Setting a custom URL takes 30 seconds and makes your profile far more credible.",
          todos: userInput.toLowerCase().includes("yes")
            ? []
            : ["Set custom LinkedIn URL: Settings → Public profile → Edit URL (use firstname-lastname format)"],
        };
      case "target-position":
        return {
          message: `Got it — targeting **${userInput}**. I'll tailor every recommendation to help you land this role.\n\nNow let's identify the core competencies that make you stand out.`,
          todos: [],
        };
      case "competencies":
        return {
          message: `Excellent choices! These will guide everything — from your headline to your skills section.\n\nNow let's tackle one of the highest-impact areas: your **headline**. It's the first thing recruiters see.`,
          todos: [],
        };
      case "profile-photo": {
        const has = !userInput.toLowerCase().match(/no photo|none|missing/);
        return {
          message: has
            ? "Good — having a photo gives you 21x more profile views!\n\nTips to make it stronger:\n• Plain or blurred background\n• Face fills 60% of the frame\n• Business casual attire\n• Natural smile, good lighting\n• Minimum 400×400px"
            : "This is urgent! Profiles without photos get almost no recruiter attention.\n\nWhat you need:\n• Professional headshot (not a selfie)\n• Plain background\n• Business casual or formal\n• Natural smile, good lighting\n• Use PhotoAI, Aragon, or a local photographer",
          todos: has
            ? ["Update profile photo: ensure it's a professional headshot with a clean background"]
            : ["Add a professional profile photo — this is your highest-priority action"],
        };
      }
      case "banner": {
        const isDefault = userInput.toLowerCase().match(/default|blue|none/);
        return {
          message: isDefault
            ? "The default banner is a missed opportunity!\n\n• Use Canva (free) — LinkedIn Banner template\n• Size: 1584×396px\n• Include your name, role, and top skills\n• Add logos of tools or companies you've worked with"
            : "Great — a custom banner puts you ahead of most users. Make sure it:\n\n• Clearly shows your expertise\n• Includes relevant keywords\n• Matches your professional brand",
          todos: isDefault
            ? ["Create custom LinkedIn banner on Canva (1584×396px) — include your name, title, and skills"]
            : ["Review banner — ensure it reinforces your target role and personal brand"],
        };
      }
      case "recommendations": {
        const n = parseInt(userInput.match(/\d+/)?.[0] || "0");
        return {
          message:
            n >= 5
              ? "Strong social proof! Focus on getting 1-2 more from senior stakeholders in your target domain."
              : n >= 2
              ? `${n} recommendations — decent, but aim for 5+. Prioritize: former managers → senior colleagues → cross-functional partners.`
              : "Fewer than 2 recommendations is a red flag for many recruiters.\n\nAction plan:\n1. Identify 3-5 people who know your work well\n2. Send a brief, personalized request\n3. Offer to write a draft for them to edit\n4. Return the favor",
          todos: n < 5 ? [`Request ${5 - n} more LinkedIn recommendations from former managers or senior colleagues`] : [],
        };
      }
      case "age-discrimination": {
        const concerned = !userInput.toLowerCase().match(/no|not applicable/);
        return {
          message: concerned
            ? "This is real, and there are concrete steps:\n\n• Only show last 10-15 years of experience\n• Remove graduation year if it dates you\n• Drop outdated technologies\n• Use a recent, modern profile photo\n• Focus headline on current value, not years of experience"
            : "Good — age-neutral presentation is best practice for everyone. Keep your profile focused on recent impact.",
          todos: concerned
            ? [
                "Audit profile: remove graduation years and jobs older than 15 years",
                "Replace outdated tech skills with current in-demand ones for your target role",
              ]
            : [],
        };
      }
      default:
        return { message: "Noted! Let's continue.", todos: [] };
    }
  };

  const progressToNextStep = useCallback(
    (currentIdx: number) => {
      const newCompleted = new Set([...completedSteps, currentIdx]);
      setCompletedSteps(newCompleted);

      // After the last free step, show paywall (unless already paid)
      if (currentIdx === FREE_STEPS_COUNT - 1 && !hasPaid) {
        setShowPaywall(true);
        return;
      }

      if (currentIdx < OPTIMIZATION_STEPS.length - 1) {
        const nextStep = OPTIMIZATION_STEPS[currentIdx + 1];
        setTimeout(() => {
          addMessage("assistant", nextStep.question);
          setCurrentStepIndex(currentIdx + 1);
        }, 600);
      } else {
        setIsComplete(true);
        addMessage(
          "assistant",
          "Congratulations! All 15 sections are optimized.\n\nReview your Action Items panel on the right and work through each one. Your LinkedIn profile is now set to attract significantly more recruiter attention. Good luck!"
        );
      }
    },
    [completedSteps, hasPaid, addMessage]
  );

  // Razorpay payment
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
        amount: orderData.amount,
        currency: "INR",
        name: "ProCareerLaunchpad",
        description: "LinkedIn Full Optimizer — 10 Sections",
        order_id: orderData.orderId,
        handler: async (response: Record<string, string>) => {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const { verified } = await verifyRes.json();
          if (verified) {
            localStorage.setItem("linkedin_optimizer_paid", "true");
            setHasPaid(true);
            setShowPaywall(false);
            addMessage("assistant", "Payment confirmed! Unlocking the full 10-section analysis. Let's continue!");
            const nextStep = OPTIMIZATION_STEPS[FREE_STEPS_COUNT];
            setTimeout(() => {
              addMessage("assistant", nextStep.question);
              setCurrentStepIndex(FREE_STEPS_COUNT);
            }, 800);
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: { name: "", email: "" },
        theme: { color: "#10B981" },
        modal: { ondismiss: () => setIsPaymentProcessing(false) },
      };

      new window.Razorpay(options).open();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleSkipPayment = () => {
    localStorage.setItem("linkedin_optimizer_paid", "true");
    setHasPaid(true);
    setShowPaywall(false);
    addMessage("assistant", "Payment skipped (test mode). Unlocking full analysis — let's continue!");
    const nextStep = OPTIMIZATION_STEPS[FREE_STEPS_COUNT];
    setTimeout(() => {
      addMessage("assistant", nextStep.question);
      setCurrentStepIndex(FREE_STEPS_COUNT);
    }, 600);
  };

  const handleSend = async (overrideText?: string) => {
    const currentStep = OPTIMIZATION_STEPS[currentStepIndex];
    let text = overrideText ?? input.trim();
    if (currentStep.inputType === "competency") {
      if (selectedCompetencies.length === 0) return;
      text = selectedCompetencies.join(", ");
    }
    if (!text) return;

    addMessage("user", text);
    setInput("");
    setIsLoading(true);

    const newProfileData = { ...profileData, [currentStep.id]: text };
    setProfileData(newProfileData);

    try {
      if (currentStep.aiAnalysis) {
        const res = await fetch("/api/optimize", {
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
      addMessage(
        "assistant",
        isBusy
          ? "The AI is a bit busy right now. Please wait 10 seconds and try again — just re-type your answer."
          : "Sorry, something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const toggleCompetency = (c: string) => {
    setSelectedCompetencies((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : prev.length < 3 ? [...prev, c] : prev
    );
  };

  const handleDownloadReport = async () => {
    setIsGeneratingPDF(true);
    try {
      const { generateProfileReport } = await import("@/lib/generateReport");
      await generateProfileReport({
        profileData,
        stepResponses,
        todos: todos.map((t) => ({ action: t.action, completed: t.completed })),
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadActionGuide = async () => {
    setIsGeneratingGuide(true);
    try {
      const res = await fetch("/api/optimize/action-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileData, stepResponses }),
      });
      const { guide, error } = await res.json();
      if (error || !guide) { alert("Could not generate action guide. Please try again."); return; }
      const { generateActionGuide } = await import("@/lib/generateActionGuide");
      await generateActionGuide(guide);
    } catch {
      alert("Failed to generate action guide. Please try again.");
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  const handleRestart = () => {
    if (!confirm("Start a new session? Your current progress will be cleared.")) return;
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("linkedin_optimizer_paid");
    window.location.reload();
  };

  const currentStep = OPTIMIZATION_STEPS[currentStepIndex];
  const isCompetencyStep = currentStep.inputType === "competency";
  const progressPct = Math.round((completedSteps.size / OPTIMIZATION_STEPS.length) * 100);

  return (
    <div className="relative flex h-screen bg-brand-bg text-white overflow-hidden">
      <AnimatedBackground />

      <StepSidebar currentIndex={currentStepIndex} completedSteps={completedSteps} hasPaid={hasPaid} />

      {/* Chat Column */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="glass-dark border-b border-white/5 px-3 md:px-6 py-2.5 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-xs md:text-sm font-black text-white truncate">LinkedIn Profile Optimizer</h1>
            <p className="text-[10px] text-white/30 truncate">
              Step {Math.min(currentStepIndex + 1, OPTIMIZATION_STEPS.length)}/{OPTIMIZATION_STEPS.length} — {currentStep.label}
            </p>
          </div>
          <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
            {!hasPaid && currentStepIndex < FREE_STEPS_COUNT && (
              <span className="text-[10px] font-bold text-brand-teal uppercase tracking-widest glass px-2 md:px-3 py-0.5 rounded-full">Free</span>
            )}
            {hasPaid && (
              <span className="hidden sm:inline text-[10px] font-bold gradient-text uppercase tracking-widest">Full Access</span>
            )}
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-1 w-20 md:w-32 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #0EA5E9, #10B981)" }} />
              </div>
              <span className="text-[11px] text-white/30">{progressPct}%</span>
            </div>
            <span className="sm:hidden text-[10px] text-white/40 font-bold">{progressPct}%</span>

            {/* Mobile: action items button */}
            <button
              onClick={() => setShowMobileTodos(true)}
              className="md:hidden relative flex items-center justify-center w-7 h-7 rounded-lg border border-white/10 text-white/40"
              title="Action items"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              {todos.filter(t => !t.completed).length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-brand-teal text-white text-[8px] font-black flex items-center justify-center">
                  {todos.filter(t => !t.completed).length}
                </span>
              )}
            </button>

            <button
              onClick={handleRestart}
              className="flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-lg border border-white/10 text-[10px] text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
              title="Restart"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Restart</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto chat-scroll px-3 md:px-6 py-4 space-y-4">
          {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
          {isLoading && <TypingIndicator aiStep={OPTIMIZATION_STEPS[currentStepIndex]?.aiAnalysis} />}
          {showPaywall && !hasPaid && (
            <PaywallCard
              profileData={profileData}
              onPayment={handlePaywallPayment}
              onSkip={handleSkipPayment}
              isProcessing={isPaymentProcessing}
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {!isComplete && !showPaywall && (
          <div className="glass-dark border-t border-white/5 p-4">
            {isCompetencyStep ? (
              <div className="space-y-3">
                <p className="text-xs text-white/40 font-medium">
                  Select up to 3 competencies
                  {selectedCompetencies.length > 0 && (
                    <span className="ml-2 gradient-text font-bold">({selectedCompetencies.length}/3)</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {COMPETENCY_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleCompetency(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        selectedCompetencies.includes(c)
                          ? "bg-brand-teal/20 text-brand-teal border-brand-teal/40"
                          : "glass text-white/50 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                  {!showCustomInput ? (
                    <button
                      onClick={() => setShowCustomInput(true)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border border-dashed border-white/15 text-white/30 hover:text-white/60 hover:border-white/30 transition-all"
                    >
                      + Custom
                    </button>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={customCompetency}
                        onChange={(e) => setCustomCompetency(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const t = customCompetency.trim();
                            if (t && !selectedCompetencies.includes(t) && selectedCompetencies.length < 3) {
                              setSelectedCompetencies((p) => [...p, t]);
                            }
                            setCustomCompetency("");
                            setShowCustomInput(false);
                          }
                        }}
                        placeholder="Type competency…"
                        className="px-3 py-1.5 rounded-full text-xs bg-white/5 border border-brand-teal/40 text-white outline-none w-36"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          const t = customCompetency.trim();
                          if (t && !selectedCompetencies.includes(t) && selectedCompetencies.length < 3) {
                            setSelectedCompetencies((p) => [...p, t]);
                          }
                          setCustomCompetency("");
                          setShowCustomInput(false);
                        }}
                        className="text-brand-teal text-xs font-bold"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
                {selectedCompetencies.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedCompetencies.map((c) => (
                      <span key={c} className="text-xs bg-brand-teal/10 text-brand-teal px-2.5 py-1 rounded-full border border-brand-teal/20 flex items-center gap-1">
                        {c}
                        <button onClick={() => toggleCompetency(c)} className="hover:text-red-400">×</button>
                      </span>
                    ))}
                    <button
                      onClick={() => handleSend()}
                      disabled={isLoading}
                      className="ml-auto btn-glow text-white px-5 py-1.5 rounded-full text-xs font-bold disabled:opacity-50"
                    >
                      Continue →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-3 items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={currentStep.placeholder}
                  rows={currentStep.inputType === "textarea" ? 3 : 1}
                  className="flex-1 resize-none rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:ring-1 focus:ring-brand-teal/40"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 btn-glow rounded-xl flex items-center justify-center text-white flex-shrink-0 disabled:opacity-30"
                >
                  <svg className="w-4 h-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {isComplete && (
          <div className="glass-dark border-t border-brand-teal/20 p-5 space-y-3">
            <div className="text-center">
              <p className="gradient-text font-black text-base mb-1">All sections complete!</p>
              <p className="text-white/40 text-xs">Download your personalized reports below</p>
            </div>

            {/* Action Guide — primary CTA */}
            <button
              onClick={handleDownloadActionGuide}
              disabled={isGeneratingGuide || isGeneratingPDF}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #F97316, #EF4444)" }}
            >
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all" />
              <span className="relative flex items-center justify-center gap-2">
                {isGeneratingGuide ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Generating Action Guide…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Step-by-Step Action Guide (PDF)
                  </>
                )}
              </span>
            </button>
            <p className="text-center text-white/25 text-[10px]">
              Phases · Numbered steps · Examples · Warnings — personalized to your profile
            </p>

            {/* Full analysis report — secondary */}
            <button
              onClick={handleDownloadReport}
              disabled={isGeneratingPDF || isGeneratingGuide}
              className="w-full py-2.5 rounded-xl font-semibold text-xs transition-all border border-brand-teal/30 hover:border-brand-teal/60 hover:bg-brand-teal/5 text-white/60 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGeneratingPDF ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
                  </svg>
                  Download Full AI Analysis Report
                </>
              )}
            </button>

            {/* Restart */}
            <button
              onClick={handleRestart}
              className="w-full py-2 rounded-xl text-xs text-white/25 hover:text-white/50 transition-colors"
            >
              ↺ Start a new analysis
            </button>
          </div>
        )}
      </div>

      <TodoPanel todos={todos} onToggle={(id) => setTodos((p) => p.map((t) => t.id === id ? { ...t, completed: !t.completed } : t))} />

      {/* Mobile Action Items Drawer */}
      {showMobileTodos && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowMobileTodos(false)} />
          <div className="relative bg-[#0d0d2b] border-t border-white/10 rounded-t-2xl max-h-[70vh] flex flex-col">
            <div className="p-4 border-b border-white/8 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">Action Items</h3>
                <p className="text-[11px] text-white/30">{todos.filter(t => !t.completed).length} remaining</p>
              </div>
              <button onClick={() => setShowMobileTodos(false)} className="text-white/40 hover:text-white p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-3 space-y-2">
              {todos.length === 0 ? (
                <p className="text-center text-white/20 text-xs pt-8">Recommendations appear here as you progress.</p>
              ) : todos.map((todo) => (
                <div key={todo.id}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                  onClick={() => setTodos(p => p.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t))}>
                  <div className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${todo.completed ? "bg-brand-teal border-brand-teal" : "border-white/20"}`}>
                    {todo.completed && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={`text-xs leading-relaxed ${todo.completed ? "line-through text-white/20" : "text-white/60"}`}>{todo.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
