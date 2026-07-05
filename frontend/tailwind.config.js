/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        ink: {
          50:  '#f4f6fb',
          100: '#e8ecf6',
          200: '#c9d3e8',
          300: '#a3b2d4',
          400: '#6379bd',
          500: '#3d5397',
          600: '#2b3f7e',
          700: '#1f2f63',
          800: '#16234c',
          900: '#0f1a3a',
          950: '#0a1229',
        },
        teal: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 26, 58, 0.05), 0 1px 3px rgba(15, 26, 58, 0.04)',
        'card-hover': '0 4px 6px -1px rgba(15, 26, 58, 0.07), 0 10px 24px -6px rgba(15, 26, 58, 0.12)',
        float: '0 12px 32px -8px rgba(15, 26, 58, 0.18)',
      },
      animation: {
        'float-slow': 'floaty 7s ease-in-out infinite',
        'float-slower': 'floaty 9s ease-in-out 1.2s infinite',
        'fade-up': 'fadeUp .6s ease-out both',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
