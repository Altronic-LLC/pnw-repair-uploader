// =============================================================================
// Navigation rules for the kiosk. The library is large and shared, but this
// device should only ever reach the photo folders under open jobs. These pure
// functions encode that policy so it's testable and lives in one place.
//
// NOTE: this is UX gating, not security. Real access is still enforced by the
// service account's SharePoint permissions. This just shapes the navigation.
// =============================================================================

export const OPEN_JOBS_FOLDER = "_OPEN JOBS";
// The per-job photo folder. Matched case-insensitively — in the real library
// it's named "Job", but tolerate "JOB"/"job" too.
export const JOB_FOLDER = "JOB";

function segments(path: string): string[] {
  return path ? path.split("/") : [];
}

function isJobFolder(name: string): boolean {
  return name.toUpperCase() === JOB_FOLDER;
}

/**
 * Template/system folders inside _OPEN JOBS use a leading underscore to sort
 * themselves to the top (e.g. "_New Job Documents", "_New Order Packet").
 * They aren't actual jobs, so they're hidden from the job list.
 */
function isTemplateFolder(name: string): boolean {
  return name.startsWith("_");
}

/**
 * Whether `path` is inside a job's "Job" folder (or deeper). Because a job
 * folder only ever exposes its "Job" child, any path three or more levels
 * under _OPEN JOBS is inside "Job". This is where files show and uploads are
 * allowed.
 */
export function isInsideJob(path: string): boolean {
  const s = segments(path);
  return s[0] === OPEN_JOBS_FOLDER && s.length >= 3;
}

/**
 * Filter which folders to display when viewing `parentPath`:
 *  - Root: every top-level folder (the non-_OPEN JOBS ones are shown but
 *    locked — see isFolderLocked — not hidden).
 *  - Inside _OPEN JOBS: every job folder (all of them), minus the "_"-prefixed
 *    template folders.
 *  - Inside a job folder (one level under _OPEN JOBS): ONLY the "JOB" folder.
 *  - Inside "JOB" and deeper: every folder.
 *  - Anywhere outside _OPEN JOBS (not normally reachable): nothing.
 */
export function visibleFolders<T extends { name: string }>(
  parentPath: string,
  folders: T[],
): T[] {
  const s = segments(parentPath);
  if (s.length === 0) return folders; // root — locked items handled separately
  if (s[0] !== OPEN_JOBS_FOLDER) return []; // outside open jobs
  if (s.length === 1) return folders.filter((f) => !isTemplateFolder(f.name)); // _OPEN JOBS → all jobs, minus templates
  if (s.length === 2) return folders.filter((f) => isJobFolder(f.name)); // job → JOB only
  return folders; // inside JOB or deeper → all
}

/**
 * Whether a folder shown at the ROOT is locked (greyed, not clickable). Only
 * _OPEN JOBS is accessible at the root. Below the root nothing is locked —
 * visibility is controlled by visibleFolders instead.
 */
export function isFolderLocked(parentPath: string, folderName: string): boolean {
  if (segments(parentPath).length !== 0) return false;
  return folderName !== OPEN_JOBS_FOLDER;
}

/**
 * Whether uploading (the camera button) is allowed at `path` — only once
 * inside a job's "Job" folder or deeper.
 */
export function canUploadHere(path: string): boolean {
  return isInsideJob(path);
}

/**
 * Whether the file list shows at `path` — only inside "Job" and deeper. At the
 * job-folder level we show only the "Job" folder and no files.
 */
export function showFilesHere(path: string): boolean {
  return isInsideJob(path);
}
