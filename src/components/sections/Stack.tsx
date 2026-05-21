import { getTranslations } from "next-intl/server";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";

const CATEGORIES = [
  "mobile",
  "backend",
  "infra",
  "observability",
  "ai",
  "tools",
] as const;

export async function Stack() {
  const t = await getTranslations("stack");

  return (
    <Section id="stack">
      <Eyebrow>{t("eyebrow")}</Eyebrow>
      <h2 className="mt-4 max-w-2xl font-sans text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl md:text-5xl">
        {t("title")}
      </h2>
      <p className="mt-6 max-w-2xl text-base text-fg-muted sm:text-lg">
        {t("intro")}
      </p>

      <div className="mt-16 grid gap-10 sm:grid-cols-2 md:gap-x-16 md:gap-y-12">
        {CATEGORIES.map((key) => (
          <div key={key} className="border-t border-border-subtle pt-6">
            <h3 className="mb-4 text-sm font-medium text-fg">
              {t(`categories.${key}.label`)}
            </h3>
            <p className="font-mono text-sm leading-relaxed text-fg-muted">
              {t(`categories.${key}.items`)}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
