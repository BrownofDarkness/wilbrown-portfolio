import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  GithubIcon,
  GitlabIcon,
  LinkedinIcon,
  XIcon,
} from "@/components/icons/SocialIcons";
import { HeroSceneClient } from "@/components/three/HeroSceneClient";
import { AvailabilityPill } from "@/components/ui/AvailabilityPill";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HeroTitleReveal } from "@/components/ui/HeroTitleReveal";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";
import { Reveal } from "@/components/ui/Reveal";
import { SITE } from "@/lib/constants";

const SOCIALS = [
  { href: SITE.socials.github, Icon: GithubIcon, label: "GitHub" },
  { href: SITE.socials.gitlab, Icon: GitlabIcon, label: "GitLab" },
  { href: SITE.socials.linkedin, Icon: LinkedinIcon, label: "LinkedIn" },
  { href: SITE.socials.twitter, Icon: XIcon, label: "X" },
];

type StackItem = { number: string; label: string };

export async function Hero() {
  const t = await getTranslations("hero");
  const stack = t.raw("stack") as StackItem[];

  return (
    <section
      id="hero"
      className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden pb-20 pt-16 sm:pb-24 sm:pt-20"
    >
      {/* Ambient cyan glows behind the 3D scene (visible as fallback before R3F mounts) */}
      <div
        aria-hidden
        className="absolute right-[-10%] top-1/2 -z-20 h-[60vh] w-[60vh] -translate-y-1/2 rounded-full bg-accent/[0.08] blur-3xl"
      />
      <div
        aria-hidden
        className="absolute left-[-10%] top-[15%] -z-20 h-[30vh] w-[30vh] rounded-full bg-accent/[0.05] blur-3xl"
      />

      {/* R3F Network Constellation — Phase 3 signature scene */}
      <HeroSceneClient />

      <Container>
        {/* Root-cause fix: grid-cols-1 explicitly sets template-columns: 1fr
            on mobile, so the LEFT column spans full Container width. Without
            it, lg:grid-cols-12 only kicks in at lg+, and the implicit grid
            below lg auto-sizes the column to its content max-width — which
            shrinks lg:col-span-7 to ~320px (the H1 width), breaking any
            full-width child like the avatar wrapper or the -mx-6 stack
            scroll-strip. */}
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:items-center lg:gap-10">
          {/* LEFT: content */}
          <div className="lg:col-span-7">
            {/* Mobile-only compact avatar — desktop shows it in the right
                column below. */}
            <div className="mb-8 flex justify-center lg:hidden">
              <Reveal mode="mount" delay={0.2} y={16}>
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-accent/20 bg-bg-elevated">
                  <Image
                    src="/avatars/avatar-01-hero.jpeg"
                    alt="Wilfried Brown — portrait illustré"
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized
                    priority
                  />
                </div>
              </Reveal>
            </div>

            <Reveal mode="mount" delay={0} y={12}>
              <div className="mb-6">
                <AvailabilityPill />
              </div>
            </Reveal>

            <Reveal mode="mount" delay={0.05} y={16}>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-fg-subtle">
                  [ 00 ]
                </span>
                <span
                  className="h-px w-8 bg-border-subtle"
                  aria-hidden
                />
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-fg-muted">
                  {t("intro_label")}
                </span>
              </div>
            </Reveal>

            <Reveal mode="mount" delay={0.08} y={16}>
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-accent">
                {t("role_label")}
              </p>
            </Reveal>

            <HeroTitleReveal
              firstName={t("name.first")}
              lastName={t("name.last")}
              className="mt-6 font-sans font-bold leading-[0.9] tracking-[-0.04em] text-fg text-[clamp(3.5rem,11vw,8rem)]"
            />

            <Reveal mode="mount" delay={0.7} y={20}>
              <div className="mt-10 max-w-xl text-base leading-[1.6] text-fg sm:text-lg">
                <p>{t("accroche.line1")}</p>
                <p>{t("accroche.line2")}</p>
                <p className="text-fg-muted">{t("accroche.line3")}</p>
              </div>
            </Reveal>

            <Reveal mode="mount" delay={0.85} y={16}>
              <p className="mt-6 max-w-xl font-mono text-xs leading-relaxed text-fg-subtle">
                {t("bio")}{" "}
                <span className="text-fg-muted">·</span> {t("location")}
              </p>
            </Reveal>

            {/* Mobile-only stack — mirrors the desktop pattern (number +
                rule + label) but stacked vertically so all 4 entries are
                visible without horizontal scrolling. */}
            <Reveal mode="mount" delay={0.95} y={16}>
              <ul className="mt-8 space-y-2.5 lg:hidden">
                {stack.map((item) => (
                  <li
                    key={item.number}
                    className="flex items-center gap-4 font-mono text-[11px]"
                  >
                    <span className="w-6 text-accent">{item.number}</span>
                    <span
                      className="h-px flex-1 bg-border-subtle"
                      aria-hidden
                    />
                    <span className="uppercase tracking-[0.15em] text-fg-muted">
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal mode="mount" delay={1} y={16}>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <MagneticWrapper strength={0.3}>
                  <Button href="#work" variant="primary">
                    {t("cta_primary")} →
                  </Button>
                </MagneticWrapper>
                <MagneticWrapper strength={0.3}>
                  <Button href="#contact" variant="ghost">
                    {t("cta_secondary")}
                  </Button>
                </MagneticWrapper>
              </div>
            </Reveal>

            <Reveal mode="mount" delay={1.15} y={12} stagger={0.06}>
              <div className="mt-10 flex items-center gap-3">
                {SOCIALS.map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-fg-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </Reveal>
          </div>

          {/* RIGHT: avatar + numbered stack */}
          <div className="hidden lg:col-span-5 lg:block">
            <Reveal mode="mount" delay={0.35} y={36}>
              <div className="relative">
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border-subtle bg-bg-elevated">
                  <Image
                    src="/avatars/avatar-01-hero.jpeg"
                    alt="Wilfried Brown — portrait illustré"
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                    unoptimized
                    priority
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-accent/10"
                  />
                </div>

                <ul className="mt-8 space-y-3">
                  {stack.map((item) => (
                    <li
                      key={item.number}
                      className="flex items-center gap-4 font-mono text-xs"
                    >
                      <span className="w-6 text-accent">{item.number}</span>
                      <span
                        className="h-px flex-1 bg-border-subtle"
                        aria-hidden
                      />
                      <span className="uppercase tracking-[0.15em] text-fg-muted">
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>

      {/* Scroll cue */}
      <a
        href="#about"
        aria-label={t("scroll_hint")}
        className="group absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-fg-subtle transition-colors hover:text-accent sm:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.4em]">
          {t("scroll_hint")}
        </span>
        <span className="animate-scroll-cue text-base" aria-hidden>
          ↓
        </span>
      </a>
    </section>
  );
}
