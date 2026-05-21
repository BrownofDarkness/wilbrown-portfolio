import { getTranslations } from "next-intl/server";
import {
  GithubIcon,
  GitlabIcon,
  LinkedinIcon,
  XIcon,
} from "@/components/icons/SocialIcons";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { SITE } from "@/lib/constants";

const SOCIAL_LINKS = [
  { href: SITE.socials.github, icon: GithubIcon, label: "GitHub" },
  { href: SITE.socials.gitlab, icon: GitlabIcon, label: "GitLab" },
  { href: SITE.socials.linkedin, icon: LinkedinIcon, label: "LinkedIn" },
  { href: SITE.socials.twitter, icon: XIcon, label: "X (Twitter)" },
];

export async function Contact() {
  const t = await getTranslations("contact");

  return (
    <Section id="contact">
      <Eyebrow>{t("eyebrow")}</Eyebrow>
      <h2 className="mt-4 max-w-2xl font-sans text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-5xl md:text-6xl">
        {t("title")}
      </h2>
      <p className="mt-6 max-w-2xl text-base text-fg-muted sm:text-lg">
        {t("intro")}
      </p>

      <div className="mt-16">
        <a
          href={`mailto:${t("email_value")}`}
          className="inline-block break-all font-sans text-2xl text-accent underline decoration-2 underline-offset-8 transition-colors hover:text-accent-soft sm:text-3xl md:text-4xl"
        >
          {t("email_value")}
        </a>
        <p className="mt-4 font-mono text-sm text-fg-muted">
          {t("phone_value")}
        </p>
      </div>

      <div className="mt-16">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
          {t("elsewhere")}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-fg-muted transition-colors hover:border-accent hover:text-accent"
            >
              <Icon size={18} aria-hidden />
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}
