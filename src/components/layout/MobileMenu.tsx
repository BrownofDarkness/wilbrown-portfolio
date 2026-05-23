"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string };

export function MobileMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const current = document.documentElement.dataset.theme;
    setTheme(current === "light" ? "light" : "dark");
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Glassmorphism: ~70% opaque bg + strong backdrop-blur. Portal-rendered
  // at body root so the menu escapes TopNav's sticky stacking context —
  // backdrop-filter can now blur the full page behind, not just the nav.
  const bgColor =
    theme === "light" ? "rgba(242, 238, 232, 0.7)" : "rgba(1, 12, 31, 0.7)";

  // Always rendered (portal) — visibility controlled via class toggling so
  // CSS transitions can run on both open AND close. Slide-from-right
  // (translate-x) combined with a fade (opacity) for a clean glass swipe.
  const overlay = (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex flex-col transition-[transform,opacity] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        open
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-full opacity-0",
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation"
      aria-hidden={!open}
      style={{
        backgroundColor: bgColor,
        backdropFilter: "blur(28px) saturate(140%)",
        WebkitBackdropFilter: "blur(28px) saturate(140%)",
      }}
    >
      {/* Subtle cyan glow as decorative layer */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-25%] top-[15%] h-[55vh] w-[55vh] rounded-full blur-3xl"
        style={{ background: "rgba(0, 162, 154, 0.1)" }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between border-b border-border-subtle px-6 py-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-fg-subtle">
          Menu
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fermer le menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-fg transition-colors hover:border-accent hover:text-accent"
        >
          <X size={18} />
        </button>
      </div>

      {/* Menu items */}
      <nav className="relative flex flex-1 flex-col justify-center px-6">
        <ul>
          {items.map((item, i) => (
            <li
              key={item.href}
              className="border-b border-border-subtle last:border-b-0"
            >
              <a
                href={item.href}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-4 py-5"
              >
                <span className="w-10 font-mono text-xs text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 font-sans text-3xl font-semibold tracking-tight text-fg transition-colors group-hover:text-accent">
                  {item.label}
                </span>
                <ArrowUpRight
                  size={20}
                  className="text-fg-subtle transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent"
                />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="relative border-t border-border-subtle px-6 py-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-fg-subtle">
          {SITE.name} · {SITE.location}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-fg-muted transition-colors hover:border-accent hover:text-accent md:hidden"
      >
        <Menu size={18} />
      </button>

      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
