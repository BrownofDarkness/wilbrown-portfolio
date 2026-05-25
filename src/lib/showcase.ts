import "server-only";
import { getDb } from "./db";
import type {
  Showcase,
  ShowcaseInput,
  ShowcaseOtherLink,
  ShowcaseStatus,
  ShowcaseType,
} from "./showcase-schema";

export * from "./showcase-schema";

type ShowcaseRow = {
  id: number;
  slug: string;
  title: string;
  type: ShowcaseType;
  description: string;
  image: string | null;
  repo_url: string | null;
  live_url: string | null;
  play_store_url: string | null;
  app_store_url: string | null;
  other_links: string | null;
  tags: string;
  stack: string;
  year: number;
  featured: number;
  status: ShowcaseStatus;
  created_at: string;
  updated_at: string;
};

function safeParseArray<T>(json: string | null, fallback: T[]): T[] {
  if (!json) return fallback;
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function rowToShowcase(row: ShowcaseRow): Showcase {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type,
    description: row.description,
    image: row.image,
    repoUrl: row.repo_url,
    liveUrl: row.live_url,
    playStoreUrl: row.play_store_url,
    appStoreUrl: row.app_store_url,
    otherLinks: safeParseArray<ShowcaseOtherLink>(row.other_links, []),
    tags: safeParseArray<string>(row.tags, []),
    stack: safeParseArray<string>(row.stack, []),
    year: row.year,
    featured: row.featured === 1,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getAllShowcase(): Showcase[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM showcase
       ORDER BY featured DESC, year DESC, created_at DESC`,
    )
    .all() as ShowcaseRow[];
  return rows.map(rowToShowcase);
}

export function getPublicShowcase(): Showcase[] {
  return getAllShowcase().filter(
    (s) => s.status === "live" || s.status === "archived",
  );
}

export function getShowcaseById(id: number): Showcase | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM showcase WHERE id = ?")
    .get(id) as ShowcaseRow | undefined;
  return row ? rowToShowcase(row) : null;
}

export function getShowcaseBySlug(slug: string): Showcase | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM showcase WHERE slug = ?")
    .get(slug) as ShowcaseRow | undefined;
  return row ? rowToShowcase(row) : null;
}

export function createShowcase(input: ShowcaseInput): Showcase {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO showcase (
        slug, title, type, description, image,
        repo_url, live_url, play_store_url, app_store_url, other_links,
        tags, stack, year, featured, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.slug,
      input.title,
      input.type,
      input.description,
      input.image,
      input.repoUrl,
      input.liveUrl,
      input.playStoreUrl,
      input.appStoreUrl,
      JSON.stringify(input.otherLinks),
      JSON.stringify(input.tags),
      JSON.stringify(input.stack),
      input.year,
      input.featured ? 1 : 0,
      input.status,
    );
  const created = getShowcaseById(Number(result.lastInsertRowid));
  if (!created) throw new Error("Failed to read back created showcase row");
  return created;
}

export function updateShowcase(id: number, input: ShowcaseInput): Showcase {
  const db = getDb();
  const result = db
    .prepare(
      `UPDATE showcase SET
        slug = ?, title = ?, type = ?, description = ?, image = ?,
        repo_url = ?, live_url = ?, play_store_url = ?, app_store_url = ?, other_links = ?,
        tags = ?, stack = ?, year = ?, featured = ?, status = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
    )
    .run(
      input.slug,
      input.title,
      input.type,
      input.description,
      input.image,
      input.repoUrl,
      input.liveUrl,
      input.playStoreUrl,
      input.appStoreUrl,
      JSON.stringify(input.otherLinks),
      JSON.stringify(input.tags),
      JSON.stringify(input.stack),
      input.year,
      input.featured ? 1 : 0,
      input.status,
      id,
    );
  if (result.changes === 0) throw new Error(`Showcase ${id} not found`);
  const updated = getShowcaseById(id);
  if (!updated) throw new Error(`Failed to read back showcase ${id}`);
  return updated;
}

export function deleteShowcase(id: number): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM showcase WHERE id = ?").run(id);
  return result.changes > 0;
}
