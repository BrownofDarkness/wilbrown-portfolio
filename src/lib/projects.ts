import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "src/content/projects");

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
  /** Content locale — for Phase 2 we only have FR. */
  locale?: "fr" | "en";
};

export function getProjectSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getProjectMeta(slug: string): ProjectMeta | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const file = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(file);
  return { slug, ...data } as ProjectMeta;
}

export function getAllProjects(): ProjectMeta[] {
  return getProjectSlugs()
    .map((slug) => getProjectMeta(slug))
    .filter((p): p is ProjectMeta => p !== null)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getAdjacentProjects(slug: string): {
  prev: ProjectMeta | null;
  next: ProjectMeta | null;
} {
  const all = getAllProjects();
  const idx = all.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}
