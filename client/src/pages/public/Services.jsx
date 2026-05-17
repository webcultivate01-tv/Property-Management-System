import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Home as HomeIcon, Tag, Key, TrendingUp, Scale, ArrowRight, Check,
  Search, ClipboardList, MapPin, FileCheck, Sparkles, Star,
  Building, Briefcase, Hotel, Warehouse, Trees, Users,
} from 'lucide-react';
import { SectionHeader } from '@/components/public/SectionHeader';

const services = [
  {
    icon: HomeIcon,
    title: 'Property Buying',
    description: 'Discover homes curated to match your taste, budget and lifestyle.',
    points: ['Verified listings', 'Personal advisor', 'Site visit assistance', 'Loan support'],
    img: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=80',
  },
  {
    icon: Tag,
    title: 'Property Selling',
    description: 'Sell smarter with data-backed pricing and a vast buyer network.',
    points: ['Market analysis', 'Premium marketing', 'Negotiation support', 'Faster closures'],
    img: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=900&q=80',
  },
  {
    icon: Key,
    title: 'Property Renting',
    description: 'Verified rental homes with hassle-free move-in and paperwork.',
    points: ['Verified tenants', 'Rental agreements', 'Property visits', 'Quick possession'],
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80',
  },
  {
    icon: TrendingUp,
    title: 'Investment Consulting',
    description: 'Strategic property investments tailored to your goals.',
    points: ['ROI analysis', 'Portfolio strategy', 'Market intel', 'Exit planning'],
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80',
  },
  {
    icon: Scale,
    title: 'Legal Assistance',
    description: 'End-to-end legal support from due-diligence to registration.',
    points: ['Title verification', 'Documentation', 'Registration help', 'Compliance review'],
    img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&q=80',
  },
];

const process = [
  { i: ClipboardList, n: '01', t: 'Discovery call', d: 'A 20-minute call to understand budget, lifestyle, must-haves and dealbreakers.' },
  { i: Search,        n: '02', t: 'Curated shortlist', d: '5–8 RERA-verified properties handpicked to your brief, delivered in 48 hours.' },
  { i: MapPin,        n: '03', t: 'Guided site visits', d: 'On-ground tours with your advisor — neighborhood, schools, commute, all covered.' },
  { i: FileCheck,     n: '04', t: 'Close & celebrate', d: 'Legal, loan, registration and move-in support until you have the keys in hand.' },
];

const segments = [
  { icon: Building, label: 'Apartments & Flats' },
  { icon: HomeIcon, label: 'Independent Houses' },
  { icon: Briefcase, label: 'Commercial Spaces' },
  { icon: Warehouse, label: 'Office Leasing' },
  { icon: Trees, label: 'Plots & Farmland' },
  { icon: Hotel, label: 'PG / Co-living' },
  { icon: Users, label: 'NRI Services' },
  { icon: Sparkles, label: 'Luxury Homes' },
];

const packages = [
  {
    name: 'Essentials',
    price: '₹ 0',
    cadence: 'Free',
    highlight: false,
    blurb: 'For buyers who want to browse and inquire on their own pace.',
    features: [
      'Unlimited browsing',
      'Save favourites',
      'Direct owner contact (where listed)',
      'Email support',
    ],
    cta: 'Browse Properties',
    href: '/properties',
  },
  {
    name: 'Advisor',
    price: 'No fee',
    cadence: 'Paid by developer',
    highlight: true,
    badge: 'Most popular',
    blurb: 'A dedicated relationship manager for buying, selling or renting.',
    features: [
      'Curated shortlist in 48 hours',
      'Guided site visits',
      'Loan pre-approval support',
      'Negotiation assistance',
      'Legal document review',
      'Move-in coordination',
    ],
    cta: 'Book a free consultation',
    href: '/contact',
  },
  {
    name: 'Portfolio',
    price: 'On request',
    cadence: 'Custom engagement',
    highlight: false,
    blurb: 'For investors, NRIs and high-volume buyers — bespoke service.',
    features: [
      'Quarterly market reports',
      'Off-market deal access',
      'Tax & FEMA advisory',
      'Property management',
      'Power-of-attorney handling',
      'Annual portfolio review',
    ],
    cta: 'Talk to portfolio team',
    href: '/contact',
  },
];

export default function Services() {
  return (
    <div>
      <section className="container-x py-16 md:py-24 text-center">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300">
          Services
        </span>
        <h1 className="font-display font-extrabold text-4xl md:text-6xl mt-5">
          Everything you need, <br />
          <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">all in one place.</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-6 text-lg">
          From your first visit to the final signature, our services cover every stage of your property journey.
        </p>
      </section>

      {/* SERVICES GRID — with imagery */}
      <section className="container-x grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="glass-card overflow-hidden hover:shadow-glow hover:-translate-y-1 transition-all"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              <img src={s.img} alt={s.title} loading="lazy" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-white/90 backdrop-blur grid place-items-center text-brand-700 shadow-soft">
                <s.icon size={22} />
              </div>
            </div>
            <div className="p-7">
              <h3 className="font-display font-bold text-xl mb-2">{s.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-5">{s.description}</p>
              <ul className="space-y-2">
                {s.points.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-300 grid place-items-center">
                      <Check size={12} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </section>

      {/* HOW WE WORK */}
      <section className="container-x mt-24">
        <SectionHeader
          eyebrow="How we work"
          title="A clean, four-step process"
          description="No mystery, no surprises. Here's the workflow from the day you reach out."
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-brand-200 dark:via-brand-500/30 to-transparent" />
          {process.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-gradient text-white grid place-items-center shadow-glow">
                  <s.i size={20} />
                </div>
                <span className="font-display font-extrabold text-lg text-slate-400 dark:text-slate-600">{s.n}</span>
              </div>
              <h3 className="font-display font-bold text-base">{s.t}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SEGMENTS WE COVER */}
      <section className="container-x mt-24">
        <SectionHeader
          eyebrow="Specialisations"
          title="Every segment, expertly handled"
          description="Whether it's a studio rental or a 5,000 sqft commercial floor — we have a team for it."
        />
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {segments.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-5 flex items-center gap-3 hover:-translate-y-1 hover:shadow-glow transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 grid place-items-center">
                <s.icon size={18} />
              </div>
              <div className="font-semibold text-sm">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PACKAGES */}
      <section className="container-x mt-24">
        <SectionHeader
          eyebrow="Engagement levels"
          title="Choose how we help"
          description="From browsing on your own to a fully managed portfolio — pick the level of support that fits."
        />
        <div className="mt-12 grid lg:grid-cols-3 gap-6">
          {packages.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`relative rounded-3xl border p-7 flex flex-col ${
                p.highlight
                  ? 'bg-brand-gradient text-white border-transparent shadow-glow'
                  : 'glass-card border-slate-200/70 dark:border-white/10'
              }`}
            >
              {p.badge && (
                <span className="absolute top-5 right-5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur text-white">
                  {p.badge}
                </span>
              )}
              <div className={`text-xs uppercase tracking-widest ${p.highlight ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                {p.name}
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <div className="font-display font-extrabold text-3xl md:text-4xl">{p.price}</div>
                <div className={`text-xs ${p.highlight ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                  · {p.cadence}
                </div>
              </div>
              <p className={`mt-3 text-sm leading-relaxed ${p.highlight ? 'text-white/90' : 'text-slate-600 dark:text-slate-400'}`}>
                {p.blurb}
              </p>
              <ul className="mt-5 space-y-2.5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check size={15} className={`mt-0.5 shrink-0 ${p.highlight ? 'text-white' : 'text-emerald-500'}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={p.href}
                className={`mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${
                  p.highlight
                    ? 'bg-white text-brand-700 hover:bg-slate-100'
                    : 'btn-outline'
                }`}
              >
                {p.cta} <ArrowRight size={15} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL STRIP */}
      <section className="container-x mt-24">
        <div className="glass-card p-8 md:p-12 grid md:grid-cols-[auto_1fr] gap-8 items-center">
          <img
            src="https://i.pravatar.cc/300?img=22"
            alt=""
            className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-cover shadow-soft"
          />
          <div>
            <div className="flex items-center gap-1 text-amber-500 mb-3">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <p className="font-display font-bold text-xl md:text-2xl leading-snug">
              "Their advisor felt like a friend who happened to know real estate.
              We toured 6 homes, signed on the 7th, and the legal team flagged a stamp-duty
              shortcut that saved us ₹1.4 lakh."
            </p>
            <div className="mt-4 text-sm">
              <div className="font-semibold">Vikram &amp; Priya Sethi</div>
              <div className="text-slate-500 dark:text-slate-400">3BHK in Whitefield · Bengaluru</div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x mt-24">
        <div className="rounded-3xl overflow-hidden relative bg-brand-gradient text-white p-10 md:p-14 grid lg:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="section-title">Have a unique requirement?</h2>
            <p className="opacity-90 mt-3 max-w-lg">
              Tell us about your project — we'll craft a service plan tailored to your needs.
            </p>
          </div>
          <div className="lg:text-right">
            <Link to="/contact" className="btn-accent">
              Get a custom quote <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
