"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 60;
const CONNECTION_DISTANCE = 1.6;
const MAX_LINE_PAIRS = (PARTICLE_COUNT * (PARTICLE_COUNT - 1)) / 2;

// Initial position bounds — tuned to roughly fill the camera view at z=6, fov=45
const BOUNDS_X = 7;
const BOUNDS_Y = 4;
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

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      basePositions[i * 3] = (Math.random() - 0.5) * 2 * BOUNDS_X;
      basePositions[i * 3 + 1] = (Math.random() - 0.5) * 2 * BOUNDS_Y;
      basePositions[i * 3 + 2] = (Math.random() - 0.5) * 2 * BOUNDS_Z;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.12 + Math.random() * 0.18;
      amps[i] = 0.3 + Math.random() * 0.4;
    }
    return { basePositions, phases, speeds, amps };
  }, []);

  // Working buffers — mutated each frame
  const positions = useMemo(
    () => new Float32Array(init.basePositions),
    [init.basePositions],
  );
  const lineBuffer = useMemo(
    () => new Float32Array(MAX_LINE_PAIRS * 6),
    [],
  );

  // Build initial geometries once
  const pointsGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const linesGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(lineBuffer, 3));
    g.setDrawRange(0, 0);
    return g;
  }, [lineBuffer]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Update particle positions (sin/cos drift around base position)
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
        Math.sin(t * speed * 1.1 + phase * 1.3) * amp * 0.6;
    }
    pointsGeometry.attributes.position.needsUpdate = true;

    // Recompute connection lines (only between near pairs)
    let pairCount = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
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
          size={0.07}
          color="#00a29a"
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </points>
      <lineSegments ref={linesRef} geometry={linesGeometry}>
        <lineBasicMaterial
          color="#00a29a"
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
