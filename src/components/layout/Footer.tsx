import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/constants";

export async function Footer() {
  const t = await getTranslations("footer");

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

          {/* Live data placeholders — Phase 5 fills these */}
          <div className="space-y-1 self-center font-mono text-xs text-fg-subtle sm:text-right">
            <p>
              {t("uptime_label")}{" "}
              <span className="text-fg-muted">— phase 5</span>
            </p>
            <p>
              {t("last_deploy_label")}{" "}
              <span className="text-fg-muted">— phase 5</span>
            </p>
            <p>
              {t("build_label")}{" "}
              <span className="text-fg-muted">— phase 5</span>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
