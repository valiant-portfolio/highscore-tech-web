'use client';

// SoundWave — a spectrum analyser rendered as a row of pulsing bars. This is
// the Studio's signature: it says "music" at a glance and echoes the waveform
// running through the Highscore Studio mark.
//
// Sharpness is the whole point here, so:
//   • solid bars, NOT additive blending — additive turned every overlap into
//     grey mush and cost the bars their edges
//   • one foreground row at full strength, with a single dimmer row behind for
//     depth, spaced far enough apart that they never smear together
//   • clear gaps between bars, so each one reads as a distinct bar
//
// One InstancedMesh, so the whole thing is a single draw call. Heights are
// summed sines, not real audio — nothing here listens to anything.

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  /** Bars per row. */
  bars?: number;
  color?: string;
  speed?: number;
}

const ROWS = 2;

export function SoundWave({
  bars = 52,
  color = '#22D3EE',
  speed = 1,
}: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = bars * ROWS;

  // Reused rather than reallocated per bar per frame.
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tint = useMemo(() => new THREE.Color(), []);
  const base = useMemo(() => new THREE.Color(color), [color]);
  const peak = useMemo(() => new THREE.Color('#EAFDFF'), []); // near-white crest

  // Random phase + frequency per bar, so neighbours don't move as one clean
  // sine — that reads as a wave, not a spectrum.
  const seeds = useMemo(() => {
    const a = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      a[i * 2] = Math.random() * Math.PI * 2;
      a[i * 2 + 1] = 0.8 + Math.random() * 2.2;
    }
    return a;
  }, [count]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime * speed;
    const half = (bars - 1) / 2;

    let i = 0;
    for (let r = 0; r < ROWS; r++) {
      // Back row sits well behind and much dimmer: depth without smear.
      const depth = -r * 1.15;
      const rowFade = r === 0 ? 1 : 0.34;
      for (let b = 0; b < bars; b++) {
        const fromCentre = Math.abs(b - half) / half;
        const centre = 1 - fromCentre * fromCentre;

        const wobble = Math.abs(Math.sin(t * seeds[i * 2 + 1] + seeds[i * 2]));
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.7 - r * 0.6);
        const h = 0.1 + wobble * (0.2 + centre * 1.25 * (0.6 + 0.4 * pulse));

        // Back row sits lower too, so it peeks between the front bars rather
        // than towering over them.
        const rowH = r === 0 ? h : h * 0.72;
        dummy.position.set((b - half) * 0.245, rowH / 2 - 1.45, depth);
        // Narrow relative to the spacing, so there is a real gap either side.
        dummy.scale.set(0.1, rowH, 0.1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        // Front row: crests blow out toward white, troughs stay brand cyan —
        // that contrast is what makes the bars read as crisp. The back row
        // stays pure dim cyan; tinting it toward white just turned it grey.
        if (r === 0) {
          const heat = Math.min(1, (h / 1.35) ** 1.6);
          tint.copy(base).lerp(peak, heat * 0.7);
        } else {
          tint.copy(base).multiplyScalar(rowFade);
        }
        mesh.setColorAt(i, tint);
        i++;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    // A small sway, so it never looks frozen between beats. More than this and
    // the band reads as tilted rather than alive.
    mesh.rotation.y = Math.sin(t * 0.18) * 0.04;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} rotation={[0.1, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
