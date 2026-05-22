"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";

export function LogoWB() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(TextureLoader, "/logos/logo-color3D.png");

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    // Slow Y rotation ~3 deg/sec = 0.0523 rad/sec
    meshRef.current.rotation.y = t * 0.0523;
    // Breathing scale ±2.5% on a 3s loop
    const breath = 1 + Math.sin(t * (Math.PI * 2) / 3) * 0.025;
    meshRef.current.scale.setScalar(breath);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2.6, 2.6]} />
      <meshBasicMaterial
        map={texture}
        transparent
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
