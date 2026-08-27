import { cn } from '../../lib/utils';

export default function Switch({ checked, onChange, label, description, disabled }) {
  return (
    <label
      className={cn(
        'flex items-start justify-between gap-4',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      )}
    >
      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="block text-sm font-semibold text-navy-800">{label}</span>}
          {description && <span className="mt-0.5 block text-xs font-medium leading-relaxed text-slate-500">{description}</span>}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={typeof label === 'string' ? label : 'Alternar'}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2',
          checked ? 'bg-action' : 'bg-slate-300',
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </label>
  );
}
