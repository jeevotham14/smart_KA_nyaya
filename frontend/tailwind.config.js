/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#edf3f8',
          100: '#d8e7f1',
          700: '#11375b',
          800: '#092846',
          900: '#051c33',
        },
        legalGold: '#c49a3a',
        aidGreen: '#1f7a4c',
        alertRed: '#b42318',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        legal: '0 16px 45px rgba(5, 28, 51, 0.12)',
      },
    },
  },
  plugins: [],
};