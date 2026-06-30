import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { LogIn, LogOut } from "lucide-react";
import { USE_MOCK } from "@/api/config";
import { graphScopes } from "@/auth/msalConfig";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/** Slim top bar: app name + signed-in account + sign-in/out control (top right). */
export function Header() {
  const user = useCurrentUser();
  return (
    <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-bold tracking-tight">PNW Repair Uploader</div>
        <div className="truncate text-xs text-fg-subtle">{user.name}</div>
      </div>
      <AccountControl />
    </header>
  );
}

/** Bordered button shared by every account state. */
const BTN_CLASS =
  "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:border-fg-faint hover:text-fg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:text-fg-muted";

function AccountControl() {
  // Mock mode never mounts MSAL, so we can't (and needn't) call its hooks.
  // Show the control disabled so the kiosk layout matches production.
  if (USE_MOCK) {
    return (
      <button type="button" disabled title="Sign-out is unavailable in demo mode" className={BTN_CLASS}>
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    );
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks -- USE_MOCK is a
  // build-time constant; hook order is stable within a given build.
  return <RealAccountControl />;
}

function RealAccountControl() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => void instance.logoutRedirect()}
        className={BTN_CLASS}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => void instance.loginRedirect({ scopes: graphScopes })}
      className={BTN_CLASS}
    >
      <LogIn className="h-4 w-4" />
      Sign in
    </button>
  );
}
