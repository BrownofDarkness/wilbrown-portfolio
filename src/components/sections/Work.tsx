import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

const PROJECTS = ["lumidata", "snmp", "quickshift", "n8n"] as const;

export async function Work() {
  const t = await getTranslations("work");

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
          {PROJECTS.map((slug, i) => (
            <Link
              key={slug}
              href={`/work/${slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-bg-elevated p-8 transition-colors hover:border-accent"
            >
              <p className="font-mono text-xs text-accent">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-fg sm:text-2xl">
                {t(`projects.${slug}.title`)}
              </h3>
              <p className="mt-2 font-mono text-xs text-fg-subtle">
                {t(`projects.${slug}.client`)}
              </p>
              <p className="mt-5 text-base leading-relaxed text-fg-muted">
                {t(`projects.${slug}.summary`)}
              </p>
              <span className="mt-8 inline-flex items-center gap-1.5 text-sm text-accent transition-transform group-hover:translate-x-1">
                {t("view_case")}
                <ArrowUpRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
