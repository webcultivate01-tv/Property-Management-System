import { Link } from 'react-router-dom';
import { Building2, Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, ChevronRight, Youtube, Send } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const socialLinks = [
    { Icon: Facebook, href: '#', label: 'Facebook' },
    { Icon: Instagram, href: '#', label: 'Instagram' },
    { Icon: Twitter, href: '#', label: 'Twitter' },
    { Icon: Linkedin, href: '#', label: 'LinkedIn' },
    { Icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="mt-24 bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-white/5">
      {/* Newsletter Section */}
      <div className="bg-brand-gradient">
        <div className="container-x py-10 md:py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-display font-bold text-white mb-2 md:mb-3">
              Stay Updated with Latest Properties
            </h3>
            <p className="text-brand-100 mb-5 md:mb-6 text-xs md:text-sm">
              Subscribe to our newsletter and get exclusive property deals, market insights, and investment tips.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 md:gap-3 max-w-md mx-auto px-4 sm:px-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                required
              />
              <button
                type="submit"
                className="px-5 md:px-6 py-2.5 md:py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg md:rounded-xl font-semibold transition flex items-center justify-center gap-2 group text-sm whitespace-nowrap"
              >
                {subscribed ? (
                  <>✓ Subscribed!</>
                ) : (
                  <>
                    Subscribe <Send size={16} className="group-hover:translate-x-1 transition" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-x py-12 md:py-16 grid gap-8 md:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {/* Company Info */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="flex items-center gap-2.5 mb-4 group w-fit">
            <div className="w-10 h-10 rounded-xl bg-brand-gradient grid place-items-center shadow-soft group-hover:scale-110 transition">
              <Building2 size={20} className="text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-extrabold text-lg text-slate-900 dark:text-white">Telvine</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 -mt-0.5">
                Realty
              </div>
            </div>
          </Link>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
            Your trusted partner in finding the perfect property. Premium real estate solutions across India.
          </p>
          <div className="flex gap-2 flex-wrap">
            {socialLinks.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-brand-500 dark:hover:bg-brand-500 text-slate-600 dark:text-slate-400 hover:text-white grid place-items-center transition-all hover:scale-110"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-slate-900 dark:text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { to: '/', label: 'Home' },
              { to: '/about', label: 'About Us' },
              { to: '/properties', label: 'Properties' },
              { to: '/services', label: 'Services' },
              { to: '/contact', label: 'Contact Us' },
            ].map((link) => (
              <li key={link.to}>
                <Link 
                  to={link.to} 
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all group"
                >
                  <ChevronRight size={14} className="flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Property Types */}
        <div>
          <h4 className="text-slate-900 dark:text-white font-semibold mb-4 text-sm uppercase tracking-wider">Property Types</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              'Residential Apartments',
              'Luxury Villas',
              'Commercial Spaces',
              'Plots & Land',
              'Penthouses',
              'Studio Apartments',
            ].map((item) => (
              <li key={item}>
                <Link 
                  to="/properties" 
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all group"
                >
                  <ChevronRight size={14} className="flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  <span>{item}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Our Services */}
        <div>
          <h4 className="text-slate-900 dark:text-white font-semibold mb-4 text-sm uppercase tracking-wider">Our Services</h4>
          <ul className="space-y-2.5 text-sm">
            {[
              'Property Buying',
              'Property Selling',
              'Property Renting',
              'Investment Consulting',
              'Legal Assistance',
              'Home Loans',
            ].map((item) => (
              <li key={item}>
                <Link 
                  to="/services" 
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all group"
                >
                  <ChevronRight size={14} className="flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  <span>{item}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-slate-900 dark:text-white font-semibold mb-4 text-sm uppercase tracking-wider">Get In Touch</h4>
          <ul className="space-y-4 text-sm">
            <li>
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex gap-3 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition group"
              >
                <MapPin size={18} className="mt-0.5 text-brand-500 flex-shrink-0 group-hover:scale-110 transition" />
                <span>123 Business Park, Andheri East, Mumbai, Maharashtra 400069</span>
              </a>
            </li>
            <li>
              <a 
                href="tel:+919876543210" 
                className="flex gap-3 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition group"
              >
                <Phone size={18} className="mt-0.5 text-brand-500 flex-shrink-0 group-hover:scale-110 transition" />
                <span>+91 98765 43210</span>
              </a>
            </li>
            <li>
              <a 
                href="mailto:contact@telvine.com" 
                className="flex gap-3 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition group"
              >
                <Mail size={18} className="mt-0.5 text-brand-500 flex-shrink-0 group-hover:scale-110 transition" />
                <span>contact@telvine.com</span>
              </a>
            </li>
          </ul>
          <div className="mt-6 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-1 font-semibold">Business Hours</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Mon - Sat: 9:00 AM - 7:00 PM</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Sunday: 10:00 AM - 5:00 PM</p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200 dark:border-white/5">
        <div className="container-x py-5 md:py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <span>© {new Date().getFullYear()} Telvine Realty. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <div className="flex gap-3 md:gap-4 flex-wrap justify-center">
                <Link to="/privacy" className="hover:text-brand-600 dark:hover:text-brand-400 transition">Privacy Policy</Link>
                <span>•</span>
                <Link to="/terms" className="hover:text-brand-600 dark:hover:text-brand-400 transition">Terms of Service</Link>
                <span>•</span>
                <Link to="/sitemap" className="hover:text-brand-600 dark:hover:text-brand-400 transition">Sitemap</Link>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>Crafted with</span>
              <span className="text-red-500 animate-pulse">❤</span>
              <span>for Premium Real Estate</span>
            </div>
          </div>
          
          {/* Developer Credit */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Developed by{' '}
              <a 
                href="https://webcultivate.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition inline-flex items-center gap-1"
              >
                WebCultivate Software Solutions
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
