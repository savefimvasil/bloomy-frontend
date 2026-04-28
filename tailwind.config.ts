import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-canvas)",
        paper: "var(--color-paper)",
        mist: "var(--color-mist)",
        forest: "var(--color-forest)",
        moss: "var(--color-moss)",
        leaf: "var(--color-leaf)",
        lime: "var(--color-lime)",
        sage: "var(--color-sage)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        line: "var(--color-line)",
        danger: "var(--color-danger)",
      },
      fontFamily: {
        sans: ["Instrument Sans", "Avenir Next", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 80px rgba(35, 63, 37, 0.12)",
      },
    },
  },
};

export default config;
