/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#EEF3FA',
          100: '#DCE7F5',
          200: '#B9CFEA',
          300: '#8AAFD9',
          400: '#5A8CC4',
          500: '#35699F',
          600: '#234E7F',
          700: '#163A61',
          800: '#0B2545',
          900: '#081C33',
          950: '#04101F',
        },
        action: {
          light: '#60A5FA',
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11, 37, 69, 0.06), 0 8px 24px -12px rgba(11, 37, 69, 0.12)',
        float: '0 24px 48px -16px rgba(4, 16, 31, 0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};
