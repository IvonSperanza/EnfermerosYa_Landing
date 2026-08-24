import { Link } from '../../router/Router';
import { cn } from '../../lib/utils';
import Avatar from './Avatar';

const ICON_TONES = {
  blue: 'bg-blue-50 text-action',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-500',
};

export default function StatCard({ icon: Icon, tone = 'blue', label, value, sub, href, onClick, className }) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
        {Icon && (
          <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', ICON_TONES[tone])}>
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
      </div>
      <p className="mt-2.5 text-2xl font-extrabold tracking-tight text-navy-800 sm:text-3xl">{value}</p>
      {sub && <p className="mt-1 truncate text-xs font-medium text-slate-500">{sub}</p>}
    </>
  );

  const classes = cn(
    'card block p-5 transition-all',
    (href || onClick) && 'hover:-translate-y-0.5 hover:shadow-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-action',
    className,
  );

  if (href) {
    return (
      <Link to={href} className={classes}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(classes, 'text-left')}>
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}
