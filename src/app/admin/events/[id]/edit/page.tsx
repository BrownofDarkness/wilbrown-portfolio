import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "@/components/admin/EventForm";
import { getEventById } from "@/lib/event";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = getEventById(Number(id));
  if (!entry) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-fg-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={12} />
        Retour
      </Link>

      <header className="mt-8 border-b border-border-subtle pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
          Évènements · Édition
        </p>
        <h1 className="mt-2 font-sans text-3xl font-bold tracking-tight text-accent sm:text-4xl">
          {entry.edition}
        </h1>
        <p className="mt-2 font-mono text-xs text-fg-subtle">
          {entry.name} · /{entry.slug}
        </p>
      </header>

      <div className="mt-10">
        <EventForm entry={entry} />
      </div>
    </main>
  );
}
