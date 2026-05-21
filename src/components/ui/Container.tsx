import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = HTMLAttributes<HTMLDivElement>;

export function Container({ className, ...props }: Props) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-10",
        className,
      )}
      {...props}
    />
  );
}
