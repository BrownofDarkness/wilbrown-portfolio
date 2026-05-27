import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/constants";
import { getAllProjects, type ProjectLocale } from "@/lib/projects";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "work" });
  const canonical =
    locale === routing.defaultLocale ? "/work" : `/${locale}/work`;
  const ogLocale = locale === "fr" ? "fr_FR" : "en_US";

  return {
    title: t("page_title"),
    description: t("intro"),
    alternates: {
      canonical,
      languages: {
        fr: "/work",
        en: "/en/work",
        "x-default": "/work",
      },
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      siteName: SITE.name,
      title: t("page_title"),
      description: t("intro"),
      url: canonical,
    },
  };
}

export default async function WorkIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("work");
  const projects = getAllProjects(locale as ProjectLocale);

  return (
    <main className="py-20 sm:py-28">
      <Container>
        <Link
          href="/#work"
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-fg-muted transition-colors hover:text-accent"
        >
          <ArrowLeft size={12} />
          {t("back_home")}
        </Link>

        <header className="mt-8 max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-sans text-4xl font-bold leading-[1.05] tracking-tight text-accent sm:text-5xl md:text-6xl">
            {t("page_title")}
          </h1>
          <p className="mt-4 text-base text-fg-muted sm:text-lg">{t("intro")}</p>
          <p className="mt-2 font-mono text-xs text-fg-subtle">
            {t("total_count", { count: projects.length })}
          </p>
        </header>

        <Reveal stagger={0.08} y={28}>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {projects.map((project, i) => (
              <Link
                key={project.slug}
                href={`/work/${project.slug}`}
                className="group flex flex-col rounded-2xl border border-border bg-bg-elevated p-8 transition-all duration-300 hover:border-accent hover:shadow-[0_12px_40px_-12px] hover:shadow-accent/25"
              >
                <p className="font-mono text-xs text-accent">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-3 text-xl font-semibold text-fg transition-colors duration-300 group-hover:text-accent sm:text-2xl">
                  {project.title}
                </h2>
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
      </Container>
    </main>
  );
}
