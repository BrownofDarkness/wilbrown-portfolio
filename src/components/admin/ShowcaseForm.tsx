"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import {
  saveShowcaseAction,
  type ShowcaseFormState,
} from "@/app/actions/showcase";
import {
  SHOWCASE_STATUSES,
  SHOWCASE_TYPES,
  STATUS_LABELS_FR,
  TYPE_LABELS_FR,
  type Showcase,
} from "@/lib/showcase-schema";
import { cn } from "@/lib/utils";

const initialState: ShowcaseFormState = { error: null };

const inputClass =
  "block w-full rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

const labelClass =
  "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-fg-muted";

const errorClass = "mt-1 font-mono text-[10px] text-red-400";

export function ShowcaseForm({ entry }: { entry?: Showcase }) {
  const [state, formAction, pending] = useActionState(
    saveShowcaseAction,
    initialState,
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    entry?.image ?? null,
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const err = (key: string) => state.fieldErrors?.[key];

  return (
    <form action={formAction} className="space-y-6">
      {entry && <input type="hidden" name="id" value={entry.id} />}

      {/* Top row: title + slug + year */}
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr_120px]">
        <div>
          <label htmlFor="title" className={labelClass}>
            Titre *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={entry?.title}
            className={inputClass}
          />
          {err("title") && <p className={errorClass}>{err("title")}</p>}
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
            placeholder="auto-from-title"
            className={inputClass}
          />
          {err("slug") && <p className={errorClass}>{err("slug")}</p>}
        </div>

        <div>
          <label htmlFor="year" className={labelClass}>
            Année *
          </label>
          <input
            id="year"
            name="year"
            type="number"
            required
            min={2000}
            max={2100}
            defaultValue={entry?.year ?? new Date().getFullYear()}
            className={inputClass}
          />
          {err("year") && <p className={errorClass}>{err("year")}</p>}
        </div>
      </div>

      {/* Type + status + featured */}
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="type" className={labelClass}>
            Type *
          </label>
          <select
            id="type"
            name="type"
            required
            defaultValue={entry?.type ?? "app"}
            className={inputClass}
          >
            {SHOWCASE_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS_FR[t]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>
            Statut *
          </label>
          <select
            id="status"
            name="status"
            required
            defaultValue={entry?.status ?? "live"}
            className={inputClass}
          >
            {SHOWCASE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS_FR[s]}
              </option>
            ))}
          </select>
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

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelClass}>
          Description courte *
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={3}
          defaultValue={entry?.description}
          className={cn(inputClass, "resize-y")}
          placeholder="1-2 phrases qui décrivent le projet"
        />
        {err("description") && (
          <p className={errorClass}>{err("description")}</p>
        )}
      </div>

      {/* Image upload + preview */}
      <div>
        <label htmlFor="image" className={labelClass}>
          Image {entry?.image && "(laisser vide pour garder l'actuelle)"}
        </label>
        <div className="flex flex-wrap items-start gap-4">
          {imagePreview && (
            <div className="relative h-32 w-44 overflow-hidden rounded-xl border border-border bg-bg-elevated">
              {imagePreview.startsWith("blob:") ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={imagePreview}
                  alt="Aperçu"
                  fill
                  sizes="176px"
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
          )}
          <input
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="block w-full max-w-md text-sm text-fg-muted file:mr-4 file:rounded-full file:border file:border-border file:bg-bg-elevated file:px-4 file:py-2 file:text-xs file:font-medium file:text-fg-muted hover:file:border-accent hover:file:text-accent"
          />
        </div>
        {err("image") && <p className={errorClass}>{err("image")}</p>}
      </div>

      {/* Links — 4 main */}
      <fieldset className="rounded-2xl border border-border-subtle bg-bg-elevated/40 p-4">
        <legend className="px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
          Liens
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="repoUrl" className={labelClass}>
              Repo (GitHub/GitLab)
            </label>
            <input
              id="repoUrl"
              name="repoUrl"
              type="url"
              defaultValue={entry?.repoUrl ?? ""}
              placeholder="https://github.com/…"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="liveUrl" className={labelClass}>
              Live (URL site)
            </label>
            <input
              id="liveUrl"
              name="liveUrl"
              type="url"
              defaultValue={entry?.liveUrl ?? ""}
              placeholder="https://…"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="playStoreUrl" className={labelClass}>
              Play Store (Android)
            </label>
            <input
              id="playStoreUrl"
              name="playStoreUrl"
              type="url"
              defaultValue={entry?.playStoreUrl ?? ""}
              placeholder="https://play.google.com/…"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="appStoreUrl" className={labelClass}>
              App Store (iOS)
            </label>
            <input
              id="appStoreUrl"
              name="appStoreUrl"
              type="url"
              defaultValue={entry?.appStoreUrl ?? ""}
              placeholder="https://apps.apple.com/…"
              className={inputClass}
            />
          </div>
        </div>
      </fieldset>

      {/* Tags + stack — comma-separated */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tags" className={labelClass}>
            Tags (séparés par virgule)
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            defaultValue={entry?.tags.join(", ")}
            placeholder="mobile, ia, weather"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="stack" className={labelClass}>
            Stack (séparés par virgule)
          </label>
          <input
            id="stack"
            name="stack"
            type="text"
            defaultValue={entry?.stack.join(", ")}
            placeholder="Flutter, Firebase, OpenWeather"
            className={inputClass}
          />
        </div>
      </div>

      {/* General error */}
      {state.error && (
        <p className="font-mono text-xs text-red-400" role="alert">
          {state.error}
        </p>
      )}

      {/* Actions */}
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
          href="/admin"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 text-sm text-fg-muted transition-colors hover:border-accent hover:text-accent"
        >
          <X size={14} />
          Annuler
        </Link>
      </div>
    </form>
  );
}
