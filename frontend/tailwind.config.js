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
        'brand-light-blue': '#d1ddeb',
        'brand-light-green': '#e6fad2',
        'brand-light-yellow': '#FAFAD2',
        'brand-light-red': '#d62929',
        'brand-green': '#e6fad2',
        'brand-text-gray': '#4e4e4e',
        'brand-black': '#333333',
      },
      fontFamily: {
        'raleway': ['Raleway', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}