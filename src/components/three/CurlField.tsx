"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 2000;

// Pseudo curl-noise via crossed sin/cos. Cheap on GPU, divergence-free-ish,
// produces visible swirling currents — visually close to a real curl noise
// field at a fraction of the cost.
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uPointer;

  varying float vDepth;
  varying float vAttract;

  vec3 pseudoCurl(vec3 p, float t) {
    return vec3(
      sin(p.y * 0.7 + t * 0.3) * cos(p.z * 0.5 + t * 0.2),
      sin(p.z * 0.6 + t * 0.4) * cos(p.x * 0.5 + t * 0.3),
      sin(p.x * 0.8 + t * 0.2) * cos(p.y * 0.6 + t * 0.3)
    );
  }

  void main() {
    vec3 pos = position + pseudoCurl(position * 0.28, uTime) * 0.9;

    // Cursor attractor — XY plane only, smooth falloff in a 2.5-unit radius
    vec2 toPointer = uPointer.xy - pos.xy;
    float dist = length(toPointer);
    float pull = smoothstep(2.5, 0.0, dist) * 0.45;
    pos.xy += normalize(toPointer + 1e-5) * pull;
    vAttract = pull;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    vDepth = -mvPos.z;
    gl_Position = projectionMatrix * mvPos;
    // Size attenuates with depth
    gl_PointSize = 1.6 * (9.0 / max(vDepth, 0.01));
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccentColor;
  varying float vDepth;
  varying float vAttract;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    if (r > 0.5) discard;

    // Soft round point
    float alpha = (1.0 - smoothstep(0.15, 0.5, r)) * 0.55;

    // Brighten particles caught in the cursor attractor
    vec3 col = mix(uColor, uAccentColor, vAttract);
    alpha *= (1.0 + vAttract * 0.8);

    // Depth fade — match scene fog
    float depthFade = 1.0 - smoothstep(7.0, 16.0, vDepth);

    gl_FragColor = vec4(col, alpha * depthFade);
  }
`;

export function CurlField() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector3() },
      uColor: { value: new THREE.Color("#00a29a") },
      uAccentColor: { value: new THREE.Color("#5bccc4") },
    }),
    [],
  );

  useFrame((state) => {
    if (!matRef.current) return;
    uniforms.uTime.value = state.clock.elapsedTime;
    // Project pointer to world bounds matching the particle field extent
    uniforms.uPointer.value.set(state.pointer.x * 7, state.pointer.y * 4, 0);
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
