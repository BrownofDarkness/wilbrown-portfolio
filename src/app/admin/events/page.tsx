import Image from "next/image";
import Link from "next/link";
import { Camera, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteEventAction } from "@/app/actions/event";
import { AdminNav } from "@/components/admin/AdminNav";
import { getAllEvents } from "@/lib/event";
import {
  ROLE_LABELS_FR,
  formatEventMonth,
  getCoverPhoto,
} from "@/lib/event-schema";

export default function AdminEventsPage() {
  const entries = getAllEvents();
  const adminLocale = "fr";

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <AdminNav />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-3xl font-bold tracking-tight text-accent sm:text-4xl">
            Évènements
          </h1>
          <p className="mt-2 font-mono text-xs text-fg-muted">
            {entries.length} évènement{entries.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 font-medium text-navy-dark transition-colors hover:bg-accent-soft"
        >
          <Plus size={14} />
          Nouvel évènement
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-border-subtle bg-bg-elevated/40 p-12 text-center">
          <p className="font-mono text-sm text-fg-muted">
            Aucun évènement pour l&apos;instant.
          </p>
          <Link
            href="/admin/events/new"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 font-medium text-navy-dark transition-colors hover:bg-accent-soft"
          >
            <Plus size={14} />
            Créer le premier
          </Link>
        </div>
      ) : (
        <div className="mt-10 overflow-hidden rounded-2xl border border-border-subtle">
          <table className="w-full">
            <thead className="bg-bg-elevated text-left font-mono text-[10px] uppercase tracking-[0.15em] text-fg-subtle">
              <tr>
                <th className="px-4 py-3">Cover</th>
                <th className="px-4 py-3">Évènement</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Photos</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-t border-border-subtle hover:bg-bg-elevated/50"
                >
                  <td className="px-4 py-3">
                    {(() => {
                      const cover = getCoverPhoto(entry);
                      return cover ? (
                        <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-bg-elevated">
                          <Image
                            src={cover}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-16 rounded-lg border border-dashed border-border-subtle" />
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-fg">
                      {entry.edition}
                      {entry.featured && (
                        <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.15em] text-accent">
                          ★ featured
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-fg-subtle">
                      {entry.name} · /{entry.slug}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-fg-muted">
                    {ROLE_LABELS_FR[entry.role]}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-fg-muted">
                    {formatEventMonth(entry.month, adminLocale)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-fg-muted">
                      <Camera size={12} />
                      {entry.photos.length}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/admin/events/${entry.id}/edit`}
                        aria-label="Éditer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-bg-elevated hover:text-accent"
                      >
                        <Pencil size={14} />
                      </Link>
                      <form action={deleteEventAction} className="inline">
                        <input type="hidden" name="id" value={entry.id} />
                        <button
                          type="submit"
                          aria-label="Supprimer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
