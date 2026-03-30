/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        fb: {
          navy: '#002856',
          'navy-light': '#1B4B8A',
          'navy-dark': '#001A3A',
          red: '#EA0029',
          'red-light': '#FF3352',
          'red-dark': '#B8001F',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
