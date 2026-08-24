import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest:  "var(--color-forest)",
        moss:    "var(--color-moss)",
        leaf:    "var(--color-leaf)",
        lime:    "var(--color-lime)",
        canvas:  "var(--color-canvas)",
        paper:   "var(--color-paper)",
        mist:    "var(--color-mist)",
        sage:    "var(--color-sage)",
        ink:     "var(--color-ink)",
        muted:   "var(--color-muted)",
        line:    "var(--color-line)",
        danger:  "var(--color-danger)",
      },
      fontFamily: {
        sans: ["Instrument Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 80px rgba(34, 32, 27, 0.10)",
      },
    },
  },
};

export default config;
