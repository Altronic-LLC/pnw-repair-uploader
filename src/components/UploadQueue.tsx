import { CheckCircle2, AlertCircle, Loader2, Trash2, RotateCw } from "lucide-react";
import type { PendingUpload } from "@/types/library";

interface UploadQueueProps {
  uploads: PendingUpload[];
  onRemove: (localId: string) => void;
  onRetry: (localId: string) => void;
}

/** Shows queued/in-flight/finished uploads with per-item progress + retry. */
export function UploadQueue({ uploads, onRemove, onRetry }: UploadQueueProps) {
  if (!uploads.length) return null;
  return (
    <ul className="space-y-2">
      {uploads.map((u) => (
        <li key={u.localId} className="flex items-center gap-3 rounded-lg bg-white/5 p-2">
          <img src={u.previewUrl} alt="" className="h-12 w-12 shrink-0 rounded object-cover" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm">{u.fileName}</div>
            {u.status === "uploading" && (
              <div className="mt-1 h-1.5 overflow-hidden rounded bg-white/10">
                <div className="h-full bg-accent transition-all" style={{ width: `${u.progress}%` }} />
              </div>
            )}
            {u.status === "error" && (
              <div className="truncate text-xs text-red-400" title={u.error}>
                {u.error ?? "Upload failed"}
              </div>
            )}
            {u.status === "done" && <div className="text-xs text-green-400">Uploaded</div>}
            {u.status === "queued" && <div className="text-xs text-neutral-500">Waiting…</div>}
          </div>

          <StatusIcon status={u.status} />

          {u.status === "error" && (
            <button
              onClick={() => onRetry(u.localId)}
              aria-label="Retry upload"
              className="rounded-lg p-2 text-neutral-300 active:bg-white/5"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          )}
          {(u.status === "error" || u.status === "queued" || u.status === "done") && (
            <button
              onClick={() => onRemove(u.localId)}
              aria-label="Remove from list"
              className="rounded-lg p-2 text-neutral-500 active:bg-white/5"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function StatusIcon({ status }: { status: PendingUpload["status"] }) {
  if (status === "uploading") return <Loader2 className="h-5 w-5 shrink-0 animate-spin text-accent" />;
  if (status === "done") return <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />;
  if (status === "error") return <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />;
  return null;
}
