import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#07071A",
          surface: "#0F0F26",
          teal: "#10B981",
          blue: "#0EA5E9",
          purple: "#8B5CF6",
          dark: "#0D0D0D",
        },
      },
      fontFamily: {
        jakarta: ["var(--font-jakarta)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-accent": "linear-gradient(135deg, #0EA5E9, #8B5CF6, #10B981)",
        "gradient-text": "linear-gradient(135deg, #0EA5E9 0%, #10B981 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
