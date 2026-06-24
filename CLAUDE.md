# Claude Code instructions for this repository

Working manual for iterating on **PNW Repair Uploader**. Read it before
making non-trivial changes. See `README.md` for the full architecture +
Entra/SharePoint setup.

## What this app is

A locked-down **kiosk SPA** for a single service-account device at PNW Repair.
The device runs one app full-screen: sign in with Entra (PKCE), pick a
permitted SharePoint folder, launch the device camera, upload photos into a
SharePoint document library via Microsoft Graph. Hosted on GitHub Pages.

It is a **sibling** of the ARC platform and deliberately reuses ARC's patterns
(USE_MOCK boundary, lazy MSAL, Sites.Selected, React Query hooks). It is a
**separate repo** — no shared code with ARC.

## The mock/real boundary (most important rule)

> **Every Graph call goes through `src/api/library.ts`, which branches on
> `USE_MOCK` (from `src/api/config.ts`).**

`USE_MOCK` is `true` by default, `false` when `VITE_USE_MOCK=false`. No other
file should care which mode it's in. To add an operation:

1. Add the function to `src/api/library.ts` with `if (USE_MOCK) {…} else {…}`.
2. Mirror any mock state in `src/data/mockData.ts`.
3. Add a React Query hook in `src/hooks/useLibrary.ts`.
4. Use the hook from a component.

## Security model — read this

- The static bundle is **public and readable by anyone.** Client-side gating
  (which folders show, whether a button is disabled) is **UX only**.
- **Real enforcement is the SharePoint/Graph permission layer**: the service
  account is granted access to only specific folders via SharePoint item-level
  permissions. Never treat client checks as a security boundary.
- Auth is a **public client (PKCE)** — there is **no client secret** anywhere.
  Do not add one; a static site cannot hold a secret. If app-only
  (client-credentials) access is ever required, it needs a backend — that's a
  different architecture, flag it rather than hacking it in.

## Auth flow

- MSAL, Authorization Code + PKCE, **redirect** sign-in (not popup — popups are
  unreliable in kiosk browsers). `src/auth/`.
- Scopes: `User.Read`, `Sites.Selected` (`src/auth/msalConfig.ts`). If you
  request a new scope here, it must be consented on the Entra app registration
  or token acquisition fails.
- Token cached in `localStorage` so the kiosk stays signed in across restarts.

## Camera

`src/components/CameraCapture.tsx`. Primary path is `getUserMedia` live preview
→ canvas snapshot → JPEG blob, with a review/retake step. Fallback is a hidden
`<input type="file" accept="image/*" capture="environment">` for when
getUserMedia is unavailable/denied. **Camera needs HTTPS or localhost.**

## Uploads

`uploadFile` in `src/api/library.ts` picks:
- **simple PUT** to `:/content` for files ≤ 4 MB,
- **upload session** (chunked, multiple of 320 KiB, progress-reporting) above
  that — camera photos routinely exceed 4 MB.

Keep both paths working when you touch upload code.

## Config / env vars

`.env.example` is the source of truth. Real values are GitHub Actions repo
**Variables** (none are secret). Key ones: `VITE_USE_MOCK`,
`VITE_AZURE_CLIENT_ID`, `VITE_AZURE_TENANT_ID`, `VITE_SP_SITE_ID`,
`VITE_SP_DRIVE_ID` (opt), `VITE_SP_ROOT_FOLDER` (opt), `VITE_BASE_PATH`
(set by CI to `/<repo-name>/`).

## Changelog / version protocol (REQUIRED on user-visible changes)

The footer shows the app version; clicking it opens the full history. This is
driven by `src/data/changelog.ts`, which is the **single source of truth** for
the version (`CURRENT_VERSION` is derived from the top entry).

**On every user-visible change (UI, copy, flow, feature), before committing:**

1. Add a new entry to the **top** of `CHANGELOG` in `src/data/changelog.ts`
   (newest first), with today's date and one-line, user-POV bullets.
2. Bump the version semver-lite: PATCH = fix/polish, MINOR = new feature,
   MAJOR = rework/breaking.
3. Bump `"version"` in `package.json` to match.
4. Mirror the changelog bullets in the Git commit message:
   ```
   v<version>: <short summary>

   - <change 1>
   - <change 2>
   ```

The footer updates automatically from `CHANGELOG[0]` — you only edit the array.
Skip the changelog only for internal-only changes with zero user impact
(refactors, comment/typo fixes, dep bumps); a one-line `chore:` commit is fine
there.

## App Info protocol (keep the footer Info modal current)

The footer **Info** button opens a developer overview (what the app is, how it
works, security model, repo, SharePoint target, tech stack, project structure,
env vars). It's data-driven from `src/data/appInfo.ts`.

**Update `src/data/appInfo.ts` in the SAME change when you:**
- Add/remove/rename a module, hook, component, or view → `PROJECT_STRUCTURE`.
- Add/remove/change an env var → `ENV_VARS`.
- Change the user flow or auth model → `HOW_IT_WORKS` / `SECURITY_MODEL`.
- Add a dependency that changes the stack → `TECH_STACK`.
- Create the GitHub repo → set `REPO_URL`.

Like the changelog, this keeps the in-app docs from going stale — it's the
first thing a new developer reads.

## Testing

After non-trivial changes:
1. `npm run typecheck`
2. `npm run test`
3. `npm run dev` — app loads with mock data, navigate folders, take a photo
   (mock upload shows progress → done), no console errors.
4. `npm run build`

Tests live next to source as `*.test.ts(x)`. The mock branch is unit-tested;
the real Graph branch is verified against a live tenant.

## When adding a department/feature, default to asking first

This app has a deliberately tiny scope (one library, capture + upload). Before
expanding it (multiple libraries, metadata columns, per-tech identity, offline
queue), confirm scope — see the **Open questions** list in `README.md`. Don't
assume; the answers change the data model and the SharePoint permission setup.
