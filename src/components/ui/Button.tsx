import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const baseClasses =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-colors duration-200";

const variantClasses = {
  primary:
    "bg-accent text-navy-dark hover:bg-accent-soft",
  ghost:
    "border border-border text-fg hover:border-accent hover:text-accent",
  link:
    "h-auto px-0 text-accent hover:underline underline-offset-4 decoration-2",
} as const;

export type ButtonVariant = keyof typeof variantClasses;

type Props = {
  variant?: ButtonVariant;
  className?: string;
  href?: string;
  external?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  className,
  href,
  external,
  children,
}: Props) {
  const classes = cn(baseClasses, variantClasses[variant], className);

  if (!href) {
    return <button className={classes}>{children}</button>;
  }

  const isAnchor =
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    external;

  if (isAnchor) {
    return (
      <a
        href={href}
        className={classes}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
