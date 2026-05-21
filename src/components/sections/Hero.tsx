import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section
      id="hero"
      className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden"
    >
      {/* Placeholder for 3D Network Constellation — Phase 3 replaces this layer */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--brand-navy-deep)_0%,_var(--brand-navy-dark)_60%)]"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -z-10 h-[50vh] w-[50vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.04] blur-3xl"
      />

      <Container>
        <div className="max-w-3xl">
          <Eyebrow>{t("eyebrow")}</Eyebrow>

          <h1 className="mt-6 font-sans text-4xl font-semibold leading-[1.05] tracking-tight text-fg sm:text-5xl md:text-6xl lg:text-7xl">
            {t("accroche.line1")}
            <br />
            {t("accroche.line2")}
            <br />
            <span className="text-accent">{t("accroche.line3")}</span>
          </h1>

          <p className="mt-10 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
            {t("bio")}
          </p>

          <p className="mt-4 font-mono text-xs text-fg-subtle">
            {t("location")}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button href="#work" variant="primary">
              {t("cta_primary")} →
            </Button>
            <Button href="#contact" variant="ghost">
              {t("cta_secondary")}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
