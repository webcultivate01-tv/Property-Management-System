import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Sidebar } from '@/components/admin/Sidebar';
import { Topbar } from '@/components/admin/Topbar';
import { CommandPalette } from '@/components/admin/CommandPalette';
import { EmiCalculator } from '@/components/admin/EmiCalculator';
import { QrCodeModal } from '@/components/admin/QrCodeModal';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const adminTheme = useSelector((s) => s.ui.adminTheme);

  // Sync admin theme to <html class> while the admin panel is mounted; restore on unmount.
  useEffect(() => {
    const root = document.documentElement;
    const prevDark = root.classList.contains('dark');
    if (adminTheme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    return () => {
      if (prevDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };
  }, [adminTheme]);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="min-h-screen flex items-start bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
      <EmiCalculator />
      <QrCodeModal />
    </div>
  );
}
