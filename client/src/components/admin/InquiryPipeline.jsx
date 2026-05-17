import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Phone, MessageCircle, GripVertical, ExternalLink } from 'lucide-react';
import { inquiryService } from '@/services/inquiry.service';
import { Skeleton } from '@/components/ui/Spinner';
import { scoreInquiry, TIER_STYLE, TIER_LABEL } from '@/lib/leadScore';
import { fetchAllPages } from '@/lib/exportAll';
import { timeAgo } from '@/lib/utils';

const COLUMNS = [
  { id: 'new',        label: 'New',         accent: 'bg-brand-500' },
  { id: 'contacted',  label: 'Contacted',   accent: 'bg-amber-500' },
  { id: 'interested', label: 'Interested',  accent: 'bg-violet-500' },
  { id: 'closed',     label: 'Closed',      accent: 'bg-emerald-500' },
  { id: 'spam',       label: 'Spam',        accent: 'bg-slate-400' },
];

export function InquiryPipeline({ search }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);

  const load = () => {
    setLoading(true);
    fetchAllPages(inquiryService.list, { search })
      .then(setRows)
      .catch(() => toast.error('Failed to load pipeline'))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [search]);

  const grouped = useMemo(() => {
    const out = Object.fromEntries(COLUMNS.map((c) => [c.id, []]));
    rows.forEach((r) => {
      const s = COLUMNS.find((c) => c.id === r.status) ? r.status : 'new';
      out[s].push(r);
    });
    // Sort each column by lead score desc.
    Object.keys(out).forEach((k) => {
      out[k].sort((a, b) => scoreInquiry(b).score - scoreInquiry(a).score);
    });
    return out;
  }, [rows]);

  const onDragStart = (id) => setDragId(id);
  const onDragEnd = () => { setDragId(null); setOverCol(null); };

  const onDrop = async (status) => {
    const id = dragId;
    setDragId(null); setOverCol(null);
    if (!id) return;
    const target = rows.find((r) => r._id === id);
    if (!target || target.status === status) return;
    // Optimistic update
    setRows((prev) => prev.map((r) => r._id === id ? { ...r, status } : r));
    try {
      await inquiryService.update(id, { status });
      toast.success(`Moved to ${status}`);
    } catch {
      toast.error('Move failed — reverting');
      load();
    }
  };

  if (loading && rows.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4">
        {COLUMNS.map((c) => <Skeleton key={c.id} className="h-[420px]" />)}
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-3 overflow-x-auto">
      {COLUMNS.map((col) => {
        const items = grouped[col.id] || [];
        const isOver = overCol === col.id;
        return (
          <div
            key={col.id}
            onDragOver={(e) => { e.preventDefault(); setOverCol(col.id); }}
            onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
            onDrop={() => onDrop(col.id)}
            className={`flex flex-col rounded-2xl border transition ${
              isOver
                ? 'border-brand-400 bg-brand-50/60 dark:bg-brand-500/10'
                : 'border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02]'
            }`}
            style={{ minHeight: 460 }}
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200/60 dark:border-white/10">
              <span className={`w-2 h-2 rounded-full ${col.accent}`} />
              <h4 className="text-sm font-bold dark:text-slate-100">{col.label}</h4>
              <span className="ml-auto text-xs font-semibold text-slate-500 dark:text-slate-400">
                {items.length}
              </span>
            </div>
            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
              {items.length === 0 && (
                <div className="text-[11px] text-center text-slate-400 py-6">
                  Drop here
                </div>
              )}
              {items.map((i) => {
                const { tier, score } = scoreInquiry(i);
                return (
                  <article
                    key={i._id}
                    draggable
                    onDragStart={() => onDragStart(i._id)}
                    onDragEnd={onDragEnd}
                    className={`group bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition ${
                      dragId === i._id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical size={12} className="text-slate-300 mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-sm truncate dark:text-slate-100">{i.name}</div>
                          <span className={`chip text-[9px] font-bold uppercase tracking-wider ${TIER_STYLE[tier]}`}>
                            {TIER_LABEL[tier]} · {score}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 truncate">{i.email}</div>
                        {i.property?.title && (
                          <div className="text-[11px] text-slate-500 mt-1 truncate">
                            <span className="text-slate-400">re:</span> {i.property.title}
                          </div>
                        )}
                        {i.message && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2">
                            {i.message}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
                          {i.phone && (
                            <a
                              href={`tel:${i.phone.replace(/[^\d+]/g, '')}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500"
                              title="Call"
                            >
                              <Phone size={11} />
                            </a>
                          )}
                          {i.phone && (
                            <a
                              href={`https://wa.me/${i.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600"
                              title="WhatsApp"
                            >
                              <MessageCircle size={11} />
                            </a>
                          )}
                          <a
                            href={`mailto:${i.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500"
                            title="Email"
                          >
                            <Mail size={11} />
                          </a>
                          <span className="ml-auto text-[10px] text-slate-400">
                            {timeAgo(i.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
