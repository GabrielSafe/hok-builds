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
        gold: {
          300: "#FAD87A",
          400: "#F0C040",
          500: "#D4A017",
          600: "#B8860B",
        },
        dark: {
          900: "#0f0f13",
          800: "#13131a",
          700: "#18181f",
          600: "#1e1e28",
          500: "#252535",
          400: "#2e2e42",
        },
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      letterSpacing: {
        widest: "0.2em",
      },
    },
  },
  plugins: [],
};

export default config;
