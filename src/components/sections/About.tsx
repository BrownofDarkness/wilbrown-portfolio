import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { Tag } from "@/components/ui/Tag";

export async function About() {
  const t = await getTranslations("about");
  const bioLines = t.raw("bio_lines") as string[];

  return (
    <Section id="about">
      <Eyebrow>{t("eyebrow")}</Eyebrow>
      <h2 className="mt-4 max-w-2xl font-sans text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl md:text-5xl">
        {t("title")}
      </h2>

      <div className="mt-16 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-16">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-bg-elevated">
          <Image
            src="/avatars/avatar-03-standing-thoughtful.jpeg"
            alt="Wilfried Brown — portrait illustré"
            fill
            sizes="(min-width: 768px) 30vw, 100vw"
            className="object-cover"
          />
        </div>

        <div>
          <div className="space-y-5 text-base leading-relaxed text-fg sm:text-lg">
            {bioLines.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          <div className="mt-12">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
              {t("stack_label")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Tag>{t("stack.mobile")}</Tag>
              <Tag>{t("stack.backend")}</Tag>
              <Tag>{t("stack.infra")}</Tag>
              <Tag>{t("stack.ia")}</Tag>
            </div>
          </div>

          <div className="mt-12">
            <Button href="#work" variant="ghost">
              {t("cta")}
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
