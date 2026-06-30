import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "./ThemeToggle";
import { THEME_STORAGE_KEY } from "@/lib/theme";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  // Report a dark OS preference so the default (system) resolves predictably.
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("dark"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});

afterEach(() => vi.unstubAllGlobals());

describe("ThemeToggle", () => {
  it("starts from the OS preference (dark) and offers to switch to light", () => {
    render(<ThemeToggle />);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(screen.getByRole("button", { name: /switch to light mode/i })).toBeInTheDocument();
  });

  it("toggles to light, removes the dark class, and persists the choice", async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("button", { name: /switch to light mode/i }));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    // The button now offers the reverse direction.
    expect(screen.getByRole("button", { name: /switch to dark mode/i })).toBeInTheDocument();
  });
});
