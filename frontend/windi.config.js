import { defineConfig } from 'windicss/helpers'

export default defineConfig({
  extract: {
    include: ['src/**/*.{jsx,tsx,html}'],
    exclude: ['node_modules', '.git'],
  },
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D8B5F', // 中医绿
          50: '#E8F5EE',
          100: '#C5E6D6',
          200: '#A3D7BE',
          300: '#80C8A6',
          400: '#5EB98E',
          500: '#2D8B5F',
          600: '#246F4C',
          700: '#1B5339',
          800: '#123826',
          900: '#091C13',
        },
        secondary: {
          DEFAULT: '#D97706', // 琥珀色，比原来的暖橙更沉稳
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#D97706',
          600: '#B45309',
        },
        stone: {
            50: '#fafaf9',
            100: '#f5f5f4',
            200: '#e7e5e4',
            300: '#d6d3d1',
            800: '#292524',
            900: '#1c1917',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif SC"', 'serif'],
      },
    },
  },
})
