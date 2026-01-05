/** @type {import('tailwindcss').Config} */
import withMT from "@material-tailwind/react/utils/withMT";
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = withMT({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Phase colors - backgrounds (dark for white text)
    'bg-emerald-600',
    'bg-purple-600',
    'bg-blue-600',
    'bg-amber-600',
    
    // Phase colors - light backgrounds (for progress bars)
    'bg-emerald-500',
    'bg-purple-500',
    'bg-blue-500',
    'bg-amber-500',
    
    // Phase colors - very light backgrounds (for selected cards)
    'bg-emerald-50',
    'bg-purple-50',
    'bg-blue-50',
    'bg-amber-50',
    
    // Phase colors - text colors
    'text-emerald-600',
    'text-purple-600',
    'text-blue-600',
    'text-amber-600',
    
    // Phase colors - dark text (for light backgrounds)
    'text-emerald-700',
    'text-purple-700',
    'text-blue-700',
    'text-amber-700',
    
    // Phase colors - borders
    'border-emerald-200',
    'border-purple-200',
    'border-blue-200',
    'border-amber-200',
    
    // Phase colors - rings
    'ring-emerald-500',
    'ring-purple-500',
    'ring-blue-500',
    'ring-amber-500',
    
    // Gray variants for locked/disabled states
    'bg-gray-500',
    'bg-gray-400',
    'bg-gray-300',
    'bg-gray-200',
    'bg-gray-100',
    'text-gray-400',
    'border-gray-200',
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