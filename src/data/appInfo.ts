// =============================================================================
// Developer "About / Info" content — drives the Info modal in the footer.
//
// This is the in-app README a developer sees when they open the Info button.
// Keep it current: when you change the architecture (add/remove a module,
// route, env var, or change the flow), update the relevant array here in the
// SAME change. See CLAUDE.md "App Info protocol".
// =============================================================================

/** GitHub repo URL — set once the repo exists; null shows "not yet created". */
export const REPO_URL: string | null = null;

export const MAINTAINER_EMAIL = "ray.white@altronic-llc.com";

export const APP_DESCRIPTION = [
  "PNW Repair Uploader is a single-purpose kiosk web app for a locked-down device at PNW Repair.",
  "A technician signs in once with a Microsoft (Entra) service account, picks a folder in the SharePoint “Cooper Downstream” document library, launches the device camera from inside the app, names the photo, and uploads it straight into that folder via Microsoft Graph.",
  "It is a static single-page app (no backend) hosted on GitHub Pages, and a sibling of the ARC platform — it reuses ARC's patterns but shares no code.",
];

export const HOW_IT_WORKS = [
  "Sign in — Entra ID SSO (Authorization Code + PKCE, a public client with no secret). On a kiosk this happens once; the token is cached so the device stays signed in.",
  "Navigate to a job — the kiosk is locked to the photo workflow: at the top level only _OPEN JOBS is open (other folders show greyed/locked); inside _OPEN JOBS the top 10 job folders are shown; inside a job only its “Job” folder is shown (no files at that level); inside “Job” all files and folders are shown. Files and the Take photo button only appear inside “Job” or below.",
  "Capture — the in-app camera (getUserMedia live preview → JPEG) takes a photo, with a native file-picker fallback.",
  "Name & validate — a dialog names the file and blocks duplicate names (case-insensitive) and illegal characters before upload.",
  "Upload — small files use a single PUT; large photos use a resumable chunked upload session with a progress bar. Failures show a clear error + Retry.",
];

export const SECURITY_MODEL = [
  "The static bundle is public and readable — client-side gating (which folders show, disabled buttons) is UX only, never a security boundary.",
  "Real enforcement is the SharePoint/Graph permission layer: the service account is granted access to only specific folders. With delegated auth, what the kiosk can touch = app grant ∩ the signed-in account's own permissions.",
  "Auth is a public client (PKCE) — there is no client secret anywhere. A static site can't hold one; app-only access would require a backend.",
];

export const TECH_STACK = [
  "React 18 + TypeScript",
  "Vite (build + dev server)",
  "MSAL (@azure/msal-browser / -react) for Entra SSO",
  "Microsoft Graph (SharePoint document library)",
  "TanStack React Query (data fetching/caching)",
  "Tailwind CSS",
  "Vitest + React Testing Library (unit tests)",
];

export interface StructureItem {
  path: string;
  desc: string;
}

export const PROJECT_STRUCTURE: StructureItem[] = [
  { path: "src/main.tsx", desc: "Entry — QueryClient + Auth providers, mounts the app" },
  { path: "src/App.tsx", desc: "One-screen shell: Header + UploadView + Footer" },
  { path: "src/api/config.ts", desc: "USE_MOCK boundary + SharePoint/Entra env config" },
  { path: "src/api/graph.ts", desc: "Authenticated Graph fetch (JSON + raw binary upload)" },
  { path: "src/api/library.ts", desc: "Folder list / file list / upload — mock + real branches" },
  { path: "src/auth/", desc: "MSAL config, provider, sign-in gate, sign-in page" },
  { path: "src/hooks/useLibrary.ts", desc: "useFolders / useFiles / useUpload (React Query)" },
  { path: "src/components/CameraCapture.tsx", desc: "getUserMedia camera capture + file fallback" },
  { path: "src/components/NameImageModal.tsx", desc: "Name-the-photo dialog with dedupe + validation" },
  { path: "src/components/UploadQueue.tsx", desc: "Per-file upload progress / status / retry" },
  { path: "src/components/FolderPicker.tsx", desc: "Browse permitted folders (responsive grid)" },
  { path: "src/views/UploadView.tsx", desc: "The whole flow: navigate → capture → name → upload" },
  { path: "src/data/mockData.ts", desc: "Mock library (real local snapshot if present, else synthetic)" },
  { path: "src/data/changelog.ts", desc: "Version history (drives footer version + history modal)" },
  { path: "src/data/appInfo.ts", desc: "This Info content" },
  { path: "src/types/library.ts", desc: "LibraryFolder / LibraryFile / PendingUpload types" },
];

export interface EnvVar {
  name: string;
  desc: string;
}

export const ENV_VARS: EnvVar[] = [
  { name: "VITE_USE_MOCK", desc: "“false” = talk to real Graph; anything else = mock data" },
  { name: "VITE_AZURE_TENANT_ID", desc: "Entra tenant ID" },
  { name: "VITE_AZURE_CLIENT_ID", desc: "Entra SPA app registration client ID (needed for live mode)" },
  { name: "VITE_SP_SITE_ID", desc: "SharePoint site ID (PNW Repair Shop)" },
  { name: "VITE_SP_DRIVE_ID", desc: "Target library drive ID (Cooper Downstream)" },
  { name: "VITE_SP_ROOT_FOLDER", desc: "Optional folder path to scope/start in (blank = library root)" },
  { name: "VITE_BASE_PATH", desc: "GitHub Pages base path, e.g. /<repo-name>/ (set by CI)" },
];

export const SHAREPOINT = {
  site: "PNW Repair Shop",
  siteUrl: "https://coopermachineryservices.sharepoint.com/sites/PNWRepairShop",
  library: "Cooper Downstream",
};
