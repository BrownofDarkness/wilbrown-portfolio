import { getTranslations } from "next-intl/server";

/*
 * Skip-to-content link — first focusable element on the page so keyboard
 * users can bypass the nav. Hidden visually until focused (sr-only on body,
 * brand-tinted pill on focus). Targets #main-content set on the layout.
 */
export async function SkipLink() {
  const t = await getTranslations("common");
  return (
    <a
      href="#main-content"
      className="sr-only fixed left-3 top-3 z-[100] inline-flex h-10 items-center rounded-full border border-accent bg-bg px-4 font-mono text-xs uppercase tracking-[0.15em] text-accent shadow-lg focus:not-sr-only focus:outline-none focus-visible:not-sr-only"
    >
      {t("skip_to_content")}
    </a>
  );
}
