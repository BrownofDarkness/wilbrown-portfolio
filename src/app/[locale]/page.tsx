import { setRequestLocale, getTranslations } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("hero");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-32">
      <div className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-muted">
          {t("eyebrow")}
        </p>
        <h1 className="mt-6 font-sans text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-fg">
          {t("accroche.line1")}
          <br />
          {t("accroche.line2")}
          <br />
          <span className="text-accent">{t("accroche.line3")}</span>
        </h1>
        <p className="mt-10 max-w-xl text-base sm:text-lg text-fg-muted leading-relaxed">
          {t("bio")}
        </p>
        <p className="mt-6 font-mono text-xs text-fg-subtle">{t("location")}</p>
      </div>
    </main>
  );
}
