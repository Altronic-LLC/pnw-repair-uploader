import { useIsAuthenticated } from "@azure/msal-react";
import type { ReactNode } from "react";
import { USE_MOCK } from "@/api/config";
import { SignInPage } from "./SignInPage";

/**
 * Blocks the app until the user is signed in. In mock mode auth is bypassed
 * entirely so the UI renders against mock data.
 *
 * This is a UX gate, NOT a security boundary — the static bundle is readable
 * by anyone. Real enforcement is the SharePoint/Graph permission layer: the
 * service account can only see and write the folders it has been granted.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  if (USE_MOCK) return <>{children}</>;
  // eslint-disable-next-line react-hooks/rules-of-hooks -- USE_MOCK is a
  // build-time constant, so the hook order is stable within a given build.
  return <RealGate>{children}</RealGate>;
}

function RealGate({ children }: { children: ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  if (!isAuthenticated) return <SignInPage />;
  return <>{children}</>;
}
