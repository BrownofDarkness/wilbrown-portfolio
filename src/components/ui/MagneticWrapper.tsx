"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  /** Multiplier applied to (cursor - center). 0.3 ≈ subtle, 0.5 = stronger. */
  strength?: number;
  /** Effective range in pixels from center; outside this radius, no effect. */
  range?: number;
  className?: string;
};

export function MagneticWrapper({
  children,
  strength = 0.35,
  range = 100,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useRef(false);

  if (typeof window !== "undefined") {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || reducedMotion.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > range) {
      ref.current.style.transform = "translate(0, 0)";
      return;
    }
    ref.current.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0, 0)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "inline-block will-change-transform transition-transform duration-300 ease-out",
        className,
      )}
    >
      {children}
    </div>
  );
}
