import { cn } from '../../lib/utils';

export default function Tabs({ tabs, active, onChange, className }) {
  return (
    <div
      role="tablist"
      aria-label="Secciones"
      className={cn(
        'flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1',
        'scrollbar-none',
        className,
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-action',
              isActive ? 'bg-white text-navy-800 shadow-sm' : 'text-slate-500 hover:text-navy-800',
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
