'use client';

// SoundWave — a spectrum analyser rendered as rows of pulsing bars, receding
// into depth. This is the Studio's signature: it says "music" at a glance and
// echoes the waveform that runs through the Highscore Studio mark.
//
// One InstancedMesh for every bar, so a few hundred bars cost a single draw
// call. Heights come from summed sines rather than real audio — nothing here
// listens to anything, it just has to *feel* like sound.

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  /** Bars per row. */
  bars?: number;
  /** Rows receding into depth. */
  rows?: number;
  color?: string;
  speed?: number;
}

export function SoundWave({
  bars = 60,
  rows = 3,
  color = '#18C2DC',
  speed = 1,
}: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = bars * rows;

  // Reused rather than allocated per bar per frame.
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tint = useMemo(() => new THREE.Color(), []);
  const base = useMemo(() => new THREE.Color(color), [color]);

  // A random phase + frequency per bar, so neighbours don't move as one clean
  // sine — that reads as a wave, not as a spectrum.
  const seeds = useMemo(() => {
    const a = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      a[i * 2] = Math.random() * Math.PI * 2;      // phase
      a[i * 2 + 1] = 0.7 + Math.random() * 2.1;    // frequency
    }
    return a;
  }, [count]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime * speed;
    const half = (bars - 1) / 2;

    let i = 0;
    for (let r = 0; r < rows; r++) {
      const depth = -r * 0.62;
      const rowFade = 1 - r * 0.28;
      for (let b = 0; b < bars; b++) {
        // Bars peak toward the centre, like a real spectrum with the energy
        // in the mids.
        const fromCentre = Math.abs(b - half) / half;
        const centre = 1 - fromCentre * fromCentre;

        const wobble = Math.abs(Math.sin(t * seeds[i * 2 + 1] + seeds[i * 2]));
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.6 - r * 0.5);
        const h = 0.1 + wobble * (0.22 + centre * 1.15 * (0.65 + 0.35 * pulse));

        // Spaced to overrun the viewport, so it reads as a band running off
        // both edges rather than a clump sitting in the middle.
        dummy.position.set((b - half) * 0.235, h / 2 - 1.5, depth);
        dummy.scale.set(0.085, h, 0.085);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        // Brighter where the bar is tall — the peaks glow.
        tint.copy(base).multiplyScalar(rowFade * (0.45 + 0.75 * Math.min(1, h / 1.4)));
        mesh.setColorAt(i, tint);
        i++;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    // A slow sway, so it never looks frozen between beats. Kept small — more
    // than this and the band reads as tilted rather than alive.
    mesh.rotation.y = Math.sin(t * 0.18) * 0.05;
    mesh.position.y = Math.sin(t * 0.5) * 0.03;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} rotation={[0.18, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  );
}
