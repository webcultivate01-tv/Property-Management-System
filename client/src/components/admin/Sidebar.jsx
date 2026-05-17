import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building2, MessageSquare, Star, ShieldCheck, UserCog,
  Settings, ArrowLeft, LogOut, ChevronRight, Zap, X,
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const groups = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/admin/properties', icon: Building2, label: 'Properties' },
      { to: '/admin/events', icon: CalendarDays, label: 'Events' },
    ],
  },
  {
    label: 'Customers',
    items: [
      { to: '/admin/inquiries', icon: MessageSquare, label: 'Inquiries' },
      { to: '/admin/reviews', icon: Star, label: 'Reviews' },
    ],
  },
  {
    label: 'Team',
    items: [
      { to: '/admin/admins', icon: ShieldCheck, label: 'Admins', roles: ['super_admin', 'admin'] },
      { to: '/admin/agents', icon: UserCog, label: 'Agents', roles: ['super_admin', 'admin'] },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const Content = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center shadow-soft">
            <Zap size={18} className="text-white" fill="currentColor" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-extrabold text-slate-900 text-base">Telvine Realty</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500 mt-0.5">Admin Console</div>
          </div>
        </Link>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
          <X size={18} />
        </button>
      </div>

      {/* User card */}
      {/* <div className="mx-3 mb-4 rounded-2xl bg-slate-50 border border-slate-200/70 p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center font-bold shadow-soft">
          {user?.name?.[0]?.toUpperCase() || 'A'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-slate-900 truncate">{user?.name || 'Admin'}</div>
          <div className="text-xs text-slate-500 truncate">{roleLabel(user?.role)}</div>
        </div>
        <span className={cn(
          'text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md',
          user?.role === 'super_admin'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-brand-100 text-brand-700'
        )}>
          {user?.role === 'super_admin' ? 'Super' : user?.role === 'admin' ? 'Admin' : 'Agent'}
        </span>
      </div> */}

      {/* Nav */}
      <nav className="flex-1 px-3 overflow-y-auto pb-4">
        {groups.map((g) => (
          <div key={g.label} className="mb-5">
            <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              {g.label}
            </div>
            <div className="space-y-1">
              {g.items
                .filter((i) => !i.roles || i.roles.includes(user?.role))
                .map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                        isActive
                          ? 'bg-brand-50 text-brand-700 shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      )
                    }
                  >
                    <item.icon size={18} className="shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {location.pathname === item.to && (
                      <ChevronRight size={14} className="text-brand-500" />
                    )}
                  </NavLink>
                ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-1 border-t border-slate-200/80 pt-4 mx-3">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
        >
          <ArrowLeft size={18} /> Back to Site
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop — sticky to viewport so it doesn't scroll with content */}
      <aside className="hidden lg:flex sticky top-0 h-screen w-72 shrink-0 bg-white border-r border-slate-200/80 text-slate-700 z-20">
        {Content}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white text-slate-700 lg:hidden shadow-2xl"
            >
              {Content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function roleLabel(role) {
  if (role === 'super_admin') return 'Super Admin';
  if (role === 'admin') return 'Administrator';
  if (role === 'agent') return 'Agent';
  return 'Member';
}
