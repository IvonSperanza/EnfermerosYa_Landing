import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export default function Modal({ open, onClose, title, children, footer, size = 'md', position = 'center' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const isDrawer = position === 'right';

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 w-full cursor-default bg-navy-950/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'absolute bg-white shadow-float',
          isDrawer
            ? 'inset-y-0 right-0 flex h-full w-full max-w-md animate-fade-up flex-col border-l border-slate-200'
            : cn(
                'left-1/2 top-1/2 w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 animate-fade-up rounded-2xl border border-slate-200',
                SIZES[size],
              ),
        )}
      >
        <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-extrabold text-navy-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-800"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className={cn('flex-1 overflow-y-auto px-5 py-4', isDrawer && 'scroll-area')}>{children}</div>
        {footer && <footer className="border-t border-slate-100 px-5 py-4">{footer}</footer>}
      </div>
    </div>
  );
}
