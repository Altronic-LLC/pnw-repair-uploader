import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applyTheme,
  getStoredPreference,
  resolveTheme,
  storePreference,
  systemTheme,
  THEME_STORAGE_KEY,
} from "./theme";

/** Install a matchMedia stub that reports the given OS preference. */
function mockSystem(prefersDark: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("dark") ? prefersDark : !prefersDark,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
  document.documentElement.classList.remove("dark");
});

describe("stored preference", () => {
  it("defaults to system when nothing is stored", () => {
    expect(getStoredPreference()).toBe("system");
  });

  it("round-trips an explicit light/dark choice", () => {
    storePreference("dark");
    expect(getStoredPreference()).toBe("dark");
    storePreference("light");
    expect(getStoredPreference()).toBe("light");
  });

  it("storing system clears the saved value", () => {
    storePreference("dark");
    storePreference("system");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(getStoredPreference()).toBe("system");
  });

  it("treats a garbage value as system", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "chartreuse");
    expect(getStoredPreference()).toBe("system");
  });
});

describe("resolveTheme", () => {
  it("returns the explicit preference verbatim", () => {
    expect(resolveTheme("light")).toBe("light");
    expect(resolveTheme("dark")).toBe("dark");
  });

  it("follows the OS when on system", () => {
    mockSystem(true);
    expect(systemTheme()).toBe("dark");
    expect(resolveTheme("system")).toBe("dark");
    mockSystem(false);
    expect(resolveTheme("system")).toBe("light");
  });
});

describe("applyTheme", () => {
  it("adds the dark class only for dark", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    applyTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
