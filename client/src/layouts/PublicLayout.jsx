import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import EventPopup from '@/components/public/EventPopup';

export default function PublicLayout() {
  const { pathname } = useLocation();

  // Public site is light-theme only — strip any leftover dark class
  // (e.g. when navigating back from /admin where dark mode may be active).
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 md:pt-20">
        <Outlet />
      </main>
      <Footer />
      <EventPopup />
    </div>
  );
}
