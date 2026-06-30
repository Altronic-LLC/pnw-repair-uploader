import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

/**
 * Sun/moon button that flips light ↔ dark. Defaults to following the device's
 * OS theme until the user taps it (see useTheme / lib/theme).
 */
export function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  const nextIsDark = resolved === "light";
  return (
    <button
      onClick={toggle}
      aria-label={nextIsDark ? "Switch to dark mode" : "Switch to light mode"}
      title={nextIsDark ? "Switch to dark mode" : "Switch to light mode"}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[11px] text-fg-subtle transition-colors hover:text-fg active:bg-surface-3"
    >
      {resolved === "dark" ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
      {resolved === "dark" ? "Light" : "Dark"}
    </button>
  );
}
