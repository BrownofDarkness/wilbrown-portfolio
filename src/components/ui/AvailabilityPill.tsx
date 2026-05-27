import { getLocale } from "next-intl/server";
import { SITE } from "@/lib/constants";

/*
 * "Available for work" status pill. Pulsing cyan dot + locale-aware label
 * driven by SITE.availability in constants.ts. Renders nothing if the
 * localized label is empty, so toggling availability is a one-liner edit
 * to constants instead of a code change.
 */
export async function AvailabilityPill() {
  const locale = await getLocale();
  const lang: "fr" | "en" = locale === "en" ? "en" : "fr";
  const label = SITE.availability?.[lang]?.trim();
  if (!label) return null;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-accent">
      <span className="relative inline-flex h-1.5 w-1.5" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      {label}
    </span>
  );
}
