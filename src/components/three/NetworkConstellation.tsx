"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 70;
const CONNECTION_DISTANCE = 1.8;
const MAX_LINE_PAIRS = (PARTICLE_COUNT * (PARTICLE_COUNT - 1)) / 2;

// Position bounds — fills the camera view at z=6, fov=45 with comfortable margin
const BOUNDS_X = 7.5;
const BOUNDS_Y = 4.2;
const BOUNDS_Z = 2.5;

export function NetworkConstellation() {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Per-particle initial position + animation params, frozen across renders
  const init = useMemo(() => {
    const basePositions = new Float32Array(PARTICLE_COUNT * 3);
    const phases = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);
    const amps = new Float32Array(PARTICLE_COUNT);
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      basePositions[i * 3] = (Math.random() - 0.5) * 2 * BOUNDS_X;
      basePositions[i * 3 + 1] = (Math.random() - 0.5) * 2 * BOUNDS_Y;
      basePositions[i * 3 + 2] = (Math.random() - 0.5) * 2 * BOUNDS_Z;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.1 + Math.random() * 0.2;
      amps[i] = 0.4 + Math.random() * 0.5;
      // Varied particle sizes for natural depth feel
      sizes[i] = 0.05 + Math.random() * 0.07;
    }
    return { basePositions, phases, speeds, amps, sizes };
  }, []);

  const positions = useMemo(
    () => new Float32Array(init.basePositions),
    [init.basePositions],
  );
  const lineBuffer = useMemo(
    () => new Float32Array(MAX_LINE_PAIRS * 6),
    [],
  );

  const pointsGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("size", new THREE.BufferAttribute(init.sizes, 1));
    return g;
  }, [positions, init.sizes]);

  const linesGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(lineBuffer, 3));
    g.setDrawRange(0, 0);
    return g;
  }, [lineBuffer]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const phase = init.phases[i];
      const speed = init.speeds[i];
      const amp = init.amps[i];
      positions[i * 3] =
        init.basePositions[i * 3] + Math.cos(t * speed + phase) * amp;
      positions[i * 3 + 1] =
        init.basePositions[i * 3 + 1] + Math.sin(t * speed * 0.9 + phase) * amp;
      positions[i * 3 + 2] =
        init.basePositions[i * 3 + 2] +
        Math.sin(t * speed * 1.1 + phase * 1.3) * amp * 0.7;
    }
    pointsGeometry.attributes.position.needsUpdate = true;

    let pairCount = 0;
    const threshSq = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq < threshSq) {
          const idx = pairCount * 6;
          lineBuffer[idx] = positions[i * 3];
          lineBuffer[idx + 1] = positions[i * 3 + 1];
          lineBuffer[idx + 2] = positions[i * 3 + 2];
          lineBuffer[idx + 3] = positions[j * 3];
          lineBuffer[idx + 4] = positions[j * 3 + 1];
          lineBuffer[idx + 5] = positions[j * 3 + 2];
          pairCount++;
        }
      }
    }
    linesGeometry.attributes.position.needsUpdate = true;
    linesGeometry.setDrawRange(0, pairCount * 2);
  });

  return (
    <group>
      <points ref={pointsRef} geometry={pointsGeometry}>
        <pointsMaterial
          size={0.09}
          color="#5bccc4"
          sizeAttenuation
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <lineSegments ref={linesRef} geometry={linesGeometry}>
        <lineBasicMaterial
          color="#00a29a"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
