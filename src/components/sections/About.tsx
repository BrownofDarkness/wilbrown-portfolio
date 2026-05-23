import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { Tag } from "@/components/ui/Tag";

export async function About() {
  const t = await getTranslations("about");
  const bioLines = t.raw("bio_lines") as string[];

  return (
    <Section id="about">
      <Reveal>
        <h2 className="font-sans text-4xl font-bold leading-[1.05] tracking-tight text-accent sm:text-5xl md:text-6xl">
          {t("eyebrow")}
        </h2>
        <p className="mt-4 max-w-2xl text-base text-fg-muted sm:text-lg">
          {t("title")}
        </p>
      </Reveal>

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
            <MagneticWrapper strength={0.3}>
              <Button href="#work" variant="ghost">
                {t("cta")}
              </Button>
            </MagneticWrapper>
          </div>
        </div>
      </div>
    </Section>
  );
}
