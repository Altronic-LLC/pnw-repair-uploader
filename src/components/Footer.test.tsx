import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Footer } from "./Footer";
import { CHANGELOG, CURRENT_VERSION } from "@/data/changelog";

describe("changelog data", () => {
  it("derives CURRENT_VERSION from the newest entry", () => {
    expect(CURRENT_VERSION).toBe(CHANGELOG[0]!.version);
  });

  it("has unique version numbers", () => {
    const versions = CHANGELOG.map((e) => e.version);
    expect(new Set(versions).size).toBe(versions.length);
  });

  it("every entry has a date and at least one change", () => {
    for (const e of CHANGELOG) {
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.changes.length).toBeGreaterThan(0);
    }
  });
});

describe("Footer", () => {
  beforeEach(() => localStorage.clear());

  it("shows the current version", () => {
    render(<Footer />);
    expect(screen.getByRole("button", { name: new RegExp(`v${CURRENT_VERSION}`) })).toBeInTheDocument();
  });

  it("opens the history modal listing every version", async () => {
    render(<Footer />);
    await userEvent.click(screen.getByRole("button", { name: new RegExp(`v${CURRENT_VERSION}`) }));
    expect(screen.getByRole("heading", { name: /version history/i })).toBeInTheDocument();
    for (const e of CHANGELOG) {
      // The current version also appears in the footer button, so allow >= 1.
      expect(screen.getAllByText(`v${e.version}`).length).toBeGreaterThan(0);
    }
  });

  it("clears the NEW badge once history is opened", async () => {
    const { rerender } = render(<Footer />);
    expect(screen.getByText(/new/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: new RegExp(`v${CURRENT_VERSION}`) }));
    rerender(<Footer />);
    expect(screen.queryByText(/new/i)).not.toBeInTheDocument();
  });
});
