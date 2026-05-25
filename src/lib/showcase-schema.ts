/*
 * Pure types + constants for the Showcase domain — no DB, no server-only.
 * Safe to import from both client components and server modules.
 */

export const SHOWCASE_TYPES = [
  "app",
  "website",
  "tool",
  "library",
  "experiment",
  "workflow",
] as const;
export type ShowcaseType = (typeof SHOWCASE_TYPES)[number];

export const SHOWCASE_STATUSES = [
  "live",
  "archived",
  "wip",
  "sunset",
] as const;
export type ShowcaseStatus = (typeof SHOWCASE_STATUSES)[number];

export type ShowcaseOtherLink = { label: string; url: string };

export type Showcase = {
  id: number;
  slug: string;
  title: string;
  type: ShowcaseType;
  description: string;
  image: string | null;
  repoUrl: string | null;
  liveUrl: string | null;
  playStoreUrl: string | null;
  appStoreUrl: string | null;
  otherLinks: ShowcaseOtherLink[];
  tags: string[];
  stack: string[];
  year: number;
  featured: boolean;
  status: ShowcaseStatus;
  createdAt: string;
  updatedAt: string;
};

export type ShowcaseInput = Omit<Showcase, "id" | "createdAt" | "updatedAt">;

/* Display labels — DB stores English identifiers (stable), UI shows French.
 * Public bilingual section (4.4) will use messages/{fr,en}.json instead. */
export const TYPE_LABELS_FR: Record<ShowcaseType, string> = {
  app: "Application",
  website: "Site web",
  tool: "Outil",
  library: "Bibliothèque",
  experiment: "Expérimentation",
  workflow: "Workflow",
};

export const STATUS_LABELS_FR: Record<ShowcaseStatus, string> = {
  live: "En ligne",
  archived: "Archivé",
  wip: "En cours",
  sunset: "Déprécié",
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
