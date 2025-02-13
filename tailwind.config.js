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
    },
  },
  plugins: [],
})
