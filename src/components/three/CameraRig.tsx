"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

const BASE_Z = 6;
const DOLLY_RANGE = 4;
const LERP = 0.05;

/*
 * Scroll-driven camera dolly. As the user scrolls past the hero, the
 * camera pulls back (z: 6 → 10), making the constellation field appear
 * to expand outward. Subtle, but it makes the scene react to the user's
 * intent rather than sitting idle.
 */
export function CameraRig() {
  const reducedMotion = useRef(false);

  if (typeof window !== "undefined") {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }

  useFrame((state) => {
    if (typeof window === "undefined" || reducedMotion.current) return;
    const progress = Math.min(
      window.scrollY / Math.max(window.innerHeight, 1),
      1,
    );
    const targetZ = BASE_Z + progress * DOLLY_RANGE;
    state.camera.position.z += (targetZ - state.camera.position.z) * LERP;
  });

  return null;
}
