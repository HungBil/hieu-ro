import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          light: "#DBEAFE",
          soft: "#EFF6FF",
        },
        app: {
          bg: "#F8FAFC",
          text: "#0F172A",
          muted: "#94A3B8",
          secondary: "#475569",
          border: "#E5E7EB",
        },
      },
      borderRadius: {
        card: "20px",
        composer: "24px",
      },
      boxShadow: {
        subtle: "0 10px 30px rgba(15, 23, 42, 0.04)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
