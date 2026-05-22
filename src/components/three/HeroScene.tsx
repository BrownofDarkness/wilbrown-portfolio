"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { LogoWB } from "./LogoWB";
import { NetworkConstellation } from "./NetworkConstellation";

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 5]} intensity={0.8} color="#5bccc4" />
      <pointLight position={[-3, -2, 4]} intensity={0.4} color="#00a29a" />

      <Suspense fallback={null}>
        <LogoWB />
      </Suspense>
      <NetworkConstellation />
    </Canvas>
  );
}
