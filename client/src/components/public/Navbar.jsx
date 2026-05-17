import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Building2, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { to: '/', label: 'Home' },
  { to: '/properties', label: 'Properties' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all',
        scrolled
          ? 'bg-white/80 dark:bg-surface-darker/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5'
          : 'bg-transparent'
      )}
    >
      <div className="container-x flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient grid place-items-center shadow-soft">
            <Building2 size={18} className="text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-extrabold text-lg">Telvine</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 -mt-0.5">
              Realty
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition',
                  isActive
                    ? 'text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/10'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="tel:+919876543210"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-300 transition px-3 py-2"
          >
            <Phone size={15} /> +91 98765 43210
          </a>
          <Link to="/contact" className="btn-primary hidden sm:inline-flex">
            Talk to expert
          </Link>

          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="lg:hidden border-t border-slate-200/50 dark:border-white/5 bg-white/95 dark:bg-surface-darker/95 backdrop-blur-xl"
          >
            <div className="container-x py-4 flex flex-col gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'px-4 py-2.5 rounded-lg text-sm font-medium',
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300'
                        : 'hover:bg-slate-100 dark:hover:bg-white/5'
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <a
                href="tel:+919876543210"
                className="px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/5 inline-flex items-center gap-2"
              >
                <Phone size={14} /> +91 98765 43210
              </a>
              <Link to="/contact" className="btn-primary mt-2">
                Talk to expert
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
