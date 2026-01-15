/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react");
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Work Sans', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  darkMode: "class",
  plugins: [nextui({
    defaultTheme: "dark",
    themes: {
      dark: {
        colors: {
          background: "#030D1C", // User provided dark
          foreground: "#FFFFFF",
          primary: {
            DEFAULT: "#0CDBFF", // User provided Cyan
            foreground: "#000000",
          },
          secondary: {
            DEFAULT: "#00C662", // User provided Green
            foreground: "#000000",
          },
          focus: "#0CDBFF",
        },
      },
    },
  })],
};
