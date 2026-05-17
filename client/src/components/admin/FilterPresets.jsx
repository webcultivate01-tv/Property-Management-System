import { useEffect, useRef, useState } from 'react';
import { Bookmark, BookmarkPlus, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const KEY = (id) => `tlv-presets:${id}`;

/**
 * Filter preset bookmark for a list page.
 *
 * Props:
 *   storageKey - unique id per page (e.g. "properties", "inquiries")
 *   current    - object of current filter values, e.g. { search, status }
 *   onApply    - (preset.filters) => void   — caller restores the filters
 */
export function FilterPresets({ storageKey, current, onApply }) {
  const [open, setOpen] = useState(false);
  const [presets, setPresets] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY(storageKey));
      setPresets(raw ? JSON.parse(raw) : []);
    } catch {
      setPresets([]);
    }
  }, [storageKey]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const persist = (next) => {
    setPresets(next);
    try { localStorage.setItem(KEY(storageKey), JSON.stringify(next)); } catch { /* ignore */ }
  };

  const hasAnyFilter = Object.values(current || {}).some((v) => v != null && v !== '');

  const save = () => {
    if (!hasAnyFilter) {
      toast.error('Apply some filters first.');
      return;
    }
    const label = window.prompt('Name this preset:', autoLabel(current));
    if (!label) return;
    const next = [
      ...presets.filter((p) => p.label !== label),
      { id: Date.now(), label: label.slice(0, 50), filters: current },
    ];
    persist(next);
    toast.success('Preset saved');
  };

  const remove = (id) => {
    persist(presets.filter((p) => p.id !== id));
  };

  const applyPreset = (p) => {
    onApply(p.filters);
    setOpen(false);
    toast.success(`Loaded "${p.label}"`);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="btn-outline gap-2"
        title="Filter presets"
      >
        <Bookmark size={16} />
        Presets
        {presets.length > 0 && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-100 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300">
            {presets.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 z-30 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-glow overflow-hidden">
          <button
            onClick={save}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition text-left border-b border-slate-100 dark:border-white/10"
          >
            <BookmarkPlus size={16} className="text-brand-600" />
            <span className="text-sm font-semibold">Save current filters</span>
          </button>

          {presets.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-slate-400">
              No presets saved yet. Apply filters and click "Save current filters".
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto py-1">
              {presets.map((p) => (
                <div
                  key={p.id}
                  className="group flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                >
                  <button
                    onClick={() => applyPreset(p)}
                    className="flex-1 flex items-center gap-2 text-left min-w-0"
                  >
                    <Check size={14} className="text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate dark:text-slate-100">{p.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {summarize(p.filters)}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className={cn(
                      'p-1.5 rounded-md text-rose-500 opacity-0 group-hover:opacity-100',
                      'hover:bg-rose-50 dark:hover:bg-rose-500/10'
                    )}
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function autoLabel(filters = {}) {
  const parts = [];
  if (filters.status) parts.push(filters.status);
  if (filters.search) parts.push(`"${filters.search.slice(0, 20)}"`);
  return parts.join(' · ') || 'My preset';
}

function summarize(filters = {}) {
  return Object.entries(filters)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ');
}
