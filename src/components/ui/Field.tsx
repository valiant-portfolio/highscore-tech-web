'use client';

// Field — labeled input wrapper. Use for almost every text input in the app.
// Composes Input/Textarea inside with label, helper text, error state.

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

// ── shared label / helper / error layout ───────────────────────────────────
interface FieldShellProps {
  id: string;
  label?: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  rightSlot?: ReactNode;       // e.g. character count, validation icon
  className?: string;
  children: ReactNode;
}

function FieldShell({ id, label, helper, error, required, rightSlot, className, children }: FieldShellProps) {
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor={id} className="text-sm font-medium text-fg">
            {label}
            {required && <span className="text-danger ml-0.5">*</span>}
          </label>
          {rightSlot && <span className="text-xs text-fg-subtle">{rightSlot}</span>}
        </div>
      )}
      {children}
      {error ? (
        <p id={errorId} className="text-xs text-danger">{error}</p>
      ) : helper ? (
        <p id={helperId} className="text-xs text-fg-muted leading-relaxed">{helper}</p>
      ) : null}
    </div>
  );
}

// ── Input ───────────────────────────────────────────────────────────────────
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  fieldClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, helper, error, leftIcon, rightSlot, fieldClassName, className, required, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  return (
    <FieldShell
      id={inputId}
      label={label}
      helper={helper}
      error={error}
      required={required}
      className={fieldClassName}
    >
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center text-fg-subtle">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : helper ? helperId : undefined}
          required={required}
          className={cn(
            'h-12 w-full rounded-md border bg-surface text-fg placeholder:text-fg-subtle',
            'px-4 transition-colors duration-[80ms]',
            leftIcon && 'pl-10',
            error
              ? 'border-danger focus:border-danger'
              : 'border-border focus:border-brand',
            'focus:outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className,
          )}
          {...rest}
        />
        {rightSlot && <span className="absolute inset-y-0 right-3 inline-flex items-center">{rightSlot}</span>}
      </div>
    </FieldShell>
  );
});

// ── Textarea ───────────────────────────────────────────────────────────────
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  fieldClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { id, label, helper, error, fieldClassName, className, required, ...rest },
  ref,
) {
  const generatedId = useId();
  const ta = id ?? generatedId;
  const helperId = `${ta}-helper`;
  const errorId = `${ta}-error`;
  return (
    <FieldShell id={ta} label={label} helper={helper} error={error} required={required} className={fieldClassName}>
      <textarea
        ref={ref}
        id={ta}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : helper ? helperId : undefined}
        required={required}
        className={cn(
          'min-h-[120px] w-full rounded-md border bg-surface text-fg placeholder:text-fg-subtle',
          'px-4 py-3 transition-colors duration-[80ms] resize-y',
          error ? 'border-danger focus:border-danger' : 'border-border focus:border-brand',
          'focus:outline-none disabled:opacity-50',
          className,
        )}
        {...rest}
      />
    </FieldShell>
  );
});

// ── Select ────────────────────────────────────────────────────────────────
export interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  fieldClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { id, label, helper, error, options, placeholder, fieldClassName, className, required, ...rest },
  ref,
) {
  const generatedId = useId();
  const sel = id ?? generatedId;
  const helperId = `${sel}-helper`;
  const errorId = `${sel}-error`;
  return (
    <FieldShell id={sel} label={label} helper={helper} error={error} required={required} className={fieldClassName}>
      <select
        ref={ref}
        id={sel}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : helper ? helperId : undefined}
        required={required}
        className={cn(
          'h-12 w-full rounded-md border bg-surface text-fg',
          'px-4 pr-10 transition-colors duration-[80ms] appearance-none',
          'bg-[image:var(--select-arrow)] bg-no-repeat bg-[right_12px_center] bg-[length:16px_16px]',
          error ? 'border-danger focus:border-danger' : 'border-border focus:border-brand',
          'focus:outline-none disabled:opacity-50',
          className,
        )}
        style={{
          ['--select-arrow' as never]:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23838B98' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
        }}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
});
