import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Rating({ value = 0, size = 16, editable, onChange, className }) {
  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!editable}
          onClick={() => onChange?.(i)}
          className={cn(
            'transition',
            editable && 'hover:scale-110 cursor-pointer',
            !editable && 'cursor-default'
          )}
        >
          <Star
            size={size}
            className={cn(
              i <= value
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300 dark:text-slate-600'
            )}
          />
        </button>
      ))}
    </div>
  );
}
