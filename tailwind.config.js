/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          soft: 'rgb(var(--ink-soft) / <alpha-value>)',
        },
        brand: {
          DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
          deep: 'rgb(var(--brand-deep) / <alpha-value>)',
          hover: 'rgb(var(--brand-hover) / <alpha-value>)',
        },
        soft: 'rgb(var(--soft) / <alpha-value>)',
        softer: 'rgb(var(--softer) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        income: {
          DEFAULT: 'rgb(var(--income) / <alpha-value>)',
          ink: 'rgb(var(--income-ink) / <alpha-value>)',
        },
        expense: {
          DEFAULT: 'rgb(var(--expense) / <alpha-value>)',
          ink: 'rgb(var(--expense-ink) / <alpha-value>)',
        },
        'on-brand': 'rgb(var(--on-brand) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Fraunces Variable"', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '28px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(74, 29, 47, 0.05), 0 10px 26px -14px rgba(214, 58, 114, 0.22)',
        fab: '0 10px 26px -6px rgba(201, 47, 101, 0.5)',
        sheet: '0 -10px 44px -14px rgba(74, 29, 47, 0.28)',
      },
      keyframes: {
        'sheet-in': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'scrim-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'sheet-in': 'sheet-in 0.34s cubic-bezier(0.22, 1, 0.36, 1)',
        'scrim-in': 'scrim-in 0.2s ease-out',
        'fade-in': 'fade-in 0.26s cubic-bezier(0.22, 1, 0.36, 1)',
        'pop-in': 'pop-in 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
