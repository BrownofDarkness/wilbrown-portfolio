import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CaseStudyLayout } from "@/components/case-study/CaseStudyLayout";
import { routing } from "@/i18n/routing";
import {
  getAdjacentProjects,
  getProjectMeta,
  getProjectSlugs,
} from "@/lib/projects";

/*
 * Static map of MDX modules — Turbopack/webpack resolve these at build time.
 * Adding a new project: drop the file in src/content/projects/, add the entry here.
 */
const PROJECT_MODULES = {
  lumidata: () => import("@/content/projects/lumidata.mdx"),
  snmp: () => import("@/content/projects/snmp.mdx"),
  quickshift: () => import("@/content/projects/quickshift.mdx"),
  n8n: () => import("@/content/projects/n8n.mdx"),
} as const;

type ProjectSlug = keyof typeof PROJECT_MODULES;

export function generateStaticParams() {
  const slugs = getProjectSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const meta = getProjectMeta(slug);
  if (!meta) notFound();

  const loader = PROJECT_MODULES[slug as ProjectSlug];
  if (!loader) notFound();
  const { default: MDXContent } = await loader();

  const { prev, next } = getAdjacentProjects(slug);
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
    >
      <MDXContent />
    </CaseStudyLayout>
  );
}
