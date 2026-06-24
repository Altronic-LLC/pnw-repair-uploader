// =============================================================================
// Application changelog — drives the version number + history modal in the
// footer. This is the SINGLE source of truth for the app version.
//
// HOW TO UPDATE (do this on every user-visible change):
//   1. Add a new entry to the TOP of CHANGELOG (newest first).
//   2. Bump the version with semver-lite:
//        PATCH (0.1.0 → 0.1.1): bug fix, copy change, small UI polish
//        MINOR (0.1.x → 0.2.0): new feature (new view, new flow, etc.)
//        MAJOR (0.x   → 1.0.0): rework / breaking change
//   3. Use today's date (YYYY-MM-DD) and one-line, user-POV bullets.
//
// CURRENT_VERSION is derived from the top entry, so the footer updates
// automatically — you only edit this array.
// =============================================================================

export interface ChangelogEntry {
  version: string;
  date: string; // YYYY-MM-DD
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "0.6.0",
    date: "2026-06-24",
    changes: [
      "_OPEN JOBS now shows only the top 10 job folders.",
      "Inside a job, only its “Job” folder is shown — no files are listed at that level.",
      "Files and the Take photo button now appear once you open the “Job” folder (or a folder inside it).",
    ],
  },
  {
    version: "0.5.0",
    date: "2026-06-24",
    changes: [
      "Focused the kiosk on the photo workflow: at the top level only the _OPEN JOBS folder is open — the other folders are shown but greyed out and locked.",
      "Inside a job, only its “Job” folder is shown; other job folders are hidden. Everything under “Job” (Pictures, etc.) is shown normally.",
      "The Take photo button now appears only once you’re inside a job’s folders, not at the top levels.",
    ],
  },
  {
    version: "0.4.0",
    date: "2026-06-24",
    changes: [
      "Added an Info button to the footer with a developer overview: what the app is, how it works, the security model, repository location, SharePoint target, tech stack, project structure, and environment variables.",
    ],
  },
  {
    version: "0.3.0",
    date: "2026-06-24",
    changes: [
      "Added a version number to the footer; click it to see the full version history.",
    ],
  },
  {
    version: "0.2.0",
    date: "2026-06-24",
    changes: [
      "Naming a photo before upload: after you take a picture, a dialog lets you name the file. It blocks names that already exist in the folder and names with illegal characters.",
      "Failed uploads now show a clear message and a Retry button.",
      "The screen scales to phones, tablets (portrait and landscape), and desktop — folders and files lay out in responsive grids.",
      "You can now upload at any level, including the top of the library.",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-06-24",
    changes: [
      "First version: sign in with your Microsoft account, browse the Cooper Downstream library folders, take a photo with the device camera (or pick a file), and upload it into the chosen folder.",
    ],
  },
];

/** The running app version — always the newest changelog entry. */
export const CURRENT_VERSION = CHANGELOG[0]!.version;
