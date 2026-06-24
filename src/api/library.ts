// =============================================================================
// SharePoint document-library access — ALL mock/real branching lives here.
//
// Every function does `if (USE_MOCK) { ...mock... } else { ...graph... }` so
// the two implementations sit side by side and stay in sync. The rest of the
// app never imports Graph directly — it calls these functions via the
// useLibrary hooks.
// =============================================================================

import type { LibraryFile, LibraryFolder } from "@/types/library";
import { mockFiles, mockFolders, mockUpload } from "@/data/mockData";
import { SP_DRIVE_ID, SP_ROOT_FOLDER, SP_SITE_ID, USE_MOCK } from "./config";
import { graphFetchAll, graphFetchRaw } from "./graph";

// 4 MB — Graph's simple-upload ceiling. Above this we must use an upload
// session (chunked). Camera photos routinely exceed this.
const SIMPLE_UPLOAD_MAX = 4 * 1024 * 1024;
// Upload-session chunk size must be a multiple of 320 KiB per Graph docs.
const CHUNK_SIZE = 5 * 320 * 1024; // 1,600 KiB

/** Base Graph path to the target drive (explicit drive ID or the site default). */
function driveBase(): string {
  if (SP_DRIVE_ID) return `/drives/${SP_DRIVE_ID}`;
  return `/sites/${SP_SITE_ID}/drive`;
}

/** Graph item-address for a folder path relative to the drive root. */
function folderAddress(path: string): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? `${driveBase()}/root:/${encodeURI(clean)}:` : `${driveBase()}/root`;
}

interface GraphDriveItem {
  id: string;
  name: string;
  size?: number;
  webUrl?: string;
  lastModifiedDateTime?: string;
  folder?: { childCount: number };
  file?: { mimeType: string };
  parentReference?: { path?: string };
}

/** Derive a drive-root-relative path for a child of `parentPath`. */
function childPath(parentPath: string, name: string): string {
  return parentPath ? `${parentPath}/${name}` : name;
}

/**
 * List subfolders of `parentPath` (relative to the drive root). Pass "" for the
 * configured root. The service account only sees folders it has permission to.
 */
export async function listFolders(parentPath = SP_ROOT_FOLDER): Promise<LibraryFolder[]> {
  if (USE_MOCK) {
    // Mock: return folders whose path sits directly under parentPath.
    return mockFolders.filter((f) => {
      const parent = f.path.split("/").slice(0, -1).join("/");
      return parent === parentPath;
    });
  }
  const items = await graphFetchAll<GraphDriveItem>(
    `${folderAddress(parentPath)}/children?$select=id,name,folder,parentReference&$top=200`,
  );
  return items
    .filter((it) => it.folder)
    .map((it) => ({
      id: it.id,
      name: it.name,
      path: childPath(parentPath, it.name),
      childCount: it.folder?.childCount ?? 0,
    }));
}

/** List the files in a folder so the user can confirm what's already there. */
export async function listFiles(folderPath: string): Promise<LibraryFile[]> {
  if (USE_MOCK) {
    return mockFiles[folderPath] ?? [];
  }
  const items = await graphFetchAll<GraphDriveItem>(
    `${folderAddress(folderPath)}/children?$select=id,name,size,file,webUrl,lastModifiedDateTime&$top=200`,
  );
  return items
    .filter((it) => it.file)
    .map((it) => ({
      id: it.id,
      name: it.name,
      size: it.size ?? 0,
      lastModified: it.lastModifiedDateTime ?? "",
      webUrl: it.webUrl,
    }));
}

/**
 * Upload one file into a folder. Picks simple upload for small files and an
 * upload session (chunked, resumable, progress-reporting) for large ones.
 * `onProgress` receives 0–100. Returns the created LibraryFile.
 */
export async function uploadFile(
  folderPath: string,
  fileName: string,
  blob: Blob,
  onProgress?: (pct: number) => void,
): Promise<LibraryFile> {
  if (USE_MOCK) {
    // Simulate progress so the UI's progress bar is exercised in mock mode.
    for (const pct of [25, 60, 90, 100]) onProgress?.(pct);
    return mockUpload(folderPath, fileName, blob.size);
  }

  if (blob.size <= SIMPLE_UPLOAD_MAX) {
    return simpleUpload(folderPath, fileName, blob, onProgress);
  }
  return sessionUpload(folderPath, fileName, blob, onProgress);
}

/** Small files: a single PUT to the item's :/content endpoint. */
async function simpleUpload(
  folderPath: string,
  fileName: string,
  blob: Blob,
  onProgress?: (pct: number) => void,
): Promise<LibraryFile> {
  const target = `${folderAddress(folderPath)}/${encodeURIComponent(fileName)}:/content`;
  const res = await graphFetchRaw(target, {
    method: "PUT",
    headers: { "Content-Type": blob.type || "application/octet-stream" },
    body: blob,
  });
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status}): ${await res.text()}`);
  }
  onProgress?.(100);
  const item = (await res.json()) as GraphDriveItem;
  return {
    id: item.id,
    name: item.name,
    size: item.size ?? blob.size,
    lastModified: item.lastModifiedDateTime ?? "",
    webUrl: item.webUrl,
  };
}

/**
 * Large files: create an upload session, then PUT sequential byte ranges. This
 * is the resumable path; we keep it simple (no resume-after-failure) but report
 * progress and handle the multiple of 320 KiB chunk requirement.
 */
async function sessionUpload(
  folderPath: string,
  fileName: string,
  blob: Blob,
  onProgress?: (pct: number) => void,
): Promise<LibraryFile> {
  const sessionRes = await graphFetchRaw(
    `${folderAddress(folderPath)}/${encodeURIComponent(fileName)}:/createUploadSession`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item: { "@microsoft.graph.conflictBehavior": "rename" },
      }),
    },
  );
  if (!sessionRes.ok) {
    throw new Error(`createUploadSession failed (${sessionRes.status}): ${await sessionRes.text()}`);
  }
  const { uploadUrl } = (await sessionRes.json()) as { uploadUrl: string };

  const total = blob.size;
  let offset = 0;
  let lastItem: GraphDriveItem | undefined;

  while (offset < total) {
    const end = Math.min(offset + CHUNK_SIZE, total);
    const chunk = blob.slice(offset, end);
    // The upload URL is pre-authenticated — plain fetch, no bearer token.
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Length": String(end - offset),
        "Content-Range": `bytes ${offset}-${end - 1}/${total}`,
      },
      body: chunk,
    });
    if (res.status !== 202 && res.status !== 201 && res.status !== 200) {
      throw new Error(`Chunk upload failed (${res.status}): ${await res.text()}`);
    }
    offset = end;
    onProgress?.(Math.round((offset / total) * 100));
    // 201/200 on the final chunk carries the created driveItem.
    if (res.status === 201 || res.status === 200) {
      lastItem = (await res.json()) as GraphDriveItem;
    }
  }

  if (!lastItem) throw new Error("Upload session completed without returning an item.");
  return {
    id: lastItem.id,
    name: lastItem.name,
    size: lastItem.size ?? total,
    lastModified: lastItem.lastModifiedDateTime ?? "",
    webUrl: lastItem.webUrl,
  };
}
