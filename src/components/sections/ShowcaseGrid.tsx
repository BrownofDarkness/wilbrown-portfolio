"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Maximize2,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import {
  AppleIcon,
  GithubIcon,
  PlayStoreIcon,
} from "@/components/icons/SocialIcons";
import { Tag } from "@/components/ui/Tag";
import {
  SHOWCASE_TYPES,
  type Showcase,
  type ShowcaseOtherLink,
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Which types are actually present? Hide pills for empty types.
  const availableTypes = useMemo(() => {
    const set = new Set(entries.map((e) => e.type));
    return SHOWCASE_TYPES.filter((t) => set.has(t));
  }, [entries]);

  const visible = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.type === filter)),
    [entries, filter],
  );

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedIndex !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  const navigate = useCallback(
    (delta: number) => {
      setSelectedIndex((prev) => {
        if (prev === null) return prev;
        const next = (prev + delta + visible.length) % visible.length;
        return next;
      });
    },
    [visible.length],
  );

  // Keyboard nav: Escape closes, arrows navigate
  useEffect(() => {
    if (selectedIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      else if (e.key === "ArrowLeft") navigate(-1);
      else if (e.key === "ArrowRight") navigate(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex, navigate]);

  if (entries.length === 0) {
    return (
      <div className="mt-16 rounded-2xl border border-dashed border-border-subtle bg-bg-elevated/40 p-12 text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent/5">
          <Sparkles size={20} className="text-accent" aria-hidden />
        </div>
        <p className="mx-auto mt-5 max-w-md text-base text-fg-muted">
          {labels.empty}
        </p>
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
              onOpen={() => setSelectedIndex(i)}
            />
          );
        })}
      </div>

      {/* Lightbox modal */}
      {mounted &&
        selectedIndex !== null &&
        visible[selectedIndex] &&
        createPortal(
          <ShowcaseModal
            entry={visible[selectedIndex]}
            index={selectedIndex}
            total={visible.length}
            labels={labels}
            onNavigate={navigate}
            onClose={() => setSelectedIndex(null)}
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
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated transition-all duration-300 hover:border-accent hover:shadow-[0_12px_40px_-12px] hover:shadow-accent/25">
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
        <h3 className="mt-2 text-lg font-semibold text-fg transition-colors duration-300 group-hover:text-accent sm:text-xl">
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
            <CompactLinks entry={entry} labels={labels} />
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * Compact text-only link row used on the cards themselves. Stays
 * uppercase mono. Renders the 4 typed link fields. Cards keep things
 * minimal — full link set (incl. otherLinks) lives in the modal.
 */
function CompactLinks({
  entry,
  labels,
}: {
  entry: Showcase;
  labels: ShowcaseLabels;
}) {
  return (
    <>
      {entry.repoUrl && (
        <CompactLink
          href={entry.repoUrl}
          icon={<GithubIcon size={12} />}
          label={labels.links.repo}
        />
      )}
      {entry.liveUrl && (
        <CompactLink
          href={entry.liveUrl}
          icon={<ExternalLink size={12} />}
          label={labels.links.live}
        />
      )}
      {entry.playStoreUrl && (
        <CompactLink
          href={entry.playStoreUrl}
          icon={<PlayStoreIcon size={12} />}
          label={labels.links.play_store}
        />
      )}
      {entry.appStoreUrl && (
        <CompactLink
          href={entry.appStoreUrl}
          icon={<AppleIcon size={12} />}
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

/* ────────────────────────────────────────────────────────────────────
 * Modal — 2-column on desktop, single-column on mobile.
 * Prev/next chevrons + keyboard ← → navigate through the visible set.
 * CTA hierarchy: 1 primary (Live / Play / App / Repo) + N secondary
 * (repo + remaining stores + otherLinks). Tags inline mono, stack pills.
 * ──────────────────────────────────────────────────────────────────── */

type PrimaryActionData = {
  url: string;
  label: string;
  icon: React.ReactNode;
};

function getPrimaryAction(
  entry: Showcase,
  labels: ShowcaseLabels,
): PrimaryActionData | null {
  // Library: code is the headline. For everything else, live demo wins,
  // then stores, then repo.
  if (entry.type === "library" && entry.repoUrl) {
    return {
      url: entry.repoUrl,
      label: labels.links.repo,
      icon: <GithubIcon size={14} />,
    };
  }
  if (entry.liveUrl) {
    return {
      url: entry.liveUrl,
      label: labels.links.live,
      icon: <ExternalLink size={14} />,
    };
  }
  if (entry.playStoreUrl) {
    return {
      url: entry.playStoreUrl,
      label: labels.links.play_store,
      icon: <PlayStoreIcon size={14} />,
    };
  }
  if (entry.appStoreUrl) {
    return {
      url: entry.appStoreUrl,
      label: labels.links.app_store,
      icon: <AppleIcon size={14} />,
    };
  }
  if (entry.repoUrl) {
    return {
      url: entry.repoUrl,
      label: labels.links.repo,
      icon: <GithubIcon size={14} />,
    };
  }
  return null;
}

function getSecondaryActions(
  entry: Showcase,
  labels: ShowcaseLabels,
  primary: PrimaryActionData | null,
): { url: string; label: string; icon: React.ReactNode }[] {
  const list: { url: string; label: string; icon: React.ReactNode }[] = [];
  const isPrimary = (url: string | null) => url && primary && url === primary.url;

  if (entry.repoUrl && !isPrimary(entry.repoUrl)) {
    list.push({
      url: entry.repoUrl,
      label: labels.links.repo,
      icon: <GithubIcon size={14} />,
    });
  }
  if (entry.liveUrl && !isPrimary(entry.liveUrl)) {
    list.push({
      url: entry.liveUrl,
      label: labels.links.live,
      icon: <ExternalLink size={14} />,
    });
  }
  if (entry.playStoreUrl && !isPrimary(entry.playStoreUrl)) {
    list.push({
      url: entry.playStoreUrl,
      label: labels.links.play_store,
      icon: <PlayStoreIcon size={14} />,
    });
  }
  if (entry.appStoreUrl && !isPrimary(entry.appStoreUrl)) {
    list.push({
      url: entry.appStoreUrl,
      label: labels.links.app_store,
      icon: <AppleIcon size={14} />,
    });
  }
  for (const link of entry.otherLinks) {
    list.push({
      url: link.url,
      label: link.label,
      icon: <ExternalLink size={14} />,
    });
  }
  return list;
}

function ShowcaseModal({
  entry,
  index,
  total,
  labels,
  onNavigate,
  onClose,
}: {
  entry: Showcase;
  index: number;
  total: number;
  labels: ShowcaseLabels;
  onNavigate: (delta: number) => void;
  onClose: () => void;
}) {
  const t = useTranslations("showcase.modal");

  // Theme-aware backdrop matching MobileMenu + EventGrid lightbox.
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "light" ? "light" : "dark");
  }, []);
  const backdropColor =
    theme === "light" ? "rgba(242, 238, 232, 0.85)" : "rgba(1, 12, 31, 0.85)";

  const primary = getPrimaryAction(entry, labels);
  const secondary = getSecondaryActions(entry, labels, primary);
  const showNav = total > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={entry.title}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
      style={{
        backgroundColor: backdropColor,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* Prev chevron — outside the card, hidden on small screens */}
      {showNav && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(-1);
          }}
          aria-label={t("prev")}
          className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-elevated/80 text-fg backdrop-blur transition-colors hover:border-accent hover:text-accent md:inline-flex"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      <div
        className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-2xl md:grid-cols-[3fr_2fr]"
        style={{ maxHeight: "min(90vh, 720px)" }}
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

        {/* Image column */}
        {entry.image ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg md:aspect-auto md:h-full">
            <Image
              src={entry.image}
              alt={entry.title}
              fill
              sizes="(min-width: 1024px) 600px, 100vw"
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
        ) : (
          <div className="aspect-[4/3] w-full border-b border-border-subtle bg-bg md:aspect-auto md:h-full md:border-b-0 md:border-r" />
        )}

        {/* Content column (scrollable on overflow) */}
        <div className="flex max-h-[60vh] flex-col overflow-y-auto p-6 sm:p-8 md:max-h-none">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
            {entry.year} · {labels.types[entry.type]}
          </p>
          <h2 className="mt-3 font-sans text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            {entry.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-fg-muted sm:text-base">
            {entry.description}
          </p>

          {/* Tags — inline mono, comma-separated visually via · separator */}
          {entry.tags.length > 0 && (
            <div className="mt-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
                {t("tags_label")}
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-muted">
                {entry.tags.join(" · ")}
              </p>
            </div>
          )}

          {/* Stack — bordered pills, more visual weight */}
          {entry.stack.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
                {t("stack_label")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {entry.stack.map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          {(primary || secondary.length > 0) && (
            <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border-subtle pt-6">
              {primary && (
                <a
                  href={primary.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 font-medium text-navy-dark transition-colors hover:bg-accent-soft"
                >
                  <span aria-hidden>{primary.icon}</span>
                  {primary.label}
                </a>
              )}
              {secondary.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-bg-elevated px-4 text-sm text-fg transition-colors hover:border-accent hover:text-accent"
                >
                  <span aria-hidden>{link.icon}</span>
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Next chevron */}
      {showNav && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(1);
          }}
          aria-label={t("next")}
          className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-elevated/80 text-fg backdrop-blur transition-colors hover:border-accent hover:text-accent md:inline-flex"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Counter — bottom center on desktop, mobile gets a thumb strip
          equivalent later if needed */}
      {showNav && (
        <p
          className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle"
          onClick={(e) => e.stopPropagation()}
        >
          {t("counter", { current: index + 1, total })}
        </p>
      )}
    </div>
  );
}

// Re-export type for other components if needed
export type { ShowcaseOtherLink };
