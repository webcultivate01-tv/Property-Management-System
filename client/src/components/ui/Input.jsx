import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef(function Input(
  { label, error, className, ...rest },
  ref
) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <input
        ref={ref}
        className={cn('input', error && 'border-rose-500 focus:ring-rose-500', className)}
        {...rest}
      />
      {error && <p className="text-xs text-rose-500 mt-1.5">{error}</p>}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, className, rows = 4, ...rest },
  ref
) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <textarea
        ref={ref}
        rows={rows}
        className={cn('input', error && 'border-rose-500 focus:ring-rose-500', className)}
        {...rest}
      />
      {error && <p className="text-xs text-rose-500 mt-1.5">{error}</p>}
    </div>
  );
});

export const Select = forwardRef(function Select(
  { label, error, className, children, ...rest },
  ref
) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <select
        ref={ref}
        className={cn('input pr-10 appearance-none', error && 'border-rose-500', className)}
        {...rest}
      >
        {children}
      </select>
      {error && <p className="text-xs text-rose-500 mt-1.5">{error}</p>}
    </div>
  );
});
