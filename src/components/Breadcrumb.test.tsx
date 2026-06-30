import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Breadcrumb, buildCrumbs } from "./Breadcrumb";

describe("buildCrumbs", () => {
  it("returns just the root at the top level", () => {
    expect(buildCrumbs("", "Cooper Downstream")).toEqual([
      { label: "Cooper Downstream", path: "" },
    ]);
  });

  it("builds cumulative paths for each segment", () => {
    expect(buildCrumbs("_OPEN JOBS/Air Liquide/Job", "Cooper Downstream")).toEqual([
      { label: "Cooper Downstream", path: "" },
      { label: "_OPEN JOBS", path: "_OPEN JOBS" },
      { label: "Air Liquide", path: "_OPEN JOBS/Air Liquide" },
      { label: "Job", path: "_OPEN JOBS/Air Liquide/Job" },
    ]);
  });
});

describe("Breadcrumb", () => {
  it("navigates to an ancestor crumb's path when clicked", async () => {
    const onNavigate = vi.fn();
    render(
      <Breadcrumb
        path="_OPEN JOBS/Air Liquide/Job"
        rootLabel="Cooper Downstream"
        onNavigate={onNavigate}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "_OPEN JOBS" }));
    expect(onNavigate).toHaveBeenCalledWith("_OPEN JOBS");
  });

  it("renders the current folder as non-clickable", () => {
    render(
      <Breadcrumb path="_OPEN JOBS/Air Liquide/Job" rootLabel="Cooper Downstream" onNavigate={vi.fn()} />,
    );
    // "Job" is current → not a button.
    expect(screen.queryByRole("button", { name: "Job" })).not.toBeInTheDocument();
    expect(screen.getByText("Job")).toBeInTheDocument();
  });
});
