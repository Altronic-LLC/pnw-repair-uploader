import { describe, expect, it } from "vitest";
import { isImageFile } from "./fileTypes";

describe("isImageFile", () => {
  it("recognises common image extensions (case-insensitive)", () => {
    for (const n of ["a.jpg", "b.JPG", "c.jpeg", "d.png", "e.HEIC", "f.webp", "g.tiff"]) {
      expect(isImageFile(n)).toBe(true);
    }
  });

  it("rejects non-images and extension-less names", () => {
    for (const n of ["report.pdf", "notes.docx", "data.csv", "noext", "archive.zip"]) {
      expect(isImageFile(n)).toBe(false);
    }
  });
});
