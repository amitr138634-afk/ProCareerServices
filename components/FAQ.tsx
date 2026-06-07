"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "How does the LinkedIn Optimizer work?",
    a: "It's a 15-step conversational AI that asks you targeted questions about your background, skills, target role, and industry. Based on your answers it rewrites your headline, about section, experience bullets, and skills — all optimised for recruiter search and the specific job type you're targeting. The first 2 sections are free; full report unlocks after a ₹200 one-time payment.",
  },
  {
    q: "What is ATS and why does my resume need to pass it?",
    a: "ATS (Applicant Tracking System) is software used by 98% of large employers to filter resumes before a human ever reads them. If your resume lacks the right keywords, formatting, or structure, it gets automatically rejected. Our ATS Scanner gives you a 0–100 score, shows every missing keyword, and gives you 12+ specific fixes to beat the filter.",
  },
  {
    q: "How does Resume Creation work — and when do I pay?",
    a: "You fill out our order form with your career level, target role, skills, and background. We write your ATS-optimised resume within 24–48 hours and email it to you. You review it, request any changes (free revisions included), and only pay ₹200 after you're satisfied. No upfront payment, no risk.",
  },
  {
    q: "What's included in Portfolio Creation (₹1,099)?",
    a: "We design and build you a custom, mobile-responsive portfolio website — including a hero section, about you, project showcase, skills, and a contact form. Delivered in 3 business days. You get full ownership of the code. Hosting guidance is included so you can deploy it for free on Vercel or Netlify.",
  },
  {
    q: "What does Career Counseling include?",
    a: "You get a 1-on-1 session with our career expert covering: personalised job search strategy, target company list, resume + LinkedIn alignment, mock interview with feedback, and salary negotiation coaching. Book a free 15-minute discovery call first — no payment until you're ready to proceed.",
  },
  {
    q: "What's in the Social Media Marketing plan (₹5,000/month)?",
    a: "It's a full monthly retainer. We handle your entire social presence — 20+ LinkedIn posts, Instagram captions and reel scripts, Twitter/X threads — all drafted with AI and refined by humans. Includes a content calendar, scheduling, and a monthly analytics report so you can see your growth.",
  },
  {
    q: "Can I get a refund if I'm not satisfied?",
    a: "For AI tools (LinkedIn Optimizer, ATS Scanner): since you pay after seeing partial results, refunds are not applicable. For Resume Creation: you only pay after delivery and approval, so dissatisfaction is addressed via free revisions before payment. For Portfolio and counseling: contact us within 24 hours of delivery and we'll make it right.",
  },
  {
    q: "How do AI and human expertise work together in your services?",
    a: "AI handles the heavy lifting — analysis, first drafts, keyword research, scoring. Our human team then reviews, refines, personalises, and quality-checks everything before it reaches you. This combination gives you the speed of AI with the quality and nuance that only a human can add.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. We use Google authentication (OAuth) so we never store your password. Resume files are processed securely and not shared with third parties. Your profile data is stored encrypted in MongoDB Atlas. You can request deletion of your data at any time by emailing info@procareerlaunchpad.com.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="relative z-10 py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black mb-3">Frequently Asked Questions</h2>
          <p className="text-white/40 text-sm">Everything you need to know before getting started.</p>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="glass rounded-2xl border border-white/8 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left group"
              >
                <span className="text-white font-semibold text-sm pr-4 leading-snug group-hover:text-white/90">
                  {faq.q}
                </span>
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{ background: open === i ? "#10B98120" : "transparent" }}
                >
                  <svg
                    className="w-3.5 h-3.5 transition-transform duration-300 text-white/50"
                    style={{ transform: open === i ? "rotate(45deg)" : "none", color: open === i ? "#10B981" : undefined }}
                    fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </button>

              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: open === i ? "400px" : "0px" }}
              >
                <p className="px-6 pb-5 text-white/55 text-sm leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-white/30 text-xs mt-8">
          Still have questions?{" "}
          <a href="/#contact" className="text-brand-teal hover:underline">Send us a message →</a>
        </p>
      </div>
    </section>
  );
}
