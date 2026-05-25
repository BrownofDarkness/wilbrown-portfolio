import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { EventGrid } from "@/components/sections/EventGrid";
import { getAllEvents } from "@/lib/event";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  return {
    title: t("page_title"),
    description: t("intro"),
  };
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("events");
  const entries = getAllEvents();
  const homeHref = locale === "fr" ? "/#events" : `/${locale}/#events`;

  return (
    <main className="py-20 sm:py-28">
      <Container>
        <Link
          href={homeHref}
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-fg-muted transition-colors hover:text-accent"
        >
          <ArrowLeft size={12} />
          {t("back_home")}
        </Link>

        <header className="mt-8 max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-sans text-4xl font-bold leading-[1.05] tracking-tight text-accent sm:text-5xl md:text-6xl">
            {t("page_title")}
          </h1>
          <p className="mt-4 text-base text-fg-muted sm:text-lg">{t("intro")}</p>
          <p className="mt-2 font-mono text-xs text-fg-subtle">
            {t("total_count", { count: entries.length })}
          </p>
        </header>

        <div className="mt-12">
          <EventGrid entries={entries} />
        </div>
      </Container>
    </main>
  );
}
