import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blush: {
          50: "#FFF5F7",
          100: "#FFECF0",
          200: "#FFD6E0",
          300: "#F8C8DC",
          400: "#F0A5C0",
          500: "#E88AAD",
          600: "#D4628E",
          700: "#B8436F",
          800: "#8C2D52",
          900: "#601D38",
        },
        cream: {
          50: "#FFFDFB",
          100: "#FFF8F3",
          200: "#FFF0E6",
        },
        charcoal: {
          DEFAULT: "#2D2D2D",
          light: "#4A4A4A",
          lighter: "#6B6B6B",
          darkest: "#1A1A1A",
          black: "#0D0D0D",
        },
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', "serif"],
        body: ['"Inter"', "sans-serif"],
        script: ['"Dancing Script"', "cursive"],
      },
      backgroundImage: {
        "gradient-blush":
          "linear-gradient(135deg, #FFF5F7 0%, #FFD6E0 50%, #F8C8DC 100%)",
        "gradient-soft":
          "linear-gradient(180deg, #FFFFFF 0%, #FFF5F7 100%)",
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(248, 200, 220, 0.3), 0 10px 20px -2px rgba(248, 200, 220, 0.1)",
        card: "0 4px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
        elegant: "0 20px 60px -15px rgba(248, 200, 220, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "fade-in-down": "fadeInDown 0.6s ease-out forwards",
        "slide-in-left": "slideInLeft 0.5s ease-out forwards",
        "slide-in-right": "slideInRight 0.5s ease-out forwards",
        "scale-in": "scaleIn 0.4s ease-out forwards",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
