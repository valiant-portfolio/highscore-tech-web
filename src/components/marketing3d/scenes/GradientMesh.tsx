'use client';

// GradientMesh — Linear-style animated gradient mesh.
//
// A fullscreen quad shaded with simplex-noise-driven color mixing of two
// brand colors. Slow drift, subtle vignette, breathing scale. Subtle by
// default — meant to sit behind content, not compete with it.

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  /** Primary color, hex string. */
  colorA: string;
  /** Secondary color, hex string. */
  colorB: string;
  /** 0..1, how much the mesh contributes. Higher = bolder; lower = subtle ambient. */
  intensity?: number;
  /** Speed multiplier. 1 = default; 0.3 = very slow. */
  speed?: number;
}

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Simplex 2D noise (Ashima). Public domain. Inlined here so we don't
// depend on a glsl loader.
const FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uIntensity;

  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    // Two layers of noise at different scales for richer blobs.
    float n1 = snoise(uv * 1.5 + vec2(uTime * 0.03, 0.0));
    float n2 = snoise(uv * 3.0 - vec2(0.0, uTime * 0.02));
    float n  = n1 * 0.65 + n2 * 0.35;
    n = (n + 1.0) * 0.5; // → [0, 1]

    vec3 color = mix(uColorA, uColorB, n);

    // Soft radial vignette toward center so edges fade out.
    float dist = distance(uv, vec2(0.5));
    float vignette = smoothstep(0.85, 0.2, dist);

    float alpha = uIntensity * vignette;
    gl_FragColor = vec4(color, alpha);
  }
`;

export function GradientMesh({ colorA, colorB, intensity = 0.55, speed = 1 }: Props) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color(colorA) },
    uColorB: { value: new THREE.Color(colorB) },
    uIntensity: { value: intensity },
  }), [colorA, colorB, intensity]);

  useFrame((_, delta) => {
    if (materialRef.current) {
      uniforms.uTime.value += delta * speed;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[16, 9]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
