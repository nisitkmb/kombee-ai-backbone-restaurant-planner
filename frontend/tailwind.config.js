/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}