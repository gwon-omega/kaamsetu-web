import type { Config } from "tailwindcss";
import { colors, typography, spacing } from "@shram-sewa/ui-tokens";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand colors from ui-tokens
        crimson: colors.crimson,
        gold: colors.gold,
        mountain: colors.mountain,
        terrain: colors.terrain,
        // Semantic aliases
        success: colors.semantic.success,
        warning: colors.semantic.warning,
        error: colors.semantic.error,
        info: colors.semantic.info,
      },
      fontFamily: {
        display: [typography.fonts.display, "serif"],
        body: [typography.fonts.body, "sans-serif"],
        devanagari: [typography.fonts.devanagari, "sans-serif"],
        mono: [typography.fonts.mono, "monospace"],
      },
      fontSize: typography.sizes,
      spacing: {
        ...spacing,
      },
      borderRadius: {
        card: "1.5rem",
        button: "1rem",
      },
      boxShadow: {
        card: "0 10px 40px -10px rgba(10, 21, 32, 0.1)",
        "card-hover": "0 20px 60px -15px rgba(10, 21, 32, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
