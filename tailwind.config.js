// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./resources/**/*.edge",
    "./resources/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
    extend: {
      colors: {
        'cream': '#FEFBF4', 
        'accent': '#F87C7C',
        'near-black': '#3A3A3A',
        'medium-gray': '#777777',
      },
      fontFamily: {
        'sans': ['Lato', ...defaultTheme.fontFamily.sans],
        'serif': ['Playfair Display', ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [],
}
