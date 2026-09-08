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
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#FF5E00",
          600: "#FF5E00",
          700: "#E05300",
          800: "#1C2A39",
          900: "#1C2A39",
          DEFAULT: "#FF5E00",
          hover: "#FF8C00",
        },
        fayzee: {
          primary: "#FF5E00",
          hover: "#FF8C00",
          navy: "#1C2A39",
          dark: "#1C2A39",
          text: "#333333",
          muted: "#777777",
          surface: "#F7F9FA",
          border: "#DDE2E6",
          white: "#FFFFFF",
          coral: "#FF5E00",
          amber: "#FF8C00",
          cyan: "#FF5E00",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 4px 20px -2px rgba(28, 42, 57, 0.06), 0 2px 6px -1px rgba(28, 42, 57, 0.03)",
        "card-hover": "0 12px 32px -4px rgba(28, 42, 57, 0.12), 0 4px 12px -2px rgba(28, 42, 57, 0.05)",
        floating: "0 20px 40px -8px rgba(255, 94, 0, 0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
