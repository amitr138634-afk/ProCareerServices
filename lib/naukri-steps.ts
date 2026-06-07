export interface NaukriStep {
  id: string;
  label: string;
  question: string;
  inputType: "text" | "textarea" | "url" | "skills";
  aiAnalysis: boolean;
  placeholder: string;
}

export const NAUKRI_STEPS: NaukriStep[] = [
  // ── FREE (0-3) ───────────────────────────────────────────────────
  {
    id: "naukri-url",
    label: "NAUKRI PROFILE",
    question:
      "Welcome! Let's optimize your Naukri profile to get 5x more recruiter calls.\n\nFirst, share your Naukri profile URL so I can begin the analysis. It usually looks like: naukri.com/mnjuser/profile",
    inputType: "url",
    aiAnalysis: false,
    placeholder: "https://www.naukri.com/mnjuser/profile?id=xxxx",
  },
  {
    id: "target-role",
    label: "TARGET ROLE",
    question:
      "What is your target job role and preferred industry? This is how I'll tailor your profile to rank in the right recruiter searches.",
    inputType: "text",
    aiAnalysis: false,
    placeholder: "e.g., Senior Software Engineer in Bangalore · FinTech / Product Startup",
  },
  {
    id: "experience",
    label: "EXPERIENCE",
    question:
      "Tell me about your experience: total years, current designation, and current company. This sets the baseline for everything we optimize.",
    inputType: "text",
    aiAnalysis: false,
    placeholder: "e.g., 4 years total · Software Engineer at Infosys · Hyderabad",
  },
  {
    id: "ctc-notice",
    label: "CTC & NOTICE",
    question:
      "What is your current CTC, expected CTC, and notice period? Naukri shows these directly to recruiters — an accurate, well-positioned CTC gets significantly more interview requests.",
    inputType: "text",
    aiAnalysis: false,
    placeholder: "e.g., Current: 8 LPA · Expected: 14 LPA · Notice: 30 days",
  },

  // ── PAID (4-12) ──────────────────────────────────────────────────
  {
    id: "resume-headline",
    label: "RESUME HEADLINE",
    question:
      "Share your current Naukri resume headline. This appears right below your name and is one of the first things recruiters see — I'll rewrite it to maximize click-throughs.",
    inputType: "text",
    aiAnalysis: true,
    placeholder: "e.g., Software Engineer | Java | Spring Boot | MySQL | 4 Years Experience",
  },
  {
    id: "profile-summary",
    label: "PROFILE SUMMARY",
    question:
      "Paste your current Naukri profile summary. I'll rewrite it to open with a strong hook, highlight your achievements, and load it with keywords recruiters search for.",
    inputType: "textarea",
    aiAnalysis: true,
    placeholder: "Paste your current profile summary (or type 'none' if blank)...",
  },
  {
    id: "key-skills",
    label: "KEY SKILLS",
    question:
      "List your current Naukri key skills (comma-separated). I'll identify what's missing for your target role, what to prioritize, and what to remove.",
    inputType: "textarea",
    aiAnalysis: true,
    placeholder: "e.g., Java, Spring Boot, MySQL, REST APIs, Microservices, Docker, Git...",
  },
  {
    id: "work-experience",
    label: "WORK EXPERIENCE",
    question:
      "Paste the job description / role description from your most recent position on Naukri. I'll optimize it with strong action verbs, quantified impact, and keywords.",
    inputType: "textarea",
    aiAnalysis: true,
    placeholder: "Paste your current job description from Naukri here...",
  },
  {
    id: "it-skills",
    label: "IT SKILLS",
    question:
      "List your IT skills — programming languages, databases, tools, and platforms you use (with proficiency level if possible). Naukri's IT Skills section boosts your ranking in technical searches.",
    inputType: "textarea",
    aiAnalysis: true,
    placeholder: "e.g., Java (Expert), Python (Intermediate), MySQL (Expert), Docker (Beginner), AWS (Beginner)...",
  },
  {
    id: "projects",
    label: "PROJECTS",
    question:
      "Describe your top 1–2 professional or academic projects. Include what you built, the tech stack, and the impact. I'll help you present them in a way that impresses technical recruiters.",
    inputType: "textarea",
    aiAnalysis: true,
    placeholder: "e.g., Built a real-time notification system using Kafka and Spring Boot — reduced delivery latency by 60%...",
  },
  {
    id: "education",
    label: "EDUCATION",
    question:
      "Share your education details — degree, college, specialization, passing year, and percentage/CGPA. I'll advise on how to present it for maximum credibility.",
    inputType: "text",
    aiAnalysis: true,
    placeholder: "e.g., B.Tech Computer Science · VIT Vellore · 2020 · 8.4 CGPA",
  },
  {
    id: "preferred-locations",
    label: "LOCATIONS",
    question:
      "What are your preferred work locations and employment type preferences? Getting this right on Naukri means your profile shows up in the right recruiter searches.",
    inputType: "text",
    aiAnalysis: true,
    placeholder: "e.g., Bangalore, Mumbai, Remote · Full-time preferred · Open to hybrid",
  },
  {
    id: "online-profiles",
    label: "ONLINE PROFILES",
    question:
      "Do you have any online profiles or work samples to showcase — GitHub, portfolio website, LinkedIn, certifications? I'll advise on how to present these on Naukri to stand out.",
    inputType: "text",
    aiAnalysis: true,
    placeholder: "e.g., GitHub: github.com/username · Portfolio: mysite.vercel.app / None yet",
  },
];

export const NAUKRI_SKILL_OPTIONS = [
  "Java Development",
  "Python & Data Science",
  "React / Next.js Frontend",
  "Node.js Backend",
  "DevOps & Cloud (AWS/GCP)",
  "Data Engineering",
  "Machine Learning / AI",
  "Mobile Development",
  "Product Management",
  "Business Analysis",
  "Sales & Business Development",
  "Digital Marketing & SEO",
];
