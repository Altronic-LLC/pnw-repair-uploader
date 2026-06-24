import { describe, expect, it, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NameImageModal } from "./NameImageModal";

beforeAll(() => {
  // jsdom doesn't implement object URLs.
  globalThis.URL.createObjectURL = vi.fn(() => "blob:preview");
  globalThis.URL.revokeObjectURL = vi.fn();
});

function setup(existingNames: string[] = []) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <NameImageModal
      suggestedName="photo-20260624.jpg"
      previewUrl="blob:preview"
      existingNames={existingNames}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  );
  return { onConfirm, onCancel };
}

describe("NameImageModal", () => {
  it("confirms with the base name plus the original extension", async () => {
    const { onConfirm } = setup([]);
    const input = screen.getByLabelText(/file name/i);
    await userEvent.clear(input);
    await userEvent.type(input, "unit-4412-front");
    await userEvent.click(screen.getByRole("button", { name: /upload/i }));
    expect(onConfirm).toHaveBeenCalledWith("unit-4412-front.jpg");
  });

  it("blocks a duplicate name (case-insensitive) and disables upload", async () => {
    setup(["UNIT-4412-FRONT.JPG"]);
    const input = screen.getByLabelText(/file name/i);
    await userEvent.clear(input);
    await userEvent.type(input, "unit-4412-front");
    expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /upload/i })).toBeDisabled();
  });

  it("rejects illegal filename characters", async () => {
    setup([]);
    const input = screen.getByLabelText(/file name/i);
    await userEvent.clear(input);
    await userEvent.type(input, "bad/name");
    expect(screen.getByText(/can.t contain/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /upload/i })).toBeDisabled();
  });

  it("requires a non-empty name", async () => {
    setup([]);
    const input = screen.getByLabelText(/file name/i);
    await userEvent.clear(input);
    expect(screen.getByText(/enter a name/i)).toBeInTheDocument();
  });
});
