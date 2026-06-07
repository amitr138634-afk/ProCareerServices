export interface OptimizationStep {
  id: string;
  label: string;
  question: string;
  inputType: "text" | "textarea" | "url" | "competency";
  aiAnalysis: boolean;
  placeholder: string;
}

export const OPTIMIZATION_STEPS: OptimizationStep[] = [
  {
    id: "linkedin-url",
    label: "LINKEDIN URL",
    question:
      "Let's start optimizing your LinkedIn profile! Please share your LinkedIn profile URL so I can begin the analysis.",
    inputType: "url",
    aiAnalysis: false,
    placeholder: "https://www.linkedin.com/in/yourname",
  },
  {
    id: "custom-url",
    label: "CUSTOM URL",
    question:
      "Do you have a custom LinkedIn URL? (e.g., linkedin.com/in/yourname rather than a random string of numbers)",
    inputType: "text",
    aiAnalysis: false,
    placeholder: "Yes, my URL is linkedin.com/in/... / No, I have a random URL",
  },
  {
    id: "target-position",
    label: "TARGET POSITION",
    question:
      "In order to optimize your LinkedIn profile, I need to understand your goals. What kind of position do you aim for?",
    inputType: "text",
    aiAnalysis: false,
    placeholder: "e.g., Software Engineer at a startup in Bangalore",
  },
  {
    id: "competencies",
    label: "COMPETENCIES",
    question:
      "Now, a critical question: What are the main competencies that you believe will stand out or draw attention to your profile?",
    inputType: "competency",
    aiAnalysis: false,
    placeholder: "Select or type your competencies",
  },
  {
    id: "headline",
    label: "HEADLINE",
    question:
      "Share your current LinkedIn headline. I'll craft 3 high-impact versions that get 3x more profile views.",
    inputType: "text",
    aiAnalysis: true,
    placeholder: "e.g., Software Engineer | Python | ML",
  },
  {
    id: "profile-photo",
    label: "PROFILE PHOTO",
    question:
      "Describe your current profile photo — is it a professional headshot, casual photo, or are you missing one? Be honest!",
    inputType: "text",
    aiAnalysis: true,
    placeholder: "e.g., Professional headshot / Casual selfie / No photo",
  },
  {
    id: "banner",
    label: "BANNER",
    question:
      "What does your LinkedIn banner look like? Is it the default blue background, a custom image, or something else?",
    inputType: "text",
    aiAnalysis: true,
    placeholder: "e.g., Default LinkedIn banner / Custom graphic / No banner",
  },
  {
    id: "achievements",
    label: "ACHIEVEMENTS",
    question:
      "Share your top 3–5 professional achievements — projects delivered, impact created, awards won, or metrics improved.",
    inputType: "textarea",
    aiAnalysis: true,
    placeholder:
      "e.g., Built a recommendation engine that increased CTR by 32%\nLed a team of 5 to deliver project 2 weeks ahead of schedule",
  },
  {
    id: "spelling-grammar",
    label: "SPELLING & GRAMMAR",
    question:
      "Paste any section of your LinkedIn profile — headline, about, or a job description — and I'll proofread it for errors and tone.",
    inputType: "textarea",
    aiAnalysis: true,
    placeholder: "Paste your headline, About section, or any job description here...",
  },
  {
    id: "resume-match",
    label: "RESUME MATCH",
    question:
      "Paste a job description for your target role. I'll identify missing keywords and gaps between your profile and the job requirements.",
    inputType: "textarea",
    aiAnalysis: true,
    placeholder: "Paste the full job description here...",
  },
  {
    id: "about-summary",
    label: "ABOUT / SUMMARY",
    question:
      "Share your current LinkedIn About/Summary section. I'll rewrite it to make it compelling and keyword-rich for your target role.",
    inputType: "textarea",
    aiAnalysis: true,
    placeholder: "Paste your current About section here (or type 'none' if it's empty)...",
  },
  {
    id: "experience",
    label: "EXPERIENCE",
    question:
      "Share your most recent job description from LinkedIn. I'll optimize it with strong action verbs and quantified achievements.",
    inputType: "textarea",
    aiAnalysis: true,
    placeholder: "Paste your current job description here...",
  },
  {
    id: "skills",
    label: "SKILLS",
    question:
      "List your current LinkedIn skills (comma-separated). I'll recommend additions and tell you which to prioritize for endorsements.",
    inputType: "textarea",
    aiAnalysis: true,
    placeholder: "e.g., Python, Machine Learning, React, Node.js, SQL...",
  },
  {
    id: "recommendations",
    label: "RECOMMENDATIONS",
    question:
      "How many LinkedIn recommendations do you currently have? And who could potentially write one for you?",
    inputType: "text",
    aiAnalysis: true,
    placeholder: "e.g., I have 2 recommendations from my manager and a colleague",
  },
  {
    id: "age-discrimination",
    label: "AGE DISCRIMINATION",
    question:
      "Are you concerned about age discrimination in your job search? Describe your situation and I'll give specific tips to present yourself optimally.",
    inputType: "text",
    aiAnalysis: true,
    placeholder: "e.g., Yes, I'm 45+ and worried / No concern / Not applicable",
  },
];

export const COMPETENCY_OPTIONS = [
  "Python ML Engineering",
  "React Native Development",
  "LLM & RAG Systems",
  "Model Fine-Tuning",
  "Robotics Software Integration",
  "Cross-Functional Product Delivery",
  "Full-Stack Development",
  "Data Science & Analytics",
  "DevOps & Cloud (AWS/GCP)",
  "Product Management",
  "System Design",
  "Mobile Development (iOS/Android)",
];
