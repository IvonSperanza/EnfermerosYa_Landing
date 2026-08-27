import { useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PROFESSIONAL_STATUS } from '../../lib/status';
import useDismissable from '../../hooks/useDismissable';

export function StatusDot({ status, className }) {
  const config = PROFESSIONAL_STATUS[status] || PROFESSIONAL_STATUS.offline;
  return <span aria-hidden="true" className={cn('inline-block h-2 w-2 rounded-full', config.dotClass, className)} />;
}

export function StatusLabel({ status, className }) {
  const config = PROFESSIONAL_STATUS[status] || PROFESSIONAL_STATUS.offline;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600', className)}>
      <StatusDot status={status} />
      {config.label}
    </span>
  );
}

const STATUS_OPTIONS = Object.entries(PROFESSIONAL_STATUS);

export default function StatusPill({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useDismissable(containerRef, open, () => setOpen(false));

  return (
    <div className="relative inline-block" role="group" aria-label="Estado de disponibilidad" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-navy-800 shadow-sm transition-colors hover:border-action focus:outline-none focus-visible:ring-2 focus-visible:ring-action"
      >
        <StatusDot status={status} />
        <span className="hidden sm:inline">{PROFESSIONAL_STATUS[status]?.label}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div role="menu" aria-label="Cambiar estado" className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-float">
          {STATUS_OPTIONS.map(([key, config]) => (
            <button
              key={key}
              type="button"
              role="menuitemradio"
              aria-checked={key === status}
              onClick={() => {
                onChange(key);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-blue-50',
                key === status && 'bg-blue-50',
              )}
            >
              <StatusDot status={key} className="mt-1" />
              <span className="min-w-0">
                <span className="block text-sm font-bold text-navy-800">{config.label}</span>
                <span className="block truncate text-xs font-medium text-slate-500">{config.description}</span>
              </span>
              {key === status && <Check className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-action" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
