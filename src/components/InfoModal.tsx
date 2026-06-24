import { X, Github, ExternalLink } from "lucide-react";
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-neutral-900 shadow-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div>
            <h2 className="text-lg font-semibold">About this app</h2>
            <p className="font-mono text-xs text-neutral-500">
              PNW Repair Uploader · v{CURRENT_VERSION}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-neutral-400 active:bg-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto px-5 py-5 text-sm">
          <Section title="What it is">
            {APP_DESCRIPTION.map((p, i) => (
              <p key={i} className="text-neutral-300">
                {p}
              </p>
            ))}
          </Section>

          <Section title="How it works">
            <ol className="ml-5 list-decimal space-y-1.5 text-neutral-300">
              {HOW_IT_WORKS.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </Section>

          <Section title="Security model">
            <ul className="ml-5 list-disc space-y-1.5 text-neutral-300">
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
              <p className="inline-flex items-center gap-2 text-neutral-400">
                <Github className="h-4 w-4" />
                Not yet created — hosted on GitHub Pages once the repo exists.
              </p>
            )}
          </Section>

          <Section title="SharePoint target">
            <ul className="space-y-1 text-neutral-300">
              <li>
                Site:{" "}
                <a
                  href={SHAREPOINT.siteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  {SHAREPOINT.site}
                </a>
              </li>
              <li>
                Library: <span className="font-medium">{SHAREPOINT.library}</span>
              </li>
            </ul>
          </Section>

          <Section title="Tech stack">
            <div className="flex flex-wrap gap-1.5">
              {TECH_STACK.map((t) => (
                <span key={t} className="rounded-md bg-white/5 px-2 py-1 text-xs text-neutral-300">
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
                  <span className="text-neutral-400">{item.desc}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Environment variables">
            <ul className="space-y-1.5">
              {ENV_VARS.map((e) => (
                <li key={e.name} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                  <code className="shrink-0 font-mono text-xs text-neutral-200 sm:w-56">{e.name}</code>
                  <span className="text-neutral-400">{e.desc}</span>
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
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
