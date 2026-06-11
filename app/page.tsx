"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import SectionBg from "@/components/SectionBg";
import ContactForm from "@/components/ContactForm";
import SuccessStories from "@/components/SuccessStories";
import FAQ from "@/components/FAQ";
import FeedbackForm from "@/components/FeedbackForm";

interface ServiceCard {
  id: string;
  icon: React.ReactNode;
  color: string;
  badge: string;
  badgeBg: string;
  title: string;
  subtitle: string;
  desc: string;
  features: string[];
  cta: string;
  ctaStyle: string;
  href: string;
  borderColor: string;
  featureColor: string;
  comingSoon?: boolean;
}

interface HeroSlide {
  id: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  badge: string;
  badgeColor: string;
  title: string;
  tagline: string;
  desc: string;
  features: string[];
  cta: string;
  href: string;
  comingSoon?: boolean;
  icon: React.ReactNode;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "linkedin",
    color: "#10B981",
    gradientFrom: "#10B98118",
    gradientTo: "#0EA5E908",
    badge: "AI Tool · Live",
    badgeColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
    title: "LinkedIn Optimizer",
    tagline: "Rewrite your LinkedIn. Land more interviews.",
    desc: "Our 15-step AI has a conversation with you and rewrites every section of your LinkedIn — headline, about, experience bullets, skills — mapped to your target role and optimised for recruiter search.",
    features: ["Personalized headline & about rewrite", "Experience bullets rewritten with impact metrics", "Keyword gap vs your target job description", "Skills section optimisation", "Downloadable PDF report"],
    cta: "Start Free →",
    href: "/optimize",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: "naukri",
    color: "#FF6B35",
    gradientFrom: "#FF6B3518",
    gradientTo: "#F9731608",
    badge: "AI Tool · Live",
    badgeColor: "text-orange-400 bg-orange-400/10 border-orange-400/25",
    title: "Naukri Optimizer",
    tagline: "Dominate Naukri search. Get 5x more recruiter calls.",
    desc: "Our AI asks you Naukri-specific questions — CTC strategy, notice period, resume headline, key skills — and rewrites your entire profile to put you at the top of recruiter search results on India's biggest job portal.",
    features: ["Resume headline optimized for recruiter search", "Profile summary rewrite for your target role", "CTC & notice period strategy tips", "Key skills & IT skills gap analysis", "Preferred location & career profile optimization"],
    cta: "Optimize Naukri →",
    href: "/naukri",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    id: "ats",
    color: "#8B5CF6",
    gradientFrom: "#8B5CF618",
    gradientTo: "#0EA5E908",
    badge: "AI Tool · Live",
    badgeColor: "text-violet-400 bg-violet-400/10 border-violet-400/25",
    title: "ATS Resume Scanner",
    tagline: "Know exactly why your resume gets rejected.",
    desc: "Upload your resume and paste the job description. Our AI gives you a 0–100 ATS score, shows every missing keyword, and gives 12+ specific fixes so you pass the filter and reach a human recruiter.",
    features: ["ATS score with full breakdown", "Keyword match & gap analysis", "Section-by-section scoring", "12+ actionable fix recommendations", "6 built-in JD templates to test against"],
    cta: "Scan My Resume →",
    href: "/ats",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: "content",
    color: "#F59E0B",
    gradientFrom: "#F59E0B18",
    gradientTo: "#EF444408",
    badge: "Human + AI · ₹500/week",
    badgeColor: "text-amber-400 bg-amber-400/10 border-amber-400/25",
    title: "Content Creation",
    tagline: "A personal brand that works while you sleep.",
    desc: "Monthly content retainer — we create scroll-stopping content for LinkedIn, Instagram, Facebook, and your website. Reels, posts, blogs, carousels — AI-drafted, human-refined, posted consistently so you stay visible and grow.",
    features: ["LinkedIn posts, carousels & articles", "Instagram & Facebook reels + posts", "Blog writing for website / Medium", "Content calendar & scheduling", "Monthly analytics & growth report"],
    cta: "Get Content Plan →",
    href: "/content",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    id: "portfolio",
    color: "#0EA5E9",
    gradientFrom: "#0EA5E918",
    gradientTo: "#6366F108",
    badge: "Human-Built · Live",
    badgeColor: "text-sky-400 bg-sky-400/10 border-sky-400/25",
    title: "Portfolio Creation",
    tagline: "A portfolio website that makes recruiters stop scrolling.",
    desc: "We design and build you a custom portfolio site — fully mobile responsive, with project showcases, skills, about, and contact. Perfect for freshers, students, professionals, and freelancers who want to stand out.",
    features: ["Custom-designed portfolio website", "Projects, skills & experience showcase", "Mobile-responsive across all devices", "Contact form built in", "Delivered in 3 business days"],
    cta: "Request Portfolio →",
    href: "/portfolio",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "career",
    color: "#EC4899",
    gradientFrom: "#EC489918",
    gradientTo: "#F59E0B08",
    badge: "1-on-1 Coaching · Live",
    badgeColor: "text-pink-400 bg-pink-400/10 border-pink-400/25",
    title: "Career Counseling",
    tagline: "A roadmap to your next role — built just for you.",
    desc: "1-on-1 coaching sessions with our career experts. We map your skills to target roles, fix your job search strategy, prep you for interviews, and guide salary negotiation — everything from resume to offer letter.",
    features: ["Personalised career roadmap", "Job search strategy & company targeting", "Mock interview + feedback sessions", "Salary negotiation coaching", "Resume + LinkedIn alignment review"],
    cta: "Book Free Call →",
    href: "/career",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: "resume",
    color: "#F97316",
    gradientFrom: "#F9731618",
    gradientTo: "#FBBF2408",
    badge: "Human + AI · ₹200 after delivery",
    badgeColor: "text-orange-400 bg-orange-400/10 border-orange-400/25",
    title: "Resume Creation",
    tagline: "A resume that gets you past ATS and into interviews.",
    desc: "We write your resume from scratch — ATS-optimised, tailored to your target role, human-reviewed. Order now and pay just ₹200 only after you receive and approve your final resume. No upfront charges.",
    features: ["ATS-optimised formatting & keywords", "Tailored to your target job title", "AI-drafted, human-reviewed & refined", "24–48 hour turnaround time", "Pay ₹200 only after delivery"],
    cta: "Order Resume →",
    href: "/resume",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: "webdev",
    color: "#06B6D4",
    gradientFrom: "#06B6D418",
    gradientTo: "#0EA5E908",
    badge: "Custom Build · Live",
    badgeColor: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",
    title: "Web & App Development",
    tagline: "Your business online — fast, beautiful, and built to convert.",
    desc: "We design and build custom websites, e-commerce stores, mobile apps, personal blogs, and brand identities. From a ₹2,999 landing page to a full web application — delivered on time, on budget.",
    features: ["Business, shop & restaurant websites", "E-commerce with payments & inventory", "Mobile apps (Android / iOS)", "Personal blogs with admin CMS", "Brand identity & logo design"],
    cta: "Get Free Quote →",
    href: "/webdev",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    id: "legal",
    color: "#6366F1",
    gradientFrom: "#6366F118",
    gradientTo: "#8B5CF608",
    badge: "Coming Soon",
    badgeColor: "text-indigo-400 bg-indigo-400/10 border-indigo-400/25",
    title: "Legal AI Assist",
    tagline: "AI-powered legal guidance for everyday problems.",
    desc: "Facing a workplace dispute, contract confusion, or legal question? Our AI legal assistant will help you understand your rights, draft letters, and connect you with the right professionals — fast and affordable.",
    features: ["Workplace & employment law guidance", "Contract review & red-flag detection", "Legal letter & notice drafting", "Know-your-rights explainers", "Connect to verified legal professionals"],
    cta: "Notify Me →",
    href: "/legal-ai",
    comingSoon: true,
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
  {
    id: "erp",
    color: "#14B8A6",
    gradientFrom: "#14B8A618",
    gradientTo: "#0EA5E908",
    badge: "Coming Soon",
    badgeColor: "text-teal-400 bg-teal-400/10 border-teal-400/25",
    title: "ERP & Business Solutions",
    tagline: "AI-driven ERP tools to run your business smarter.",
    desc: "From inventory and HR to finance and CRM — we build custom ERP and business automation solutions for SMEs and startups using AI to cut manual work, reduce errors, and give you real-time business insights.",
    features: ["Custom ERP setup for your business", "HR, payroll & attendance management", "Inventory & supply chain tracking", "Finance, invoicing & reporting", "CRM + sales pipeline automation"],
    cta: "Express Interest →",
    href: "/erp",
    comingSoon: true,
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: "courses",
    color: "#A78BFA",
    gradientFrom: "#A78BFA18",
    gradientTo: "#EC489908",
    badge: "Coming Soon",
    badgeColor: "text-violet-300 bg-violet-300/10 border-violet-300/25",
    title: "Career Courses",
    tagline: "Self-paced courses to upskill and get hired faster.",
    desc: "Structured video courses on resume writing, LinkedIn growth, interview preparation, and in-demand tech & business skills — with certificates, lifetime access, and direct placement support.",
    features: ["Resume & LinkedIn masterclass", "Interview preparation bootcamp", "In-demand tech & business skill tracks", "Certificate of completion", "Lifetime access on enrollment"],
    cta: "Join Waitlist →",
    href: "/courses",
    comingSoon: true,
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
  },
];

const STATS = [
  { value: "500+", label: "Profiles Optimized" },
  { value: "92%", label: "Success Rate" },
  { value: "4.9★", label: "Avg Rating" },
  { value: "24h", label: "Avg Response Time" },
];

const SERVICES: ServiceCard[] = [
  {
    id: "linkedin",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: "#10B981",
    badge: "AI · ₹200",
    badgeBg: "bg-brand-teal/10 border-brand-teal/25 text-brand-teal",
    title: "LinkedIn Optimizer",
    subtitle: "15-section AI analysis",
    desc: "AI-powered conversational optimizer that rewrites your headline, about section, experience bullets, and maps keywords to your target role.",
    features: ["Personalized headline rewrites", "About section full rewrite", "Experience bullet optimization", "Keyword gap vs job description", "Downloadable PDF report"],
    cta: "Start Free →",
    ctaStyle: "btn-glow",
    href: "/optimize",
    borderColor: "border-brand-teal/20",
    featureColor: "text-brand-teal",
  },
  {
    id: "naukri",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    color: "#FF6B35",
    badge: "AI · ₹200",
    badgeBg: "bg-orange-500/10 border-orange-500/25 text-orange-400",
    title: "Naukri Optimizer",
    subtitle: "India's #1 job portal, fully optimized",
    desc: "AI-powered optimizer for your Naukri profile — rewrites your resume headline, profile summary, key skills, and career profile to put you at the top of recruiter search results.",
    features: ["Resume headline & profile summary rewrite", "Key skills & IT skills gap analysis", "CTC + notice period strategy", "Career profile & preferred locations fix", "Downloadable action plan"],
    cta: "Start Free →",
    ctaStyle: "btn-glow",
    href: "/naukri",
    borderColor: "border-orange-500/20",
    featureColor: "text-orange-400",
  },
  {
    id: "ats",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    color: "#8B5CF6",
    badge: "AI · ₹200",
    badgeBg: "bg-brand-purple/10 border-brand-purple/25 text-brand-purple",
    title: "ATS Resume Scanner",
    subtitle: "Resume vs job description",
    desc: "Upload your resume, paste the job description, and instantly see your ATS score with keyword gaps, section scoring, and 12+ fix recommendations.",
    features: ["ATS score (0–100) with breakdown", "Keyword match & gap analysis", "Section-by-section scoring", "12+ fix recommendations", "6 built-in JD templates"],
    cta: "Start Free →",
    ctaStyle: "purple-btn",
    href: "/ats",
    borderColor: "border-brand-purple/20",
    featureColor: "text-brand-purple",
  },
  {
    id: "resume",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: "#F97316",
    badge: "Human + AI · ₹200",
    badgeBg: "bg-orange-500/10 border-orange-500/25 text-orange-400",
    title: "Resume Creation",
    subtitle: "Pay ₹200 only after delivery",
    desc: "We write your ATS-optimised resume from scratch — tailored to your target role, human-reviewed. Order now and pay ₹200 only after you receive and approve it. No upfront charges.",
    features: ["ATS-optimised formatting & keywords", "Role-specific content tailoring", "AI-drafted, human-reviewed", "24–48 hour turnaround", "Pay only after delivery"],
    cta: "Order Resume →",
    ctaStyle: "orange-btn",
    href: "/resume",
    borderColor: "border-orange-500/20",
    featureColor: "text-orange-400",
  },
  {
    id: "content",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
    color: "#F59E0B",
    badge: "Human + AI · ₹500/week",
    badgeBg: "bg-yellow-500/10 border-yellow-500/25 text-yellow-400",
    title: "Content Creation",
    subtitle: "Multi-platform content & brand growth",
    desc: "Monthly retainer — we create and manage content across LinkedIn, Instagram, Facebook, and your website. Reels, posts, blogs, carousels — AI-drafted, human-refined, posted consistently so you grow.",
    features: ["LinkedIn posts, carousels & articles", "Instagram & Facebook reels + posts", "Blog writing for website / Medium", "Content calendar & scheduling", "Monthly analytics & growth report"],
    cta: "Get Content Plan →",
    ctaStyle: "amber-btn",
    href: "/content",
    borderColor: "border-yellow-500/20",
    featureColor: "text-yellow-400",
  },
  {
    id: "portfolio",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: "#0EA5E9",
    badge: "Custom · ₹1,099",
    badgeBg: "bg-brand-blue/10 border-brand-blue/25 text-brand-blue",
    title: "Portfolio Creation",
    subtitle: "For freshers, students & professionals",
    desc: "We build you a stunning portfolio website that showcases your projects, skills, and experience — personalized to your career stage and target role.",
    features: ["Custom portfolio website", "Mobile-responsive design", "Project showcase section", "Contact & enquiry form", "Lifetime hosting guidance"],
    cta: "Request Portfolio →",
    ctaStyle: "blue-btn",
    href: "/portfolio",
    borderColor: "border-brand-blue/20",
    featureColor: "text-brand-blue",
  },
  {
    id: "career",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: "#EC4899",
    badge: "1-on-1 Coaching",
    badgeBg: "bg-pink-500/10 border-pink-500/25 text-pink-400",
    title: "Career Counseling",
    subtitle: "Job hunting tips & guidance",
    desc: "1-on-1 career coaching sessions covering job search strategy, salary negotiation, interview prep, and personalized roadmap for your next role.",
    features: ["Personalized job search strategy", "Salary negotiation coaching", "Interview preparation & mock sessions", "Resume + LinkedIn alignment", "Ongoing career roadmap"],
    cta: "Book Free Call →",
    ctaStyle: "pink-btn",
    href: "/career",
    borderColor: "border-pink-500/20",
    featureColor: "text-pink-400",
  },
  {
    id: "webdev",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    color: "#06B6D4",
    badge: "Custom Build · ₹2,999+",
    badgeBg: "bg-cyan-500/10 border-cyan-500/25 text-cyan-400",
    title: "Web & App Development",
    subtitle: "Websites, apps & branding",
    desc: "We build custom websites, e-commerce stores, mobile apps, personal blogs, and brand identities — from a quick landing page to a full-featured web application.",
    features: ["Business & shop websites", "E-commerce with payments", "Mobile apps (Android/iOS)", "Personal blogs with CMS", "Branding & logo design"],
    cta: "Get Free Quote →",
    ctaStyle: "cyan-btn",
    href: "/webdev",
    borderColor: "border-cyan-500/20",
    featureColor: "text-cyan-400",
  },
  {
    id: "seo",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 14l3-3 3 3 5-6" />
      </svg>
    ),
    color: "#22C55E",
    badge: "Free Consultation",
    badgeBg: "bg-green-500/10 border-green-500/25 text-green-400",
    title: "SEO",
    subtitle: "Rank higher, get found on Google",
    desc: "On-page, technical, and content SEO to push your website up Google's rankings and bring in steady, qualified organic traffic.",
    features: ["Keyword research & strategy", "On-page & technical SEO", "Content optimisation", "Backlink building", "Monthly ranking reports"],
    cta: "Get Free Quote →",
    ctaStyle: "seo",
    href: "/marketing?service=seo",
    borderColor: "border-green-500/20",
    featureColor: "text-green-400",
  },
  {
    id: "smm",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
    color: "#38BDF8",
    badge: "Free Consultation",
    badgeBg: "bg-sky-500/10 border-sky-500/25 text-sky-400",
    title: "Social Media Marketing",
    subtitle: "Grow your audience on every platform",
    desc: "End-to-end social media management across Instagram, Facebook, and LinkedIn — strategy, content, posting, and community engagement that grows your brand.",
    features: ["Platform strategy & calendar", "Post & creative design", "Community management", "Hashtag & reach optimisation", "Monthly growth analytics"],
    cta: "Get Free Quote →",
    ctaStyle: "smm",
    href: "/marketing?service=smm",
    borderColor: "border-sky-500/20",
    featureColor: "text-sky-400",
  },
  {
    id: "google-ads",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    color: "#EF4444",
    badge: "Free Consultation",
    badgeBg: "bg-red-500/10 border-red-500/25 text-red-400",
    title: "Google Ads",
    subtitle: "High-intent leads from Search & YouTube",
    desc: "Search, Display, and YouTube ad campaigns built and optimised to bring you qualified leads at the lowest possible cost-per-click.",
    features: ["Campaign setup & structure", "Keyword & audience targeting", "Ad copy & creative", "Conversion tracking", "Budget & bid optimisation"],
    cta: "Get Free Quote →",
    ctaStyle: "google-ads",
    href: "/marketing?service=google-ads",
    borderColor: "border-red-500/20",
    featureColor: "text-red-400",
  },
  {
    id: "meta-ads",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
      </svg>
    ),
    color: "#3B82F6",
    badge: "Free Consultation",
    badgeBg: "bg-blue-500/10 border-blue-500/25 text-blue-400",
    title: "Meta Ads",
    subtitle: "Facebook & Instagram ads that convert",
    desc: "Facebook and Instagram ad campaigns with sharp audience targeting, scroll-stopping creatives, and funnels engineered to convert clicks into customers.",
    features: ["Audience & lookalike targeting", "Creative & copy production", "Funnel & landing strategy", "A/B testing", "ROAS optimisation"],
    cta: "Get Free Quote →",
    ctaStyle: "meta-ads",
    href: "/marketing?service=meta-ads",
    borderColor: "border-blue-500/20",
    featureColor: "text-blue-400",
  },
  {
    id: "email-marketing",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: "#FB7185",
    badge: "Free Consultation",
    badgeBg: "bg-rose-500/10 border-rose-500/25 text-rose-400",
    title: "Email Marketing",
    subtitle: "Nurture leads & drive repeat sales",
    desc: "Automated email funnels, newsletters, and broadcast campaigns that nurture your leads, win back customers, and drive consistent repeat business.",
    features: ["Email funnel & automation setup", "Newsletter design & copy", "List segmentation", "Broadcast campaigns", "Open & click-rate reporting"],
    cta: "Get Free Quote →",
    ctaStyle: "email-marketing",
    href: "/marketing?service=email-marketing",
    borderColor: "border-rose-500/20",
    featureColor: "text-rose-400",
  },
  {
    id: "courses",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
    color: "#6366F1",
    badge: "Coming Soon",
    badgeBg: "bg-indigo-500/10 border-indigo-500/25 text-indigo-400",
    title: "Career Courses",
    subtitle: "Self-paced skill building",
    desc: "Structured video courses on resume writing, LinkedIn growth, interview cracking, and in-demand tech & business skills — launching soon.",
    features: ["Resume & LinkedIn masterclass", "Interview preparation bootcamp", "In-demand tech skills tracks", "Certificates of completion", "Lifetime access on enrollment"],
    cta: "Coming Soon",
    ctaStyle: "indigo-btn",
    href: "",
    borderColor: "border-indigo-500/20",
    featureColor: "text-indigo-400",
    comingSoon: true,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  const total = HERO_SLIDES.length;
  const prev = useCallback(() => setSlide((s) => (s - 1 + total) % total), [total]);
  const next = useCallback(() => setSlide((s) => (s + 1) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next]);

  const handleCta = (href: string) => router.push(href);

  const ctaClass = (style: string) => {
    if (style === "btn-glow") return "btn-glow text-white font-black text-sm py-3 rounded-xl w-full";
    if (style === "purple-btn") return "text-white font-black text-sm py-3 rounded-xl w-full transition-all hover:opacity-90";
    return "text-white font-black text-sm py-3 rounded-xl w-full transition-all hover:opacity-90";
  };

  const ctaInlineStyle = (style: string, color: string): React.CSSProperties => {
    if (style === "btn-glow") return {};
    if (style === "purple-btn") return { background: "linear-gradient(135deg,#8B5CF6,#0EA5E9)" };
    if (style === "orange-btn") return { background: "linear-gradient(135deg,#F97316,#FBBF24)" };
    return { background: `linear-gradient(135deg,${color}cc,${color}88)` };
  };

  return (
    <div className="relative min-h-screen bg-brand-bg text-white overflow-x-hidden">
      <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      <div className="noise-overlay" />

      <Navbar />

      {/* ── Hero carousel ── */}
      <section className="relative z-10 pt-28 pb-10 px-4 sm:px-6 overflow-hidden">
        <SectionBg variant="hero" />
        <div className="max-w-6xl mx-auto">

          {/* Top label */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-white/55 mb-4">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
              AI tools + Human expertise · Trusted by professionals across India
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
              Everything You Need<br />
              <span className="gradient-text">to Win Professionally.</span>
            </h1>
            <p className="mt-3 text-white/50 text-sm md:text-base tracking-wide">
              Career &nbsp;·&nbsp; Business &nbsp;·&nbsp; Legal &nbsp;—&nbsp; Powered by AI
            </p>
          </div>

          {/* Carousel */}
          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Track — clips slides as they move in/out */}
            <div className="relative overflow-hidden rounded-3xl h-[640px] md:h-[420px]">
              {HERO_SLIDES.map((s, i) => {
                // Position each slide relative to the current:
                // 0 = centre, 1 = right (next), total-1 = left (prev), others off-screen
                const diff = ((i - slide) % total + total) % total;
                const x =
                  diff === 0 ? 0 :
                  diff === 1 ? 100 :
                  diff === total - 1 ? -100 :
                  diff < total / 2 ? 200 : -200;

                return (
                  <div
                    key={s.id}
                    className="absolute inset-0 transition-transform duration-500 ease-in-out border border-white/10 rounded-3xl overflow-hidden"
                    style={{
                      transform: `translateX(${x}%)`,
                      background: `linear-gradient(135deg, ${s.gradientFrom}, ${s.gradientTo})`,
                      willChange: "transform",
                    }}
                  >
                    <div className="h-full grid md:grid-cols-2">

                      {/* Left — content */}
                      <div className="p-7 md:p-9 flex flex-col h-full">
                        {/* Icon + badge */}
                        <div className="flex items-start justify-between mb-5">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${s.color}22` }}>
                            <span style={{ color: s.color }}>{s.icon}</span>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${s.badgeColor}`}>
                            {s.badge}
                          </span>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-white mb-1.5">{s.title}</h2>
                        <p className="font-semibold text-sm mb-3" style={{ color: s.color }}>{s.tagline}</p>
                        <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-3">{s.desc}</p>

                        <ul className="space-y-1.5 flex-1">
                          {s.features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                              <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: s.color }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              {f}
                            </li>
                          ))}
                        </ul>

                        <div className="mt-6">
                          {s.comingSoon ? (
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleCta(s.href)}
                                className="px-5 py-2.5 rounded-xl text-white font-bold text-sm border border-white/20 hover:bg-white/10 transition-all"
                              >
                                {s.cta}
                              </button>
                              <span className="text-white/35 text-xs">Coming soon — stay tuned</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleCta(s.href)}
                              className="px-7 py-3 rounded-xl text-white font-black text-sm transition-all hover:opacity-90 hover:scale-[1.02]"
                              style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}99)` }}
                            >
                              {s.cta}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Right — visual accent panel */}
                      <div
                        className="hidden md:flex items-center justify-center relative overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${s.color}12, ${s.color}04)` }}
                      >
                        {/* Decorative giant circle behind */}
                        <div
                          className="absolute w-80 h-80 rounded-full opacity-[0.06]"
                          style={{ background: s.color, transform: "translate(30%, 30%)" }}
                        />
                        <div className="relative z-10 flex flex-col items-center text-center px-8">
                          {/* Giant icon */}
                          <div
                            className="w-32 h-32 rounded-3xl flex items-center justify-center mb-5 shadow-2xl"
                            style={{
                              background: `linear-gradient(135deg, ${s.color}30, ${s.color}10)`,
                              border: `1px solid ${s.color}40`,
                            }}
                          >
                            <span style={{ color: s.color }} className="[&_svg]:w-16 [&_svg]:h-16">{s.icon}</span>
                          </div>

                          {/* Slide counter */}
                          <div className="text-6xl font-black leading-none mb-1" style={{ color: `${s.color}cc` }}>
                            {String(i + 1).padStart(2, "0")}
                          </div>
                          <div className="text-white/25 text-xs mb-6">of {total} services</div>

                          {/* Status pill */}
                          {s.comingSoon ? (
                            <div
                              className="rounded-xl px-4 py-2.5 border border-dashed text-center"
                              style={{ borderColor: `${s.color}50` }}
                            >
                              <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: `${s.color}70` }}>Coming Soon</div>
                              <div className="font-bold text-sm" style={{ color: s.color }}>{s.title}</div>
                            </div>
                          ) : (
                            <div className="glass rounded-xl px-4 py-2.5 border border-white/10 text-center">
                              <div className="text-[10px] uppercase tracking-widest text-white/35 mb-0.5">Available Now</div>
                              <div className="text-white font-bold text-sm">{s.title}</div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Prev / Next arrows — outside the clipping container */}
            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 glass w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white border border-white/10 transition-all hover:bg-white/10 z-20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 glass w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white border border-white/10 transition-all hover:bg-white/10 z-20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {HERO_SLIDES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => { setSlide(i); setPaused(true); }}
                className={`rounded-full transition-all duration-300 ${i === slide ? "w-6 h-2" : "w-2 h-2 bg-white/20 hover:bg-white/40"}`}
                style={i === slide ? { background: HERO_SLIDES[slide].color, width: "24px", height: "8px" } : {}}
              />
            ))}
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
            {STATS.map((s) => (
              <div key={s.label} className="glass rounded-2xl py-4 px-3 text-center border border-white/5">
                <div className="text-2xl font-black gradient-text mb-1">{s.value}</div>
                <div className="text-white/40 text-xs">{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="relative z-10 py-16 px-6 overflow-hidden">
        <SectionBg variant="particles" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Everything You Need to Land Your Dream Job</h2>
            <p className="text-white/40 max-w-xl mx-auto">AI tools for instant results. Human experts for deep guidance. Sign in once, access everything.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((svc) => (
              <div key={svc.id} className={`relative glass rounded-2xl p-6 border ${svc.borderColor} flex flex-col ${svc.comingSoon ? "overflow-hidden" : ""}`}>
                {svc.comingSoon && (
                  <div className="absolute top-5 -right-9 rotate-45 bg-indigo-500/90 text-white text-[10px] font-black px-10 py-1 shadow-lg">SOON</div>
                )}
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${svc.color}18` }}>
                      <span style={{ color: svc.color }}>{svc.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-black text-white text-base leading-tight">{svc.title}</h3>
                      <p className="text-white/40 text-xs">{svc.subtitle}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${svc.badgeBg}`}>{svc.badge}</span>
                </div>

                <p className="text-white/50 text-sm leading-relaxed mb-4">{svc.desc}</p>

                <ul className="space-y-1.5 mb-5 flex-1">
                  {svc.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-white/55">
                      <svg className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${svc.featureColor}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {svc.comingSoon ? (
                  <button disabled
                    className="w-full py-3 rounded-xl font-black text-sm text-white/40 bg-white/5 border border-white/10 cursor-not-allowed flex items-center justify-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                    Coming Soon
                  </button>
                ) : (
                  <button onClick={() => handleCta(svc.href)}
                    className={ctaClass(svc.ctaStyle)}
                    style={ctaInlineStyle(svc.ctaStyle, svc.color)}>
                    {svc.cta}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-3">How It Works</h2>
          <p className="text-white/40 mb-12">Three simple steps to launch your career</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Sign In", desc: "One-time Google login to track your subscriptions and session across tools." },
              { step: "02", title: "Choose Your Service", desc: "Pick from AI tools (instant) or human services (request & we respond within 24 hours)." },
              { step: "03", title: "Get Results", desc: "AI tools give instant results. Human services are delivered within 2-3 business days." },
            ].map((s) => (
              <div key={s.step} className="glass rounded-2xl p-6 text-center">
                <div className="text-4xl font-black gradient-text mb-3">{s.step}</div>
                <h3 className="font-black text-white mb-2">{s.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Success Stories ── */}
      <SuccessStories />

      {/* ── Pricing ── */}
      <section id="pricing" className="relative z-10 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Simple, Transparent Pricing</h2>
            <p className="text-white/40">No hidden fees. No subscriptions unless stated. Pay only for what you need.</p>
          </div>

          {/* ── AI Tools ── */}
          <div className="mb-3">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-teal px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/20">AI Tools · Instant Results</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  name: "LinkedIn Optimizer", price: "₹200", model: "One-time payment",
                  color: "#10B981", href: "/optimize", cta: "Start Free →",
                  features: ["15-section AI analysis", "Full profile rewrite", "Keyword gap vs job description"],
                  note: "First 5 sections free",
                },
                {
                  name: "Naukri Optimizer", price: "₹200", model: "One-time payment",
                  color: "#FF6B35", href: "/naukri", cta: "Start Free →",
                  features: ["13-section AI analysis", "Resume headline + summary rewrite", "CTC & skills strategy"],
                  note: "First 4 sections free",
                },
                {
                  name: "ATS Resume Scanner", price: "₹200", model: "One-time payment",
                  color: "#8B5CF6", href: "/ats", cta: "Scan Resume →",
                  features: ["ATS score 0–100", "Keyword match & gap report", "12+ fix recommendations"],
                  note: "Score visible free",
                },
              ].map((p) => (
                <div key={p.name} className="glass rounded-2xl p-6 border border-white/8 flex flex-col" style={{ borderColor: `${p.color}20` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-black text-white text-base mb-0.5">{p.name}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${p.color}18`, color: p.color }}>{p.note}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black" style={{ color: p.color }}>{p.price}</div>
                      <div className="text-white/30 text-[10px]">{p.model}</div>
                    </div>
                  </div>
                  <ul className="space-y-1.5 mb-5 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-white/55">
                        <svg className="w-3 h-3 flex-shrink-0" style={{ color: p.color }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleCta(p.href)}
                    className="w-full py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
                    style={{ background: `linear-gradient(135deg,${p.color}cc,${p.color}55)` }}>
                    {p.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Human + AI Services ── */}
          <div className="mb-3">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-purple px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20">Human + AI Services</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  name: "Resume Creation", price: "₹200", model: "Pay after delivery",
                  color: "#F97316", href: "/resume", cta: "Order Resume →",
                  features: ["ATS-optimised", "Role-specific tailoring", "24–48h turnaround"],
                  highlight: true,
                },
                {
                  name: "Portfolio Website", price: "₹1,099", model: "One-time",
                  color: "#0EA5E9", href: "/portfolio", cta: "Request Now →",
                  features: ["Custom design", "Mobile responsive", "3-day delivery"],
                  highlight: false,
                },
                {
                  name: "Career Counseling", price: "Custom", model: "Per session",
                  color: "#EC4899", href: "/career", cta: "Book Free Call →",
                  features: ["1-on-1 coaching", "Mock interviews", "Career roadmap"],
                  highlight: false,
                },
                {
                  name: "Content Creation", price: "₹500", model: "Per week",
                  color: "#F59E0B", href: "/content", cta: "Get Plan →",
                  features: ["Reels, posts & blogs", "All platforms", "Monthly analytics"],
                  highlight: false,
                },
              ].map((p) => (
                <div key={p.name} className="glass rounded-2xl p-5 border flex flex-col" style={{ borderColor: p.highlight ? `${p.color}40` : `${p.color}18` }}>
                  <h3 className="font-black text-white text-sm mb-1 leading-tight">{p.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-black" style={{ color: p.color }}>{p.price}</span>
                    {p.price !== "Custom" && <span className="text-white/30 text-[10px]">/{p.model.split(" ")[0] === "Pay" ? "delivery" : p.model.toLowerCase().replace("one-time","one time")}</span>}
                  </div>
                  {p.highlight && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block w-fit" style={{ background: `${p.color}20`, color: p.color }}>
                      No upfront charge
                    </span>
                  )}
                  <ul className="space-y-1 mb-4 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-[11px] text-white/50">
                        <svg className="w-2.5 h-2.5 flex-shrink-0" style={{ color: p.color }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleCta(p.href)}
                    className="w-full py-2 rounded-xl text-white font-bold text-xs transition-all hover:opacity-90"
                    style={{ background: `linear-gradient(135deg,${p.color}cc,${p.color}55)` }}>
                    {p.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Coming Soon ── */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-white/30 px-3 py-1 rounded-full bg-white/5 border border-white/10">Coming Soon</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { name: "Legal AI Assist", desc: "Workplace law, contracts, notices", color: "#6366F1" },
                { name: "ERP & Business Solutions", desc: "HR, inventory, finance, CRM automation", color: "#14B8A6" },
                { name: "Career Courses", desc: "Self-paced video courses with certificates", color: "#A78BFA" },
              ].map((p) => (
                <div key={p.name} className="glass rounded-2xl p-4 border border-dashed border-white/10 flex items-center gap-4 opacity-60">
                  <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: `${p.color}18` }} />
                  <div>
                    <p className="text-white font-bold text-xs mb-0.5">{p.name}</p>
                    <p className="text-white/35 text-[10px]">{p.desc}</p>
                  </div>
                  <span className="ml-auto text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${p.color}18`, color: p.color }}>Soon</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Bundle ── */}
          <div className="glass rounded-2xl p-6 border border-white/8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-brand-teal uppercase tracking-widest mb-1">Best Value</div>
                <h3 className="font-black text-white text-lg">Complete Career Bundle</h3>
                <p className="text-white/40 text-sm">LinkedIn Optimizer + ATS Scanner + Resume Creation + Portfolio Website + Career Counseling</p>
              </div>
              <div className="text-center flex-shrink-0">
                <div className="text-3xl font-black gradient-text">₹1,999</div>
                <p className="text-white/30 text-xs">Saves ₹700+</p>
              </div>
              <button onClick={() => handleCta("/#contact")}
                className="btn-glow text-white font-bold px-6 py-3 rounded-xl text-sm flex-shrink-0">
                Get Bundle →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FAQ />

      {/* ── Contact + Feedback (side by side) ── */}
      <section id="contact" className="relative z-10 py-16 px-6 overflow-hidden">
        <SectionBg variant="orbits" />
        <div className="max-w-6xl mx-auto">

          {/* Header + quick info strip */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Let&apos;s Connect</h2>
            <p className="text-white/40 max-w-lg mx-auto text-sm">Have a question or want a service? Reach out. Worked with us? Share your experience.</p>
          </div>

          {/* Info pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <a href="mailto:info@procareerlaunchpad.com"
              className="flex items-center gap-2 px-4 py-2 glass rounded-full border border-white/10 text-sm text-white/60 hover:text-white transition-colors">
              <svg className="w-4 h-4 text-brand-teal" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              info@procareerlaunchpad.com
            </a>
            <a href="https://calendar.app.google/HbKg3j7UYVZXKxxaA" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 glass rounded-full border border-white/10 text-sm text-white/60 hover:text-white transition-colors">
              <svg className="w-4 h-4 text-brand-purple" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book a free 15-min call
            </a>
            <span className="flex items-center gap-2 px-4 py-2 glass rounded-full border border-white/10 text-sm text-white/50">
              <svg className="w-4 h-4 text-brand-teal" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Reply within 24 hours
            </span>
          </div>

          {/* Follow us on social */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <p className="w-full text-center text-white/30 text-xs mb-1 tracking-widest uppercase">Follow &amp; Connect</p>
            <a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#"} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 hover:brightness-110"
              style={{ background: "linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)" }}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.24 2.242 1.301 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.061 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.24-3.608 1.301-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.061-2.633-.326-3.608-1.301-.975-.975-1.24-2.242-1.301-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.061-1.366.326-2.633 1.301-3.608.975-.975 2.242-1.24 3.608-1.301C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072 5.197.157 3.355.673 2.014 2.014.673 3.355.157 5.197.072 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.085 1.855.601 3.697 1.942 5.038 1.341 1.341 3.183 1.857 5.038 1.942C8.332 23.986 8.741 24 12 24s3.668-.014 4.948-.072c1.855-.085 3.697-.601 5.038-1.942 1.341-1.341 1.857-3.183 1.942-5.038.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.668-.072-4.948-.085-1.855-.601-3.697-1.942-5.038C20.645.673 18.803.157 16.948.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              Follow on Instagram
            </a>
            <a href={process.env.NEXT_PUBLIC_LINKEDIN_URL || "#"} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 hover:brightness-110"
              style={{ background: "#0077B5" }}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Connect on LinkedIn
            </a>
            <a href={process.env.NEXT_PUBLIC_FACEBOOK_URL || "#"} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 hover:brightness-110"
              style={{ background: "#1877F2" }}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.532-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              Like on Facebook
            </a>
          </div>

          {/* Side-by-side forms — animated cards */}
          <style>{`
            @keyframes floatIcon { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
            @keyframes glowTeal { 0%,100%{box-shadow:0 0 40px #10B98115} 50%{box-shadow:0 0 80px #10B98130} }
            @keyframes glowAmber { 0%,100%{box-shadow:0 0 40px #F59E0B12} 50%{box-shadow:0 0 80px #F59E0B28} }
          `}</style>
          <div className="grid md:grid-cols-2 gap-6">

            {/* ── Get In Touch card (teal) ── */}
            <div
              className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:border-[#10B981]/40 cursor-default"
              style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(16,185,129,0.2)", animation:"glowTeal 4s ease-in-out infinite" }}
            >
              {/* Animated top accent line */}
              <div className="h-[2px] w-full" style={{ background:"linear-gradient(90deg,transparent,#10B981,transparent)" }} />
              {/* Card header */}
              <div className="flex items-center gap-3 px-6 pt-5 pb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:"#10B98118", animation:"floatIcon 3s ease-in-out infinite" }}>
                  <svg className="w-5 h-5" style={{ color:"#10B981" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-black text-base">Get In Touch</h3>
                  <p className="text-white/35 text-xs">We reply within 24 hours</p>
                </div>
              </div>
              <div className="px-6 pb-6">
                <ContactForm />
              </div>
            </div>

            {/* ── Share Your Experience card (amber) ── */}
            <div
              className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:border-amber-400/40 cursor-default"
              style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(245,158,11,0.2)", animation:"glowAmber 4s ease-in-out infinite 1.2s" }}
            >
              {/* Animated top accent line */}
              <div className="h-[2px] w-full" style={{ background:"linear-gradient(90deg,transparent,#F59E0B,transparent)" }} />
              {/* Card header */}
              <div className="flex items-center gap-3 px-6 pt-5 pb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:"#F59E0B18", animation:"floatIcon 3s ease-in-out infinite 1s" }}>
                  <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-black text-base">Share Your Experience</h3>
                  <p className="text-white/35 text-xs">Published after verification · helps others find us</p>
                </div>
              </div>
              <div className="px-6 pb-6">
                <FeedbackForm />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 btn-glow rounded-lg flex items-center justify-center text-white font-black text-sm">S</div>
                <span className="font-black text-white">Shyam Pro Services</span>
              </div>
              <p className="text-white/35 text-xs leading-relaxed">AI-powered career tools and human expertise to help you get hired faster.</p>
            </div>
            <div>
              <p className="text-white/70 font-bold text-sm mb-3">AI Tools</p>
              <div className="space-y-2">
                <a href="/optimize" className="block text-white/35 hover:text-white text-xs transition-colors">LinkedIn Optimizer</a>
                <a href="/naukri" className="block text-white/35 hover:text-white text-xs transition-colors">Naukri Optimizer</a>
                <a href="/ats" className="block text-white/35 hover:text-white text-xs transition-colors">ATS Scanner</a>
              </div>
            </div>
            <div>
              <p className="text-white/70 font-bold text-sm mb-3">Services</p>
              <div className="space-y-2">
                <a href="/resume" className="block text-white/35 hover:text-white text-xs transition-colors">Resume Creation</a>
                <a href="/content" className="block text-white/35 hover:text-white text-xs transition-colors">Content Creation</a>
                <a href="/portfolio" className="block text-white/35 hover:text-white text-xs transition-colors">Portfolio Creation</a>
                <a href="/career" className="block text-white/35 hover:text-white text-xs transition-colors">Career Counseling</a>
                <a href="/pay" className="block text-brand-teal/60 hover:text-brand-teal text-xs transition-colors font-bold">💳 Pay for a Service</a>
              </div>
            </div>
            <div>
              <p className="text-white/70 font-bold text-sm mb-3">Contact</p>
              <a href="mailto:info@procareerlaunchpad.com" className="block text-white/35 hover:text-white text-xs transition-colors mb-2">info@procareerlaunchpad.com</a>
              <a href="https://calendar.app.google/HbKg3j7UYVZXKxxaA" target="_blank" rel="noreferrer" className="block text-white/35 hover:text-white text-xs transition-colors">Book a Discovery Call</a>
            </div>
            <div>
              <p className="text-white/70 font-bold text-sm mb-3">Follow Us</p>
              <div className="flex items-center gap-3">
                <a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#"} target="_blank" rel="noreferrer" title="Instagram"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all hover:scale-110"
                  style={{ background:"rgba(255,255,255,0.06)" }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.24 2.242 1.301 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.061 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.24-3.608 1.301-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.061-2.633-.326-3.608-1.301-.975-.975-1.24-2.242-1.301-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.061-1.366.326-2.633 1.301-3.608.975-.975 2.242-1.24 3.608-1.301C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072 5.197.157 3.355.673 2.014 2.014.673 3.355.157 5.197.072 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.085 1.855.601 3.697 1.942 5.038 1.341 1.341 3.183 1.857 5.038 1.942C8.332 23.986 8.741 24 12 24s3.668-.014 4.948-.072c1.855-.085 3.697-.601 5.038-1.942 1.341-1.341 1.857-3.183 1.942-5.038.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.668-.072-4.948-.085-1.855-.601-3.697-1.942-5.038C20.645.673 18.803.157 16.948.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href={process.env.NEXT_PUBLIC_LINKEDIN_URL || "#"} target="_blank" rel="noreferrer" title="LinkedIn"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all hover:scale-110"
                  style={{ background:"rgba(255,255,255,0.06)" }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href={process.env.NEXT_PUBLIC_FACEBOOK_URL || "#"} target="_blank" rel="noreferrer" title="Facebook"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all hover:scale-110"
                  style={{ background:"rgba(255,255,255,0.06)" }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.532-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-white/20 text-xs">© {new Date().getFullYear()} Shyam Pro Services. Not affiliated with LinkedIn.</p>
            <p className="text-white/20 text-xs">Get Hired. Get Ahead.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
