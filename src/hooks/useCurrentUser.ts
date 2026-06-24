import { useMsal } from "@azure/msal-react";
import { USE_MOCK } from "@/api/config";

export interface CurrentUser {
  name: string;
  username: string;
}

/** The signed-in account's display name + UPN. Returns a stub in mock mode. */
export function useCurrentUser(): CurrentUser {
  if (USE_MOCK) {
    return { name: "Service Account (mock)", username: "svc-pnw@altronic-llc.com" };
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks -- USE_MOCK is a
  // build-time constant; hook order is stable within a build.
  const { instance } = useMsal();
  const account = instance.getActiveAccount();
  return {
    name: account?.name ?? account?.username ?? "Signed in",
    username: account?.username ?? "",
  };
}
