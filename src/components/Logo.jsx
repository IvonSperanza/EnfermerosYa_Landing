import { cn } from '../lib/utils';

export default function Logo({ className, tone = 'light' }) {
  return (
    <a href="#inicio" className={cn('inline-flex items-center gap-2.5', className)}>
      <img
        src="/logo.jpg"
        alt=""
        aria-hidden="true"
        className="h-10 w-10 rounded-xl object-cover shadow-sm"
      />
      <span
        className={cn(
          'text-xl font-extrabold tracking-tight',
          tone === 'light' ? 'text-navy-800' : 'text-white'
        )}
      >
        Enfermeros<span className="text-action">Ya</span>
      </span>
    </a>
  );
}
