"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, FolderKanban } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Showcase", icon: FolderKanban },
  { href: "/admin/events", label: "Évènements", icon: Calendar },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle pb-6">
      <div className="flex items-center gap-1 rounded-full border border-border bg-bg-elevated p-1">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin" || pathname.startsWith("/admin/showcase")
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full px-4 font-mono text-xs uppercase tracking-[0.1em] transition-colors",
                active
                  ? "bg-accent text-navy-dark"
                  : "text-fg-muted hover:text-accent",
              )}
            >
              <Icon size={12} />
              {label}
            </Link>
          );
        })}
      </div>

      <form action={logoutAction}>
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-full border border-border px-4 font-mono text-xs uppercase tracking-[0.1em] text-fg-muted transition-colors hover:border-accent hover:text-accent"
        >
          Déconnexion
        </button>
      </form>
    </header>
  );
}
