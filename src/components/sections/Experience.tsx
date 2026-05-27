import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
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
      <Reveal>
        <h2 className="font-sans text-4xl font-bold leading-[1.05] tracking-tight text-accent sm:text-5xl md:text-6xl">
          {t("eyebrow")}
        </h2>
        <p className="mt-4 max-w-2xl text-base text-fg-muted sm:text-lg">
          {t("title")}
        </p>
      </Reveal>

      <Reveal stagger={0.08} y={24}>
        <ol className="relative mt-16 space-y-12 sm:space-y-14">
          {/* Continuous vertical rail — drawn behind every entry's dot */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-3 left-[5px] top-3 w-px bg-border-subtle"
          />

          {ENTRIES.map((key) => {
            const isCurrent = CURRENT_KEYS.includes(key);
            return (
              <li
                key={key}
                className="relative grid grid-cols-1 gap-4 pl-8 md:grid-cols-[200px_1fr] md:gap-10"
              >
                {/* Brand dot on the rail. Pulses (animate-ping) for current
                    entries, solid filled for past ones. The ring-4 punches
                    it out of the rail line cleanly. */}
                <span
                  aria-hidden
                  className="absolute left-0 top-2 inline-flex h-3 w-3 items-center justify-center"
                >
                  {isCurrent && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
                  )}
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-accent ring-4 ring-bg" />
                </span>

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
      </Reveal>
    </Section>
  );
}
