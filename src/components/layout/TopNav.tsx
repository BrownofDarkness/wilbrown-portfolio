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
    { href: "#work", label: t("work") },
    { href: "#stack", label: t("stack") },
    { href: "#contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-bg/80 backdrop-blur-md">
      <Container>
        <nav className="flex h-16 items-center justify-between gap-6">
          {/* Logo / brand mark */}
          <Link href="/" className="group inline-flex items-center gap-2.5">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full bg-accent transition-transform duration-300 group-hover:scale-150"
            />
            <span className="font-mono text-sm font-semibold tracking-tight text-fg">
              WB
            </span>
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
