import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        surface: "#f8fafc",
      },
      fontFamily: {
        jakarta: ["Plus Jakarta Sans", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
  darkMode: "class",
}

export default config
