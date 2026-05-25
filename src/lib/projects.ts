import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "src/content/projects");
const SUPPORTED_LOCALES = ["fr", "en"] as const;
const DEFAULT_LOCALE = "fr";

export type ProjectLocale = (typeof SUPPORTED_LOCALES)[number];

export type ProjectMeta = {
  slug: string;
  order: number;
  title: string;
  client: string;
  period: string;
  role: string;
  summary: string;
  tags: string[];
  stack: string[];
  /** True when the work is under NDA (no product visuals / IP claim). */
  confidential: boolean;
  /** Content locale of THIS meta (may be the fallback locale if EN missing). */
  locale: ProjectLocale;
};

function fileFor(slug: string, locale: ProjectLocale): string {
  return path.join(CONTENT_DIR, `${slug}.${locale}.mdx`);
}

/**
 * Distinct project slugs across all locales. A project is counted once even
 * if it only has one locale variant.
 */
export function getProjectSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const slugs = new Set<string>();
  for (const file of fs.readdirSync(CONTENT_DIR)) {
    const match = /^(.+)\.(fr|en)\.mdx$/.exec(file);
    if (match) slugs.add(match[1]);
  }
  return [...slugs];
}

/**
 * Read frontmatter for a given (slug, locale). Falls back to the default
 * locale's variant if the requested one is missing — keeps the case study
 * visible in EN even when only the FR text exists.
 */
export function getProjectMeta(
  slug: string,
  locale: ProjectLocale = DEFAULT_LOCALE,
): ProjectMeta | null {
  let filePath = fileFor(slug, locale);
  let actualLocale: ProjectLocale = locale;
  if (!fs.existsSync(filePath)) {
    if (locale !== DEFAULT_LOCALE) {
      filePath = fileFor(slug, DEFAULT_LOCALE);
      actualLocale = DEFAULT_LOCALE;
    }
    if (!fs.existsSync(filePath)) return null;
  }
  const file = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(file);
  return { slug, ...data, locale: actualLocale } as ProjectMeta;
}

export function getAllProjects(
  locale: ProjectLocale = DEFAULT_LOCALE,
): ProjectMeta[] {
  return getProjectSlugs()
    .map((slug) => getProjectMeta(slug, locale))
    .filter((p): p is ProjectMeta => p !== null)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getAdjacentProjects(
  slug: string,
  locale: ProjectLocale = DEFAULT_LOCALE,
): {
  prev: ProjectMeta | null;
  next: ProjectMeta | null;
} {
  const all = getAllProjects(locale);
  const idx = all.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}
