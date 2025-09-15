/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Sora", "system-ui", "sans-serif"],
      },
      colors: {
        dark: "var(--dark-bg)",
        bg: "var(--bg-color)",
        primary: "var(--primary-bg)",
        secondary: "var(--secondary-bg)",
        orange: "var(--orange-bg)",
        white: "var(--white-bg)",
        black: "var(--black-bg)",
      },
    },
  },
  plugins: [],
};
