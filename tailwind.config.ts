import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        display: ["var(--font-orbitron)", "var(--font-montserrat)", "sans-serif"],
      },
      colors: {
        /* Brand gold */
        gold: {
          300: "#FDE68A",
          400: "#FACC15",
          500: "#D4AF37",
          600: "#B8960C",
        },
        /* Dark backgrounds */
        dark: {
          950: "#070B12",
          900: "#0B0F17",
          800: "#0F172A",
          700: "#1E293B",
          600: "#1F1F23",
          500: "#27272A",
          400: "#3F3F46",
        },
        /* Accent */
        accent: {
          blue:   "#3B82F6",
          green:  "#22C55E",
          red:    "#EF4444",
          purple: "#8B5CF6",
        },
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      backgroundImage: {
        "page-gradient": "linear-gradient(160deg, #0B0F17 0%, #0F172A 50%, #0B0F17 100%)",
        "card-gradient": "linear-gradient(135deg, #1E293B 0%, #1F1F23 100%)",
        "hero-gradient": "linear-gradient(90deg, rgba(11,15,23,0.98) 0%, rgba(15,23,42,0.85) 60%, rgba(30,41,59,0.4) 100%)",
      },
      boxShadow: {
        "gold-glow":   "0 0 16px rgba(212,175,55,0.45)",
        "blue-glow":   "0 0 14px rgba(59,130,246,0.5)",
        "purple-glow": "0 0 14px rgba(139,92,246,0.45)",
        "card":        "0 4px 24px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
