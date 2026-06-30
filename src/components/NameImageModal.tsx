import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Portal } from "./Portal";

interface NameImageModalProps {
  /** Default name to pre-fill (e.g. the captured "photo-…jpg"). */
  suggestedName: string;
  /** Thumbnail of the captured/selected image. */
  previewUrl: string;
  /** Display name of the folder the photo will upload into. */
  destination: string;
  /** Existing file names in the target folder — used to block duplicates. */
  existingNames: string[];
  /** Called with the final, validated file name (including extension). */
  onConfirm: (fileName: string) => void;
  onCancel: () => void;
}

// SharePoint / OneDrive forbid these characters in file names.
const INVALID_CHARS = /[\\/:*?"<>|#%]/;

/** Split a file name into its base and (lower-cased) extension. */
function splitExt(name: string): { base: string; ext: string } {
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return { base: name, ext: "" };
  return { base: name.slice(0, dot), ext: name.slice(dot) };
}

/**
 * Modal shown after a photo is captured. The user names the file before it
 * uploads. Validates: non-empty, no illegal characters, and — the important
 * one — not a duplicate of a file already in the folder (case-insensitive).
 */
export function NameImageModal({
  suggestedName,
  previewUrl,
  destination,
  existingNames,
  onConfirm,
  onCancel,
}: NameImageModalProps) {
  const { base: suggestedBase, ext } = splitExt(suggestedName);
  const [base, setBase] = useState(suggestedBase);

  const finalName = `${base.trim()}${ext}`;
  const lowerExisting = useMemo(
    () => new Set(existingNames.map((n) => n.toLowerCase())),
    [existingNames],
  );

  const error = useMemo<string | null>(() => {
    const trimmed = base.trim();
    if (!trimmed) return "Enter a name for the photo.";
    if (INVALID_CHARS.test(trimmed)) return 'Name can’t contain \\ / : * ? " < > | # %';
    if (lowerExisting.has(finalName.toLowerCase())) {
      return `“${finalName}” already exists in this folder. Choose a different name.`;
    }
    return null;
  }, [base, finalName, lowerExisting]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (error) return;
    onConfirm(finalName);
  }

  return (
    <Portal>
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-surface p-5 shadow-2xl ring-1 ring-border"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Name this photo</h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="rounded-full p-2 text-fg-muted active:bg-surface-3"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex justify-center">
          <img
            src={previewUrl}
            alt="Preview of the photo to upload"
            className="max-h-48 rounded-lg object-contain"
          />
        </div>

        <p className="mb-3 text-sm text-fg-muted">
          Saving to <span className="font-medium text-fg">{destination}</span>
        </p>

        <label className="block text-sm font-medium text-fg-muted" htmlFor="image-name">
          File name
        </label>
        <div className="mt-1 flex items-center gap-2">
          <input
            id="image-name"
            autoFocus
            value={base}
            onChange={(e) => setBase(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface-2 px-3 py-3 text-base outline-none focus:border-accent"
            placeholder="e.g. unit-4412-intake-front"
          />
          {ext && <span className="shrink-0 text-fg-subtle">{ext}</span>}
        </div>

        {/* aria-live so screen readers announce the validation result. */}
        <p
          className={`mt-2 min-h-[1.25rem] text-sm ${error ? "text-red-500 dark:text-red-400" : "text-fg-subtle"}`}
          aria-live="polite"
        >
          {error ?? "This name is available."}
        </p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl bg-surface-2 py-3 font-medium active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!!error}
            className="flex-1 rounded-xl bg-accent py-3 font-semibold text-white active:scale-[0.98] disabled:opacity-40"
          >
            Upload
          </button>
        </div>
      </form>
    </div>
    </Portal>
  );
}
