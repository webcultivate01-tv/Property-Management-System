import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Pagination({ page = 1, totalPages = 1, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1.5 py-6">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/5"
      >
        <ChevronLeft size={16} />
      </button>
      {start > 1 && (
        <>
          <PageBtn onClick={() => onChange(1)}>1</PageBtn>
          {start > 2 && <span className="px-1 text-slate-400">…</span>}
        </>
      )}
      {pages.map((p) => (
        <PageBtn key={p} active={p === page} onClick={() => onChange(p)}>
          {p}
        </PageBtn>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
          <PageBtn onClick={() => onChange(totalPages)}>{totalPages}</PageBtn>
        </>
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/5"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function PageBtn({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'min-w-[36px] h-9 rounded-lg text-sm font-medium border transition',
        active
          ? 'bg-brand-gradient text-white border-transparent shadow-soft'
          : 'border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5'
      )}
    >
      {children}
    </button>
  );
}
