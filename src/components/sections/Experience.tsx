import { getTranslations } from "next-intl/server";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { Tag } from "@/components/ui/Tag";

const ENTRIES = [
  "freelance",
  "localhost",
  "ibaass",
  "coding_industry",
  "min_ext",
  "cnls",
  "yaknema",
] as const;

const CURRENT_KEYS: readonly string[] = ["freelance", "localhost"];

export async function Experience() {
  const t = await getTranslations("experience");

  return (
    <Section id="experience">
      <Eyebrow>{t("eyebrow")}</Eyebrow>
      <h2 className="mt-4 max-w-2xl font-sans text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl md:text-5xl">
        {t("title")}
      </h2>

      <ol className="mt-16 space-y-12 sm:space-y-14">
        {ENTRIES.map((key) => {
          const isCurrent = CURRENT_KEYS.includes(key);
          return (
            <li
              key={key}
              className="grid grid-cols-1 gap-4 border-l border-border-subtle pl-6 md:grid-cols-[200px_1fr] md:gap-10 md:border-l-0 md:pl-0"
            >
              <div>
                <p className="font-mono text-xs text-fg-subtle">
                  {t(`items.${key}.period`)}
                </p>
                {isCurrent && (
                  <Tag variant="accent" className="mt-3">
                    {t("current")}
                  </Tag>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-fg sm:text-xl">
                  {t(`items.${key}.company`)}
                </h3>
                <p className="mt-1 text-sm text-accent">
                  {t(`items.${key}.role`)}
                </p>
                <p className="mt-3 text-base leading-relaxed text-fg-muted">
                  {t(`items.${key}.summary`)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
