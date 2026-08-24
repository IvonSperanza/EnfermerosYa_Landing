import { cn } from '../../lib/utils';
import { initialsFrom } from '../../lib/format';

const SIZES = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

export const AVATAR_TONES = [
  'from-action to-blue-400',
  'from-emerald-500 to-teal-400',
  'from-violet-500 to-purple-400',
  'from-amber-500 to-orange-400',
];

function toneFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 997;
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

export default function Avatar({ name, size = 'md', onlineStatus, src, className }) {
  const initials = initialsFrom(name || '?');

  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn('rounded-full object-cover', SIZES[size])}
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn('flex items-center justify-center rounded-full bg-gradient-to-br font-bold text-white', SIZES[size], toneFor(name || ''))}
        >
          {initials}
        </span>
      )}
      {onlineStatus === 'online' && (
        <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" aria-label="En línea" />
      )}
      {onlineStatus === 'offline' && (
        <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-slate-300" aria-hidden="true" />
      )}
    </span>
  );
}
