import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  path: string;
}

/**
 * Build the breadcrumb trail for a drive-root-relative `path`. The first crumb
 * is the library root (`rootLabel` → ""), then one crumb per path segment with
 * its cumulative path.
 */
export function buildCrumbs(path: string, rootLabel: string): Crumb[] {
  const segs = path ? path.split("/") : [];
  const crumbs: Crumb[] = [{ label: rootLabel, path: "" }];
  let acc = "";
  for (const s of segs) {
    acc = acc ? `${acc}/${s}` : s;
    crumbs.push({ label: s, path: acc });
  }
  return crumbs;
}

interface BreadcrumbProps {
  /** Current drive-root-relative path ("" = root). */
  path: string;
  rootLabel: string;
  onNavigate: (path: string) => void;
}

/**
 * Full folder path shown while navigating. Every crumb except the current
 * (last) one is tappable to jump back up to that level.
 */
export function Breadcrumb({ path, rootLabel, onNavigate }: BreadcrumbProps) {
  const crumbs = buildCrumbs(path, rootLabel);
  return (
    <nav aria-label="Folder path" className="flex flex-wrap items-center gap-x-1 gap-y-1">
      {crumbs.map((c, i) => {
        const isCurrent = i === crumbs.length - 1;
        return (
          <span key={c.path} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-4 w-4 shrink-0 text-fg-faint" />}
            {isCurrent ? (
              <span
                aria-current="location"
                className="max-w-[60vw] truncate text-base font-semibold sm:max-w-xs sm:text-lg"
              >
                {c.label}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(c.path)}
                className="max-w-[40vw] truncate text-sm text-fg-muted hover:text-fg active:opacity-70 sm:max-w-[12rem]"
              >
                {c.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
