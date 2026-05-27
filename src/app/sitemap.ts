import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/constants";
import { getProjectSlugs } from "@/lib/projects";

/**
 * Build a locale-aware URL. With `localePrefix: "as-needed"` the default
 * locale (fr) lives at the root; other locales prefix the path.
 */
function localized(path: string, locale: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === routing.defaultLocale) return `${SITE.url}${clean}`;
  return `${SITE.url}/${locale}${clean === "/" ? "" : clean}`;
}

/**
 * Map of {locale → URL} for hreflang alternates on each entry. Helps search
 * engines surface the correct localized variant.
 */
function alternatesFor(path: string): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((loc) => [loc, localized(path, loc)]),
  );
}

const PUBLIC_PATHS = ["/", "/work", "/events"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const slugs = getProjectSlugs();

  const entries: MetadataRoute.Sitemap = [];

  // Home + section landings, one entry per locale
  for (const path of PUBLIC_PATHS) {
    for (const loc of routing.locales) {
      entries.push({
        url: localized(path, loc),
        lastModified: now,
        changeFrequency: path === "/" ? "weekly" : "monthly",
        priority: path === "/" ? 1.0 : 0.7,
        alternates: { languages: alternatesFor(path) },
      });
    }
  }

  // Case studies — one per slug × per locale
  for (const slug of slugs) {
    for (const loc of routing.locales) {
      const path = `/work/${slug}`;
      entries.push({
        url: localized(path, loc),
        lastModified: now,
        changeFrequency: "yearly",
        priority: 0.6,
        alternates: { languages: alternatesFor(path) },
      });
    }
  }

  return entries;
}
