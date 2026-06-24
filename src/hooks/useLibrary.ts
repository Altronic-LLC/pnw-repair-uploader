import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listFiles, listFolders, uploadFile } from "@/api/library";
import type { LibraryFile } from "@/types/library";

/** Subfolders under a given path (defaults to the configured root). */
export function useFolders(parentPath?: string) {
  return useQuery({
    queryKey: ["folders", parentPath ?? "__root__"],
    queryFn: () => listFolders(parentPath),
  });
}

/** Files already present in a folder. Disabled until a folder is chosen. */
export function useFiles(folderPath: string | null) {
  return useQuery({
    queryKey: ["files", folderPath],
    queryFn: () => listFiles(folderPath as string),
    enabled: folderPath != null,
  });
}

export interface UploadArgs {
  folderPath: string;
  fileName: string;
  blob: Blob;
  onProgress?: (pct: number) => void;
}

/** Upload a file, then refresh the folder's file list on success. */
export function useUpload() {
  const qc = useQueryClient();
  return useMutation<LibraryFile, Error, UploadArgs>({
    mutationFn: ({ folderPath, fileName, blob, onProgress }) =>
      uploadFile(folderPath, fileName, blob, onProgress),
    onSuccess: (_file, { folderPath }) => {
      void qc.invalidateQueries({ queryKey: ["files", folderPath] });
    },
  });
}
