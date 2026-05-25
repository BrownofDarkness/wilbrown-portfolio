"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Maximize2, Star, X } from "lucide-react";
import {
  AppleIcon,
  GithubIcon,
  PlayStoreIcon,
} from "@/components/icons/SocialIcons";
import { Tag } from "@/components/ui/Tag";
import {
  SHOWCASE_TYPES,
  type Showcase,
  type ShowcaseType,
} from "@/lib/showcase-schema";
import { cn } from "@/lib/utils";

const MAX_TAGS_VISIBLE = 4;

type FilterKey = "all" | ShowcaseType;

export type ShowcaseLabels = {
  empty: string;
  featured: string;
  filter_all: string;
  types: Record<ShowcaseType, string>;
  links: {
    repo: string;
    live: string;
    play_store: string;
    app_store: string;
  };
  modal: {
    close: string;
    visit: string;
  };
};

export function ShowcaseGrid({
  entries,
  labels,
}: {
  entries: Showcase[];
  labels: ShowcaseLabels;
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<Showcase | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  // Close on ESC
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  // Which types are actually present? Hide pills for empty types.
  const availableTypes = useMemo(() => {
    const set = new Set(entries.map((e) => e.type));
    return SHOWCASE_TYPES.filter((t) => set.has(t));
  }, [entries]);

  const visible = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.type === filter)),
    [entries, filter],
  );

  if (entries.length === 0) {
    return (
      <div className="mt-16 rounded-2xl border border-dashed border-border-subtle bg-bg-elevated/40 p-12 text-center">
        <p className="font-mono text-sm text-fg-muted">{labels.empty}</p>
      </div>
    );
  }

  return (
    <>
      {/* Filter pills */}
      {availableTypes.length > 1 && (
        <div
          role="tablist"
          aria-label="Filter by type"
          className="mt-12 flex flex-wrap items-center gap-2"
        >
          {(["all", ...availableTypes] as FilterKey[]).map((f) => {
            const active = f === filter;
            return (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f)}
                className={cn(
                  "inline-flex h-9 items-center rounded-full border px-4 font-mono text-xs uppercase tracking-[0.1em] transition-colors",
                  active
                    ? "border-accent bg-accent text-navy-dark"
                    : "border-border text-fg-muted hover:border-accent hover:text-accent",
                )}
              >
                {f === "all" ? labels.filter_all : labels.types[f]}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((entry, i) => {
          const number = String(i + 1).padStart(2, "0");
          return (
            <ShowcaseCard
              key={entry.id}
              entry={entry}
              number={number}
              labels={labels}
              onOpen={() => setSelected(entry)}
            />
          );
        })}
      </div>

      {/* Lightbox modal */}
      {mounted &&
        selected &&
        createPortal(
          <ShowcaseModal
            entry={selected}
            labels={labels}
            onClose={() => setSelected(null)}
          />,
          document.body,
        )}
    </>
  );
}

function ShowcaseCard({
  entry,
  number,
  labels,
  onOpen,
}: {
  entry: Showcase;
  number: string;
  labels: ShowcaseLabels;
  onOpen: () => void;
}) {
  const linkCount = [
    entry.repoUrl,
    entry.liveUrl,
    entry.playStoreUrl,
    entry.appStoreUrl,
  ].filter(Boolean).length;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated transition-colors hover:border-accent">
      {/* Ghost number — sits behind content as decoration */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-4 top-3 font-mono text-7xl font-bold tracking-tighter text-fg/[0.06] sm:text-8xl"
      >
        {number}
      </span>

      {/* Image with zoom button */}
      {entry.image ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`${entry.title} — agrandir`}
          className="relative block aspect-[4/3] w-full overflow-hidden bg-bg"
        >
          <Image
            src={entry.image}
            alt={entry.title}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          {entry.featured && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-accent/40 bg-bg/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-accent backdrop-blur">
              <Star size={10} fill="currentColor" />
              {labels.featured}
            </span>
          )}
          <span className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg/80 text-fg-muted opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100 group-hover:text-accent">
            <Maximize2 size={14} />
          </span>
        </button>
      ) : (
        <div className="aspect-[4/3] w-full border-b border-border-subtle bg-bg" />
      )}

      <div className="relative flex flex-1 flex-col p-6">
        <p className="font-mono text-xs text-fg-subtle">
          {entry.year} · {labels.types[entry.type]}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-fg sm:text-xl">
          {entry.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-fg-muted">
          {entry.description}
        </p>

        {entry.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {entry.tags.slice(0, MAX_TAGS_VISIBLE).map((tag) => (
              <Tag key={tag} className="text-[10px]">
                {tag}
              </Tag>
            ))}
            {entry.tags.length > MAX_TAGS_VISIBLE && (
              <span className="inline-flex items-center font-mono text-[10px] text-fg-subtle">
                +{entry.tags.length - MAX_TAGS_VISIBLE}
              </span>
            )}
          </div>
        )}

        {linkCount > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border-subtle pt-4">
            <LinkRow entry={entry} labels={labels} compact />
          </div>
        )}
      </div>
    </article>
  );
}

function LinkRow({
  entry,
  labels,
  compact = false,
}: {
  entry: Showcase;
  labels: ShowcaseLabels;
  compact?: boolean;
}) {
  const Link = compact ? CompactLink : FullLink;
  return (
    <>
      {entry.repoUrl && (
        <Link
          href={entry.repoUrl}
          icon={<GithubIcon size={compact ? 12 : 14} />}
          label={labels.links.repo}
        />
      )}
      {entry.liveUrl && (
        <Link
          href={entry.liveUrl}
          icon={<ExternalLink size={compact ? 12 : 14} />}
          label={labels.links.live}
        />
      )}
      {entry.playStoreUrl && (
        <Link
          href={entry.playStoreUrl}
          icon={<PlayStoreIcon size={compact ? 12 : 14} />}
          label={labels.links.play_store}
        />
      )}
      {entry.appStoreUrl && (
        <Link
          href={entry.appStoreUrl}
          icon={<AppleIcon size={compact ? 12 : 14} />}
          label={labels.links.app_store}
        />
      )}
    </>
  );
}

function CompactLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-muted transition-colors hover:text-accent"
    >
      <span aria-hidden>{icon}</span>
      {label}
    </a>
  );
}

function FullLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-4 py-2 text-sm text-fg transition-colors hover:border-accent hover:text-accent"
    >
      <span aria-hidden>{icon}</span>
      {label}
    </a>
  );
}

function ShowcaseModal({
  entry,
  labels,
  onClose,
}: {
  entry: Showcase;
  labels: ShowcaseLabels;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={entry.title}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
      style={{
        backgroundColor: "rgba(1, 12, 31, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-border bg-bg-elevated shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={labels.modal.close}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg/80 text-fg backdrop-blur transition-colors hover:border-accent hover:text-accent"
        >
          <X size={16} />
        </button>

        {/* Image */}
        {entry.image && (
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-bg">
            <Image
              src={entry.image}
              alt={entry.title}
              fill
              sizes="(min-width: 1024px) 900px, 100vw"
              className="object-cover"
              unoptimized
              priority
            />
            {entry.featured && (
              <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full border border-accent/40 bg-bg/80 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.15em] text-accent backdrop-blur">
                <Star size={12} fill="currentColor" />
                {labels.featured}
              </span>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
            {entry.year} · {labels.types[entry.type]}
          </p>
          <h2 className="mt-3 font-sans text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            {entry.title}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-fg-muted">
            {entry.description}
          </p>

          {/* Tags + stack */}
          {(entry.tags.length > 0 || entry.stack.length > 0) && (
            <div className="mt-6 space-y-3">
              {entry.tags.length > 0 && (
                <div>
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                </div>
              )}
              {entry.stack.length > 0 && (
                <div>
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
                    Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.stack.map((s) => (
                      <Tag key={s}>{s}</Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          {(entry.repoUrl ||
            entry.liveUrl ||
            entry.playStoreUrl ||
            entry.appStoreUrl) && (
            <div className="mt-8 flex flex-wrap gap-2 border-t border-border-subtle pt-6">
              <LinkRow entry={entry} labels={labels} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
