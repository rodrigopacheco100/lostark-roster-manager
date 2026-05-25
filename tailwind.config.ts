import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#181818",
          elevated: "#1e1e1e",
          hover: "#252525",
          active: "#2a2a2a",
        },
        primary: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
        },
        success: {
          DEFAULT: "#22c55e",
          hover: "#16a34a",
        },
        danger: {
          DEFAULT: "#ef4444",
          hover: "#dc2626",
        },
        warning: {
          DEFAULT: "#f59e0b",
          hover: "#d97706",
        },
      },
    },
  },
  plugins: [],
}
export default config