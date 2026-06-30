const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "heic",
  "heif",
  "tif",
  "tiff",
]);

/** Whether a file name looks like an image we can preview in a lightbox. */
export function isImageFile(name: string): boolean {
  const dot = name.lastIndexOf(".");
  if (dot < 0) return false;
  return IMAGE_EXTENSIONS.has(name.slice(dot + 1).toLowerCase());
}
