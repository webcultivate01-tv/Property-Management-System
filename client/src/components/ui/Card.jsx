import { cn } from '@/lib/utils';

export function Card({ className, children, ...rest }) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/10 shadow-card',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn('px-6 pt-5 pb-3', className)}>{children}</div>;
}
export function CardTitle({ className, children }) {
  return <h3 className={cn('font-display font-bold text-lg', className)}>{children}</h3>;
}
export function CardContent({ className, children }) {
  return <div className={cn('px-6 pb-6', className)}>{children}</div>;
}
