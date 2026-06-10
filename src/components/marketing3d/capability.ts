// Device-capability detection for the 3D layer.
//
// We tier devices into none / low / medium / high. The Stage wrapper picks
// the right scene complexity (or a static CSS fallback) per tier.
//
// Detection runs once per page-load, client-side only. Cached in a module
// variable so multiple <Stage> instances on a page share the result.

export type CapabilityTier = 'none' | 'low' | 'medium' | 'high';

interface Cached {
  tier: CapabilityTier;
  reducedMotion: boolean;
  webglAvailable: boolean;
}

let cached: Cached | null = null;

function probeWebgl(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) return false;
    // dispose
    const ext = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context');
    ext?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function probeGpuTier(): 'low' | 'medium' | 'high' {
  if (typeof navigator === 'undefined') return 'medium';

  // Hard signals first.
  // deviceMemory is in GB. Many phones report 4 or less.
  const memGb = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 4;
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024;

  // Low: tiny memory OR very few cores OR ancient screen.
  if ((memGb && memGb <= 2) || cores <= 2 || width < 600) {
    return 'low';
  }
  // High: lots of memory AND many cores AND big screen.
  if ((memGb ?? 8) >= 8 && cores >= 8 && width >= 1200) {
    return 'high';
  }
  return 'medium';
}

export function detectCapability(): Cached {
  if (cached) return cached;
  if (typeof window === 'undefined') {
    // SSR — return high so the markup matches when client hydrates;
    // the Stage will re-evaluate after mount.
    return { tier: 'high', reducedMotion: false, webglAvailable: false };
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const webglAvailable = probeWebgl();
  let tier: CapabilityTier = 'none';

  if (!webglAvailable) tier = 'none';
  else if (reducedMotion) tier = 'low';
  else tier = probeGpuTier();

  cached = { tier, reducedMotion, webglAvailable };
  return cached;
}

// Re-export for tests / debugging.
export function resetCapability() { cached = null; }
