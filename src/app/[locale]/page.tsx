import { setRequestLocale } from "next-intl/server";
import { SectionDots } from "@/components/layout/SectionDots";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Events } from "@/components/sections/Events";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Showcase } from "@/components/sections/Showcase";
import { Stack } from "@/components/sections/Stack";
import { Work } from "@/components/sections/Work";

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
