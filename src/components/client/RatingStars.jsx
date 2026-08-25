import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function RatingStars({ rating, reviewsCount, className }) {
  const rounded = Math.round(rating);
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="flex items-center" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={cn('h-3.5 w-3.5', index < rounded ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200')}
          />
        ))}
      </span>
      <span className="text-sm font-extrabold text-navy-800">{rating.toFixed(1)}</span>
      {typeof reviewsCount === 'number' && (
        <span className="text-xs font-medium text-slate-400">({reviewsCount} reseñas)</span>
      )}
    </span>
  );
}
