import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import { getAllEvents } from "@/lib/event";
import { EventGrid } from "./EventGrid";

const HOME_LIMIT = 4;

export async function Events() {
  const t = await getTranslations("events");
  const all = getAllEvents();
  const teaser = all.slice(0, HOME_LIMIT);
  const hasMore = all.length > HOME_LIMIT;

  return (
    <Section id="events">
      <Reveal>
        <h2 className="font-sans text-4xl font-bold leading-[1.05] tracking-tight text-accent sm:text-5xl md:text-6xl">
          {t("eyebrow")}
        </h2>
        <p className="mt-4 max-w-2xl text-base text-fg-muted sm:text-lg">
          {t("title")}
        </p>
        <p className="mt-3 max-w-2xl text-sm text-fg-subtle">{t("intro")}</p>
      </Reveal>

      <EventGrid entries={teaser} />

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <Link
            href="/events"
            className="group inline-flex h-12 items-center gap-3 rounded-full border border-border bg-bg-elevated px-6 font-mono text-xs uppercase tracking-[0.15em] text-fg transition-colors hover:border-accent hover:text-accent"
          >
            {t("view_all", { count: all.length })}
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      )}
    </Section>
  );
}
