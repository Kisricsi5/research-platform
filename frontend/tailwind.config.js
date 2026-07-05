/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutral scale remapped to slate per brand spec:
        // bg #F8FAFC · border #E2E8F0 · secondary text #475569 · main text #0F172A
        gray: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
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
        // Navy/ink ramp: 700 = brand deep navy #1E3A8A, 900 = main text #0F172A
        ink: {
          50:  '#f0f4fc',
          100: '#e1e9f8',
          200: '#c3d0ee',
          300: '#94aade',
          400: '#5f7cc7',
          500: '#3956a8',
          600: '#27418f',
          700: '#1e3a8a',
          800: '#172a5e',
          900: '#0f172a',
          950: '#0b1120',
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
