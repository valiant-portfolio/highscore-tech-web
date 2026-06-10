'use client';

// Sheet — mobile-style bottom sheet. Slides up from the bottom, anchored.
// Use over <Modal> for mobile-first flows; on desktop a Sheet just looks
// like a tall right-aligned panel.

import { useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { backdropFade, sheetSlide } from '@/lib/motion';
import { cn } from '@/lib/utils';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  /** Sheet content height when `auto` (default) is content-driven. */
  fullHeight?: boolean;
  children: ReactNode;
}

export function Sheet({ open, onClose, title, description, className, fullHeight, children }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

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
      className="fixed inset-0 z-50 flex flex-col justify-end"
    >
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={backdropFade}
        onClick={onClose}
        className="absolute inset-0 bg-ink/60 backdrop-blur-[12px]"
      />
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={sheetSlide}
        className={cn(
          'relative w-full bg-surface-raised border-t border-border rounded-t-xl shadow-elev-3',
          'pb-[env(safe-area-inset-bottom)] overflow-y-auto scrollbar-none',
          fullHeight ? 'h-[calc(100dvh-2rem)]' : 'max-h-[calc(100dvh-2rem)]',
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag indicator */}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="block mx-auto mt-2 h-1 w-10 rounded-full bg-border hover:bg-border-strong"
        />
        {(title || description) && (
          <div className="px-6 pt-4 pb-2">
            {title && <h2 className="text-lg font-semibold text-fg leading-tight">{title}</h2>}
            {description && <p className="mt-1 text-sm text-fg-muted leading-relaxed">{description}</p>}
          </div>
        )}
        <div className="px-6 pt-2 pb-6">{children}</div>
      </motion.div>
    </div>
  );
}
