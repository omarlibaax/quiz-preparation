import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        quiz: {
          blue: '#3b82f6',
          orange: '#f97316',
          green: '#22c55e',
          purple: '#a855f7',
          red: '#ef4444',
          yellow: '#eab308',
        },
        /** CRM / ynex-style admin */
        admin: {
          primary: '#845adf',
          'primary-dark': '#6f48d8',
          sidebar: '#0c1427',
          'sidebar-hover': '#151e36',
          surface: '#f3f6fb',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.06), 0 10px 24px rgba(15, 23, 42, 0.04)',
        'card-lg': '0 4px 24px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
}

