import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "gosports-primary": "#00A651",
        "gosports-secondary": "#007A3D",
        "gosports-accent": "#FFC72C",
        "gosports-light": "#F0FBF5",
        "gosports-dark": "#1A1A2E",
        "gosports-gray": "#6B7280",
        "gosports-border": "#E5E7EB",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "gosports-sm": "0 2px 8px rgba(0, 166, 81, 0.10)",
        "gosports-md": "0 4px 24px rgba(0, 166, 81, 0.15)",
        "gosports-lg": "0 8px 40px rgba(0, 166, 81, 0.20)",
        "gosports-accent": "0 4px 20px rgba(255, 199, 44, 0.30)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "pulse-green": "pulseGreen 2s ease-in-out infinite",
        "bounce-subtle": "bounceSubtle 1.4s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGreen: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0, 166, 81, 0.4)" },
          "50%": { boxShadow: "0 0 0 10px rgba(0, 166, 81, 0)" },
        },
        bounceSubtle: {
          "0%, 80%, 100%": { transform: "scale(0)" },
          "40%": { transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
