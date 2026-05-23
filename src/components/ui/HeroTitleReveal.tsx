"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, SplitText);

type Props = {
  firstName: string;
  lastName: string;
  className?: string;
};

/*
 * Animated wordmark for the hero. Splits the first + last name into
 * characters and cascades them in on mount with a slight rotateX +
 * upward translate. Honors prefers-reduced-motion.
 */
export function HeroTitleReveal({ firstName, lastName, className }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduced) return;

      const split = SplitText.create(ref.current, {
        type: "chars,words",
        // Wrap each char in a span we can control
        charsClass: "hero-char inline-block",
      });

      gsap.from(split.chars, {
        opacity: 0,
        y: 80,
        rotateX: -55,
        stagger: 0.028,
        duration: 0.85,
        ease: "back.out(1.2)",
        delay: 0.1,
      });

      return () => {
        split.revert();
      };
    },
    { scope: ref },
  );

  return (
    <h1
      ref={ref}
      className={className}
      style={{ perspective: 800 }}
    >
      {firstName}
      <br />
      <span className="text-accent">{lastName}.</span>
    </h1>
  );
}
