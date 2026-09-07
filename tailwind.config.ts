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
          50: "#F0F7FF",
          100: "#E0EFFE",
          200: "#B9DDFA",
          300: "#7CC2F8",
          400: "#36A2F2",
          500: "#0C85E0",
          600: "#0267BE",
          700: "#03529B",
          800: "#074680",
          900: "#0B3C6B",
          950: "#062647",
        },
        fayzee: {
          dark: "#0B132B",
          navy: "#1C2541",
          slate: "#3A506B",
          cyan: "#00B4D8",
          coral: "#FF6B35",
          amber: "#F77F00",
          gold: "#FCBF49",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 4px 20px -2px rgba(11, 19, 43, 0.06), 0 2px 6px -1px rgba(11, 19, 43, 0.03)",
        "card-hover": "0 12px 32px -4px rgba(11, 19, 43, 0.12), 0 4px 12px -2px rgba(11, 19, 43, 0.05)",
        floating: "0 20px 40px -8px rgba(11, 19, 43, 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
