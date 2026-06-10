'use client';

// Modal — desktop-first dialog. On mobile, prefer <Sheet> instead; this
// component still works on small screens but full-screen sheets read better.
// Use AnimatePresence around <Modal> in the caller for exit animations.

import { useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { backdropFade, modalRise } from '@/lib/motion';
import { IconButton } from './Button';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<Size, string> = {
  sm: 'max-w-sm',     // ~384
  md: 'max-w-md',     // ~448
  lg: 'max-w-lg',     // ~512
  xl: 'max-w-2xl',    // ~672
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  size?: Size;
  /** When false, clicking the backdrop does NOT close. Use for important confirms. */
  dismissOnBackdrop?: boolean;
  /** When false, hides the close X — relies on programmatic onClose. */
  showCloseButton?: boolean;
  className?: string;
  children: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  dismissOnBackdrop = true,
  showCloseButton = true,
  className,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC to close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={backdropFade}
        onClick={() => dismissOnBackdrop && onClose()}
        className="absolute inset-0 bg-ink/60 backdrop-blur-[12px]"
      />
      <motion.div
        ref={panelRef}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalRise}
        className={cn(
          'relative w-full bg-surface-raised border border-border rounded-xl shadow-elev-3',
          'max-h-[calc(100dvh-2rem)] overflow-y-auto scrollbar-none',
          SIZES[size],
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start gap-4 p-6 pb-4">
            <div className="flex-1 min-w-0">
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-fg leading-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="mt-1 text-sm text-fg-muted leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <IconButton
                ariaLabel="Close"
                icon={<X className="h-4 w-4" strokeWidth={1.75} />}
                size="sm"
                onClick={onClose}
              />
            )}
          </div>
        )}
        <div className="px-6 pb-6">{children}</div>
      </motion.div>
    </div>
  );
}

// Modal footer convenience — right-aligned action row.
export function ModalFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mt-6 flex flex-wrap items-center justify-end gap-3', className)}>{children}</div>
  );
}
