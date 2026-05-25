import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/*
 * Locale-aware navigation primitives. Use these instead of next/link or
 * next/navigation for any internal route that should preserve / switch the
 * current locale. With localePrefix: "as-needed":
 *   - FR (default) → /work/lumidata
 *   - EN → /en/work/lumidata
 * The wrappers inject /en automatically based on the active locale.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
