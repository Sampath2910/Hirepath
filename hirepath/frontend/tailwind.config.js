/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hirepath: {
          blue: "#2563EB",
          "blue-dark": "#1D4ED8",
          "blue-light": "#DBEAFE",
          green: "#22C55E",
          "green-dark": "#16A34A",
          "green-light": "#DCFCE7",
          dark: "#0F172A",
          slate: "#64748B",
          bg: "#F8FAFC",
          orange: "#F59E0B",
          red: "#EF4444",
          purple: "#8B5CF6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        "card": "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 4px 12px 0 rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)",
        "blue": "0 4px 14px 0 rgba(37, 99, 235, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(37, 99, 235, 0.4)" },
          "70%": { boxShadow: "0 0 0 10px rgba(37, 99, 235, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(37, 99, 235, 0)" },
        },
      },
    },
  },
  plugins: [],
};
