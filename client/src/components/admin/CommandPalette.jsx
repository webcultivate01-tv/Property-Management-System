import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Building2, MessageSquare, Star, ShieldCheck, UserCog,
  Settings, CalendarDays, Plus, Calculator, Moon, Sun, LogOut, Search,
} from 'lucide-react';
import { toggleAdminTheme } from '@/store/slices/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const STATIC_ACTIONS = [
  { id: 'dash', label: 'Go to Dashboard', icon: LayoutDashboard, to: '/admin', group: 'Navigate' },
  { id: 'props', label: 'Properties', icon: Building2, to: '/admin/properties', group: 'Navigate' },
  { id: 'new-prop', label: 'New Property', icon: Plus, to: '/admin/properties/new', group: 'Create', accent: true },
  { id: 'inq', label: 'Inquiries', icon: MessageSquare, to: '/admin/inquiries', group: 'Navigate' },
  { id: 'rev', label: 'Reviews', icon: Star, to: '/admin/reviews', group: 'Navigate' },
  { id: 'ev', label: 'Events', icon: CalendarDays, to: '/admin/events', group: 'Navigate' },
  { id: 'admins', label: 'Admins', icon: ShieldCheck, to: '/admin/admins', group: 'Navigate', roles: ['super_admin', 'admin'] },
  { id: 'agents', label: 'Agents', icon: UserCog, to: '/admin/agents', group: 'Navigate', roles: ['super_admin', 'admin'] },
  { id: 'set', label: 'Settings', icon: Settings, to: '/admin/settings', group: 'Navigate' },
];

const TOOL_ACTIONS = [
  { id: 'emi', label: 'EMI / Mortgage Calculator', icon: Calculator, group: 'Tools', event: 'tools:open-emi' },
  { id: 'theme', label: 'Toggle Dark Mode', icon: Moon, group: 'Tools', event: 'tools:toggle-theme' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const adminTheme = useSelector((s) => s.ui.adminTheme);
  const { user, logout } = useAuth();

  useEffect(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const role = user?.role;
  const items = useMemo(() => {
    const all = [
      ...STATIC_ACTIONS.filter((a) => !a.roles || a.roles.includes(role)),
      ...TOOL_ACTIONS,
      {
        id: 'logout',
        label: 'Log out',
        icon: LogOut,
        group: 'Session',
        onRun: () => logout(),
        accent: 'danger',
      },
    ];
    const needle = q.trim().toLowerCase();
    if (!needle) return all;
    return all.filter((a) => a.label.toLowerCase().includes(needle));
  }, [q, role, logout]);

  useEffect(() => { setActive(0); }, [q]);

  const run = (item) => {
    if (!item) return;
    setOpen(false);
    if (item.onRun) item.onRun();
    else if (item.id === 'theme') dispatch(toggleAdminTheme());
    else if (item.event) window.dispatchEvent(new CustomEvent(item.event));
    else if (item.to) navigate(item.to);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(items[active]);
    }
  };

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm grid place-items-start pt-[12vh] px-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-white/10">
          <Search size={16} className="text-slate-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a command or page…"
            className="flex-1 bg-transparent outline-none text-sm dark:text-slate-100 placeholder:text-slate-400"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
            esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-1">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              No matches.
            </div>
          ) : (
            items.map((it, idx) => {
              const Icon = it.icon;
              const themeIcon = it.id === 'theme' && adminTheme === 'dark' ? Sun : Icon;
              const I = themeIcon;
              return (
                <button
                  key={it.id}
                  data-idx={idx}
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => run(it)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition',
                    idx === active
                      ? 'bg-brand-50 dark:bg-brand-500/10'
                      : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]',
                    it.accent === 'danger' && 'text-rose-600 dark:text-rose-300'
                  )}
                >
                  <I size={16} className={cn(
                    'shrink-0',
                    it.accent === true && 'text-brand-600 dark:text-brand-300',
                    it.accent === 'danger' && 'text-rose-500'
                  )} />
                  <span className="flex-1 truncate">{it.label}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">
                    {it.group}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>↑ ↓ to navigate · ⏎ to select</span>
          <span>
            <kbd className="font-mono px-1 py-0.5 rounded bg-slate-100 dark:bg-white/10">Ctrl</kbd>
            {' + '}
            <kbd className="font-mono px-1 py-0.5 rounded bg-slate-100 dark:bg-white/10">K</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}

