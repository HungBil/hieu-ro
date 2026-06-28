import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F766E",
          light: "#99F6E4",
          soft: "#CCFBF1",
        },
        app: {
          bg: "#F7F3EA",
          text: "#10201E",
          muted: "#8A9792",
          secondary: "#4E625D",
          border: "#DDE7E1",
        },
      },
      borderRadius: {
        card: "20px",
        composer: "24px",
      },
      boxShadow: {
        subtle: "0 10px 30px rgba(16, 32, 30, 0.06)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
