import { cn } from '@/lib/utils';

export function Spinner({ className, size = 24 }) {
  return (
    <div
      className={cn(
        'rounded-full border-2 border-slate-300 dark:border-white/20 border-t-brand-600 animate-spin',
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size={40} />
    </div>
  );
}

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-slate-200/70 dark:bg-white/10',
        className
      )}
    />
  );
}
