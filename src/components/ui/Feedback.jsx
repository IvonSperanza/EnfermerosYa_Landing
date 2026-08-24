import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center', className)}>
      {Icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-card">
          <Icon className="h-6 w-6 text-action" />
        </span>
      )}
      <h3 className="mt-4 text-base font-bold text-navy-800">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm font-medium text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Algo salió mal', description = 'No pudimos cargar la información. Volvé a intentar en unos segundos.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-card">
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </span>
      <h3 className="mt-4 text-base font-bold text-navy-800">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm font-medium text-slate-500">{description}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-5">
          Reintentar
        </button>
      )}
    </div>
  );
}

export function PageLoader({ label = 'Cargando…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20" role="status">
      <Loader2 className="h-8 w-8 animate-spin text-action" />
      <p className="sr-only">{label}</p>
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-100', className)} aria-hidden="true" />;
}
