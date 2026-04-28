import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        "surface-strong": "var(--surface-strong)",
        border: "var(--border)",
        brand: "var(--brand)",
        "brand-strong": "var(--brand-strong)",
        "brand-soft": "var(--brand-soft)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        "ink-muted": "var(--ink-muted)",
        danger: "var(--danger)",
        "danger-soft": "var(--danger-soft)",
      },
      fontFamily: {
        sans: ["Instrument Sans", "Avenir Next", "Segoe UI", "sans-serif"],
      },
    },
  },
};

export default config;
