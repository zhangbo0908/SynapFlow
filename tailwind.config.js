/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        app: "var(--color-bg-app)",
        panel: {
          DEFAULT: "var(--color-bg-panel)",
          hover: "var(--color-bg-panel-hover)",
        },
        ui: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          border: "var(--color-border-base)",
        },
        brand: "var(--color-brand)",
        accent: "var(--color-accent)",
      },
      boxShadow: {
        'node': 'var(--shadow-node)',
        'node-selected': 'var(--shadow-node-selected)',
      }
    },
  },
  plugins: [],
};
