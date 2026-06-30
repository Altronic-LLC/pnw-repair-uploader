import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children into <body> via a portal so overlays (modals, the camera,
 * the lightbox) sit above everything and can't be clipped or stacked under
 * sibling content by an ancestor's stacking context / overflow.
 */
export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
