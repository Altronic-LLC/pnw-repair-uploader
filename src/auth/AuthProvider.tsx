import {
  PublicClientApplication,
  EventType,
  type AuthenticationResult,
} from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { useEffect, useState, type ReactNode } from "react";
import { buildMsalConfig } from "./msalConfig";
import { USE_MOCK } from "@/api/config";

let pca: PublicClientApplication | null = null;

/**
 * Lazily build the MSAL instance so mock mode never touches MSAL (no client
 * ID, no network, no cookies). Throws on bad config — caught by AuthProvider.
 */
function getPca(): PublicClientApplication {
  if (!pca) {
    pca = new PublicClientApplication(buildMsalConfig());
    pca.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const result = event.payload as AuthenticationResult;
        if (result.account && pca) pca.setActiveAccount(result.account);
      }
    });
  }
  return pca;
}

type InitState =
  | { kind: "pending" }
  | { kind: "ready" }
  | { kind: "error"; error: Error };

/**
 * In mock mode this is a transparent passthrough. In real mode it boots MSAL,
 * restores any cached account, and wraps the tree in MsalProvider. If init
 * fails we render a retryable error instead of a perpetual loading screen.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InitState>(
    USE_MOCK ? { kind: "ready" } : { kind: "pending" },
  );

  useEffect(() => {
    if (USE_MOCK) return;
    let cancelled = false;

    (async () => {
      try {
        const instance = getPca();
        await instance.initialize();
        // handleRedirectPromise resolves the auth response if we returned from
        // a redirect sign-in (we use redirect, not popup, for kiosk reliability).
        await instance.handleRedirectPromise();
        if (cancelled) return;
        const accounts = instance.getAllAccounts();
        if (accounts.length > 0 && !instance.getActiveAccount()) {
          instance.setActiveAccount(accounts[0]);
        }
        setState({ kind: "ready" });
      } catch (err) {
        if (cancelled) return;
        setState({
          kind: "error",
          error: err instanceof Error ? err : new Error(String(err)),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (USE_MOCK) return <>{children}</>;

  if (state.kind === "pending") {
    return (
      <div className="flex h-full items-center justify-center text-neutral-400">
        Initialising sign-in…
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-lg font-semibold">Sign-in failed to start</h1>
          <p className="mt-2 text-sm text-neutral-400">{state.error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return <MsalProvider instance={getPca()}>{children}</MsalProvider>;
}

/** Access the MSAL instance from non-React modules (the Graph fetcher). */
export function getMsalInstance(): PublicClientApplication | null {
  if (USE_MOCK) return null;
  try {
    return getPca();
  } catch {
    return null;
  }
}
