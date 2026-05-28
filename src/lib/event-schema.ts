/* Pure types + constants for the Event domain — safe to import client-side. */

export const EVENT_ROLES = [
  "attendee",
  "speaker",
  "organizer",
  "mentor",
] as const;
export type EventRole = (typeof EVENT_ROLES)[number];

export type Event = {
  id: number;
  slug: string;
  name: string;        // Organization / brand: "GDG Yaoundé", "IndabaX"
  edition: string;     // Specific occurrence: "DevFest Yaoundé 2024"
  role: EventRole;
  month: string;       // YYYY-MM — sortable, formatted to locale at render time
  location: string;
  description: string;
  eventUrl: string | null;
  photos: string[];    // Array of public URLs (e.g. /events/uploads/slug/01.webp)
  coverPhoto: string | null;  // Selected cover; null falls back to photos[0]
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EventInput = Omit<Event, "id" | "createdAt" | "updatedAt">;

export const ROLE_LABELS_FR: Record<EventRole, string> = {
  attendee: "Participant",
  speaker: "Speaker",
  organizer: "Organisateur",
  mentor: "Mentor",
};

export const ROLE_LABELS_EN: Record<EventRole, string> = {
  attendee: "Attendee",
  speaker: "Speaker",
  organizer: "Organizer",
  mentor: "Mentor",
};

export function slugifyEvent(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * formatEventMonth("2024-10", "fr") → "octobre 2024"
 * formatEventMonth("2024-10", "en") → "October 2024"
 */
export function formatEventMonth(month: string, locale: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return month;
  const y = Number(match[1]);
  const m = Number(match[2]);
  if (!Number.isFinite(y) || m < 1 || m > 12) return month;
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
    }).format(new Date(y, m - 1, 1));
  } catch {
    return month;
  }
}

export function yearFromMonth(month: string): number {
  const match = /^(\d{4})-\d{2}$/.exec(month);
  return match ? Number(match[1]) : new Date().getFullYear();
}

/**
 * True when the event month is the current month or later — used to
 * surface an "Upcoming" badge on event cards. Comparison is done at
 * month granularity so an event still happening this month counts.
 */
export function isUpcomingMonth(
  month: string,
  now: Date = new Date(),
): boolean {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return false;
  const eventKey = Number(match[1]) * 100 + Number(match[2]);
  const nowKey = now.getFullYear() * 100 + (now.getMonth() + 1);
  return eventKey >= nowKey;
}

/**
 * Resolves the cover photo to display: the explicitly-chosen `coverPhoto`
 * if it still exists in the photos array, otherwise the first photo,
 * otherwise null.
 */
export function getCoverPhoto(event: Pick<Event, "photos" | "coverPhoto">): string | null {
  if (event.coverPhoto && event.photos.includes(event.coverPhoto)) {
    return event.coverPhoto;
  }
  return event.photos[0] ?? null;
}
