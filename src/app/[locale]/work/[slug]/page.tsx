import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CaseStudyLayout } from "@/components/case-study/CaseStudyLayout";
import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/constants";
import {
  getAdjacentProjects,
  getProjectMeta,
  getProjectSlugs,
  type ProjectLocale,
} from "@/lib/projects";

/*
 * Static map of MDX modules — Turbopack/webpack resolve these at build time.
 * Adding a new project: drop two files (slug.fr.mdx + slug.en.mdx) in
 * src/content/projects/, then add the entry here under both locales.
 */
const PROJECT_MODULES = {
  fr: {
    lumidata: () => import("@/content/projects/lumidata.fr.mdx"),
    snmp: () => import("@/content/projects/snmp.fr.mdx"),
    quickshift: () => import("@/content/projects/quickshift.fr.mdx"),
    n8n: () => import("@/content/projects/n8n.fr.mdx"),
  },
  en: {
    lumidata: () => import("@/content/projects/lumidata.en.mdx"),
    snmp: () => import("@/content/projects/snmp.en.mdx"),
    quickshift: () => import("@/content/projects/quickshift.en.mdx"),
    n8n: () => import("@/content/projects/n8n.en.mdx"),
  },
} as const;

type ProjectSlug = keyof (typeof PROJECT_MODULES)["fr"];

export function generateStaticParams() {
  const slugs = getProjectSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const meta = getProjectMeta(slug, locale as ProjectLocale);
  if (!meta) return {};

  const path = `/work/${slug}`;
  const canonical =
    locale === routing.defaultLocale ? path : `/${locale}${path}`;
  const ogLocale = locale === "fr" ? "fr_FR" : "en_US";

  return {
    title: meta.title,
    description: meta.summary,
    alternates: {
      canonical,
      languages: {
        fr: path,
        en: `/en${path}`,
        "x-default": path,
      },
    },
    openGraph: {
      type: "article",
      locale: ogLocale,
      siteName: SITE.name,
      title: meta.title,
      description: meta.summary,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.summary,
      creator: SITE.twitter,
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const projectLocale = (locale as ProjectLocale) ?? "fr";
  const meta = getProjectMeta(slug, projectLocale);
  if (!meta) notFound();

  // Pick the MDX loader for the requested locale; fall back to FR if the EN
  // translation is missing (e.g. a brand-new case study not yet translated).
  const localeMap =
    PROJECT_MODULES[projectLocale] ?? PROJECT_MODULES.fr;
  const loader = localeMap[slug as ProjectSlug] ?? PROJECT_MODULES.fr[slug as ProjectSlug];
  if (!loader) notFound();
  const { default: MDXContent } = await loader();

  const { prev, next } = getAdjacentProjects(slug, projectLocale);
  const t = await getTranslations("case_study");

  return (
    <CaseStudyLayout
      meta={meta}
      prev={prev}
      next={next}
      backLabel={t("back")}
      prevLabel={t("prev")}
      nextLabel={t("next")}
      confidentialLabel={t("confidential")}
      tocLabel={t("toc")}
    >
      <MDXContent />
    </CaseStudyLayout>
  );
}
