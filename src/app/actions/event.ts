"use server";

import { mkdir, rm, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createEvent,
  deleteEvent,
  EVENT_ROLES,
  getEventById,
  slugifyEvent,
  updateEvent,
  type EventInput,
  type EventRole,
} from "@/lib/event";

const UPLOADS_DIR = join(process.cwd(), "public", "events", "uploads");
const UPLOADS_PUBLIC_PREFIX = "/events/uploads";
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const MAX_PHOTOS_PER_EVENT = 30;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const schema = z.object({
  slug: z.string().min(2).max(80),
  name: z.string().min(2).max(160),
  edition: z.string().min(2).max(200),
  role: z.enum(EVENT_ROLES),
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Mois invalide (attendu YYYY-MM)"),
  location: z.string().min(2).max(160),
  description: z.string().min(10).max(1500),
  eventUrl: z.union([z.url(), z.literal("")]).optional(),
  featured: z.string().optional(),
});

export type EventFormState = {
  error: string | null;
  fieldErrors?: Partial<Record<string, string>>;
};

async function processPhoto(
  file: File,
  slug: string,
  index: number,
): Promise<string> {
  const tag = `[event upload][photo ${index + 1}] "${file.name}"`;
  const sizeMB = (file.size / 1024 / 1024).toFixed(2);
  console.log(`${tag} start (${sizeMB}MB, ${file.type})`);

  if (file.size > MAX_UPLOAD_BYTES) {
    console.log(`${tag} REJECTED — file too large`);
    throw new Error(
      `Photo "${file.name}" trop lourde (${sizeMB}MB · max ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB)`,
    );
  }
  if (!ALLOWED_MIME.has(file.type)) {
    console.log(`${tag} REJECTED — mime not allowed`);
    throw new Error(`"${file.name}" : format ${file.type} non supporté (jpeg/png/webp)`);
  }

  const t0 = Date.now();
  const { default: sharp } = await import("sharp");
  const buf = Buffer.from(await file.arrayBuffer());
  console.log(`${tag} buffered in ${Date.now() - t0}ms`);

  const t1 = Date.now();
  const resized = await sharp(buf)
    .rotate()
    .resize(1600, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 90 })
    .toBuffer();
  console.log(
    `${tag} resized in ${Date.now() - t1}ms (${(resized.length / 1024).toFixed(0)}KB output)`,
  );

  const t2 = Date.now();
  const eventDir = join(UPLOADS_DIR, slug);
  await mkdir(eventDir, { recursive: true });
  const filename = `${Date.now()}-${index}.webp`;
  await writeFile(join(eventDir, filename), resized);
  console.log(`${tag} written to disk in ${Date.now() - t2}ms → ${filename}`);

  return `${UPLOADS_PUBLIC_PREFIX}/${slug}/${filename}`;
}

async function deletePhotoFile(publicPath: string) {
  if (!publicPath.startsWith(UPLOADS_PUBLIC_PREFIX)) return;
  const relative = publicPath.slice(UPLOADS_PUBLIC_PREFIX.length + 1);
  try {
    await unlink(join(UPLOADS_DIR, relative));
  } catch {
    /* best-effort */
  }
}

async function deleteEventFolder(slug: string) {
  try {
    await rm(join(UPLOADS_DIR, slug), { recursive: true, force: true });
  } catch {
    /* best-effort */
  }
}

export async function saveEventAction(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const rawId = formData.get("id");
  const id =
    typeof rawId === "string" && rawId !== "" && Number.isFinite(Number(rawId))
      ? Number(rawId)
      : undefined;

  const titleForSlug = String(formData.get("edition") ?? "");
  const raw = {
    slug:
      String(formData.get("slug") ?? "").trim() || slugifyEvent(titleForSlug),
    name: String(formData.get("name") ?? "").trim(),
    edition: String(formData.get("edition") ?? "").trim(),
    role: formData.get("role"),
    month: String(formData.get("month") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    eventUrl: String(formData.get("eventUrl") ?? "").trim(),
    featured: formData.get("featured"),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      error: "Validation échouée — corrige les champs marqués.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const isUpdate = id !== undefined && id > 0;
  const actionTag = `[event save] ${isUpdate ? `update id=${id}` : "create"} slug=${data.slug}`;

  const existingPhotos = formData.getAll("existingPhotos").map(String);
  const toDelete = new Set(formData.getAll("deletePhotos").map(String));
  const keptPhotos = existingPhotos.filter((p) => !toDelete.has(p));

  const newFiles = formData
    .getAll("photos")
    .filter((v): v is File => v instanceof File && v.size > 0);

  const totalMB = (
    newFiles.reduce((s, f) => s + f.size, 0) / 1024 / 1024
  ).toFixed(2);
  console.log(
    `${actionTag} — start (${newFiles.length} new photo(s), ${totalMB}MB total, ${keptPhotos.length} kept, ${toDelete.size} to delete)`,
  );

  const tAll = Date.now();
  let newPhotoUrls: string[] = [];
  try {
    newPhotoUrls = await Promise.all(
      newFiles.map((file, i) => processPhoto(file, data.slug, i)),
    );
    console.log(
      `${actionTag} — all ${newFiles.length} photo(s) processed in ${Date.now() - tAll}ms`,
    );
  } catch (e) {
    console.log(`${actionTag} — photo processing FAILED: ${e instanceof Error ? e.message : e}`);
    return {
      error: e instanceof Error ? e.message : "Upload photo échoué",
      fieldErrors: { photos: "Upload échoué" },
    };
  }

  const allPhotos = [...keptPhotos, ...newPhotoUrls].slice(
    0,
    MAX_PHOTOS_PER_EVENT,
  );

  // Resolve the chosen cover. The form sends either:
  //   - an existing URL: keep it if still in allPhotos
  //   - "new:N": index into newPhotoUrls (a photo being uploaded right now)
  //   - empty string: fallback to photos[0] at render time (stored as null)
  const coverRaw = String(formData.get("coverPhoto") ?? "").trim();
  let coverPhoto: string | null = null;
  if (coverRaw.startsWith("new:")) {
    const idx = Number(coverRaw.slice(4));
    if (Number.isFinite(idx) && newPhotoUrls[idx]) {
      coverPhoto = newPhotoUrls[idx];
    }
  } else if (coverRaw && allPhotos.includes(coverRaw)) {
    coverPhoto = coverRaw;
  }

  const input: EventInput = {
    slug: data.slug,
    name: data.name,
    edition: data.edition,
    role: data.role as EventRole,
    month: data.month,
    location: data.location,
    description: data.description,
    eventUrl: data.eventUrl || null,
    photos: allPhotos,
    coverPhoto,
    featured: data.featured === "on",
  };

  const tDB = Date.now();
  try {
    if (isUpdate) {
      updateEvent(id, input);
    } else {
      createEvent(input);
    }
    console.log(`${actionTag} — DB write ok in ${Date.now() - tDB}ms`);
  } catch (e) {
    console.log(`${actionTag} — DB write FAILED: ${e instanceof Error ? e.message : e}`);
    return {
      error: e instanceof Error ? e.message : "Erreur DB",
    };
  }

  if (toDelete.size > 0) {
    await Promise.all([...toDelete].map(deletePhotoFile));
    console.log(`${actionTag} — deleted ${toDelete.size} old photo file(s)`);
  }

  revalidatePath("/admin/events");
  revalidatePath("/", "layout");
  revalidatePath("/events");
  console.log(`${actionTag} — complete, redirecting`);
  redirect("/admin/events");
}

export async function deleteEventAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) return;
  const entry = getEventById(id);
  if (entry) {
    await deleteEventFolder(entry.slug);
  }
  deleteEvent(id);
  revalidatePath("/admin/events");
  revalidatePath("/", "layout");
  revalidatePath("/events");
}
