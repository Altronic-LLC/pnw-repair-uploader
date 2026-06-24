import {
  BrowserAuthError,
  InteractionRequiredAuthError,
} from "@azure/msal-browser";
import { getMsalInstance } from "@/auth/AuthProvider";
import { graphScopes } from "@/auth/msalConfig";
import { GRAPH_BASE, USE_MOCK } from "./config";

export class GraphError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: string,
    public url: string,
  ) {
    super(`Graph ${status} ${statusText} at ${url}: ${body}`);
    this.name = "GraphError";
  }
}

/** Thrown when the session expired or interactive sign-in was cancelled. */
export class SessionExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionExpiredError";
  }
}

/** Acquire a delegated Graph access token, falling back to interactive redirect. */
async function getAccessToken(): Promise<string> {
  const instance = getMsalInstance();
  if (!instance) throw new Error("MSAL instance not initialised");

  const account = instance.getActiveAccount();
  if (!account) throw new SessionExpiredError("Not signed in");

  try {
    const result = await instance.acquireTokenSilent({ scopes: graphScopes, account });
    return result.accessToken;
  } catch (err) {
    if (err instanceof InteractionRequiredAuthError) {
      // Silent refresh failed — kick off a redirect re-auth. This navigates
      // away; the promise won't resolve, so we surface a session-expired.
      try {
        await instance.acquireTokenRedirect({ scopes: graphScopes });
      } catch (redirectErr) {
        if (redirectErr instanceof BrowserAuthError) {
          throw new SessionExpiredError(redirectErr.message);
        }
        throw redirectErr;
      }
      throw new SessionExpiredError("Re-authentication required");
    }
    throw err;
  }
}

/**
 * Make an authenticated JSON request to Microsoft Graph. Used for metadata
 * (resolving the drive, listing folders/children). Binary uploads go through
 * the dedicated helpers in `library.ts` which need raw fetch control.
 */
export async function graphFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (USE_MOCK) {
    throw new Error("graphFetch called while USE_MOCK is true — check the call site.");
  }
  const accessToken = await getAccessToken();
  const url = path.startsWith("http") ? path : `${GRAPH_BASE}${path}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 401) throw new SessionExpiredError(`Graph 401: ${body}`);
    throw new GraphError(response.status, response.statusText, body, url);
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Authenticated raw fetch (no JSON Content-Type) for binary upload bodies. */
export async function graphFetchRaw(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  if (USE_MOCK) {
    throw new Error("graphFetchRaw called while USE_MOCK is true.");
  }
  const accessToken = await getAccessToken();
  const url = path.startsWith("http") ? path : `${GRAPH_BASE}${path}`;
  return fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, ...(init.headers ?? {}) },
  });
}

/** Walk @odata.nextLink pages until all items are collected. */
export async function graphFetchAll<T>(path: string): Promise<T[]> {
  let url: string | undefined = path;
  const all: T[] = [];
  while (url) {
    const page: { value: T[]; "@odata.nextLink"?: string } = await graphFetch(url);
    all.push(...page.value);
    url = page["@odata.nextLink"];
  }
  return all;
}
