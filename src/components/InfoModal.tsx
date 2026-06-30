import { X, Github, ExternalLink } from "lucide-react";
import { Portal } from "./Portal";
import { CURRENT_VERSION } from "@/data/changelog";
import {
  APP_DESCRIPTION,
  ENV_VARS,
  HOW_IT_WORKS,
  MAINTAINER_EMAIL,
  PROJECT_STRUCTURE,
  REPO_URL,
  SECURITY_MODEL,
  SHAREPOINT,
  TECH_STACK,
} from "@/data/appInfo";

/**
 * Developer-facing "About this app" modal opened from the footer Info button.
 * All content is data-driven from src/data/appInfo.ts so it stays current with
 * one edit when the architecture changes (see CLAUDE.md "App Info protocol").
 */
export function InfoModal({ onClose }: { onClose: () => void }) {
  return (
    <Portal>
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl ring-1 ring-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <h2 className="text-lg font-semibold">About this app</h2>
            <p className="font-mono text-xs text-fg-subtle">
              PNW Repair Uploader · v{CURRENT_VERSION}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-fg-muted active:bg-surface-3"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto px-5 py-5 text-sm">
          <Section title="What it is">
            {APP_DESCRIPTION.map((p, i) => (
              <p key={i} className="text-fg-muted">
                {p}
              </p>
            ))}
          </Section>

          <Section title="How it works">
            <ol className="ml-5 list-decimal space-y-1.5 text-fg-muted">
              {HOW_IT_WORKS.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </Section>

          <Section title="Security model">
            <ul className="ml-5 list-disc space-y-1.5 text-fg-muted">
              {SECURITY_MODEL.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </Section>

          <Section title="Repository">
            {REPO_URL ? (
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-accent hover:underline"
              >
                <Github className="h-4 w-4" />
                {REPO_URL}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <p className="inline-flex items-center gap-2 text-fg-muted">
                <Github className="h-4 w-4" />
                Not yet created — hosted on GitHub Pages once the repo exists.
              </p>
            )}
          </Section>

          <Section title="SharePoint target">
            <ul className="space-y-1 text-fg-muted">
              <li>
                Site: <span className="font-medium">{SHAREPOINT.site}</span>
              </li>
              <li>
                Library: <span className="font-medium">{SHAREPOINT.library}</span>
              </li>
            </ul>
          </Section>

          <Section title="Tech stack">
            <div className="flex flex-wrap gap-1.5">
              {TECH_STACK.map((t) => (
                <span key={t} className="rounded-md bg-surface-2 px-2 py-1 text-xs text-fg-muted">
                  {t}
                </span>
              ))}
            </div>
          </Section>

          <Section title="Project structure">
            <ul className="space-y-1.5">
              {PROJECT_STRUCTURE.map((item) => (
                <li key={item.path} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                  <code className="shrink-0 font-mono text-xs text-accent sm:w-64">{item.path}</code>
                  <span className="text-fg-muted">{item.desc}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Environment variables">
            <ul className="space-y-1.5">
              {ENV_VARS.map((e) => (
                <li key={e.name} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                  <code className="shrink-0 font-mono text-xs text-fg sm:w-56">{e.name}</code>
                  <span className="text-fg-muted">{e.desc}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Maintainer">
            <a href={`mailto:${MAINTAINER_EMAIL}`} className="text-accent hover:underline">
              {MAINTAINER_EMAIL}
            </a>
          </Section>
        </div>
      </div>
    </div>
    </Portal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-fg-subtle">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
