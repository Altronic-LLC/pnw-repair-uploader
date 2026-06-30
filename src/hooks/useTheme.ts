import { useCallback, useEffect, useState } from "react";
import {
  applyTheme,
  getStoredPreference,
  resolveTheme,
  storePreference,
  systemTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

interface UseTheme {
  /** What the user picked: "light", "dark", or "system" (follow OS). */
  preference: ThemePreference;
  /** The concrete theme currently rendered. */
  resolved: ResolvedTheme;
  /** Set an explicit preference (also persists it). */
  setPreference: (pref: ThemePreference) => void;
  /** Flip between light and dark, storing the result as an explicit choice. */
  toggle: () => void;
}

/**
 * Drives the light/dark theme. Keeps the <html> class in sync with the chosen
 * preference and, while on "system", live-tracks OS theme changes.
 */
export function useTheme(): UseTheme {
  const [preference, setPref] = useState<ThemePreference>(getStoredPreference);
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    resolveTheme(getStoredPreference()),
  );

  // Apply whenever the preference changes.
  useEffect(() => {
    const next = resolveTheme(preference);
    setResolved(next);
    applyTheme(next);
  }, [preference]);

  // While following the OS, react to OS theme changes in real time.
  useEffect(() => {
    if (preference !== "system") return;
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next = systemTheme();
      setResolved(next);
      applyTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = useCallback((pref: ThemePreference) => {
    storePreference(pref);
    setPref(pref);
  }, []);

  const toggle = useCallback(() => {
    setPreference(resolveTheme(getStoredPreference()) === "dark" ? "light" : "dark");
  }, [setPreference]);

  return { preference, resolved, setPreference, toggle };
}
