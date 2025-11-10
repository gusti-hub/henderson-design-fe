/** @type {import('tailwindcss').Config} */
import withMT from "@material-tailwind/react/utils/withMT";
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = withMT({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: '#11566C',
        bgmain: '#C2BAFF'
      },
      fontFamily: {
        sans: ['Freight Sans Book', ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
        spin: 'spin 1s linear infinite',
      }
    },
  },
  plugins: [],
})