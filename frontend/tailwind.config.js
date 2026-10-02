/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep charcoal surfaces with an indigo/blue accent.
        base: '#0a0b11',
        surface: '#12141d',
        surface2: '#171a25',
        line: '#232838',
        accent: '#6366f1',
        accent2: '#818cf8',
        ink: '#e7e9f2',
        muted: '#8b93ab',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
}
