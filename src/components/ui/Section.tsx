import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./Container";

type Props = {
  id?: string;
  className?: string;
  children: ReactNode;
  noBorder?: boolean;
  noPadding?: boolean;
};

export function Section({ id, className, children, noBorder, noPadding }: Props) {
  return (
    <section
      id={id}
      className={cn(
        !noPadding && "py-24 sm:py-32",
        !noBorder && "border-t border-border-subtle",
        className,
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}
