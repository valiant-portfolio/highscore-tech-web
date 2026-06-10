'use client';

// Toast — small ephemeral notice anchored to the top-right (desktop) or
// top-center (mobile). API is a hook: `toast.success('Done')`.
//
// Architecture:
//   1. <ToastProvider /> mounts a single portal and exposes a context store.
//   2. The `useToast()` hook (or the static `toast` API for one-offs)
//      pushes notices into the store.
//   3. Notices auto-dismiss after `duration` ms unless `duration: 0`.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { toastIn } from '@/lib/motion';
import { cn } from '@/lib/utils';

type ToastTone = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  duration: number; // ms — 0 = sticky
}

interface ToastContextValue {
  push: (t: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Static fallback queue — buffers toasts pushed before the provider mounts
// (e.g. during initial render). The provider drains the buffer on mount.
const buffer: Omit<Toast, 'id'>[] = [];
let providerPush: ToastContextValue['push'] | null = null;

function makeDefault(tone: ToastTone): number {
  return tone === 'error' ? 6000 : 4000;
}

export const toast = {
  success: (title: string, description?: string, duration?: number) =>
    pushOrBuffer({ tone: 'success', title, description, duration: duration ?? makeDefault('success') }),
  error: (title: string, description?: string, duration?: number) =>
    pushOrBuffer({ tone: 'error', title, description, duration: duration ?? makeDefault('error') }),
  info: (title: string, description?: string, duration?: number) =>
    pushOrBuffer({ tone: 'info', title, description, duration: duration ?? makeDefault('info') }),
  warning: (title: string, description?: string, duration?: number) =>
    pushOrBuffer({ tone: 'warning', title, description, duration: duration ?? makeDefault('warning') }),
};

function pushOrBuffer(t: Omit<Toast, 'id'>): string {
  if (providerPush) return providerPush(t);
  buffer.push(t);
  return '';
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback<ToastContextValue['push']>((t) => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { ...t, id }]);
    if (t.duration > 0) {
      setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== id));
      }, t.duration);
    }
    return id;
  }, []);

  const dismiss = useCallback<ToastContextValue['dismiss']>((id) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  // Drain the buffer on mount.
  useEffect(() => {
    providerPush = push;
    while (buffer.length) {
      const next = buffer.shift();
      if (next) push(next);
    }
    return () => {
      providerPush = null;
    };
  }, [push]);

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto sm:px-0"
      >
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <ToastView key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ── Internal: one rendered toast ───────────────────────────────────────────
const TONE_ICON: Record<ToastTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  error:   AlertCircle,
  info:    Info,
  warning: AlertTriangle,
};

const TONE_CLASS: Record<ToastTone, string> = {
  success: 'text-success',
  error:   'text-danger',
  info:    'text-info',
  warning: 'text-warning',
};

function ToastView({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = TONE_ICON[toast.tone];
  const labelId = useId();
  return (
    <motion.div
      variants={toastIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      role="status"
      aria-labelledby={labelId}
      className={cn(
        'pointer-events-auto w-full max-w-sm bg-surface-raised border border-border rounded-md shadow-elev-2',
        'p-4 flex items-start gap-3',
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', TONE_CLASS[toast.tone])} strokeWidth={1.75} />
      <div className="flex-1 min-w-0">
        <p id={labelId} className="text-sm font-semibold text-fg leading-tight">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-xs text-fg-muted leading-relaxed">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="text-fg-subtle hover:text-fg transition-colors"
      >
        <X className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </motion.div>
  );
}
