import { cn } from '../../lib/utils';

const VARIANTS = {
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10',
  warning: 'bg-amber-100 text-amber-700 ring-1 ring-amber-600/10',
  danger: 'bg-red-50 text-red-600 ring-1 ring-red-600/10',
  info: 'bg-sky-100 text-sky-700 ring-1 ring-sky-600/10',
  blue: 'bg-blue-50 text-action ring-1 ring-blue-600/10',
  violet: 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/10',
  neutral: 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/10',
};

export default function Badge({ variant = 'neutral', dot, children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold',
        VARIANTS[variant] || VARIANTS.neutral,
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}
