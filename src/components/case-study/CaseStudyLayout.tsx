import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Tag } from "@/components/ui/Tag";
import { Link } from "@/i18n/navigation";
import { type ProjectMeta } from "@/lib/projects";

type Props = {
  meta: ProjectMeta;
  prev: ProjectMeta | null;
  next: ProjectMeta | null;
  backLabel: string;
  prevLabel: string;
  nextLabel: string;
  confidentialLabel: string;
  children: ReactNode;
};

export function CaseStudyLayout({
  meta,
  prev,
  next,
  backLabel,
  prevLabel,
  nextLabel,
  confidentialLabel,
  children,
}: Props) {
  return (
    <article className="py-16 sm:py-24">
      <Container>
        {/* Back link */}
        <Link
          href="/#work"
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-fg-muted transition-colors hover:text-accent"
        >
          <ArrowLeft size={12} />
          {backLabel}
        </Link>

        {/* Header */}
        <header className="mt-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            {meta.client} · {meta.period}
          </p>
          <h1 className="mt-4 font-sans text-4xl font-bold leading-[1.05] tracking-tight text-fg sm:text-5xl md:text-6xl">
            {meta.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base text-fg-muted sm:text-lg">
            {meta.summary}
          </p>

          {/* Role + tags */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <Tag variant="accent">{meta.role}</Tag>
            {meta.tags?.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>

          {/* NDA banner */}
          {meta.confidential && (
            <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-4 py-2 font-mono text-xs text-fg-muted">
              <Lock size={12} className="text-accent" />
              {confidentialLabel}
            </p>
          )}
        </header>

        {/* Body — prose container */}
        <div className="mt-16 max-w-3xl">{children}</div>

        {/* Prev/Next nav */}
        <nav className="mt-24 grid gap-4 border-t border-border-subtle pt-8 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/work/${prev.slug}`}
              className="group rounded-2xl border border-border bg-bg-elevated p-6 transition-colors hover:border-accent"
            >
              <p className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
                <ArrowLeft size={12} />
                {prevLabel}
              </p>
              <p className="mt-3 text-base font-semibold text-fg transition-colors group-hover:text-accent sm:text-lg">
                {prev.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/work/${next.slug}`}
              className="group rounded-2xl border border-border bg-bg-elevated p-6 transition-colors hover:border-accent sm:text-right"
            >
              <p className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle sm:justify-end">
                {nextLabel}
                <ArrowRight size={12} />
              </p>
              <p className="mt-3 text-base font-semibold text-fg transition-colors group-hover:text-accent sm:text-lg">
                {next.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </Container>
    </article>
  );
}
