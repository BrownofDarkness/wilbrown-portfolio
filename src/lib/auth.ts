import "server-only";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "wb_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET must be set and at least 32 chars long. Run `npm run secret`.",
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Read the admin bcrypt hash. Priority:
 *   1. .auth/password.hash file (preferred — no env escaping headaches)
 *   2. ADMIN_PASSWORD_HASH env var (caveat: dotenv-expand eats $ chars,
 *      requires backslash-escaping like \$2a\$12\$...)
 */
async function getStoredHash(): Promise<string | null> {
  try {
    const { readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const filePath = join(process.cwd(), ".auth", "password.hash");
    const content = await readFile(filePath, "utf-8");
    const trimmed = content.trim();
    if (trimmed) return trimmed;
  } catch {
    // File missing or unreadable — fall through to env
  }
  return process.env.ADMIN_PASSWORD_HASH?.trim() || null;
}

/**
 * Verify a plain-text password against the stored bcrypt hash.
 * Uses dynamic import so bcrypt doesn't bundle into Edge middleware.
 */
export async function verifyPassword(password: string): Promise<boolean> {
  const hash = await getStoredHash();
  if (!hash) {
    console.warn(
      "No admin password hash configured. Create .auth/password.hash or set ADMIN_PASSWORD_HASH.",
    );
    return false;
  }
  // Sanity: a valid bcrypt hash is exactly 60 chars and starts with $2a$/$2b$/$2y$.
  // If neither holds, the value is corrupted (almost certainly dotenv eating $).
  if (hash.length !== 60 || !/^\$2[aby]\$/.test(hash)) {
    console.error(
      `[auth] Stored hash looks malformed (length=${hash.length}, prefix=${JSON.stringify(hash.slice(0, 7))}). Expected 60 chars starting with $2a$/$2b$/$2y$. Likely cause: dotenv interpolation ate the $ characters — move the hash to .auth/password.hash instead.`,
    );
    return false;
  }
  const { default: bcrypt } = await import("bcryptjs");
  return bcrypt.compare(password, hash);
}

/** Sign a 7-day session JWT. */
export async function signSession(): Promise<string> {
  return new SignJWT({ sub: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

/** Verify a session JWT. Returns true if valid + not expired + sub === "admin". */
export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.sub === "admin";
  } catch {
    return false;
  }
}
