import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { getPublicShowcase } from "@/lib/showcase";
import { SHOWCASE_STATUSES, SHOWCASE_TYPES } from "@/lib/showcase-schema";
import {
  ShowcaseGrid,
  type ShowcaseLabels,
} from "./ShowcaseGrid";

export async function Showcase() {
  const t = await getTranslations("showcase");
  const entries = getPublicShowcase();

  const labels: ShowcaseLabels = {
    empty: t("empty"),
    featured: t("featured"),
    filter_all: t("filter_all"),
    types: Object.fromEntries(
      SHOWCASE_TYPES.map((type) => [type, t(`types.${type}`)]),
    ) as ShowcaseLabels["types"],
    statuses: Object.fromEntries(
      SHOWCASE_STATUSES.map((s) => [s, t(`status.${s}`)]),
    ) as ShowcaseLabels["statuses"],
    stack_label: t("stack_label"),
    links: {
      repo: t("links.repo"),
      live: t("links.live"),
      play_store: t("links.play_store"),
      app_store: t("links.app_store"),
    },
    modal: {
      close: t("modal.close"),
      visit: t("modal.visit"),
    },
  };

  return (
    <Section id="showcase">
      <Reveal>
        <h2 className="font-sans text-4xl font-bold leading-[1.05] tracking-tight text-accent sm:text-5xl md:text-6xl">
          {t("eyebrow")}
        </h2>
        <p className="mt-4 max-w-2xl text-base text-fg-muted sm:text-lg">
          {t("title")}
        </p>
        <p className="mt-3 max-w-2xl text-sm text-fg-subtle">{t("intro")}</p>
      </Reveal>

      <ShowcaseGrid entries={entries} labels={labels} />
    </Section>
  );
}
