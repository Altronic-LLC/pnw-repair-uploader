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
    return <p className="p-6 text-center text-neutral-400">Loading folders…</p>;
  }
  if (isError) {
    return (
      <p className="p-6 text-center text-red-400">
        Couldn’t load folders: {(error as Error).message}
      </p>
    );
  }
  if (!visible.length) {
    return (
      <p className="p-6 text-center text-neutral-500">No folders available here.</p>
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
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl border border-white/5 bg-white/[0.01] px-4 py-4 text-left opacity-40"
              >
                <Folder className="h-6 w-6 shrink-0 text-neutral-500" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-neutral-400">{f.name}</span>
                  <span className="text-xs text-neutral-600">Locked</span>
                </span>
                <Lock className="h-4 w-4 shrink-0 text-neutral-600" />
              </div>
            </li>
          );
        }
        return (
          <li key={f.id}>
            <button
              onClick={() => onOpen(f.path)}
              className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-4 text-left active:bg-white/5"
            >
              <Folder className="h-6 w-6 shrink-0 text-accent" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{f.name}</span>
                <span className="text-xs text-neutral-500">{f.childCount} items</span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-neutral-500" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
