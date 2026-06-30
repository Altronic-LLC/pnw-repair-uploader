import { useMsal } from "@azure/msal-react";
import { LogIn } from "lucide-react";
import { graphScopes } from "./msalConfig";

/**
 * Full-screen sign-in for the kiosk. Uses a redirect (not popup) login —
 * popups are unreliable inside locked-down kiosk browsers, and a redirect
 * round-trips cleanly back to the registered base URL.
 */
export function SignInPage() {
  const { instance } = useMsal();

  function signIn() {
    void instance.loginRedirect({ scopes: graphScopes });
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <div className="text-3xl font-bold tracking-tight">PNW Repair Uploader</div>
        <p className="mt-2 text-sm text-fg-muted">
          Sign in with your Altronic account to upload repair photos.
        </p>
      </div>
      <button
        onClick={signIn}
        className="flex items-center gap-3 rounded-xl bg-accent px-8 py-4 text-lg font-semibold text-white shadow-lg active:scale-95"
      >
        <LogIn className="h-6 w-6" />
        Sign in with Microsoft
      </button>
    </div>
  );
}
