"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import {
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Images,
  MapPin,
  Mic,
  Settings,
  Star,
  User,
  X,
} from "lucide-react";
import { formatEventMonth, getCoverPhoto, type Event, type EventRole } from "@/lib/event-schema";
import { cn } from "@/lib/utils";

const ROLE_ICONS: Record<EventRole, typeof User> = {
  attendee: User,
  speaker: Mic,
  organizer: Settings,
  mentor: Award,
};

type GalleryState = {
  event: Event;
  index: number;
} | null;

export function EventGrid({ entries }: { entries: Event[] }) {
  const t = useTranslations("events");
  const [gallery, setGallery] = useState<GalleryState>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = gallery ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [gallery]);

  useEffect(() => {
    if (!gallery) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGallery(null);
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gallery]);

  const navigate = (delta: number) => {
    setGallery((g) => {
      if (!g) return null;
      const len = g.event.photos.length;
      if (len === 0) return g;
      return { ...g, index: (g.index + delta + len) % len };
    });
  };

  if (entries.length === 0) {
    return (
      <div className="mt-16 rounded-2xl border border-dashed border-border-subtle bg-bg-elevated/40 p-12 text-center">
        <p className="font-mono text-sm text-fg-muted">{t("empty")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {entries.map((entry, i) => (
          <EventCard
            key={entry.id}
            entry={entry}
            number={String(i + 1).padStart(2, "0")}
            onOpenGallery={(index = 0) => setGallery({ event: entry, index })}
          />
        ))}
      </div>

      {mounted &&
        gallery &&
        createPortal(
          <GalleryLightbox
            event={gallery.event}
            index={gallery.index}
            onNavigate={navigate}
            onClose={() => setGallery(null)}
          />,
          document.body,
        )}
    </>
  );
}

function EventCard({
  entry,
  number,
  onOpenGallery,
}: {
  entry: Event;
  number: string;
  onOpenGallery: (index?: number) => void;
}) {
  const t = useTranslations("events");
  const locale = useLocale();
  const RoleIcon = ROLE_ICONS[entry.role];
  const cover = getCoverPhoto(entry);
  const dateDisplay = formatEventMonth(entry.month, locale);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-bg-elevated transition-colors hover:border-accent">
      <span
        aria-hidden
        className="pointer-events-none absolute right-4 top-3 z-0 font-mono text-7xl font-bold tracking-tighter text-fg/[0.06] sm:text-8xl"
      >
        {number}
      </span>

      {cover ? (
        <button
          type="button"
          onClick={() => onOpenGallery(0)}
          className="relative block aspect-[16/9] w-full overflow-hidden bg-bg"
          aria-label={`${entry.edition} — ${t("view_gallery")}`}
        >
          <Image
            src={cover}
            alt={entry.edition}
            fill
            sizes="(min-width: 1024px) 580px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          {entry.featured && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-accent/40 bg-bg/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-accent backdrop-blur">
              <Star size={10} fill="currentColor" />
              {t("featured")}
            </span>
          )}
          {entry.photos.length > 1 && (
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-bg/80 px-3 py-1.5 font-mono text-[11px] text-fg backdrop-blur">
              <Images size={12} />
              {t("photos_count", { count: entry.photos.length })}
            </span>
          )}
        </button>
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center border-b border-border-subtle bg-bg">
          <span className="font-mono text-xs text-fg-subtle">
            {t("no_photos")}
          </span>
        </div>
      )}

      <div className="relative flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-fg">{entry.name}</p>
            <p className="mt-1 text-sm text-accent">{entry.edition}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-accent">
            <RoleIcon size={11} />
            {t(`roles.${entry.role}`)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-fg-muted">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={11} />
            {dateDisplay}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={11} />
            {entry.location}
          </span>
        </div>

        <p className="mt-4 flex-1 text-sm leading-relaxed text-fg-muted">
          {entry.description}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border-subtle pt-4">
          {entry.eventUrl && (
            <a
              href={entry.eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-muted transition-colors hover:text-accent"
            >
              <ExternalLink size={12} />
              {t("view_event")}
            </a>
          )}
          {entry.photos.length > 0 && (
            <button
              type="button"
              onClick={() => onOpenGallery(0)}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.05em] text-fg-muted transition-colors hover:text-accent"
            >
              <Images size={12} />
              {t("view_gallery")}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function GalleryLightbox({
  event,
  index,
  onNavigate,
  onClose,
}: {
  event: Event;
  index: number;
  onNavigate: (delta: number) => void;
  onClose: () => void;
}) {
  const t = useTranslations("events");
  const locale = useLocale();
  const photos = event.photos;
  const current = photos[index];
  const total = photos.length;
  const dateDisplay = formatEventMonth(event.month, locale);

  const THUMB_WINDOW = 7;
  const thumbStart = Math.max(
    0,
    Math.min(index - Math.floor(THUMB_WINDOW / 2), total - THUMB_WINDOW),
  );
  const thumbnails = useMemo(
    () =>
      photos
        .map((url, i) => ({ url, i }))
        .slice(thumbStart, thumbStart + THUMB_WINDOW),
    [photos, thumbStart],
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={event.edition}
      className="fixed inset-0 z-[70] flex flex-col"
      style={{
        backgroundColor: "rgba(1, 12, 31, 0.94)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
      }}
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between border-b border-border-subtle/40 px-4 py-3 sm:px-6 sm:py-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0">
          <p className="truncate font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle">
            {event.name} · {dateDisplay}
          </p>
          <p className="mt-0.5 truncate font-sans text-base font-semibold text-fg sm:text-lg">
            {event.edition}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-xs text-fg-muted sm:inline-flex">
            {t("modal.counter", { current: index + 1, total })}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("modal.close")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-elevated text-fg transition-colors hover:border-accent hover:text-accent"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center px-3 py-6 sm:px-12"
        onClick={(e) => e.stopPropagation()}
      >
        {current && (
          <div className="relative h-full max-h-[70vh] w-full max-w-5xl">
            <Image
              src={current}
              alt={`${event.edition} — ${index + 1}/${total}`}
              fill
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="object-contain"
              unoptimized
              priority
              key={current}
            />
          </div>
        )}

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => onNavigate(-1)}
              aria-label={t("modal.prev")}
              className="absolute left-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-elevated/80 text-fg backdrop-blur transition-colors hover:border-accent hover:text-accent sm:left-6"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate(1)}
              aria-label={t("modal.next")}
              className="absolute right-2 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-elevated/80 text-fg backdrop-blur transition-colors hover:border-accent hover:text-accent sm:right-6"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div
          className="border-t border-border-subtle/40 px-4 py-3 sm:px-6 sm:py-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 overflow-x-auto">
            {thumbnails.map(({ url, i }) => (
              <button
                key={url}
                type="button"
                onClick={() => onNavigate(i - index)}
                aria-label={`Photo ${i + 1}`}
                className={cn(
                  "relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all",
                  i === index
                    ? "border-accent opacity-100"
                    : "border-border-subtle opacity-60 hover:opacity-100",
                )}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
          <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle sm:hidden">
            {t("modal.counter", { current: index + 1, total })}
          </p>
        </div>
      )}
    </div>
  );
}
