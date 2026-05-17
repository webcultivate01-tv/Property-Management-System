import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function Topbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/70">
      <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
          <Menu size={20} />
        </button>

        <div className="hidden sm:flex items-center gap-3 text-sm">
          <span className="relative inline-flex w-2.5 h-2.5">
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
            <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="font-semibold text-emerald-600">Live</span>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-slate-700">Admin Panel</span>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-auto">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition placeholder:text-slate-400"
              placeholder="Search..."
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
          </button>
          <div className="hidden sm:flex items-center gap-3 pl-3 ml-1 border-l border-slate-200">
            <div className="text-right leading-tight">
              <div className="font-semibold text-sm text-slate-800">{user?.name}</div>
              <div className="text-xs text-slate-500">{user?.email}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className={cn(
              'text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-md',
              user?.role === 'super_admin'
                ? 'bg-amber-400/20 text-amber-700'
                : 'bg-brand-500/15 text-brand-700'
            )}>
              {user?.role === 'super_admin' ? 'Super' : 'Admin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
