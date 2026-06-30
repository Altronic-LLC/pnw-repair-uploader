import { Folder, ChevronRight, Lock } from "lucide-react";
import { useMemo } from "react";
import { useFolders } from "@/hooks/useLibrary";
import { isFolderLocked, visibleFolders } from "@/lib/folderRules";

interface FolderPickerProps {
  /** Current parent path (drive-root-relative). */
  parentPath: string;
  onOpen: (path: string) => void;
}

/**
 * Lists the folders available under `parentPath`, applying the kiosk
 * navigation rules (see lib/folderRules): at the root every top-level folder
 * is shown but only _OPEN JOBS is unlocked; deeper, the visible set is filtered
 * (a job folder shows only its "JOB" folder, etc.).
 */
export function FolderPicker({ parentPath, onOpen }: FolderPickerProps) {
  const { data: folders, isLoading, isError, error } = useFolders(parentPath);

  const visible = useMemo(
    () => (folders ? visibleFolders(parentPath, folders) : []),
    [folders, parentPath],
  );

  if (isLoading) {
    return <p className="p-6 text-center text-fg-muted">Loading folders…</p>;
  }
  if (isError) {
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <p className="text-sm font-medium text-red-500 dark:text-red-400">
          Couldn’t load folders.
        </p>
        {/* Technical detail, wrapped so a long Graph URL never forces the page
            to scroll sideways. */}
        <p className="mt-2 break-words text-xs text-fg-subtle [overflow-wrap:anywhere]">
          {(error as Error).message}
        </p>
      </div>
    );
  }
  if (!visible.length) {
    return (
      <p className="p-6 text-center text-fg-subtle">No folders available here.</p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((f) => {
        const locked = isFolderLocked(parentPath, f.name);
        if (locked) {
          return (
            <li key={f.id}>
              <div
                aria-disabled="true"
                title="Not available on this device"
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-4 text-left opacity-60"
              >
                <Folder className="h-6 w-6 shrink-0 text-fg-subtle" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-fg-muted">{f.name}</span>
                  <span className="text-xs text-fg-faint">Locked</span>
                </span>
                <Lock className="h-4 w-4 shrink-0 text-fg-faint" />
              </div>
            </li>
          );
        }
        return (
          <li key={f.id}>
            <button
              onClick={() => onOpen(f.path)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 py-4 text-left shadow-sm transition-colors hover:border-fg-faint active:bg-surface-2"
            >
              <Folder className="h-6 w-6 shrink-0 text-accent" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{f.name}</span>
                <span className="text-xs text-fg-subtle">{f.childCount} items</span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-fg-subtle" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
