import { useMsal } from "@azure/msal-react";
import { LogOut } from "lucide-react";
import { USE_MOCK } from "@/api/config";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/** Slim top bar: app name + signed-in account + sign-out. */
export function Header() {
  const user = useCurrentUser();
  return (
    <header className="flex items-center justify-between border-b border-white/5 px-4 py-3">
      <div>
        <div className="text-sm font-bold tracking-tight">PNW Repair Uploader</div>
        <div className="text-xs text-neutral-500">{user.name}</div>
      </div>
      {!USE_MOCK && <SignOutButton />}
    </header>
  );
}

function SignOutButton() {
  const { instance } = useMsal();
  return (
    <button
      onClick={() => void instance.logoutRedirect()}
      aria-label="Sign out"
      className="rounded-lg p-2 text-neutral-400 active:bg-white/5"
    >
      <LogOut className="h-5 w-5" />
    </button>
  );
}
