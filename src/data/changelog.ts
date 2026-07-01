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
    version: "0.12.1",
    date: "2026-07-01",
    changes: [
      "Folder names now show in full — they wrap onto multiple lines instead of being cut off with “…”.",
    ],
  },
  {
    version: "0.12.0",
    date: "2026-07-01",
    changes: [
      "_OPEN JOBS now lists every open job, not just the first 10.",
      "Hid the template folders (e.g. _New Job Documents, _New Order Packet) from the job list — only real jobs show.",
    ],
  },
  {
    version: "0.11.1",
    date: "2026-06-30",
    changes: [
      "Error messages now wrap to fit the screen instead of forcing it to scroll sideways.",
    ],
  },
  {
    version: "0.11.0",
    date: "2026-06-24",
    changes: [
      "Only photos can be opened now — tap an image to view it full-screen in the app.",
      "Other files (PDFs, reports) still show in the folder so you can see what's there, but they no longer open. The app is focused on uploading images.",
      "Nothing leaves the app to SharePoint anymore — viewing stays entirely inside the kiosk.",
    ],
  },
  {
    version: "0.10.0",
    date: "2026-06-24",
    changes: [
      "Added a Sign in / Sign out button in the top-right of the header.",
      "Light mode now has clearer contrast — folders and cards stand out from the background.",
      "Pop-up dialogs now have a solid background in both light and dark mode.",
      "Pop-up dialogs now always appear in front of everything else on screen.",
    ],
  },
  {
    version: "0.9.0",
    date: "2026-06-24",
    changes: [
      "Added light and dark mode. A Light/Dark button in the footer switches between them.",
      "On first launch the app follows your device's light/dark setting; once you pick one, your choice is remembered.",
    ],
  },
  {
    version: "0.8.0",
    date: "2026-06-24",
    changes: [
      "You can now open photos: tap an image in a folder to view it full-screen inside the app, without leaving the kiosk.",
      "Non-image files (PDFs, reports) open in SharePoint in a new tab when available.",
    ],
  },
  {
    version: "0.7.0",
    date: "2026-06-24",
    changes: [
      "The full folder path now shows while navigating, as a breadcrumb — tap any part to jump back up to that level.",
      "Photos upload into whatever folder you currently have open; the destination folder is now shown above the Take photo button and in the naming dialog.",
    ],
  },
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
