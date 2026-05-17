import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

const DEFAULT_COLORS = ['#f97316', '#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899'];

export function DonutCard({
  icon: Icon,
  title,
  subtitle = 'All time',
  data = [],
  colors = DEFAULT_COLORS,
  centerLabel = 'Total',
  unit = '',
  className,
}) {
  const total = data.reduce((acc, d) => acc + (d.value || 0), 0);

  return (
    <div className={cn('bg-white rounded-2xl border border-slate-200/70 shadow-card overflow-hidden', className)}>
      <div className="px-5 py-4 border-b border-slate-200/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700">
          {Icon && <Icon size={16} className="text-brand-500" />}
          <h3 className="font-display font-bold">{title}</h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-slate-500 px-2.5 py-1 rounded-md bg-slate-100">
          {subtitle}
        </span>
      </div>
      <div className="p-5">
        {data.length === 0 || total === 0 ? (
          <div className="h-[220px] grid place-items-center text-sm text-slate-400">No data yet</div>
        ) : (
          <div className="grid sm:grid-cols-[200px_1fr] gap-5 items-center">
            <div className="relative h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={88}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {data.map((_, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      color: '#fff',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="font-display font-extrabold text-3xl text-slate-900">{total}{unit}</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-0.5">{centerLabel}</div>
                </div>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              {data.map((d, i) => {
                const pct = total ? Math.round((d.value / total) * 100) : 0;
                return (
                  <li key={d.name} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: colors[i % colors.length] }}
                    />
                    <span className="flex-1 capitalize text-slate-700">{d.name}</span>
                    <span className="font-semibold text-slate-800">{d.value}</span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md text-amber-700 bg-amber-50"
                    >
                      {pct}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
