import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const accents = {
  brand:   { stripe: 'border-l-brand-500',   icon: 'bg-brand-50 text-brand-600',     value: 'text-brand-600' },
  emerald: { stripe: 'border-l-emerald-500', icon: 'bg-emerald-50 text-emerald-600', value: 'text-emerald-600' },
  amber:   { stripe: 'border-l-amber-500',   icon: 'bg-amber-50 text-amber-600',     value: 'text-amber-600' },
  rose:    { stripe: 'border-l-rose-500',    icon: 'bg-rose-50 text-rose-600',       value: 'text-rose-600' },
  accent:  { stripe: 'border-l-accent-500',  icon: 'bg-accent-50 text-accent-600',   value: 'text-accent-600' },
  violet:  { stripe: 'border-l-violet-500',  icon: 'bg-violet-50 text-violet-600',   value: 'text-violet-600' },
  sky:     { stripe: 'border-l-sky-500',     icon: 'bg-sky-50 text-sky-600',         value: 'text-sky-600' },
};

export function StatCard({ icon: Icon, label, value, accent = 'brand', index = 0, suffix }) {
  const a = accents[accent] || accents.brand;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'relative bg-white rounded-2xl border border-slate-200/70 p-5 shadow-card border-l-4',
        a.stripe
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn('w-12 h-12 rounded-xl grid place-items-center', a.icon)}>
          <Icon size={22} />
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
          <TrendingUp size={12} /> Active
        </span>
      </div>
      <div className="mt-5">
        <div className={cn('font-display font-extrabold text-3xl tracking-tight', a.value)}>
          {value}{suffix}
        </div>
        <div className="text-sm text-slate-500 mt-1">{label}</div>
      </div>
    </motion.div>
  );
}
