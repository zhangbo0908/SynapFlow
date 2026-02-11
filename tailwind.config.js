/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-bg-canvas)',
        panel: {
          DEFAULT: 'var(--color-bg-panel)',
          hover: 'var(--color-bg-panel-hover)',
        },
        ui: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          border: 'var(--color-border)',
        },
        brand: {
          DEFAULT: 'var(--color-primary)',
        }
      }
    },
  },
  plugins: [],
}
