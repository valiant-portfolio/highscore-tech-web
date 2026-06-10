'use client';

// Theme provider — manages the light/dark/system preference and writes
// `class="light"` or `class="dark"` to <html> so the CSS tokens swap.
//
// Storage: localStorage('hc-theme'). Three values:
//   - 'light'   → force light
//   - 'dark'    → force dark
//   - 'system'  → follow prefers-color-scheme (default; no class set,
//                 the @media block in tokens.css handles it)
//
// SSR caveat: the actual class is applied after hydration in a useLayoutEffect.
// Before hydration, the browser already reads prefers-color-scheme via the
// :not(.light):not(.dark) media block in tokens.css, so there's no FOUC for
// system-default users.

import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  setMode: (next: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'hc-theme';

// SSR-safe useLayoutEffect: falls back to useEffect on the server.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function resolveMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode !== 'system') return mode;
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyMode(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === 'system') {
    root.classList.remove('light', 'dark');
    return;
  }
  root.classList.toggle('dark', mode === 'dark');
  root.classList.toggle('light', mode === 'light');
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [resolved, setResolved] = useState<'light' | 'dark'>('dark');

  // First-mount hydration: read storage, apply class.
  useIsomorphicLayoutEffect(() => {
    const stored = (typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY)) as ThemeMode | null;
    const initial: ThemeMode = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    setModeState(initial);
    setResolved(resolveMode(initial));
    applyMode(initial);
  }, []);

  // Keep `resolved` in sync if user has system mode and the OS preference changes.
  useEffect(() => {
    if (mode !== 'system' || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setResolved(mq.matches ? 'dark' : 'light');
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    setResolved(resolveMode(next));
    applyMode(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode or storage disabled — non-fatal */
    }
  };

  const toggle = () => {
    setMode(resolved === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}
