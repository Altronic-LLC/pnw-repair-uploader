/** A folder the kiosk can navigate into. */
export interface LibraryFolder {
  id: string;
  name: string;
  /** Path relative to the drive root, e.g. "Repairs/Intake". */
  path: string;
  childCount: number;
}

/** A file already present in a folder (shown so the user can confirm uploads). */
export interface LibraryFile {
  id: string;
  name: string;
  size: number;
  /** ISO timestamp. */
  lastModified: string;
  /** Browser-openable URL (Graph webUrl) — may be undefined in mock mode. */
  webUrl?: string;
}

/** A file selected/captured locally and queued for upload. */
export interface PendingUpload {
  /** Client-side id (not from Graph). */
  localId: string;
  fileName: string;
  /** Drive-root-relative folder this upload targets (for dedupe + retry). */
  folderPath: string;
  blob: Blob;
  /** Object URL for thumbnail preview; revoke when removed. */
  previewUrl: string;
  status: "queued" | "uploading" | "done" | "error";
  /** 0–100 while uploading. */
  progress: number;
  error?: string;
}
