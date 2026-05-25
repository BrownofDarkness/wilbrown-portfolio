import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Phone } from "lucide-react";
import {
  GithubIcon,
  GitlabIcon,
  LinkedinIcon,
  WhatsappIcon,
  XIcon,
} from "@/components/icons/SocialIcons";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SITE } from "@/lib/constants";
import { ContactForm } from "./ContactForm";

const SOCIAL_LINKS = [
  { href: SITE.socials.github, icon: GithubIcon, label: "GitHub" },
  { href: SITE.socials.gitlab, icon: GitlabIcon, label: "GitLab" },
  { href: SITE.socials.linkedin, icon: LinkedinIcon, label: "LinkedIn" },
  { href: SITE.socials.twitter, icon: XIcon, label: "X (Twitter)" },
];

export async function Contact() {
  const t = await getTranslations("contact");
  const phoneIntl = t("phone_intl");

  return (
    <Section id="contact">
      <Reveal>
        <h2 className="font-sans text-4xl font-bold leading-[1.05] tracking-tight text-accent sm:text-5xl md:text-6xl">
          {t("eyebrow")}
        </h2>
        <p className="mt-4 max-w-2xl text-base text-fg-muted sm:text-lg">
          {t("title")}
        </p>
        <p className="mt-3 max-w-2xl text-sm text-fg-subtle">{t("intro")}</p>
      </Reveal>

      <div className="mt-16 grid gap-12 md:grid-cols-[1fr_1fr] md:gap-16">
        {/* Left column: direct channels (phone + whatsapp + socials) */}
        <Reveal y={24}>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
            {t("phone_label")}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href={`tel:+${phoneIntl}`}
              aria-label={`${t("call_label")} ${t("phone_value")}`}
              title={t("phone_value")}
              className="inline-flex items-center gap-2.5 rounded-full border border-border bg-bg-elevated px-4 py-2.5 text-sm text-fg-muted transition-colors hover:border-accent hover:text-accent"
            >
              <Phone size={16} aria-hidden />
              {t("call_label")}
            </a>
            <a
              href={`https://wa.me/${phoneIntl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full border border-border bg-bg-elevated px-4 py-2.5 text-sm text-fg-muted transition-colors hover:border-accent hover:text-accent"
            >
              <WhatsappIcon size={16} />
              {t("whatsapp_label")}
            </a>
          </div>

          <div className="mt-12">
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
        </Reveal>

        {/* Right column: contact form */}
        <Reveal y={24}>
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
            {t("form_title")}
          </p>
          <ContactForm
            labels={{
              name: t("form.name"),
              email: t("form.email"),
              subject: t("form.subject"),
              message: t("form.message"),
              submit: t("form.submit"),
              submitting: t("form.submitting"),
              success: t("form.success"),
              error: t("form.error"),
              errors: {
                name_too_short: t("form.errors.name_too_short"),
                email_invalid: t("form.errors.email_invalid"),
                message_too_short: t("form.errors.message_too_short"),
              },
            }}
          />
        </Reveal>
      </div>

      {/* Closing visual — Pose 5 (back introspection, cyan rim).
          Atmospheric end-of-page beat. Fades into the footer via gradient. */}
      <Reveal y={32}>
        <div className="relative mt-24 h-[280px] overflow-hidden rounded-2xl border border-border-subtle bg-bg-elevated sm:h-[360px]">
          <Image
            src="/avatars/avatar-05-back.jpeg"
            alt="Wilfried Brown — fin de journée"
            fill
            sizes="(min-width: 1024px) 1000px, 100vw"
            className="object-cover object-top"
            unoptimized
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent"
          />
        </div>
      </Reveal>
    </Section>
  );
}
