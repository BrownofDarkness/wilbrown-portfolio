"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

/*
 * Dynamically loads the R3F scene with SSR disabled — Canvas needs a DOM/WebGL
 * context that doesn't exist on the server. Loading shows a transparent
 * placeholder so the static cyan glow / brand gradient remains visible.
 *
 * Also: IntersectionObserver pauses the scene when the hero leaves the
 * viewport (frameloop="never") so scroll on long pages stays jank-free.
 */
const HeroScene = dynamic(
  () => import("./HeroScene").then((m) => m.HeroScene),
  {
    ssr: false,
    loading: () => null,
  },
);

export function HeroSceneClient() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "100px" },
    );
    obs.observe(wrapperRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
    >
      <HeroScene frameloop={active ? "always" : "never"} />
    </div>
  );
}
