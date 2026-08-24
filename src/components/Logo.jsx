import { HeartPulse } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Logo({ className, tone = 'light' }) {
  return (
    <a href="#inicio" className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-action shadow-sm">
        <HeartPulse className="h-6 w-6 text-white" strokeWidth={2.2} />
      </span>
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
