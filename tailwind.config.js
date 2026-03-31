/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: '#3B82F6',
        'accent-light': '#60A5FA',
        gold: '#D4A853',
        surface: {
          DEFAULT: '#0A0A0A',
          light: '#141414',
          card: '#1A1A1A',
          border: '#2A2A2A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
