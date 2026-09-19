import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#050816",
          "bg-secondary": "#0B1120",
          surface: "#0F172A",
          "surface-hover": "#111C32",
          border: "#1E293B",
          "border-subtle": "#172033",
          accent: "#2563EB",
          "accent-hover": "#3B82F6",
          "accent-active": "#1D4ED8",
          "text-primary": "#F8FAFC",
          "text-secondary": "#CBD5E1",
          "text-muted": "#94A3B8",
          disabled: "#64748B",
          success: "#22C55E",
          warning: "#F59E0B",
          error: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        interactive: "12px",
        lg: "16px",
        pill: "999px",
      },
      maxWidth: {
        container: "1280px",
      },
      spacing: {
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "6": "24px",
        "8": "32px",
        "12": "48px",
        "16": "64px",
        "20": "80px",
        "24": "96px",
        "32": "128px",
        "40": "160px",
      },
      gridTemplateColumns: {
        "12": "repeat(12, minmax(0, 1fr))",
      },
    },
  },
  plugins: [],
};

export default config;
