'use client';

// Compact theme toggle — three-state segmented control (system / light / dark)
// for settings pages, plus a one-tap toggle for headers.

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemeMode } from './ThemeProvider';
import { cn } from '@/lib/utils';

const OPTIONS: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { value: 'light',  label: 'Light',  Icon: Sun },
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'dark',   label: 'Dark',   Icon: Moon },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full border border-border bg-surface p-0.5',
        className,
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => setMode(value)}
            className={cn(
              'inline-flex items-center justify-center h-7 w-7 rounded-full transition-colors',
              active
                ? 'bg-brand text-brand-fg'
                : 'text-fg-muted hover:text-fg hover:bg-surface-hover',
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </button>
        );
      })}
    </div>
  );
}

// One-tap quick toggle for the marketing header — flips light <-> dark,
// ignoring 'system' so the visible state is always definite.
export function ThemeQuickToggle({ className }: { className?: string }) {
  const { resolved, toggle } = useTheme();
  const Icon = resolved === 'dark' ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-fg-muted hover:text-fg hover:bg-surface-hover transition-colors',
        className,
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}
