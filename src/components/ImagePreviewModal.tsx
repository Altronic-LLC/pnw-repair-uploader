import { useEffect, useState } from "react";
import { X, Loader2, ImageOff } from "lucide-react";
import { useFileBlob } from "@/hooks/useLibrary";
import { Portal } from "./Portal";
import type { LibraryFile } from "@/types/library";

/**
 * Full-screen in-app image preview (lightbox). Stays inside the locked kiosk —
 * the image is fetched via Graph and shown as a blob, never navigating away to
 * SharePoint. In mock mode there are no real bytes, so a placeholder is shown.
 */
export function ImagePreviewModal({
  file,
  onClose,
}: {
  file: LibraryFile;
  onClose: () => void;
}) {
  const { data: blob, isLoading, isError, error } = useFileBlob(file);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);

  return (
    <Portal>
    <div className="fixed inset-0 z-[100] flex flex-col bg-black" onClick={onClose}>
      <div className="flex items-center justify-between p-3">
        <span className="truncate pr-4 text-sm font-medium text-white/80">{file.name}</span>
        <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-white/80">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div
        className="flex flex-1 items-center justify-center overflow-hidden p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <Loader2 className="h-10 w-10 animate-spin text-white/60" />
        ) : isError ? (
          <div className="text-center text-sm text-red-300">
            <ImageOff className="mx-auto mb-2 h-10 w-10" />
            Couldn’t load this image.
            <div className="mt-1 text-xs text-white/40">{(error as Error)?.message}</div>
          </div>
        ) : url ? (
          <img src={url} alt={file.name} className="max-h-full max-w-full object-contain" />
        ) : (
          // Mock mode — no bytes behind the metadata.
          <div className="max-w-sm text-center text-sm text-white/50">
            <ImageOff className="mx-auto mb-2 h-10 w-10" />
            Preview isn’t available in demo mode. In the live app this opens the
            full photo here, inside the kiosk.
          </div>
        )}
      </div>
    </div>
    </Portal>
  );
}
