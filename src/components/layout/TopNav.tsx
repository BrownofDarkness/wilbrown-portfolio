import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { LanguageToggle } from "./LanguageToggle";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";

export async function TopNav() {
  const t = await getTranslations("nav");

  const items = [
    { href: "#about", label: t("about") },
    { href: "#experience", label: t("experience") },
    { href: "#work", label: t("work") },
    { href: "#stack", label: t("stack") },
    { href: "#contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg/80 backdrop-blur-md">
      <Container>
        <nav className="flex h-16 items-center justify-between gap-6">
          {/* Brand mark — WB logo, swap white/color variant per theme */}
          <Link
            href="/"
            aria-label="Wilfried Brown"
            className="group inline-flex items-center"
          >
            <Image
              src="/logos/logo-white.without.png"
              alt="Wilfried Brown"
              width={56}
              height={56}
              priority
              unoptimized
              className="logo-dark-only h-12 w-auto transition-transform duration-300 group-hover:scale-110"
            />
            <Image
              src="/logos/logo-color-without-background.png"
              alt="Wilfried Brown"
              width={56}
              height={56}
              priority
              unoptimized
              className="logo-light-only h-12 w-auto transition-transform duration-300 group-hover:scale-110"
            />
          </Link>

          {/* Desktop section links */}
          <div className="hidden items-center gap-8 text-sm md:flex">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-fg-muted transition-colors hover:text-accent"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right utilities */}
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <MobileMenu items={items} />
          </div>
        </nav>
      </Container>
    </header>
  );
}
