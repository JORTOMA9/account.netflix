/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // دابا Inter هو الخط الأساسي ديال السيت كامل
        sans: ['Inter', 'sans-serif'], 
      },
      colors: {
        netflixRed: '#e50914',
      }
    },
  },
  plugins: [],
}