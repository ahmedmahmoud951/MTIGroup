import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc7fc",
          400: "#38a8f8",
          500: "#0e8de9",
          600: "#026fc7",
          700: "#0358a1",
          800: "#074b84",
          900: "#0c3f6e",
          950: "#082849",
        },
        burgundy: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          850: "#881337",
          900: "#4c0519",
          950: "#2a040d",
        },
        wine: {
          950: "#180206",
          900: "#27040b",
          800: "#3d0612",
          700: "#58091b",
          600: "#740c24",
          500: "#91102e",
        },
        gold: {
          300: "#fde68a",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        dark: {
          950: "#070204",
          900: "#0c0608",
          850: "#130a0e",
          800: "#1a0f14",
          700: "#26171e",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-cairo)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "burgundy-glow": "radial-gradient(circle at 50% 0%, rgba(159, 18, 57, 0.35) 0%, rgba(42, 4, 13, 0.8) 70%, transparent 100%)",
        "wine-mesh": "radial-gradient(at 0% 0%, rgba(136, 19, 55, 0.25) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(159, 18, 57, 0.2) 0px, transparent 50%)",
      }
    },
  },
  plugins: [],
};
export default config;
