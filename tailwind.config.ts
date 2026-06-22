import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─── Soirée Villa Design System ────────────────────────────
      // Format rgb(R G B / <alpha-value>) — active les utilitaires d'opacité
      // ex: bg-primary/10, text-accent/80, border-border/50
      colors: {
        primary:      "rgb(var(--color-primary-rgb) / <alpha-value>)",
        secondary:    "rgb(var(--color-secondary-rgb) / <alpha-value>)",
        accent:       "rgb(var(--color-accent-rgb) / <alpha-value>)",
        bg:           "rgb(var(--color-bg-rgb) / <alpha-value>)",
        surface:      "rgb(var(--color-surface-rgb) / <alpha-value>)",
        border:       "rgb(var(--color-border-rgb) / <alpha-value>)",
        text:         "rgb(var(--color-text-rgb) / <alpha-value>)",
        "text-muted": "rgb(var(--color-text-muted-rgb) / <alpha-value>)",
        success:      "rgb(var(--color-success-rgb) / <alpha-value>)",
        warning:      "rgb(var(--color-warning-rgb) / <alpha-value>)",
        error:        "rgb(var(--color-error-rgb) / <alpha-value>)",
        // Thèmes de soirée
        gold:         "rgb(var(--color-gold-rgb) / <alpha-value>)",
        wine:         "rgb(var(--color-wine-rgb) / <alpha-value>)",
        burgundy:     "rgb(var(--color-burgundy-rgb) / <alpha-value>)",
        electric:     "rgb(var(--color-electric-rgb) / <alpha-value>)",
        terracotta:   "rgb(var(--color-terracotta-rgb) / <alpha-value>)",
        acid:         "rgb(var(--color-acid-rgb) / <alpha-value>)",
        // shadcn interop
        background:   "var(--background)",
        foreground:   "var(--foreground)",
        card: {
          DEFAULT:    "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT:    "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        muted: {
          DEFAULT:    "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        destructive:  "var(--destructive)",
        input:        "var(--input)",
        ring:         "var(--ring)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Inter", "sans-serif"],
        body:    ["var(--font-body)",    "system-ui", "sans-serif"],
        sans:    ["var(--font-body)",    "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono",      "monospace"],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        // Tailwind defaults gardés implicitement
      },
      borderRadius: {
        // Design system
        "2xl": "16px",
        "3xl": "24px",
        // shadcn interop
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionTimingFunction: {
        swipe:    "cubic-bezier(0.22, 1, 0.36, 1)",
        premium:  "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in":  "fade-in 400ms ease-out both",
        "slide-up": "slide-up 400ms ease-out both",
        "scale-in": "scale-in 200ms ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
