/**
 * Light/dark theme handling for the kiosk.
 *
 * Model: the stored preference is "light", "dark", or "system". "system" is the
 * default (nothing stored) — the app follows the device's OS setting and tracks
 * changes to it live. The moment the user taps the toggle, an explicit
 * light/dark preference is stored and the OS setting is ignored from then on.
 *
 * The resolved theme is applied as a `dark` class on <html>; Tailwind's
 * darkMode:"class" + the CSS variables in globals.css do the rest. An inline
 * script in index.html applies the same logic before first paint to avoid a
 * flash — keep the two in sync if you change the storage key or rules.
 */

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "pnw-uploader-theme";

/** Read the saved preference; absent/invalid value means "system". */
export function getStoredPreference(): ThemePreference {
  if (typeof localStorage === "undefined") return "system";
  const v = localStorage.getItem(THEME_STORAGE_KEY);
  return v === "light" || v === "dark" ? v : "system";
}

/** Persist a preference. "system" clears the stored value (back to OS-follow). */
export function storePreference(pref: ThemePreference): void {
  if (typeof localStorage === "undefined") return;
  if (pref === "system") localStorage.removeItem(THEME_STORAGE_KEY);
  else localStorage.setItem(THEME_STORAGE_KEY, pref);
}

/** Current OS-level preference; defaults to dark when unknowable. */
export function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Turn a preference into the concrete theme to render. */
export function resolveTheme(pref: ThemePreference): ResolvedTheme {
  return pref === "system" ? systemTheme() : pref;
}

/** Apply the resolved theme to the document (<html class="dark">). */
export function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}
