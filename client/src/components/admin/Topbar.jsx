import { Menu, Bell, Search, Calculator, Moon, Sun } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { toggleAdminTheme } from '@/store/slices/uiSlice';
import { cn } from '@/lib/utils';

export function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const adminTheme = useSelector((s) => s.ui.adminTheme);

  const openPalette = () => {
    const e = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
    window.dispatchEvent(e);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/70 dark:border-white/10">
      <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5">
          <Menu size={20} />
        </button>

        <div className="hidden sm:flex items-center gap-3 text-sm">
          <span className="relative inline-flex w-2.5 h-2.5">
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
            <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Live</span>
          <span className="text-slate-300 dark:text-white/20">|</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">Admin Panel</span>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-auto">
          <button
            type="button"
            onClick={openPalette}
            className="w-full flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-sm text-slate-500 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/10 transition"
          >
            <Search size={16} className="text-slate-400" />
            <span className="flex-1 text-left">Search or jump to…</span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300">
              Ctrl K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('tools:open-emi'))}
            className="hidden sm:inline-flex p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
            title="EMI Calculator"
          >
            <Calculator size={18} />
          </button>
          <button
            type="button"
            onClick={() => dispatch(toggleAdminTheme())}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
            title={adminTheme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {adminTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
          </button>
          <div className="hidden sm:flex items-center gap-3 pl-3 ml-1 border-l border-slate-200 dark:border-white/10">
            <div className="text-right leading-tight">
              <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">{user?.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className={cn(
              'text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-md',
              user?.role === 'super_admin'
                ? 'bg-amber-400/20 text-amber-700 dark:text-amber-300'
                : 'bg-brand-500/15 text-brand-700 dark:text-brand-300'
            )}>
              {user?.role === 'super_admin' ? 'Super' : user?.role === 'agent' ? 'Agent' : 'Admin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
