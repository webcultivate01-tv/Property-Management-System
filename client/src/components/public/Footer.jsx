import { Link } from 'react-router-dom';
import { Building2, Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 bg-surface-darker text-slate-300">
      <div className="container-x py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-brand-gradient grid place-items-center">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="font-display font-extrabold text-xl text-white">Telvine Realty</span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed">
            Premium real estate solutions across India. Discover, invest, and live
            beautifully with Telvine.
          </p>
          <div className="flex gap-3 mt-5">
            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand-500/20 grid place-items-center transition"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/properties" className="hover:text-white">Properties</Link></li>
            <li><Link to="/services" className="hover:text-white">Services</Link></li>
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Services</h4>
          <ul className="space-y-2 text-sm">
            <li>Property Buying</li>
            <li>Property Selling</li>
            <li>Property Renting</li>
            <li>Investment Consulting</li>
            <li>Legal Assistance</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2.5"><MapPin size={16} className="mt-0.5 text-brand-400"/> Mumbai, Maharashtra, India</li>
            <li className="flex gap-2.5"><Phone size={16} className="mt-0.5 text-brand-400"/> +91 98765 43210</li>
            <li className="flex gap-2.5"><Mail size={16} className="mt-0.5 text-brand-400"/> contact@telvine.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="container-x py-5 text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Telvine Realty. All rights reserved.</span>
          <span>Crafted with care · Premium Real Estate Platform</span>
        </div>
      </div>
    </footer>
  );
}
