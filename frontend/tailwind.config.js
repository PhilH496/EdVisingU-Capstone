/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark-blue': '#0071a9',
        'brand-light-blue': '#0d6efd',
        'brand-light-green': '#e6fad2',
        'brand-light-yellow': '#FAFAD2',
        'brand-light-red': '#fad2d2',
        'brand-submit-green': '#90EE90',
        'brand-text-gray': '#4e4e4e',
        'brand-header-black': '#333',
      },
      fontFamily: {
        'raleway': ['Raleway', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}