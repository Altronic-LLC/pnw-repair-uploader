import { describe, expect, it } from "vitest";
import { canUploadHere, isFolderLocked, showFilesHere, visibleFolders } from "./folderRules";

const f = (name: string) => ({ name });

describe("visibleFolders", () => {
  it("shows every top-level folder at the root", () => {
    const folders = [f("_OPEN JOBS"), f("CLOSED JOBS"), f("QUOTES")];
    expect(visibleFolders("", folders)).toHaveLength(3);
  });

  it("shows every job sub-folder inside _OPEN JOBS (no cap)", () => {
    const folders = Array.from({ length: 25 }, (_, i) => f(`JOB ${i}`));
    const visible = visibleFolders("_OPEN JOBS", folders);
    expect(visible).toHaveLength(25);
  });

  it("hides the '_'-prefixed template folders inside _OPEN JOBS", () => {
    const folders = [
      f("_New Job Documents"),
      f("_New Order Packet"),
      f("Air Liquide (40043741)"),
      f("Bayer (40051222)"),
    ];
    const visible = visibleFolders("_OPEN JOBS", folders);
    expect(visible.map((x) => x.name)).toEqual([
      "Air Liquide (40043741)",
      "Bayer (40051222)",
    ]);
  });

  it("shows ONLY the Job folder inside a job sub-folder (case-insensitive)", () => {
    const folders = [f("Customer"), f("Job"), f("Purchasing")];
    const visible = visibleFolders("_OPEN JOBS/Air Liquide (40043741)", folders);
    expect(visible.map((x) => x.name)).toEqual(["Job"]);
  });

  it("hides everything when a job has no Job folder", () => {
    const folders = [f("Inspection Report Templates"), f("Job Packets")];
    expect(visibleFolders("_OPEN JOBS/_New Job Documentation", folders)).toHaveLength(0);
  });

  it("shows every folder inside JOB and deeper", () => {
    const folders = [f("Photos"), f("Reports"), f("Misc")];
    expect(visibleFolders("_OPEN JOBS/JOB 12345/JOB", folders)).toHaveLength(3);
    expect(visibleFolders("_OPEN JOBS/JOB 12345/JOB/Photos", folders)).toHaveLength(3);
  });

  it("shows nothing outside _OPEN JOBS", () => {
    expect(visibleFolders("QUOTES", [f("anything")])).toHaveLength(0);
  });
});

describe("isFolderLocked", () => {
  it("locks every root folder except _OPEN JOBS", () => {
    expect(isFolderLocked("", "_OPEN JOBS")).toBe(false);
    expect(isFolderLocked("", "QUOTES")).toBe(true);
    expect(isFolderLocked("", "CLOSED JOBS")).toBe(true);
  });

  it("locks nothing below the root", () => {
    expect(isFolderLocked("_OPEN JOBS", "anything")).toBe(false);
    expect(isFolderLocked("_OPEN JOBS/JOB 12345", "JOB")).toBe(false);
  });
});

describe("canUploadHere / showFilesHere (inside the Job folder)", () => {
  it("are false at the root, _OPEN JOBS, and the bare job folder", () => {
    for (const p of ["", "_OPEN JOBS", "_OPEN JOBS/Air Liquide (40043741)"]) {
      expect(canUploadHere(p)).toBe(false);
      expect(showFilesHere(p)).toBe(false);
    }
  });

  it("are true inside the Job folder and deeper", () => {
    for (const p of [
      "_OPEN JOBS/Air Liquide (40043741)/Job",
      "_OPEN JOBS/Air Liquide (40043741)/Job/Pictures",
    ]) {
      expect(canUploadHere(p)).toBe(true);
      expect(showFilesHere(p)).toBe(true);
    }
  });

  it("are false anywhere outside _OPEN JOBS", () => {
    expect(canUploadHere("QUOTES/whatever/deep")).toBe(false);
    expect(showFilesHere("CLOSED JOBS/a/b")).toBe(false);
  });
});
