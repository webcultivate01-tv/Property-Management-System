import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 dark:bg-surface-darker">
      {/* Left visual */}
      <div className="hidden lg:flex relative bg-brand-gradient text-white p-12 flex-col justify-between overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent-500/30 rounded-full blur-3xl" />
        <Link to="/" className="flex items-center gap-2.5 relative">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur grid place-items-center">
            <Building2 size={20} />
          </div>
          <div>
            <div className="font-display font-extrabold text-xl">Telvine Realty</div>
            <div className="text-xs opacity-70 uppercase tracking-widest">Admin Console</div>
          </div>
        </Link>
        <div className="relative">
          <h2 className="font-display font-extrabold text-4xl leading-tight">
            Premium real estate, <br /> beautifully managed.
          </h2>
          <p className="mt-4 opacity-80 max-w-md">
            A modern dashboard built for real-estate teams — listings, leads, reviews and more.
          </p>
        </div>
        <div className="relative text-xs opacity-70">
          © {new Date().getFullYear()} Telvine Realty
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-brand-gradient grid place-items-center">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="font-display font-extrabold text-lg">Telvine Realty</span>
          </Link>
          <h1 className="font-display font-extrabold text-3xl mb-1.5">{title}</h1>
          {subtitle && <p className="text-slate-500 dark:text-slate-400 mb-6">{subtitle}</p>}
          {children}
          {footer && <div className="mt-6 text-sm text-center text-slate-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
