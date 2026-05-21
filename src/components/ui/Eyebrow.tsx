import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = HTMLAttributes<HTMLParagraphElement>;

export function Eyebrow({ className, ...props }: Props) {
  return (
    <p
      className={cn(
        "font-mono text-xs uppercase tracking-[0.2em] text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}
