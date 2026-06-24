import type { Configuration } from "@azure/msal-browser";
import { USE_MOCK } from "@/api/config";

const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;
const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;

/**
 * Build the MSAL configuration. Throws in real mode if required env vars are
 * missing — fail loud rather than booting into a half-broken state. In mock
 * mode AuthProvider never calls this, so the throw is harmless.
 *
 * Auth flow: SPA with Authorization Code + PKCE (a public client — no secret).
 * This is the only Entra flow a static GitHub Pages app can use safely. A real
 * Entra user signs in interactively; on a locked kiosk this happens once and
 * the refresh token is cached so the device stays signed in.
 */
export function buildMsalConfig(): Configuration {
  if (!USE_MOCK) {
    if (!clientId) throw new Error("VITE_AZURE_CLIENT_ID is required in real mode.");
    if (!tenantId) throw new Error("VITE_AZURE_TENANT_ID is required in real mode.");
  }

  // Pin the redirect URI to the app's BASE URL (origin + Vite base path), NOT
  // the current pathname — the Entra app registration only has the base URL
  // registered as a redirect URI. e.g. https://<org>.github.io/pnw-repair-uploader/
  const baseUri =
    typeof window !== "undefined"
      ? `${window.location.origin}${import.meta.env.BASE_URL ?? "/"}`
      : "/";

  return {
    auth: {
      clientId: clientId ?? "demo-mode-no-client-id",
      authority: `https://login.microsoftonline.com/${tenantId ?? "common"}`,
      redirectUri: baseUri,
      postLogoutRedirectUri: baseUri,
      navigateToLoginRequestUrl: true,
    },
    cache: {
      // localStorage so the kiosk stays signed in across restarts. Entra still
      // enforces its own refresh-token lifetime (~90 days default).
      cacheLocation: "localStorage",
      storeAuthStateInCookie: false,
    },
  };
}

/**
 * Delegated Graph scopes the app requests. Must match what's consented on the
 * Entra app registration.
 *
 * - User.Read       — show the signed-in account's name/email.
 * - Sites.Selected  — narrowest SharePoint scope. A SharePoint admin grants the
 *                     app explicit READ+WRITE on just the target site via a
 *                     one-time POST to /sites/{id}/permissions. Folder-level
 *                     restriction for the service account is then applied with
 *                     SharePoint item-level permissions on the folders.
 *
 * If you find Sites.Selected too restrictive to set up, the broader alternative
 * is Files.ReadWrite.All — but prefer Sites.Selected for least privilege.
 */
export const graphScopes = ["User.Read", "Sites.Selected"];
