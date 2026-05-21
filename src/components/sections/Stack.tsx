import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { SkillsConstellation } from "./SkillsConstellation";

export async function Stack() {
  const t = await getTranslations("stack");

  return (
    <Section id="stack">
      <h2 className="font-sans text-4xl font-bold leading-[1.05] tracking-tight text-accent sm:text-5xl md:text-6xl">
        {t("eyebrow")}
      </h2>
      <p className="mt-4 max-w-2xl text-base text-fg-muted sm:text-lg">
        {t("title")}
      </p>
      <p className="mt-3 max-w-2xl text-sm text-fg-subtle">{t("intro")}</p>

      <div className="mt-12">
        <SkillsConstellation />
      </div>
    </Section>
  );
}
