import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { BUILD_HASH, BUILD_TIME_ISO } from "@/lib/build-info";
import { SITE } from "@/lib/constants";

export async function Footer() {
  const t = await getTranslations("footer");
  const locale = await getLocale();

  const deployDate = new Date(BUILD_TIME_ISO);
  const formattedDeploy = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(deployDate);

  return (
    <footer className="border-t border-border-subtle py-12 sm:py-16">
      <Container>
        <div className="grid gap-10 sm:grid-cols-[auto_1fr_auto] sm:gap-12">
          {/* Signature avatar + identity */}
          <div className="flex items-center gap-4">
            <span className="relative inline-block h-14 w-14 overflow-hidden rounded-full border border-border-subtle bg-bg-elevated">
              <Image
                src="/avatars/avatar-08-headshot.jpeg"
                alt={SITE.fullName}
                fill
                sizes="56px"
                className="object-cover"
                unoptimized
              />
            </span>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-fg">
                {SITE.name}
              </p>
              <p className="mt-1 font-mono text-[10px] text-fg-subtle">
                {SITE.location}
              </p>
            </div>
          </div>

          <div className="self-center">
            <p className="text-sm text-fg-muted">{t("tagline")}</p>
            <p className="mt-2 font-mono text-xs text-fg-subtle">
              {t("rights")}
            </p>
          </div>

          {/* Operator signature — live status + last deploy + build hash.
              Reinforces the "I run the servers" positioning over a generic
              social-links footer. */}
          <div className="space-y-1.5 self-center font-mono text-xs text-fg-subtle sm:text-right">
            <p className="inline-flex items-center gap-2 sm:flex-row-reverse">
              <span className="relative inline-flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span>
                {t("uptime_label")} <span className="text-fg">{t("live")}</span>
              </span>
            </p>
            <p>
              {t("last_deploy_label")}{" "}
              <span className="text-fg-muted">{formattedDeploy}</span>
            </p>
            <p>
              {t("build_label")}{" "}
              <span className="text-fg-muted">{BUILD_HASH}</span>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
