// =============================================================================
// API configuration — single source of truth for "where does the data come
// from" decisions. Read from Vite env vars at build time.
//
// The USE_MOCK boundary: every Graph call branches on USE_MOCK so the UI can be
// built and demoed against mock data before the real SharePoint library / Entra
// app registration exists.
// =============================================================================

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

/** Composite SharePoint site ID: {hostname},{site-guid},{web-guid}. */
export const SP_SITE_ID = import.meta.env.VITE_SP_SITE_ID;

/**
 * Optional explicit drive (document library) ID. If unset, the app targets the
 * site's default drive via `/sites/{id}/drive`.
 */
export const SP_DRIVE_ID = import.meta.env.VITE_SP_DRIVE_ID;

/**
 * Optional folder path (relative to the drive root) the kiosk is scoped to —
 * e.g. "Repairs/Intake". The app opens here instead of the drive root. This is
 * a UX convenience ONLY; real folder access is enforced by SharePoint
 * item-level permissions on the service account, never by this string.
 */
export const SP_ROOT_FOLDER = (import.meta.env.VITE_SP_ROOT_FOLDER ?? "").replace(
  /^\/+|\/+$/g,
  "",
);

/** Fail loud if real mode is on but the Graph/Entra config is incomplete. */
export function assertGraphConfigured(): void {
  if (USE_MOCK) return;
  const missing: string[] = [];
  if (!import.meta.env.VITE_AZURE_CLIENT_ID) missing.push("VITE_AZURE_CLIENT_ID");
  if (!import.meta.env.VITE_AZURE_TENANT_ID) missing.push("VITE_AZURE_TENANT_ID");
  if (!SP_SITE_ID) missing.push("VITE_SP_SITE_ID");
  if (missing.length) {
    throw new Error(
      `Real mode is on (VITE_USE_MOCK=false) but these env vars are missing: ${missing.join(", ")}`,
    );
  }
}
