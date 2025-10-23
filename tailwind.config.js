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
        'cream': '#FEFBF4', // Cor de fundo principal
        'accent': '#F87C7C', // Coral/Rosa Salmão para destaque
        'near-black': '#3A3A3A', // Um preto/marrom escuro suave para texto principal
        'medium-gray': '#777777', // Cinza médio para texto secundário
      },
      fontFamily: {
        'sans': ['Lato', ...defaultTheme.fontFamily.sans], // Ex: Lato ou Montserrat
        'serif': ['Playfair Display', ...defaultTheme.fontFamily.serif], // Ex: Playfair Display ou Lora
      },
    },
  },
  plugins: [],
}
