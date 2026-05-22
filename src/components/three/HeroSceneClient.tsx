"use client";

import dynamic from "next/dynamic";

/*
 * Dynamically loads the R3F scene with SSR disabled — Canvas needs a DOM/WebGL
 * context that doesn't exist on the server. Loading shows a transparent
 * placeholder so the static cyan glow / brand gradient remains visible.
 */
const HeroScene = dynamic(
  () => import("./HeroScene").then((m) => m.HeroScene),
  {
    ssr: false,
    loading: () => null,
  },
);

export function HeroSceneClient() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
    >
      <HeroScene />
    </div>
  );
}
