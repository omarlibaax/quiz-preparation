/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        quiz: {
          blue: '#3b82f6',
          orange: '#f97316',
          green: '#22c55e',
          purple: '#a855f7',
          red: '#ef4444',
          yellow: '#eab308',
        },
      },
      borderRadius: {
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
}

