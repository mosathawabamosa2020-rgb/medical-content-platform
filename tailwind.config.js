/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2E7D32', light: '#4CAF50', dark: '#1B5E20' },
        secondary: { DEFAULT: '#546E7A', light: '#78909C', dark: '#37474F' },
        success: '#388E3C',
        warning: '#F9A825',
        error: '#C62828',
        surface: '#F5F7FA',
      },
      fontFamily: {
        arabic: ['Cairo', 'Noto Sans Arabic', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-rtl'), require('@tailwindcss/typography'), require('@tailwindcss/forms')],
}
