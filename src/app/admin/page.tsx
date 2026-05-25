import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteShowcaseAction } from "@/app/actions/showcase";
import { AdminNav } from "@/components/admin/AdminNav";
import { getAllShowcase } from "@/lib/showcase";
import {
  STATUS_LABELS_FR,
  TYPE_LABELS_FR,
} from "@/lib/showcase-schema";

const STATUS_COLORS: Record<string, string> = {
  live: "text-accent border-accent/40 bg-accent/10",
  archived: "text-fg-muted border-border bg-bg-elevated",
  wip: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
  sunset: "text-red-400 border-red-400/40 bg-red-400/10",
};

export default function AdminDashboard() {
  const entries = getAllShowcase();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <AdminNav />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-3xl font-bold tracking-tight text-accent sm:text-4xl">
            Showcase
          </h1>
          <p className="mt-2 font-mono text-xs text-fg-muted">
            {entries.length} projet{entries.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/showcase/new"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 font-medium text-navy-dark transition-colors hover:bg-accent-soft"
        >
          <Plus size={14} />
          Nouveau projet
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-border-subtle bg-bg-elevated/40 p-12 text-center">
          <p className="font-mono text-sm text-fg-muted">
            Aucun projet pour l&apos;instant.
          </p>
          <Link
            href="/admin/showcase/new"
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
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Titre</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Année</th>
                <th className="px-4 py-3">Statut</th>
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
                    {entry.image ? (
                      <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-bg-elevated">
                        <Image
                          src={entry.image}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-16 rounded-lg border border-dashed border-border-subtle" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-fg">
                      {entry.title}
                      {entry.featured && (
                        <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.15em] text-accent">
                          ★ featured
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-fg-subtle">
                      /{entry.slug}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-fg-muted">
                    {TYPE_LABELS_FR[entry.type]}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-fg-muted">
                    {entry.year}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${STATUS_COLORS[entry.status]}`}
                    >
                      {STATUS_LABELS_FR[entry.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/admin/showcase/${entry.id}/edit`}
                        aria-label="Éditer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-bg-elevated hover:text-accent"
                      >
                        <Pencil size={14} />
                      </Link>
                      <form action={deleteShowcaseAction} className="inline">
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
