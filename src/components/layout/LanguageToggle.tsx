"use client";

import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/*
 * Switches between locales while keeping the user on the SAME page.
 * From /en/work/lumidata, clicking FR goes to /work/lumidata (not /).
 * Uses next-intl's locale-aware <Link> with the `locale` prop, which
 * preserves the current pathname and just swaps the prefix.
 */
export function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const nextLocale =
    locale === routing.defaultLocale ? "en" : routing.defaultLocale;

  return (
    <Link
      href={pathname}
      locale={nextLocale}
      aria-label={`Switch to ${nextLocale === "en" ? "English" : "Français"}`}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 font-mono text-xs text-fg-muted transition-colors hover:border-accent hover:text-accent"
    >
      <Globe size={14} aria-hidden />
      <span>{t("language")}</span>
    </Link>
  );
}
