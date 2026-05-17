import { cn } from '@/lib/utils';
import { statusColors } from '@/lib/utils';

export function Badge({ status, className, children }) {
  return (
    <span
      className={cn(
        'chip capitalize',
        status ? statusColors[status] : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200',
        className
      )}
    >
      {children || status}
    </span>
  );
}
