"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

type Item = { href: string; label: string };

export function MobileMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);

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

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg/95 backdrop-blur-md">
          <div className="flex items-center justify-end p-6">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-fg transition-colors hover:border-accent hover:text-accent"
            >
              <X size={18} />
            </button>
          </div>
          <nav className="flex flex-1 flex-col items-center justify-center gap-10">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-sans text-3xl font-semibold tracking-tight text-fg transition-colors hover:text-accent"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
