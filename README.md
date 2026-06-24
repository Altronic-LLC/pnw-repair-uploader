# PNW Repair Uploader

A single-purpose **kiosk web app** for a locked-down device at PNW Repair.
The device runs one app, full-screen: a technician signs in once with the
**service-account Entra identity**, picks a permitted folder in a SharePoint
document library, **launches the device camera from inside the app**, and
uploads repair photos straight into that folder via **Microsoft Graph**.

- **Static SPA** (React + Vite + TypeScript), hosted on **GitHub Pages**.
- **Auth:** Microsoft Entra ID SSO, Authorization Code + **PKCE** (public
  client — no secret, which is the only safe model for a static site).
- **Storage:** a SharePoint document library, accessed through Microsoft Graph
  with the narrow **`Sites.Selected`** scope.
- **Mock-first:** `VITE_USE_MOCK` lets you build and demo the entire UI before
  the Entra app registration or SharePoint library exists.

> Status: **scaffold**. Runs against mock data today (`npm install && npm run
> dev`). Wiring it to a real tenant is a config exercise — see *Going live*.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173 — mock data, no sign-in needed
npm run typecheck    # TS check
npm run test         # unit tests (mock branch)
npm run build        # production build → dist/
```

Mock mode is the default. To point at a real tenant locally, copy
`.env.example` to `.env.local`, fill it in, and set `VITE_USE_MOCK=false`.

---

## How it works

```
Device (kiosk browser, full-screen)
        │
        ▼
  Entra ID SSO  ──(Auth Code + PKCE)──►  token cached in localStorage
        │
        ▼
  React SPA (this app)
        │  Microsoft Graph (Sites.Selected, delegated)
        ▼
  SharePoint document library
        └── service account can ONLY see / write the folders it's granted
```

The flow on screen:

1. **Sign in** (once per device — token is cached across restarts).
2. **Pick a folder** — the app lists only the subfolders the service account
   has permission to see. Uploading is allowed at any level, including the
   library root.
3. **Take photo** — the in-app camera (`getUserMedia` live preview → JPEG, with
   a native-camera file-input fallback) captures an image.
4. **Name it** — a modal asks for the file name before upload. It blocks
   duplicate names (case-insensitive, against both existing files in the folder
   and anything queued this session) and illegal characters.
5. **Upload** — the photo goes into the current folder. Small files use a
   single PUT; large photos use a resumable upload session (chunked, with a
   progress bar). Failed uploads show a clear error and a **retry** button.

The layout scales responsively from phone → tablet (portrait & landscape) →
desktop web: a centered column that widens to `max-w-3xl`, with folders/files
in responsive grids; the camera and naming modal fill any viewport.

---

## Architecture (mirrors the ARC platform)

This app deliberately reuses the proven patterns from the **ARC** codebase
(the sibling Altronic platform):

- **The `USE_MOCK` boundary.** Every Graph call lives in `src/api/library.ts`
  and branches on `USE_MOCK` (`src/api/config.ts`). Nothing else in the app
  knows or cares which mode it's in. Add a new operation → add it here with a
  mock + real branch, then expose a React Query hook in `src/hooks/`.
- **MSAL bootstrap** (`src/auth/`) is lazy: mock mode never touches MSAL.
- **Client gating is UX, not security.** The bundle is public and readable.
  The *only* real access control is the SharePoint/Graph permission layer —
  what folders the service account is granted (see below).

```
src/
├── main.tsx                  Providers (QueryClient, Auth) + mount
├── App.tsx                   One-screen shell (Header + UploadView)
├── api/
│   ├── config.ts             USE_MOCK + SharePoint/Entra env config
│   ├── graph.ts              Authenticated Graph fetch (JSON + raw binary)
│   └── library.ts            Folder list / file list / upload  ← mock+real
├── auth/
│   ├── msalConfig.ts         Client/tenant/redirect + Graph scopes
│   ├── AuthProvider.tsx      MSAL init + MsalProvider
│   ├── AuthGate.tsx          Blocks app until signed in (real mode)
│   └── SignInPage.tsx        Full-screen "Sign in with Microsoft"
├── hooks/
│   ├── useLibrary.ts         useFolders / useFiles / useUpload
│   └── useCurrentUser.ts     Signed-in account name/UPN
├── components/
│   ├── Header.tsx            App name + account + sign-out
│   ├── FolderPicker.tsx      Drill into permitted folders
│   ├── CameraCapture.tsx     getUserMedia capture (+ file fallback)
│   └── UploadQueue.tsx       Per-file progress / status
├── views/
│   └── UploadView.tsx        The whole flow: navigate → capture → upload
├── data/mockData.ts          In-memory mock library
└── types/library.ts          LibraryFolder / LibraryFile / PendingUpload
```

---

## Confirmed identifiers

Resolved 2026-06-24 against the live tenant via Microsoft Graph (not secret —
safe to keep here):

- **Tenant ID:** `bde86e02-c641-4952-97f2-99ea6d9b8e29`
- **Site:** PNW Repair Shop —
  <https://coopermachineryservices.sharepoint.com/sites/PNWRepairShop>
- **Site ID:** `coopermachineryservices.sharepoint.com,6abaa273-eb94-49f0-bfcc-cdc4f39b184f,9506a0c4-3f6b-4b21-ae77-acd84fd392bb`
- **Target library:** **"Cooper Downstream"** — its *own* document library
  (a separate drive, **not** a folder in a default Documents library; this
  site has no default Documents library). Target it by drive ID, not folder
  path:
  - **Drive ID:** `b!c6K6apTr8Em_zM3E85sYT8SgBpVrPyFLrnes2E_TkrttdPyGRLZeTbWqVLgKTuIG`
  - So set `VITE_SP_DRIVE_ID` to that, and leave `VITE_SP_ROOT_FOLDER` blank —
    the whole library is the kiosk's scope.

Other libraries on the same site (not used): "PNW Repair shop info", "Site
Collection Documents", "Site Collection Images".

**Still needed:** a **new Entra SPA app registration** for this kiosk
(`VITE_AZURE_CLIENT_ID`). Until that exists, leave `VITE_USE_MOCK=true`.

## Going live — one-time setup

### 1. Entra ID app registration

1. **Azure Portal → Entra ID → App registrations → New registration.**
   - Supported account types: **single tenant**.
   - Platform: **Single-page application (SPA)**.
   - Redirect URI: the app's base URL, e.g.
     `https://<org>.github.io/<repo-name>/`
     (and `http://localhost:5173/` for local dev).
2. Note the **Application (client) ID** and **Directory (tenant) ID** →
   `VITE_AZURE_CLIENT_ID` / `VITE_AZURE_TENANT_ID`.
3. **API permissions → Microsoft Graph → Delegated:** add `User.Read` and
   `Sites.Selected`. Grant admin consent.
4. No client secret — this is a public client (PKCE).

### 2. Grant the app access to just the target site (`Sites.Selected`)

`Sites.Selected` grants nothing until an admin explicitly grants this app
permission on a specific site. One-time Graph call (as a SharePoint/Graph
admin):

```http
POST https://graph.microsoft.com/v1.0/sites/{site-id}/permissions
Content-Type: application/json

{
  "roles": ["write"],
  "grantedToIdentities": [
    { "application": { "id": "<client-id>", "displayName": "PNW Repair Uploader" } }
  ]
}
```

### 3. Restrict the service account to specific folders

`Sites.Selected` is *site*-level. To limit the kiosk to certain folders only,
apply **SharePoint item-level permissions**: break inheritance on the library
(or its top folder), remove the service account's broad access, and grant it
**Contribute** on only the intended folder(s). Because all enforcement is
server-side, the app will simply never see folders the account can't read —
no client code change needed.

> Open question: confirm whether the service account should have **Contribute**
> (add files, edit own) or a tighter custom level (add only, no delete). See
> *Open questions*.

### 4. Find the SharePoint identifiers

```powershell
# Site ID (composite form Graph wants):
Invoke-MgGraphRequest -Method GET `
  -Uri "https://graph.microsoft.com/v1.0/sites/{hostname}:/sites/{site-path}"

# Drive (library) IDs on that site — pick the right one if not the default:
Invoke-MgGraphRequest -Method GET `
  -Uri "https://graph.microsoft.com/v1.0/sites/{site-id}/drives"
```

Set `VITE_SP_SITE_ID`, optionally `VITE_SP_DRIVE_ID` (default drive used if
unset), and optionally `VITE_SP_ROOT_FOLDER` to open the app at a sub-path.

### 5. GitHub Pages

- Create the repo, push this code.
- **Settings → Pages → Build and deployment → Source: GitHub Actions.**
- **Settings → Secrets and variables → Actions → Variables:** add
  `VITE_AZURE_TENANT_ID`, `VITE_AZURE_CLIENT_ID`, `VITE_SP_SITE_ID`, and
  (optional) `VITE_SP_DRIVE_ID`, `VITE_SP_ROOT_FOLDER`.
- The included workflow (`.github/workflows/deploy.yml`) sets
  `VITE_USE_MOCK=false` and `VITE_BASE_PATH=/<repo-name>/` automatically.
- Add `https://<org>.github.io/<repo-name>/` as a redirect URI on the Entra
  app registration (step 1).

---

## Kiosk device notes

The app is browser-only; the *device* lockdown is configured outside this repo:

- **Camera requires HTTPS** (or `localhost`). GitHub Pages is HTTPS — fine.
- Lock the device to this URL in full-screen/kiosk mode (e.g. Windows
  **Assigned Access** / a single-app kiosk, or a managed Android/iPad kiosk).
- Grant the browser camera permission once and persist it.
- The UI disables text selection, zoom, and overscroll for a kiosk feel
  (`src/styles/globals.css`, the viewport meta in `index.html`).

---

## Open questions (decide before go-live)

1. **Folder scope:** is the kiosk pinned to one fixed folder, or does the user
   browse a folder tree? (Scaffold supports browsing; set `VITE_SP_ROOT_FOLDER`
   to pin a starting point.)
2. **Service-account permission level:** Contribute vs. add-only (no delete /
   no edit). Drives both the SharePoint grant and whether we hide deletes.
3. **File naming:** should uploads encode a unit/RO/work-order number into the
   filename or a metadata column? Today they're `photo-<timestamp>.jpg`.
4. **Metadata columns:** does the library need tagged columns (unit #, stage,
   technician) written alongside the file?
5. **One shared service account vs. per-tech sign-in.** A shared account is
   simplest for a kiosk but loses "who uploaded this." Per-tech keeps an audit
   trail. (Question carried over from the original brief.)
6. **Offline / poor signal:** do we need to queue uploads and retry when the
   shop floor connection drops?
```
