import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import { getAllProjects, type ProjectLocale } from "@/lib/projects";

const HOME_LIMIT = 4;

export async function Work() {
  const t = await getTranslations("work");
  const locale = (await getLocale()) as ProjectLocale;
  const all = getAllProjects(locale);
  const teaser = all.slice(0, HOME_LIMIT);
  const hasMore = all.length > HOME_LIMIT;

  return (
    <Section id="work">
      <Reveal>
        <h2 className="font-sans text-4xl font-bold leading-[1.05] tracking-tight text-accent sm:text-5xl md:text-6xl">
          {t("eyebrow")}
        </h2>
        <p className="mt-4 max-w-2xl text-base text-fg-muted sm:text-lg">
          {t("title")}
        </p>
        <p className="mt-3 max-w-2xl text-sm text-fg-subtle">{t("intro")}</p>
      </Reveal>

      <Reveal stagger={0.1} y={32}>
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {teaser.map((project, i) => (
            <Link
              key={project.slug}
              href={`/work/${project.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-bg-elevated p-8 transition-all duration-300 hover:border-accent hover:shadow-[0_12px_40px_-12px] hover:shadow-accent/25"
            >
              <p className="font-mono text-xs text-accent">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-fg transition-colors duration-300 group-hover:text-accent sm:text-2xl">
                {project.title}
              </h3>
              <p className="mt-2 font-mono text-xs text-fg-subtle">
                {project.client} · {project.period}
              </p>
              <p className="mt-5 text-base leading-relaxed text-fg-muted">
                {project.summary}
              </p>
              <span className="mt-8 inline-flex items-center gap-1.5 text-sm text-accent transition-transform group-hover:translate-x-1">
                {t("view_case")}
                <ArrowUpRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </Reveal>

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <Link
            href="/work"
            className="group inline-flex h-12 items-center gap-3 rounded-full border border-border bg-bg-elevated px-6 font-mono text-xs uppercase tracking-[0.15em] text-fg transition-colors hover:border-accent hover:text-accent"
          >
            {t("view_all", { count: all.length })}
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      )}
    </Section>
  );
}
