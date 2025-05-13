/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        theme: {
          primary: {
            bg: "var(--theme-primary-bg)",
            hover: "var(--theme-primary-hover-bg)",
            ring: "var(--theme-primary-focus-ring)",
            text: "var(--theme-primary-text)",
          },
          secondary: {
            bg: "var(--theme-secondary-bg)",
            hover: "var(--theme-secondary-hover-bg)",
            ring: "var(--theme-secondary-focus-ring)",
            text: "var(--theme-secondary-text)",
          },
          table: {
            header: {
              bg: "var(--theme-table-header-bg)",
              text: "var(--theme-table-header-text)",
            },
            cell: {
              bg: "var(--theme-table-cell-bg)",
              text: "var(--theme-table-cell-text)",
            },
            border: "var(--theme-table-border)",
          },
          app: {
            bg: "var(--theme-app-bg)",
            text: "var(--theme-app-text)",
            border: "var(--theme-app-border)",
          },
          card: {
            bg: "var(--theme-card-bg)",
            shadow: "var(--theme-card-shadow)",
            border: "var(--theme-card-border)",
            text: "var(--theme-card-text)",
            heading: "var(--theme-card-heading-text)",
          },
          input: {
            bg: "var(--theme-input-bg)",
            text: "var(--theme-input-text)",
            border: "var(--theme-input-border)",
            focusring: "var(--theme-input-focus-ring)",
            placeholder: "var(--theme-input-placeholder)",
          },
        },
      },
      fontSize: {
        "schedule-base": "var(--base-text-size)",
        "schedule-lg": "calc(var(--base-text-size) * 1.15)",
        "schedule-sm": "calc(var(--base-text-size) * 0.9)",
        "schedule-xs": "calc(var(--base-text-size) * 0.8)",
        "schedule-xxs": "calc(var(--base-text-size) * 0.7)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
