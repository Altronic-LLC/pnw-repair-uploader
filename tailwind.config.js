/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  // Theme is toggled by adding/removing the `dark` class on <html>.
  // See src/lib/theme.ts (logic) and src/styles/globals.css (token values).
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Cooper Red — Altronic's brand accent. Same in both themes.
        accent: "#CB2C30",

        // Semantic tokens backed by CSS variables in globals.css. The variable
        // values flip between light (:root) and dark (.dark), so components use
        // these names and never care which theme is active.
        bg: "var(--bg)", // page background
        fg: "var(--fg)", // primary text
        "fg-muted": "var(--fg-muted)", // secondary text
        "fg-subtle": "var(--fg-subtle)", // tertiary / hint text
        "fg-faint": "var(--fg-faint)", // faintest text / icons
        surface: "var(--surface)", // cards, modals, panels
        "surface-2": "var(--surface-2)", // inputs, chips, subtle fills
        "surface-3": "var(--surface-3)", // hover / active fills
        border: "var(--border)", // hairline borders + rings
        overlay: "var(--overlay)", // solid modal backdrop (both themes)
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
