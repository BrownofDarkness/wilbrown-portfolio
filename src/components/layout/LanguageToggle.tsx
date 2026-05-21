import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Globe } from "lucide-react";

export async function LanguageToggle() {
  const locale = await getLocale();
  const t = await getTranslations("nav");
  const href = locale === "fr" ? "/en" : "/";

  return (
    <Link
      href={href}
      aria-label={`Switch to ${locale === "fr" ? "English" : "Français"}`}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 font-mono text-xs text-fg-muted transition-colors hover:border-accent hover:text-accent"
    >
      <Globe size={14} aria-hidden />
      <span>{t("language")}</span>
    </Link>
  );
}
