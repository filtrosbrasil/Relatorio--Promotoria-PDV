/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        fb: {
          navy: '#1B3A6D',
          'navy-light': '#254B8A',
          'navy-dark': '#122848',
          red: '#E31E24',
          'red-light': '#F04A4F',
          'red-dark': '#B8181D',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
