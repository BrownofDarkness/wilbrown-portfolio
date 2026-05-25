"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { Loader2, Save, Star, Trash2, X } from "lucide-react";
import {
  saveEventAction,
  type EventFormState,
} from "@/app/actions/event";
import {
  EVENT_ROLES,
  ROLE_LABELS_FR,
  formatEventMonth,
  type Event,
} from "@/lib/event-schema";
import { cn } from "@/lib/utils";

const initialState: EventFormState = { error: null };

const inputClass =
  "block w-full rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

const labelClass =
  "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-fg-muted";

const errorClass = "mt-1 font-mono text-[10px] text-red-400";

type NewPreview = { id: string; url: string; name: string; file: File };

function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const ADMIN_LOCALE = "fr";
const UPLOAD_SOFT_LIMIT_MB = 180; // a hair under serverActions.bodySizeLimit
const formatMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);

export function EventForm({ entry }: { entry?: Event }) {
  const [state, formAction, pending] = useActionState(
    saveEventAction,
    initialState,
  );
  const [existingPhotos] = useState<string[]>(entry?.photos ?? []);
  const [deletedPhotos, setDeletedPhotos] = useState<string[]>([]);
  const [newPreviews, setNewPreviews] = useState<NewPreview[]>([]);
  const [month, setMonth] = useState<string>(
    entry?.month ?? currentYearMonth(),
  );
  // Cover photo selector. Either an existing URL or "new:<index>" for a
  // freshly-uploaded preview. Empty string = auto-fallback to photos[0].
  const [cover, setCover] = useState<string>(entry?.coverPhoto ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep the file input's FileList synced with the previews so form submission
  // ships exactly what's previewed (DataTransfer is the standard way to set
  // input.files programmatically).
  const syncInputFiles = (previews: NewPreview[]) => {
    if (!fileInputRef.current) return;
    const dt = new DataTransfer();
    for (const p of previews) dt.items.add(p.file);
    fileInputRef.current.files = dt.files;
  };

  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setNewPreviews((prev) => {
      // Dedupe by file identity (name + mtime + size). Re-picking the same
      // file silently keeps the existing preview instead of duplicating.
      const map = new Map(prev.map((p) => [p.id, p]));
      for (const f of files) {
        const id = `${f.name}-${f.lastModified}-${f.size}`;
        if (map.has(id)) continue;
        map.set(id, {
          id,
          url: URL.createObjectURL(f),
          name: f.name,
          file: f,
        });
      }
      const next = Array.from(map.values());
      syncInputFiles(next);
      return next;
    });
  };

  const removeNewPreview = (id: string) => {
    setNewPreviews((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      const next = prev.filter((p) => p.id !== id);
      syncInputFiles(next);
      // If the removed preview was the cover, clear the cover ref
      const removedIdx = prev.findIndex((p) => p.id === id);
      if (cover === `new:${removedIdx}`) setCover("");
      return next;
    });
  };

  const markExistingDeleted = (url: string) => {
    setDeletedPhotos((prev) => {
      const next = prev.includes(url)
        ? prev.filter((p) => p !== url)
        : [...prev, url];
      // If we just flagged the current cover for deletion, drop it
      if (next.includes(url) && cover === url) setCover("");
      return next;
    });
  };

  // Effective cover for display indicator. Falls back to the first
  // non-deleted existing photo, then to the first new preview.
  const effectiveCover = (() => {
    if (cover.startsWith("new:")) {
      const idx = Number(cover.slice(4));
      if (newPreviews[idx]) return { kind: "new" as const, value: cover };
    }
    if (cover && existingPhotos.includes(cover) && !deletedPhotos.includes(cover)) {
      return { kind: "existing" as const, value: cover };
    }
    const firstKept = existingPhotos.find((p) => !deletedPhotos.includes(p));
    if (firstKept) return { kind: "existing" as const, value: firstKept };
    if (newPreviews[0]) return { kind: "new" as const, value: `new:0` };
    return null;
  })();

  const err = (key: string) => state.fieldErrors?.[key];

  return (
    <form action={formAction} className="space-y-6">
      {entry && <input type="hidden" name="id" value={entry.id} />}

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div>
          <label htmlFor="edition" className={labelClass}>
            Édition (titre principal) *
          </label>
          <input
            id="edition"
            name="edition"
            type="text"
            required
            defaultValue={entry?.edition}
            placeholder="DevFest Yaoundé 2024"
            className={inputClass}
          />
          {err("edition") && <p className={errorClass}>{err("edition")}</p>}
        </div>

        <div>
          <label htmlFor="slug" className={labelClass}>
            Slug (auto si vide)
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            defaultValue={entry?.slug}
            placeholder="auto-from-edition"
            className={inputClass}
          />
          {err("slug") && <p className={errorClass}>{err("slug")}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Organisation / Marque *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={entry?.name}
            placeholder="GDG Yaoundé, IndabaX…"
            className={inputClass}
          />
          {err("name") && <p className={errorClass}>{err("name")}</p>}
        </div>

        <div>
          <label htmlFor="role" className={labelClass}>
            Rôle *
          </label>
          <select
            id="role"
            name="role"
            required
            defaultValue={entry?.role ?? "attendee"}
            className={inputClass}
          >
            {EVENT_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS_FR[r]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="month" className={labelClass}>
            Mois de l&apos;évènement *
          </label>
          <input
            id="month"
            name="month"
            type="month"
            required
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            min="2000-01"
            max="2100-12"
            className={inputClass}
          />
          <p className="mt-1.5 font-mono text-[10px] text-fg-subtle">
            Affiché :{" "}
            <span className="text-accent">
              {formatEventMonth(month, ADMIN_LOCALE)}
            </span>
          </p>
          {err("month") && <p className={errorClass}>{err("month")}</p>}
        </div>

        <div>
          <label htmlFor="location" className={labelClass}>
            Lieu *
          </label>
          <input
            id="location"
            name="location"
            type="text"
            required
            defaultValue={entry?.location}
            placeholder="Yaoundé, Cameroun"
            className={inputClass}
          />
        </div>

        <label className="inline-flex h-[42px] cursor-pointer items-center gap-2 rounded-xl border border-border bg-bg-elevated px-4">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={entry?.featured ?? false}
            className="h-4 w-4 accent-accent"
          />
          <span className="font-mono text-xs text-fg">Featured</span>
        </label>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={entry?.description}
          className={cn(inputClass, "resize-y")}
          placeholder="Quelques phrases sur l'évènement, ton rôle, ce que tu en as retiré"
        />
        {err("description") && (
          <p className={errorClass}>{err("description")}</p>
        )}
      </div>

      <div>
        <label htmlFor="eventUrl" className={labelClass}>
          URL officielle de l&apos;évènement
        </label>
        <input
          id="eventUrl"
          name="eventUrl"
          type="url"
          defaultValue={entry?.eventUrl ?? ""}
          placeholder="https://devfest.gdg-yaounde.com/"
          className={inputClass}
        />
      </div>

      {/* Carry the chosen cover. If unset, server falls back to photos[0]. */}
      <input type="hidden" name="coverPhoto" value={cover} />

      {existingPhotos.length > 0 && (
        <div>
          <p className={labelClass}>
            Photos actuelles ({existingPhotos.length}) ·{" "}
            <span className="text-fg-subtle normal-case tracking-normal">
              clique l&apos;étoile pour choisir la photo de couverture
            </span>
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {existingPhotos.map((url) => {
              const flagged = deletedPhotos.includes(url);
              const isCover =
                effectiveCover?.kind === "existing" &&
                effectiveCover.value === url;
              return (
                <div
                  key={url}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-lg border-2 transition-all",
                    flagged
                      ? "border-red-400 opacity-40"
                      : isCover
                        ? "border-accent shadow-[0_0_0_2px] shadow-accent/30"
                        : "border-border-subtle",
                  )}
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="200px"
                    className="object-cover"
                    unoptimized
                  />
                  <input type="hidden" name="existingPhotos" value={url} />
                  {flagged && (
                    <input type="hidden" name="deletePhotos" value={url} />
                  )}

                  {/* Cover toggle (top-left) */}
                  {!flagged && (
                    <button
                      type="button"
                      onClick={() => setCover(isCover ? "" : url)}
                      aria-label={isCover ? "Photo de couverture" : "Définir comme couverture"}
                      title={isCover ? "Couverture actuelle" : "Définir comme couverture"}
                      className={cn(
                        "absolute left-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full border backdrop-blur transition-colors",
                        isCover
                          ? "border-accent bg-accent text-navy-dark"
                          : "border-border bg-bg/80 text-fg-muted hover:border-accent hover:text-accent",
                      )}
                    >
                      <Star size={12} fill={isCover ? "currentColor" : "none"} />
                    </button>
                  )}

                  {/* Cover badge */}
                  {isCover && (
                    <span className="absolute bottom-1.5 left-1.5 inline-flex items-center rounded-full border border-accent/40 bg-bg/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-accent backdrop-blur">
                      Cover
                    </span>
                  )}

                  {/* Delete toggle (top-right) */}
                  <button
                    type="button"
                    onClick={() => markExistingDeleted(url)}
                    aria-label={
                      flagged ? "Annuler suppression" : "Marquer pour suppression"
                    }
                    className={cn(
                      "absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full border backdrop-blur transition-colors",
                      flagged
                        ? "border-red-400 bg-red-400/20 text-red-200 hover:bg-red-400/40"
                        : "border-border bg-bg/80 text-fg-muted hover:border-red-400 hover:text-red-400",
                    )}
                  >
                    {flagged ? <X size={12} /> : <Trash2 size={12} />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {newPreviews.length > 0 && (
        <div>
          <p className={labelClass}>
            Nouvelles photos à ajouter ({newPreviews.length})
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {newPreviews.map((p, i) => {
              const coverRef = `new:${i}`;
              const isCover =
                effectiveCover?.kind === "new" &&
                effectiveCover.value === coverRef;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-lg border-2 transition-all",
                    isCover
                      ? "border-accent shadow-[0_0_0_2px] shadow-accent/30"
                      : "border-accent/60",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setCover(isCover ? "" : coverRef)}
                    aria-label={isCover ? "Photo de couverture" : "Définir comme couverture"}
                    title={isCover ? "Couverture actuelle" : "Définir comme couverture"}
                    className={cn(
                      "absolute left-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full border backdrop-blur transition-colors",
                      isCover
                        ? "border-accent bg-accent text-navy-dark"
                        : "border-border bg-bg/80 text-fg-muted hover:border-accent hover:text-accent",
                    )}
                  >
                    <Star size={12} fill={isCover ? "currentColor" : "none"} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeNewPreview(p.id)}
                    aria-label="Retirer cette photo"
                    title="Retirer"
                    className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-bg/80 text-fg-muted backdrop-blur transition-colors hover:border-red-400 hover:text-red-400"
                  >
                    <X size={12} />
                  </button>
                  <span className="absolute bottom-1.5 right-1.5 inline-flex items-center rounded-full border border-accent/40 bg-bg/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-accent backdrop-blur">
                    Nouveau
                  </span>
                  {isCover && (
                    <span className="absolute bottom-1.5 left-1.5 inline-flex items-center rounded-full border border-accent/40 bg-bg/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-accent backdrop-blur">
                      Cover
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="photos" className={labelClass}>
          Ajouter des photos (multi-sélection)
        </label>
        <input
          ref={fileInputRef}
          id="photos"
          name="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleAddPhotos}
          className="block w-full max-w-md text-sm text-fg-muted file:mr-4 file:rounded-full file:border file:border-border file:bg-bg-elevated file:px-4 file:py-2 file:text-xs file:font-medium file:text-fg-muted hover:file:border-accent hover:file:text-accent"
        />
        <p className="mt-1.5 font-mono text-[10px] text-fg-subtle">
          jpg/png/webp · max 20MB par photo · 30 photos max par évènement
        </p>
        {(() => {
          const totalBytes = newPreviews.reduce(
            (acc, p) => acc + p.file.size,
            0,
          );
          if (newPreviews.length === 0) return null;
          const totalMB = Number(formatMB(totalBytes));
          const over = totalMB > UPLOAD_SOFT_LIMIT_MB;
          return (
            <p
              className={cn(
                "mt-2 font-mono text-[10px]",
                over ? "text-red-400" : "text-fg-muted",
              )}
            >
              Total à envoyer : {totalMB} MB ({newPreviews.length} fichier
              {newPreviews.length > 1 ? "s" : ""}){" "}
              {over &&
                `· dépasse la limite serveur de ${UPLOAD_SOFT_LIMIT_MB}MB — split en plusieurs batches`}
            </p>
          );
        })()}
      </div>

      {state.error && (
        <p className="font-mono text-xs text-red-400" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-border-subtle pt-6">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 font-medium text-navy-dark transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Enregistrement…
            </>
          ) : (
            <>
              <Save size={14} />
              {entry ? "Mettre à jour" : "Créer"}
            </>
          )}
        </button>
        <Link
          href="/admin/events"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 text-sm text-fg-muted transition-colors hover:border-accent hover:text-accent"
        >
          <X size={14} />
          Annuler
        </Link>
      </div>
    </form>
  );
}
