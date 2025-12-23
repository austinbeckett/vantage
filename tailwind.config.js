/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Source Serif 4', 'Georgia', 'Times New Roman', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        primary: {
          50: '#fef6f4',
          100: '#fdeae6',
          200: '#fbd5cc',
          300: '#f6b5a3',
          400: '#e8937a',
          500: '#de7356',
          600: '#c75a3d',
          700: '#a74830',
          800: '#8a3d2a',
          900: '#723627',
          950: '#3d1a11',
        },
        secondary: {
          50: '#f6f7f5',
          100: '#e8ebe5',
          200: '#d3daca',
          300: '#b3c0a4',
          400: '#8fa07a',
          500: '#6b8455',
          600: '#556b42',
          700: '#445536',
          800: '#38452d',
          900: '#2f3a27',
          950: '#171e12',
        },
        neutral: {
          50: '#fcfcf8',
          100: '#f8f7f2',
          200: '#f0eee6',
          300: '#e2dfd4',
          400: '#b8b3a4',
          500: '#7a7567',
          600: '#5a554a',
          700: '#3d3a33',
          800: '#2a2722',
          900: '#1e1c18',
          950: '#121110',
        },
      },
    },
  },
  plugins: [],
}
