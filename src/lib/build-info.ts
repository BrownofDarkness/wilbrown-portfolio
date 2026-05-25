import "server-only";
import { execSync } from "node:child_process";

/*
 * Build metadata baked into the bundle at `next build` time. Module-level
 * execSync runs once per process boot (in dev) or once at build (in prod —
 * Next.js evaluates the module while bundling, so the captured strings end
 * up as literal values in the production output).
 *
 * Safe fallbacks for environments without git (extracted tarball deploy):
 * env vars BUILD_HASH / BUILD_TIME override the git calls, then "dev" /
 * current time as last resort.
 */

function safeGit(cmd: string, fallback: string): string {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return fallback;
  }
}

export const BUILD_HASH: string =
  process.env.BUILD_HASH?.trim() ||
  safeGit("git rev-parse --short HEAD", "dev");

export const BUILD_TIME_ISO: string =
  process.env.BUILD_TIME?.trim() ||
  safeGit("git log -1 --format=%cI", new Date().toISOString());
