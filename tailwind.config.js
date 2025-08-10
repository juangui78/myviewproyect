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
    defaultTheme: "light",
    themes: {
      // light: {
      //   colors: {
      //     danger: "#FF1A1A", // Color de peligro para el tema claro
      //     primary: "#FF4ECD", // Color primario
      //     secondary: "#9750DD", // Color secundario
      //     background: "#FFFFFF", // Fondo claro
      //     foreground: "#000000", // Texto claro
      //   },
      // },
      light: {
        colors: {
          danger: {
            DEFAULT: "#e60000",
            foreground: "#fff0f0",
            background: "#000",
          },
          primary: {
            DEFAULT: "#0CDBFF",
            foreground: "#000",
          }
        },
      },
    },
  })],
};
