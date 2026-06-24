import { Camera, ChevronLeft, FileText } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { CameraCapture } from "@/components/CameraCapture";
import { FolderPicker } from "@/components/FolderPicker";
import { NameImageModal } from "@/components/NameImageModal";
import { UploadQueue } from "@/components/UploadQueue";
import { useFiles, useUpload } from "@/hooks/useLibrary";
import { SP_ROOT_FOLDER } from "@/api/config";
import { canUploadHere, showFilesHere } from "@/lib/folderRules";
import type { PendingUpload } from "@/types/library";

interface Captured {
  blob: Blob;
  suggestedName: string;
  previewUrl: string;
}

/**
 * The whole kiosk flow:
 *   1. Navigate folders (FolderPicker) starting at the configured root.
 *   2. See what's already in the current folder.
 *   3. Take a photo → name it (NameImageModal, with duplicate-name guard) →
 *      it joins the upload queue and uploads with per-item progress + retry.
 *
 * Layout scales from phone → tablet (portrait & landscape) → desktop: a single
 * centered column that widens to max-w-3xl, with folders/files in responsive
 * grids. The camera and naming modal are overlays that fill any viewport.
 */
export function UploadView() {
  const [path, setPath] = useState<string>(SP_ROOT_FOLDER);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [captured, setCaptured] = useState<Captured | null>(null);
  const [uploads, setUploads] = useState<PendingUpload[]>([]);
  const idRef = useRef(0);

  // Files only show (and are only fetched) inside a "Job" folder or deeper.
  const filesVisible = showFilesHere(path);
  const { data: files } = useFiles(filesVisible ? path : null);
  const upload = useUpload();

  // Names that would collide in the CURRENT folder: existing files + anything
  // already queued/uploaded to this folder this session.
  const existingNames = useMemo(() => {
    const fromFolder = files?.map((f) => f.name) ?? [];
    const fromSession = uploads
      .filter((u) => u.folderPath === path && u.status !== "error")
      .map((u) => u.fileName);
    return [...fromFolder, ...fromSession];
  }, [files, uploads, path]);

  function patch(localId: string, p: Partial<PendingUpload>) {
    setUploads((prev) => prev.map((u) => (u.localId === localId ? { ...u, ...p } : u)));
  }

  function runUpload(item: PendingUpload) {
    patch(item.localId, { status: "uploading", progress: 0, error: undefined });
    upload.mutate(
      {
        folderPath: item.folderPath,
        fileName: item.fileName,
        blob: item.blob,
        onProgress: (pct) => patch(item.localId, { progress: pct }),
      },
      {
        onSuccess: () => patch(item.localId, { status: "done", progress: 100 }),
        onError: (err) =>
          patch(item.localId, { status: "error", error: friendlyError(err) }),
      },
    );
  }

  // Step 1: camera/file produced an image — open the naming modal.
  function handleCapture(blob: Blob, suggestedName: string) {
    setCameraOpen(false);
    setCaptured({ blob, suggestedName, previewUrl: URL.createObjectURL(blob) });
  }

  // Step 2: user confirmed a (validated, unique) name — start the upload. The
  // queue item takes ownership of the preview URL, so we don't revoke it here.
  function confirmName(fileName: string) {
    if (!captured) return;
    const item: PendingUpload = {
      localId: `u${idRef.current++}`,
      fileName,
      folderPath: path,
      blob: captured.blob,
      previewUrl: captured.previewUrl,
      status: "queued",
      progress: 0,
    };
    setUploads((prev) => [item, ...prev]);
    setCaptured(null);
    runUpload(item);
  }

  function cancelName() {
    if (captured) URL.revokeObjectURL(captured.previewUrl);
    setCaptured(null);
  }

  function retryUpload(localId: string) {
    const item = uploads.find((u) => u.localId === localId);
    if (item) runUpload(item);
  }

  function removeUpload(localId: string) {
    setUploads((prev) => {
      const target = prev.find((u) => u.localId === localId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((u) => u.localId !== localId);
    });
  }

  const atRoot = path === SP_ROOT_FOLDER;
  const folderName = path.split("/").filter(Boolean).pop() ?? "Library";

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
      {/* Breadcrumb / back */}
      <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
        {!atRoot && (
          <button
            onClick={() => setPath(parentOf(path, SP_ROOT_FOLDER))}
            className="flex items-center gap-1 text-sm text-neutral-300 active:opacity-70"
          >
            <ChevronLeft className="h-5 w-5" /> Back
          </button>
        )}
        <span className="truncate text-base font-medium sm:text-lg">
          {atRoot ? "Cooper Downstream" : folderName}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pb-2">
        {/* Always allow drilling into subfolders. */}
        <FolderPicker parentPath={path} onOpen={setPath} />

        <div className="space-y-5 p-4">
          {filesVisible && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                In this folder
              </h2>
              {files?.length ? (
                <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {files.map((f) => (
                    <li key={f.id} className="flex items-center gap-2 text-sm text-neutral-300">
                      <FileText className="h-4 w-4 shrink-0 text-neutral-500" />
                      <span className="truncate">{f.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-500">No files yet.</p>
              )}
            </section>
          )}

          {uploads.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                This session
              </h2>
              <UploadQueue uploads={uploads} onRemove={removeUpload} onRetry={retryUpload} />
            </section>
          )}
        </div>
      </div>

      {/* Capture button — only inside a sub-folder of _OPEN JOBS. */}
      {canUploadHere(path) && (
        <div className="border-t border-white/5 p-4">
          <button
            onClick={() => setCameraOpen(true)}
            className="mx-auto flex w-full max-w-md items-center justify-center gap-3 rounded-xl bg-accent py-4 text-lg font-semibold text-white active:scale-[0.98]"
          >
            <Camera className="h-6 w-6" /> Take photo
          </button>
        </div>
      )}

      {cameraOpen && (
        <CameraCapture onCapture={handleCapture} onClose={() => setCameraOpen(false)} />
      )}

      {captured && (
        <NameImageModal
          suggestedName={captured.suggestedName}
          previewUrl={captured.previewUrl}
          existingNames={existingNames}
          onConfirm={confirmName}
          onCancel={cancelName}
        />
      )}
    </div>
  );
}

/** Parent folder path, not going above the configured root. */
function parentOf(path: string, root: string): string {
  const parts = path.split("/").filter(Boolean);
  parts.pop();
  const parent = parts.join("/");
  return parent.length >= root.length ? parent : root;
}

/** Turn a raw upload error into something a shop-floor user can act on. */
function friendlyError(err: Error): string {
  const msg = err.message ?? "Upload failed";
  if (/Not signed in|session|401/i.test(msg)) return "Sign-in expired — sign in again.";
  if (/403|denied|permission/i.test(msg)) return "You don’t have permission to upload here.";
  if (/network|fetch|Failed to fetch/i.test(msg)) return "Network problem — check the connection and retry.";
  return msg.length > 120 ? "Upload failed — tap retry." : msg;
}
