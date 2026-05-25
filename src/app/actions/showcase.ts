"use server";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createShowcase,
  deleteShowcase,
  getShowcaseById,
  SHOWCASE_STATUSES,
  SHOWCASE_TYPES,
  slugify,
  updateShowcase,
  type ShowcaseInput,
  type ShowcaseStatus,
  type ShowcaseType,
} from "@/lib/showcase";

const UPLOADS_DIR = join(process.cwd(), "public", "showcase", "uploads");
const UPLOADS_PUBLIC_PREFIX = "/showcase/uploads";
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

// id is handled outside the schema to dodge z.coerce + optional friction
const schema = z.object({
  slug: z.string().min(2).max(80),
  title: z.string().min(2).max(160),
  type: z.enum(SHOWCASE_TYPES),
  description: z.string().min(10).max(800),
  repoUrl: z.union([z.url(), z.literal("")]).optional(),
  liveUrl: z.union([z.url(), z.literal("")]).optional(),
  playStoreUrl: z.union([z.url(), z.literal("")]).optional(),
  appStoreUrl: z.union([z.url(), z.literal("")]).optional(),
  tagsRaw: z.string().max(400).optional(),
  stackRaw: z.string().max(400).optional(),
  year: z.coerce.number().int().min(2000).max(2100),
  featured: z.string().optional(),
  status: z.enum(SHOWCASE_STATUSES),
});

export type ShowcaseFormState = {
  error: string | null;
  fieldErrors?: Partial<Record<string, string>>;
};

function parseList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function processImage(file: File, slug: string): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `Image trop lourde (max ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB)`,
    );
  }
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error(
      `Format ${file.type} non supporté (jpeg/png/webp uniquement)`,
    );
  }

  const { default: sharp } = await import("sharp");
  const buf = Buffer.from(await file.arrayBuffer());
  const resized = await sharp(buf)
    // .rotate() with no args auto-applies EXIF orientation then strips the
    // tag — without this, landscape phone photos arrive sideways because
    // sharp ignores EXIF by default. MUST come before resize.
    .rotate()
    .resize(1200, 900, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88 })
    .toBuffer();

  await mkdir(UPLOADS_DIR, { recursive: true });
  const filename = `${slug}-${Date.now()}.webp`;
  await writeFile(join(UPLOADS_DIR, filename), resized);
  return `${UPLOADS_PUBLIC_PREFIX}/${filename}`;
}

async function deleteImageFile(publicPath: string | null) {
  if (!publicPath || !publicPath.startsWith(UPLOADS_PUBLIC_PREFIX)) return;
  const filename = publicPath.slice(UPLOADS_PUBLIC_PREFIX.length + 1);
  try {
    await unlink(join(UPLOADS_DIR, filename));
  } catch {
    // best-effort cleanup
  }
}

export async function saveShowcaseAction(
  _prev: ShowcaseFormState,
  formData: FormData,
): Promise<ShowcaseFormState> {
  // Parse id separately (may be absent for create, present for update)
  const rawId = formData.get("id");
  const id =
    typeof rawId === "string" && rawId !== "" && Number.isFinite(Number(rawId))
      ? Number(rawId)
      : undefined;

  const raw = {
    slug: String(formData.get("slug") ?? "").trim() ||
      slugify(String(formData.get("title") ?? "")),
    title: String(formData.get("title") ?? "").trim(),
    type: formData.get("type"),
    description: String(formData.get("description") ?? "").trim(),
    repoUrl: String(formData.get("repoUrl") ?? "").trim(),
    liveUrl: String(formData.get("liveUrl") ?? "").trim(),
    playStoreUrl: String(formData.get("playStoreUrl") ?? "").trim(),
    appStoreUrl: String(formData.get("appStoreUrl") ?? "").trim(),
    tagsRaw: String(formData.get("tags") ?? ""),
    stackRaw: String(formData.get("stack") ?? ""),
    year: formData.get("year"),
    featured: formData.get("featured"),
    status: formData.get("status"),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Validation échouée — corrige les champs marqués.", fieldErrors };
  }

  const data = parsed.data;
  const isUpdate = id !== undefined && id > 0;

  // Handle image: keep existing if no new file uploaded
  let imagePath: string | null = null;
  const imageFile = formData.get("image") as File | null;
  const existing = isUpdate ? getShowcaseById(id) : null;

  if (imageFile && imageFile.size > 0) {
    try {
      imagePath = await processImage(imageFile, data.slug);
      // Clean up old image on successful upload of new one
      if (existing?.image) await deleteImageFile(existing.image);
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "Upload image échoué",
        fieldErrors: { image: "Upload échoué" },
      };
    }
  } else {
    imagePath = existing?.image ?? null;
  }

  const input: ShowcaseInput = {
    slug: data.slug,
    title: data.title,
    type: data.type as ShowcaseType,
    description: data.description,
    image: imagePath,
    repoUrl: data.repoUrl || null,
    liveUrl: data.liveUrl || null,
    playStoreUrl: data.playStoreUrl || null,
    appStoreUrl: data.appStoreUrl || null,
    otherLinks: existing?.otherLinks ?? [],
    tags: parseList(data.tagsRaw),
    stack: parseList(data.stackRaw),
    year: data.year,
    featured: data.featured === "on",
    status: data.status as ShowcaseStatus,
  };

  try {
    if (isUpdate) {
      updateShowcase(id, input);
    } else {
      createShowcase(input);
    }
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Erreur DB",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/", "layout");
  revalidatePath("/showcase");
  redirect("/admin");
}

export async function deleteShowcaseAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) return;
  const entry = getShowcaseById(id);
  if (entry?.image) await deleteImageFile(entry.image);
  deleteShowcase(id);
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  revalidatePath("/showcase");
}
