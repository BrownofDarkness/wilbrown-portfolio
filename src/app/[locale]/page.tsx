import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionDots } from "@/components/layout/SectionDots";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Events } from "@/components/sections/Events";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Showcase } from "@/components/sections/Showcase";
import { Stack } from "@/components/sections/Stack";
import { Work } from "@/components/sections/Work";
import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  const canonical = locale === routing.defaultLocale ? "/" : `/${locale}`;
  const ogLocale = locale === "fr" ? "fr_FR" : "en_US";
  const altLocale = locale === "fr" ? "en_US" : "fr_FR";

  return {
    title: t("home_title"),
    description: t("home_description"),
    keywords: t("home_keywords"),
    alternates: {
      canonical,
      languages: {
        fr: "/",
        en: "/en",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      alternateLocale: [altLocale],
      siteName: SITE.name,
      title: t("home_title"),
      description: t("home_description"),
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: t("home_title"),
      description: t("home_description"),
      creator: SITE.twitter,
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Work />
      <Showcase />
      <Events />
      <Stack />
      <Contact />
      <SectionDots />
    </>
  );
}
