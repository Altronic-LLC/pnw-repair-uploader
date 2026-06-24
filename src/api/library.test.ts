import { describe, expect, it } from "vitest";
import { listFiles, listFolders, uploadFile } from "./library";

// These exercise the mock branch (USE_MOCK defaults to true in tests because
// VITE_USE_MOCK is unset). Written to be dataset-agnostic so they pass with
// either the real local snapshot or the synthetic fallback in mockData.
describe("library api (mock mode)", () => {
  it("lists top-level folders with the expected shape", async () => {
    const folders = await listFolders("");
    expect(folders.length).toBeGreaterThan(0);
    expect(folders[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      path: expect.any(String),
      childCount: expect.any(Number),
    });
  });

  it("returns subfolders of a parent path", async () => {
    const top = await listFolders("");
    // Find a top-level folder that actually has subfolders.
    for (const f of top) {
      const subs = await listFolders(f.path);
      if (subs.length) {
        expect(subs.every((s) => s.path.startsWith(`${f.path}/`))).toBe(true);
        return;
      }
    }
    // No nested folders in this dataset — that's still valid.
    expect(top.length).toBeGreaterThan(0);
  });

  it("uploads a file into a folder and reports progress to 100", async () => {
    const top = await listFolders("");
    const target = top[0]!.path;
    const before = (await listFiles(target)).length;
    const progress: number[] = [];
    const blob = new Blob(["x"], { type: "image/jpeg" });

    const result = await uploadFile(target, "unit-test-upload.jpg", blob, (p) =>
      progress.push(p),
    );

    expect(result.name).toBe("unit-test-upload.jpg");
    expect(progress.at(-1)).toBe(100);
    expect((await listFiles(target)).length).toBe(before + 1);
  });
});
