import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        '2xl': '1576px',
      },
      colors: {
        primary: {
          50: '#EEF4FF',
          100: '#E1ECFF',
          200: '#BCD5FF',
          300: '#9DBBEF',
          400: '#82A4DE',
          500: '#72A6FF',
          600: '#C5D8F9',
          700: '#5996FF',
          800: '#4F71CD',
          900: '#517BC0',
        },
        purple: {
          500: '#D689FC',
        },
        green: {
          800: '#A9EF53',
        },
        pink: {
          800: '#DD3B96',
        },
        orange: {
          800: '#FF975C',
        },
        red: {
          600: '#FF5E5C',
        },
        yellow: {
          700: '#FAB608',
        },
        boxColor: {
          200: '#F9FAFA',
        },
      },
    },
  },
  plugins: [],
}
export default config
