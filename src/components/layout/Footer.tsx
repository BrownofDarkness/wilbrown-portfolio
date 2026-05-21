import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-border-subtle py-12 sm:py-16">
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-12">
          <div>
            <p className="text-sm text-fg">{t("tagline")}</p>
            <p className="mt-2 font-mono text-xs text-fg-subtle">
              {t("rights")}
            </p>
          </div>

          {/* Live data placeholders — Phase 5 fills these */}
          <div className="space-y-1 font-mono text-xs text-fg-subtle sm:text-right">
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
