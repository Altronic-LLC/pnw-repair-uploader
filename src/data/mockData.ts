import type { LibraryFile, LibraryFolder } from "@/types/library";

// =============================================================================
// Mock library data, mirroring the shape Graph returns so the UI can be built
// and demoed before real Graph access exists.
//
// Source of the data, in priority order:
//   1. A LOCAL-ONLY snapshot of the real "Cooper Downstream" library
//      (`cooperDownstreamSnapshot.local.json`) if it's present. This file is
//      gitignored — it contains real customer/job/quote folder names and must
//      never be committed/pushed. Regenerate it with the Graph snapshot script
//      (see README).
//   2. Otherwise a small SYNTHETIC fallback below that reuses only the generic
//      top-level category names (safe to commit) with made-up children. This
//      is what clones and CI see, so the build never depends on the snapshot.
// =============================================================================

interface SnapFolder {
  parent: string;
  name: string;
  path: string;
  childCount: number;
}
interface SnapFile {
  folder: string;
  name: string;
  size: number;
  lastModified: string;
}
interface Snapshot {
  folders: SnapFolder[];
  files: SnapFile[];
}

// import.meta.glob returns {} when the file is absent — no build error on a
// fresh clone where the gitignored snapshot doesn't exist.
const localSnapModules = import.meta.glob<{ default: Snapshot }>(
  "./cooperDownstreamSnapshot.local.json",
  { eager: true },
);
const realSnapshot: Snapshot | undefined = Object.values(localSnapModules)[0]?.default;

// Synthetic fallback. Top-level names are the real (generic) library
// categories; everything under them is invented. Mirrors the real navigation
// shape so the kiosk rules demo without the local snapshot:
//   _OPEN JOBS → job folder → "Job" → Pictures (where photos go).
const J1 = "_OPEN JOBS/SAMPLE JOB 12345 - EXAMPLE CUSTOMER";
const J1_JOB = `${J1}/Job`;
const J1_PICS = `${J1_JOB}/Pictures`;
const fallbackSnapshot: Snapshot = {
  folders: [
    // Top level — only _OPEN JOBS is unlocked; the rest show locked.
    { parent: "", name: "_OPEN JOBS", path: "_OPEN JOBS", childCount: 2 },
    { parent: "", name: "CLOSED JOBS", path: "CLOSED JOBS", childCount: 0 },
    { parent: "", name: "QUOTES", path: "QUOTES", childCount: 0 },
    { parent: "", name: "COMPRESSOR INFORMATION", path: "COMPRESSOR INFORMATION", childCount: 0 },
    {
      parent: "",
      name: "BLANK INSPECTION REPORTS & DOCUMENTATION",
      path: "BLANK INSPECTION REPORTS & DOCUMENTATION",
      childCount: 0,
    },
    { parent: "", name: "CUSTOMER INFORMATION", path: "CUSTOMER INFORMATION", childCount: 0 },
    { parent: "", name: "DAILY UPDATES", path: "DAILY UPDATES", childCount: 0 },

    // Job folders under _OPEN JOBS.
    { parent: "_OPEN JOBS", name: "SAMPLE JOB 12345 - EXAMPLE CUSTOMER", path: J1, childCount: 3 },
    {
      parent: "_OPEN JOBS",
      name: "SAMPLE JOB 12346 - EXAMPLE CUSTOMER",
      path: "_OPEN JOBS/SAMPLE JOB 12346 - EXAMPLE CUSTOMER",
      childCount: 0,
    },

    // Inside a job: only "Job" is shown; Customer/Purchasing are hidden by rule.
    { parent: J1, name: "Customer", path: `${J1}/Customer`, childCount: 0 },
    { parent: J1, name: "Job", path: J1_JOB, childCount: 2 },
    { parent: J1, name: "Purchasing", path: `${J1}/Purchasing`, childCount: 0 },

    // Inside "Job": everything is shown.
    { parent: J1_JOB, name: "Pictures", path: J1_PICS, childCount: 2 },
    {
      parent: J1_JOB,
      name: "MTR & Vendor Reports",
      path: `${J1_JOB}/MTR & Vendor Reports`,
      childCount: 0,
    },
  ],
  files: [
    { folder: J1_PICS, name: "intake-front.jpg", size: 2_412_544, lastModified: "2026-06-22T14:02:00Z" },
    { folder: J1_PICS, name: "nameplate.jpg", size: 1_988_120, lastModified: "2026-06-22T14:03:10Z" },
  ],
};

const snap: Snapshot = realSnapshot ?? fallbackSnapshot;

/** True when the app is showing the real (local-only) library snapshot. */
export const USING_REAL_SNAPSHOT = realSnapshot != null;

export const mockFolders: LibraryFolder[] = snap.folders.map((f, i) => ({
  id: `f${i}`,
  name: f.name,
  path: f.path,
  childCount: f.childCount,
}));

export const mockFiles: Record<string, LibraryFile[]> = {};
snap.files.forEach((file, i) => {
  (mockFiles[file.folder] ??= []).push({
    id: `file-${i}`,
    name: file.name,
    size: file.size ?? 0,
    lastModified: file.lastModified ?? "",
  });
});

let mockCounter = 100_000;

/** Simulate a successful upload by appending to the mock file map. */
export function mockUpload(folderPath: string, fileName: string, size: number): LibraryFile {
  const file: LibraryFile = {
    id: `file-${mockCounter++}`,
    name: fileName,
    size,
    lastModified: "2026-06-24T00:00:00Z",
  };
  (mockFiles[folderPath] ??= []).push(file);
  return file;
}
