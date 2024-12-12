/** @type {import('tailwindcss').Config} */
import withMT from "@material-tailwind/react/utils/withMT";
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
    },
  },
  plugins: [],
})
