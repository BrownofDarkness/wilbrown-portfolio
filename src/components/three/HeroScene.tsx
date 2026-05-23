"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Bloom,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { CameraRig } from "./CameraRig";
import { CurlField } from "./CurlField";
import { NetworkConstellation } from "./NetworkConstellation";

/*
 * Cursor parallax — lerps a group's rotation toward the normalized pointer
 * position. ±3° maximum tilt, smoothed at 5% per frame. Respects
 * prefers-reduced-motion (freezes when user opted out).
 */
function ParallaxGroup({ children }: { children: ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      reducedMotion.current = e.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useFrame((state) => {
    if (!groupRef.current || reducedMotion.current) return;
    const { x, y } = state.pointer;
    const targetRotX = -y * 0.05;
    const targetRotY = x * 0.05;
    groupRef.current.rotation.x +=
      (targetRotX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.y +=
      (targetRotY - groupRef.current.rotation.y) * 0.05;
  });

  return <group ref={groupRef}>{children}</group>;
}

type Props = {
  frameloop?: "always" | "never" | "demand";
};

export function HeroScene({ frameloop = "always" }: Props) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      frameloop={frameloop}
      style={{ background: "transparent" }}
    >
      {/* Atmospheric depth: navy-dark fog fading the back particles */}
      <fog attach="fog" args={["#010c1f", 4, 14]} />

      <ambientLight intensity={0.4} />

      {/* Scroll-driven camera dolly */}
      <CameraRig />

      <ParallaxGroup>
        {/* Tier 2 — 2000 small particles in a pseudo curl-noise flowfield,
            cursor attractor brings them closer when hovered. The "depth"
            layer of the constellation. */}
        <CurlField />
        {/* The 70 "bright nodes" + connection lines stay on top */}
        <NetworkConstellation />
      </ParallaxGroup>

      {/* Cinematic post stack. Bloom catches cyan glow, vignette focuses
          the eye, noise gives an analog film texture. Disabled grain
          when user prefers reduced motion. */}
      <EffectComposer enableNormalPass={false}>
        <Bloom
          intensity={0.55}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
        <Vignette
          offset={0.42}
          darkness={0.55}
          blendFunction={BlendFunction.NORMAL}
        />
        <Noise
          opacity={reducedMotion ? 0 : 0.035}
          blendFunction={BlendFunction.OVERLAY}
        />
      </EffectComposer>
    </Canvas>
  );
}
