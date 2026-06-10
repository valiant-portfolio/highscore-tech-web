'use client';

// Checkbox + Switch — paired primitives. Both expose a controlled boolean.

import { Check } from 'lucide-react';
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  description?: ReactNode;
  size?: 'sm' | 'md';
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { id, label, description, size = 'md', className, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const dim = size === 'sm' ? 'h-4 w-4 rounded' : 'h-5 w-5 rounded-md';
  const checkSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  return (
    <label htmlFor={inputId} className={cn('flex items-start gap-3 cursor-pointer select-none', className)}>
      <span className="relative inline-flex shrink-0 mt-0.5">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={cn(
            'peer appearance-none border bg-surface transition-colors duration-[80ms] cursor-pointer',
            'border-border-strong checked:bg-brand checked:border-brand',
            'focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-bg',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            dim,
          )}
          {...rest}
        />
        <Check
          className={cn(
            'pointer-events-none absolute inset-0 m-auto text-brand-fg opacity-0 peer-checked:opacity-100',
            checkSize,
          )}
          strokeWidth={3}
        />
      </span>
      {(label || description) && (
        <span className="flex flex-col gap-0.5">
          {label && <span className="text-sm text-fg font-medium leading-tight">{label}</span>}
          {description && <span className="text-xs text-fg-muted leading-relaxed">{description}</span>}
        </span>
      )}
    </label>
  );
});

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  description?: ReactNode;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { id, label, description, className, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <label htmlFor={inputId} className={cn('flex items-start gap-3 cursor-pointer select-none', className)}>
      <span className="relative inline-flex shrink-0 mt-0.5">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          role="switch"
          className="peer sr-only"
          {...rest}
        />
        <span
          aria-hidden="true"
          className={cn(
            'block h-6 w-10 rounded-full bg-surface-active transition-colors duration-[160ms] [transition-timing-function:var(--ease-out)]',
            'peer-checked:bg-brand peer-disabled:opacity-50',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg',
          )}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-paper shadow-elev-1 transition-transform duration-[160ms] [transition-timing-function:var(--ease-out)] peer-checked:translate-x-4"
        />
      </span>
      {(label || description) && (
        <span className="flex flex-col gap-0.5">
          {label && <span className="text-sm text-fg font-medium leading-tight">{label}</span>}
          {description && <span className="text-xs text-fg-muted leading-relaxed">{description}</span>}
        </span>
      )}
    </label>
  );
});
