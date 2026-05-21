import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "accent";
};

export function Tag({ className, variant = "default", ...props }: Props) {
  const variants = {
    default:
      "border-border bg-bg-elevated text-fg-muted",
    accent:
      "border-accent/30 bg-accent/10 text-accent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 font-mono text-xs",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
