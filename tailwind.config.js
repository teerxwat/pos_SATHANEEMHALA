/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        sarabun: ['Sarabun', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#0f766e',
          hover: '#115e59',
        },
        sidebar: '#06231f',
      },
    },
  },
  plugins: [],
}
