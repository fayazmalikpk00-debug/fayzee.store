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
          50: "#F5F3EE",
          100: "#EFECE6",
          200: "#E5DFD3",
          300: "#D4B15A",
          400: "#C8A96B",
          500: "#0B0F14",
          600: "#081832",
          700: "#161F2B",
          800: "#0B0F14",
          900: "#05080B",
          DEFAULT: "#0B0F14",
          hover: "#1A222C",
          accent: "#C8A96B",
          accentHover: "#D4B15A",
          gold: "#C8A96B",
          navy: "#0B0F14",
          dark: "#0B0F14",
          bg: "#F5F3EE",
          muted: "#8A8F98",
          surface: "#FFFFFF",
          border: "#E8E5DC",
        },
        fayzee: {
          primary: "#0B0F14",
          hover: "#1A222C",
          accent: "#C8A96B",
          gold: "#C8A96B",
          navy: "#0B0F14",
          dark: "#0B0F14",
          text: "#0B0F14",
          muted: "#8A8F98",
          surface: "#FFFFFF",
          background: "#F5F3EE",
          border: "#E8E5DC",
          white: "#FFFFFF",
          coral: "#C8A96B",
          amber: "#C8A96B",
          cyan: "#C8A96B",
        },
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        display: ["Arial", "Helvetica", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(11, 15, 20, 0.04), 0 1px 2px 0 rgba(11, 15, 20, 0.02)",
        card: "0 4px 20px -2px rgba(11, 15, 20, 0.05), 0 2px 6px -1px rgba(11, 15, 20, 0.03)",
        "card-hover": "0 14px 34px -4px rgba(11, 15, 20, 0.08), 0 6px 16px -2px rgba(200, 169, 107, 0.14)",
        floating: "0 20px 40px -8px rgba(11, 15, 20, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
