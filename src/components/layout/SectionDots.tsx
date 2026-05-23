"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const SECTIONS = [
  "hero",
  "about",
  "experience",
  "work",
  "stack",
  "contact",
] as const;
type Section = (typeof SECTIONS)[number];

/*
 * Vertical constellation nav on the right edge. Each dot = one section;
 * active section's dot scales up + glows cyan and reveals its label on
 * the left. Click any dot to smooth-scroll to that section. The "hero"
 * top dot doubles as back-to-top.
 *
 * Hidden until the user has scrolled past 30% of viewport (no clutter on
 * first paint). Hidden on mobile (< md) — MobileMenu handles nav there.
 */
export function SectionDots() {
  const t = useTranslations("nav");
  const labels: Record<Section, string> = {
    hero: t("hero"),
    about: t("about"),
    experience: t("experience"),
    work: t("work"),
    stack: t("stack"),
    contact: t("contact"),
  };

  const [activeSection, setActiveSection] = useState<Section>("hero");
  const [visible, setVisible] = useState(false);

  // Visibility: only show after scrolling past 30% of first viewport
  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.3);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: the active section is the LAST one whose top has crossed the
  // 30%-from-viewport-top line. This works equally well for short and tall
  // sections (the previous IntersectionObserver picked the largest ratio,
  // which favored short sections and silently skipped the tall Experience).
  useEffect(() => {
    const onScroll = () => {
      const targetY = window.scrollY + window.innerHeight * 0.3;
      let active: Section = "hero";
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const elTop = el.getBoundingClientRect().top + window.scrollY;
        if (elTop <= targetY) {
          active = id;
        }
      }
      setActiveSection(active);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollToSection = (s: Section) => {
    const el = document.getElementById(s);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Navigation des sections"
      className={cn(
        "fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-5 transition-opacity duration-500 md:flex",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      {SECTIONS.map((s) => {
        const isActive = activeSection === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => scrollToSection(s)}
            aria-label={labels[s]}
            aria-current={isActive ? "true" : undefined}
            className="group relative flex items-center gap-3"
          >
            <span
              className={cn(
                "pointer-events-none font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300",
                isActive
                  ? "translate-x-0 text-accent opacity-100"
                  : "-translate-x-2 text-fg-muted opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
              )}
            >
              {labels[s]}
            </span>
            <span
              className={cn(
                "block rounded-full transition-all duration-300",
                isActive
                  ? "h-2.5 w-2.5 bg-accent shadow-[0_0_14px_-2px] shadow-accent"
                  : "h-1.5 w-1.5 bg-fg-subtle group-hover:bg-accent",
              )}
            />
          </button>
        );
      })}
    </nav>
  );
}
