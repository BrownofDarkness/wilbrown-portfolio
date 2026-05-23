"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Props = {
  children: ReactNode;
  /** Pixels to translate from on enter. */
  y?: number;
  /** Animation delay in seconds. */
  delay?: number;
  /** Animation duration in seconds. */
  duration?: number;
  /** "scroll" plays when element enters viewport; "mount" plays immediately. */
  mode?: "scroll" | "mount";
  /** Stagger children directly (immediate children, not deep). */
  stagger?: number;
  className?: string;
};

export function Reveal({
  children,
  y = 28,
  delay = 0,
  duration = 0.9,
  mode = "scroll",
  stagger,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const conditions = ctx.conditions as
            | { motion: boolean; reduced: boolean }
            | undefined;
          if (conditions?.reduced) {
            gsap.set(ref.current, { opacity: 1, y: 0 });
            if (stagger != null) {
              gsap.set(ref.current!.children, { opacity: 1, y: 0 });
            }
            return;
          }

          const target =
            stagger != null
              ? Array.from(ref.current!.children)
              : ref.current;

          const tween: gsap.TweenVars = {
            opacity: 0,
            y,
            duration,
            delay,
            ease: "power3.out",
          };
          if (stagger != null) tween.stagger = stagger;

          if (mode === "mount") {
            gsap.from(target, tween);
          } else {
            gsap.from(target, {
              ...tween,
              scrollTrigger: {
                trigger: ref.current,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            });
          }
        },
      );
    },
    { scope: ref, dependencies: [y, delay, duration, mode, stagger] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
