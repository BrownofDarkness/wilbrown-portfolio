import "server-only";
import { getDb } from "./db";
import type { Event, EventInput, EventRole } from "./event-schema";

export * from "./event-schema";

type EventRow = {
  id: number;
  slug: string;
  name: string;
  edition: string;
  role: EventRole;
  month: string;
  location: string;
  description: string;
  event_url: string | null;
  photos: string;
  cover_photo: string | null;
  featured: number;
  created_at: string;
  updated_at: string;
};

function safeParseStringArray(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function rowToEvent(row: EventRow): Event {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    edition: row.edition,
    role: row.role,
    month: row.month,
    location: row.location,
    description: row.description,
    eventUrl: row.event_url,
    photos: safeParseStringArray(row.photos),
    coverPhoto: row.cover_photo,
    featured: row.featured === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getAllEvents(): Event[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM event
       ORDER BY featured DESC, month DESC, created_at DESC`,
    )
    .all() as EventRow[];
  return rows.map(rowToEvent);
}

export function getEventById(id: number): Event | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM event WHERE id = ?")
    .get(id) as EventRow | undefined;
  return row ? rowToEvent(row) : null;
}

export function createEvent(input: EventInput): Event {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO event (
        slug, name, edition, role, month, location, description,
        event_url, photos, cover_photo, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.slug,
      input.name,
      input.edition,
      input.role,
      input.month,
      input.location,
      input.description,
      input.eventUrl,
      JSON.stringify(input.photos),
      input.coverPhoto,
      input.featured ? 1 : 0,
    );
  const created = getEventById(Number(result.lastInsertRowid));
  if (!created) throw new Error("Failed to read back created event");
  return created;
}

export function updateEvent(id: number, input: EventInput): Event {
  const db = getDb();
  const result = db
    .prepare(
      `UPDATE event SET
        slug = ?, name = ?, edition = ?, role = ?, month = ?,
        location = ?, description = ?, event_url = ?, photos = ?,
        cover_photo = ?, featured = ?, updated_at = datetime('now')
      WHERE id = ?`,
    )
    .run(
      input.slug,
      input.name,
      input.edition,
      input.role,
      input.month,
      input.location,
      input.description,
      input.eventUrl,
      JSON.stringify(input.photos),
      input.coverPhoto,
      input.featured ? 1 : 0,
      id,
    );
  if (result.changes === 0) throw new Error(`Event ${id} not found`);
  const updated = getEventById(id);
  if (!updated) throw new Error(`Failed to read back event ${id}`);
  return updated;
}

export function deleteEvent(id: number): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM event WHERE id = ?").run(id);
  return result.changes > 0;
}
