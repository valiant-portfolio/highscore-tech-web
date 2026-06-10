'use client';

// ParticleField — drifting points scattered across a depth slab. Used for
// ambient backdrops on inner sections.

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  count?: number;
  color?: string;
  size?: number;
  speed?: number;
}

export function ParticleField({
  count = 1200,
  color = '#5fd0e3',
  size = 0.02,
  speed = 1,
}: Props) {
  const ref = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Wide horizontal spread, narrower vertical, varied depth.
      positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      velocities[i] = 0.05 + Math.random() * 0.15;
    }
    return { positions, velocities };
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const geom = ref.current.geometry as THREE.BufferGeometry;
    const pos = geom.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      // Slow vertical drift; wrap when off the top.
      pos[i * 3 + 1] += velocities[i] * delta * 0.4 * speed;
      if (pos[i * 3 + 1] > 4) pos[i * 3 + 1] = -4;
    }
    geom.attributes.position.needsUpdate = true;
    if (ref.current) ref.current.rotation.z += delta * 0.005 * speed;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
