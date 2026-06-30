import { useEffect, useState } from "react";
import { History, Info, X } from "lucide-react";
import { CHANGELOG, CURRENT_VERSION } from "@/data/changelog";
import { InfoModal } from "./InfoModal";
import { Portal } from "./Portal";
import { ThemeToggle } from "./ThemeToggle";

const MAINTAINER_EMAIL = "ray.white@altronic-llc.com";
const VERSION_SEEN_KEY = "pnw-uploader-version-seen";

/**
 * Slim footer showing the maintainer contact and the current version. Clicking
 * the version opens the full history. A "NEW" badge highlights the version
 * until the user has opened the history on this build.
 */
export function Footer() {
  const [showHistory, setShowHistory] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [versionSeen, setVersionSeen] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setVersionSeen(localStorage.getItem(VERSION_SEEN_KEY) === CURRENT_VERSION);
  }, []);

  function openHistory() {
    if (typeof window !== "undefined") {
      localStorage.setItem(VERSION_SEEN_KEY, CURRENT_VERSION);
      setVersionSeen(true);
    }
    setShowHistory(true);
  }

  return (
    <>
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 py-3 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <span>
            Managed by{" "}
            <a
              href={`mailto:${MAINTAINER_EMAIL}`}
              className="font-medium text-fg-muted underline-offset-2 hover:text-accent hover:underline"
            >
              {MAINTAINER_EMAIL}
            </a>
          </span>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <ThemeToggle />

            <button
              onClick={() => setShowInfo(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[11px] text-fg-subtle transition-colors hover:border-fg-faint hover:text-fg"
            >
              <Info className="h-3 w-3" />
              Info
            </button>

            <button
              onClick={openHistory}
              className={
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors " +
                (versionSeen
                  ? "border-border text-fg-subtle hover:border-fg-faint hover:text-fg"
                  : "border-accent text-accent hover:opacity-90")
              }
            >
              <History className="h-3 w-3" />
              v{CURRENT_VERSION}
              {!versionSeen && (
                <span className="ml-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                  New
                </span>
              )}
            </button>
          </div>
        </div>
      </footer>

      {showHistory && <ChangelogModal onClose={() => setShowHistory(false)} />}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </>
  );
}

function ChangelogModal({ onClose }: { onClose: () => void }) {
  return (
    <Portal>
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl bg-surface shadow-2xl ring-1 ring-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-lg font-semibold">Version history</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-fg-muted active:bg-surface-3"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(80vh-3.5rem)] overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-5">
            {CHANGELOG.map((entry) => (
              <div key={entry.version} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                <div className="mb-2 flex items-baseline gap-3">
                  <span className="text-base font-semibold">v{entry.version}</span>
                  <span className="text-xs text-fg-subtle">{entry.date}</span>
                </div>
                <ul className="ml-5 list-disc space-y-1 text-sm text-fg-muted">
                  {entry.changes.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </Portal>
  );
}
