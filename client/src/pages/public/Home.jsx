import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, ArrowRight, Building2, Users, Star,
  TrendingUp, Award, Shield, Key, Home as HomeIcon, Scale,
  CheckCircle2, BadgeCheck, Headphones, Lock, FileText, Sparkles,
  MapPin, ChevronDown, Building, Warehouse, Hotel, Trees,
  Briefcase, Phone, ArrowUpRight, Clock, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { propertyService } from '@/services/property.service';
import { reviewService } from '@/services/review.service';
import { PropertyCard } from '@/components/public/PropertyCard';
import { SectionHeader } from '@/components/public/SectionHeader';
import { Skeleton } from '@/components/ui/Spinner';

const CITIES = [
  { name: 'Mumbai', listings: '2,140+', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=900&q=80' },
  { name: 'Bengaluru', listings: '1,820+', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=900&q=80' },
  { name: 'Delhi NCR', listings: '1,640+', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=900&q=80' },
  { name: 'Pune', listings: '980+', img: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=900&q=80' },
  { name: 'Hyderabad', listings: '870+', img: 'https://images.unsplash.com/photo-1572883454114-1cf0031ede2a?w=900&q=80' },
  { name: 'Chennai', listings: '720+', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=900&q=80' },
  { name: 'Kolkata', listings: '610+', img: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=900&q=80' },
  { name: 'Goa', listings: '430+', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900&q=80' },
];

const PROPERTY_TYPES = [
  { 
    label: 'Apartments', 
    icon: Building, 
    query: 'apartment', 
    count: '5,200+ listings',
    img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80'
  },
  { 
    label: 'Villas', 
    icon: HomeIcon, 
    query: 'villa', 
    count: '1,400+ listings',
    img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&auto=format&fit=crop&q=80'
  },
  { 
    label: 'Plots & Land', 
    icon: Trees, 
    query: 'plot', 
    count: '980+ listings',
    img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80'
  },
  { 
    label: 'Commercial', 
    icon: Briefcase, 
    query: 'commercial', 
    count: '760+ listings',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80'
  },
  { 
    label: 'Office Space', 
    icon: Warehouse, 
    query: 'office', 
    count: '510+ listings',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80'
  },
  { 
    label: 'PG / Co-living', 
    icon: Hotel, 
    query: 'pg', 
    count: '320+ listings',
    img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80'
  },
];

const WHY_US = [
  { 
    icon: BadgeCheck, 
    t: 'RERA-verified listings', 
    d: 'Every property goes through a strict 7-point verification before going live.',
    img: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80'
  },
  { 
    icon: Headphones, 
    t: 'Dedicated relationship manager', 
    d: 'One advisor handles your journey end-to-end — no transfers, no repeats.',
    img: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&auto=format&fit=crop&q=80'
  },
  { 
    icon: Lock, 
    t: 'Zero brokerage on select homes', 
    d: 'Owner-direct listings save lakhs on the closing — clearly marked on each card.',
    img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&auto=format&fit=crop&q=80'
  },
  { 
    icon: FileText, 
    t: 'Legal & paperwork support', 
    d: 'Title checks, sale deeds and registration handled by in-house legal experts.',
    img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80'
  },
  { 
    icon: TrendingUp, 
    t: 'Free market intelligence', 
    d: 'Real-time price trends, locality scores and rental yields on every listing.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80'
  },
  { 
    icon: Sparkles, 
    t: 'Move-in support', 
    d: 'Packers, painters, deep cleaning — all coordinated with one phone call.',
    img: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=600&auto=format&fit=crop&q=80'
  },
];

const HOW_IT_WORKS = [
  { n: '01', t: 'Tell us what you want', d: 'Share budget, location, family size, lifestyle. Takes under 2 minutes.' },
  { n: '02', t: 'Get a curated shortlist', d: 'Your advisor handpicks 5–8 RERA-verified properties matched to your brief.' },
  { n: '03', t: 'Visit with your advisor', d: 'Guided site visits, neighborhood walk-throughs, no pushy sales.' },
  { n: '04', t: 'Close with confidence', d: 'Legal, loan & registration support all the way to handing over the keys.' },
];

const FAQS = [
  {
    q: 'How do you verify a property listing?',
    a: 'Every listing passes a 7-point check: RERA registration, title trace, encumbrance certificate, building approvals, owner KYC, on-ground photo verification, and price benchmarking against the locality.',
  },
  {
    q: 'Do you charge any brokerage?',
    a: 'No brokerage on owner-direct listings (marked with a "No Brokerage" badge). For builder properties, our fee is paid by the developer — never by you.',
  },
  {
    q: 'Can you help with home loans?',
    a: 'Yes. We have lender tie-ups with 18+ banks and NBFCs. You get pre-approved offers within 24 hours, plus fee waivers we negotiate on your behalf.',
  },
  {
    q: 'What if I want to sell my existing property first?',
    a: 'Our "Sell-then-Buy" service handles both legs in parallel: market valuation, professional photos, premium listing visibility, and bridge advisory until your new keys are in hand.',
  },
  {
    q: 'Do you handle NRI buyers?',
    a: 'Absolutely. We work with NRI clients across 35+ countries — handling PoA, FEMA compliance, repatriation paperwork, and virtual site tours.',
  },
  {
    q: 'How long does a typical purchase take?',
    a: 'From shortlist to registration, our average is 38 days — versus the industry average of 90+ days. Faster is possible for ready-to-move-in properties with paperwork in order.',
  },
];

const INSIGHTS = [
  {
    tag: 'Market Report',
    title: 'Mumbai property prices: where to buy in 2026',
    excerpt: 'Sub-markets that beat the city average, locality-wise capital appreciation, and where rental yields stay above 4%.',
    img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80',
    readTime: '6 min',
  },
  {
    tag: 'Buyer Guide',
    title: 'First home in Bengaluru: a complete budget breakdown',
    excerpt: 'Stamp duty, GST, registration, parking, club fees — the line items most first-time buyers forget to plan for.',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80',
    readTime: '8 min',
  },
  {
    tag: 'Investment',
    title: 'Are commercial properties still a smart bet?',
    excerpt: 'Pre-leased office assets, Grade-A vs. B, REIT alternatives, and what a 7% rental yield really means after costs.',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80',
    readTime: '10 min',
  },
];

const PARTNERS = [
  'DLF', 'Godrej Properties', 'Lodha', 'Prestige', 'Brigade', 'Sobha', 'Oberoi Realty', 'Hiranandani',
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      propertyService.list({ featured: true, limit: 6 }).catch(() => ({ data: [] })),
      reviewService.listApproved({ limit: 6 }).catch(() => ({ data: [] })),
    ]).then(([f, r]) => {
      setFeatured(f.data || []);
      setReviews(r.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden min-h-[600px] md:min-h-[700px] flex items-center">
        {/* Background Image Carousel */}
        <BackgroundCarousel />

        <div className="container-x py-16 md:py-24 relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-widest mb-6">
              <Award size={14} /> #1 Premium Real Estate Platform
            </span>
            <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-7xl leading-[1.05] tracking-tight text-white">
              Find your dream
              <span className="block bg-gradient-to-r from-brand-300 via-accent-300 to-brand-300 bg-clip-text text-transparent mt-2">
                home, beautifully.
              </span>
            </h1>
            <p className="mt-6 text-white/90 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              12,000+ RERA-verified properties across 25 cities. Owner-direct listings, dedicated advisors, and zero pushy sales calls.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/properties" className="btn-primary text-base px-7 py-3">
                Browse Properties <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn-outline text-base px-7 py-3 !bg-white/10 !text-white !border-white/30 hover:!bg-white/20">
                Talk to an expert
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/80">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> RERA verified</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> No spam calls</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> Free legal check</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> 24/7 support</span>
            </div>

            <StatsCounter />
          </motion.div>
        </div>
      </section>

      {/* QUICK SEARCH BAR */}
      <section className="container-x -mt-6">
        <SearchBar />
      </section>

      {/* TRUST STRIP */}
      <section className="container-x mt-10">
        <div className="glass-card px-6 py-5">
          <div className="text-center text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">
            Trusted by India's leading developers
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 opacity-70">
            {PARTNERS.map((p) => (
              <span key={p} className="font-display font-extrabold text-base md:text-lg text-slate-500 dark:text-slate-400 tracking-wide">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PROPERTY TYPES */}
      <section className="container-x mt-24">
        <SectionHeader
          eyebrow="Browse by category"
          title="Find the right kind of space"
          description="From compact studios to expansive farmland — search the type that fits your life."
        />
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {PROPERTY_TYPES.map((t, i) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/properties?propertyType=${t.query}`}
                className="group relative overflow-hidden rounded-2xl shadow-card hover:shadow-glow transition-all hover:-translate-y-2 block"
              >
                {/* Background Image */}
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img
                    src={t.img}
                    alt={t.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-brand-600/0 group-hover:bg-brand-600/20 transition-colors duration-300" />
                </div>
                
                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 text-center">
                  <div className="font-display font-bold text-sm md:text-base lg:text-lg text-white mb-1 group-hover:scale-105 transition-transform">
                    {t.label}
                  </div>
                  <div className="text-[10px] md:text-xs text-white/90 font-medium">{t.count}</div>
                  
                  {/* Arrow on Hover */}
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="inline-flex items-center gap-1 text-[10px] md:text-xs text-white font-semibold">
                      Explore <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED CITIES */}
      <section className="container-x mt-24">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <SectionHeader
            align="left"
            eyebrow="Explore cities"
            title="Featured locations"
            description="Premium homes from India's most loved real-estate markets."
          />
          <Link to="/properties" className="btn-outline">
            All cities <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CITIES.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to={`/properties?city=${encodeURIComponent(c.name)}`}
                className="relative block aspect-[4/5] rounded-2xl overflow-hidden group shadow-soft"
              >
                <img
                  src={c.img}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 text-white">
                  <div className="font-display font-extrabold text-xl md:text-2xl">{c.name}</div>
                  <div className="flex items-center gap-1 text-xs opacity-90 mt-0.5">
                    <MapPin size={12} /> {c.listings} properties
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold opacity-90 group-hover:opacity-100">
                    Explore <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="container-x mt-24">
        <SectionHeader
          eyebrow="What we offer"
          title="Premium real-estate, end-to-end"
          description="From discovery to deeds — a complete suite of services to make property simple."
        />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {[
            { 
              i: HomeIcon, 
              t: 'Property Buying', 
              d: 'Curated homes that match your life.',
              img: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&auto=format&fit=crop&q=80'
            },
            { 
              i: TrendingUp, 
              t: 'Property Selling', 
              d: 'Smart pricing and faster closures.',
              img: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=600&auto=format&fit=crop&q=80'
            },
            { 
              i: Key, 
              t: 'Property Renting', 
              d: 'Verified rentals across cities.',
              img: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=600&auto=format&fit=crop&q=80'
            },
            { 
              i: Shield, 
              t: 'Investment Advisory', 
              d: 'Data-driven investment guidance.',
              img: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80'
            },
            { 
              i: Scale, 
              t: 'Legal Assistance', 
              d: 'Compliance, paperwork & due-diligence.',
              img: 'https://images.unsplash.com/photo-1436450412740-6b988f486c6b?w=600&auto=format&fit=crop&q=80'
            },
          ].map((s, i) => (
            <motion.div
              key={s.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group relative overflow-hidden rounded-2xl shadow-card hover:shadow-glow hover:-translate-y-1 transition-all"
            >
              {/* Background Image */}
              <div className="aspect-[4/5] relative overflow-hidden">
                <img
                  src={s.img}
                  alt={s.t}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                <h3 className="font-display font-bold text-base md:text-lg text-white mb-2">{s.t}</h3>
                <p className="text-xs md:text-sm text-white/90 leading-relaxed">{s.d}</p>
                
                {/* Learn More on Hover */}
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="inline-flex items-center gap-1 text-xs text-white font-semibold">
                    Learn more <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="container-x mt-24">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <SectionHeader
            align="left"
            eyebrow="Hand-picked"
            title="Featured properties"
            description="A glimpse into our most exclusive listings, available right now."
          />
          <Link to="/properties" className="btn-outline">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (<Skeleton key={i} className="h-[420px]" />))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No featured listings yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p, i) => <PropertyCard key={p._id} property={p} index={i} />)}
          </div>
        )}
      </section>

      {/* WHY CHOOSE US */}
      <section className="container-x mt-24">
        <SectionHeader
          eyebrow="Why Telvine"
          title="Real estate, without the runaround"
          description="No spam calls. No hidden fees. No mystery brokers. Just a calmer way to buy, sell or rent."
        />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY_US.map((w, i) => (
            <motion.div
              key={w.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-2xl shadow-card hover:shadow-glow hover:-translate-y-1 transition-all"
            >
              {/* Background Image */}
              <div className="aspect-[4/5] md:aspect-[16/10] relative overflow-hidden">
                <img
                  src={w.img}
                  alt={w.t}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                <h3 className="font-display font-bold text-base md:text-lg text-white mb-2">{w.t}</h3>
                <p className="text-xs md:text-sm text-white/90 leading-relaxed">{w.d}</p>
                
                {/* Checkmark Icon on Hover */}
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 size={16} /> Verified Feature
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container-x mt-24">
        <SectionHeader
          eyebrow="How it works"
          title="Four simple steps to your new address"
          description="From the first call to the day you get the keys — here's exactly what to expect."
        />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          {/* connecting line */}
          <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-brand-200 dark:via-brand-500/30 to-transparent" />
          {HOW_IT_WORKS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative glass-card p-5 md:p-6 text-center group hover:shadow-glow hover:-translate-y-1 transition-all"
            >
              {/* SVG Number Badge */}
              <div className="mx-auto w-14 h-14 md:w-16 md:h-16 mb-4 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                  <defs>
                    <linearGradient id={`gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#312e81" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="48" fill={`url(#gradient-${i})`} />
                  <text
                    x="50"
                    y="50"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize="32"
                    fontWeight="bold"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    {s.n}
                  </text>
                </svg>
              </div>
              <h3 className="font-display font-bold text-base md:text-lg mt-4">{s.t}</h3>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="container-x mt-24">
        <div className="rounded-3xl bg-brand-gradient text-white overflow-hidden relative">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent-500/30 rounded-full blur-2xl" />
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 p-8 md:p-14">
            <AnimatedStat icon={Building2} value="12,400+" label="Properties listed" />
            <AnimatedStat icon={Users} value="8,200+" label="Happy clients" />
            <AnimatedStat icon={TrendingUp} value="₹ 2,000 Cr+" label="Closed value" />
            <AnimatedStat icon={Star} value="4.9 / 5" label="Avg. rating" isRating />
          </div>
        </div>
      </section>

      {/* REVIEWS / TESTIMONIALS */}
      <section className="container-x mt-24">
        <SectionHeader
          eyebrow="From our clients"
          title="Real stories. Real homes."
          description="What people are saying about working with us."
        />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(reviews.length ? reviews : SAMPLE_REVIEWS).map((r, i) => (
            <motion.div
              key={r._id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-5 md:p-6 hover:shadow-glow hover:-translate-y-1 transition-all"
            >
              <SvgStarRating value={r.rating} />
              <p className="mt-4 text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-5 text-sm md:text-base">"{r.review}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-gradient grid place-items-center text-white font-bold text-sm">
                  {r.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-sm">{r.name}</div>
                  <div className="text-xs text-slate-500">Verified Client</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* INSIGHTS / BLOG TEASER */}
      <section className="container-x mt-24">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <SectionHeader
            align="left"
            eyebrow="Insights"
            title="Property knowledge, decoded"
            description="Market reports, buyer guides and investment ideas — written by our analysts."
          />
          <Link to="/contact" className="btn-outline">
            Get our newsletter <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {INSIGHTS.map((post, i) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass-card overflow-hidden group"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={post.img}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 font-semibold uppercase tracking-wider text-[10px]">
                    {post.tag}
                  </span>
                  <span className="inline-flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>
                </div>
                <h3 className="font-display font-bold text-lg mt-3 leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-300 transition">
                  {post.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-3">
                  {post.excerpt}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x mt-24">
        <SectionHeader
          eyebrow="Questions, answered"
          title="Frequently asked"
          description="Quick answers to the things we get asked most. Still unsure? Just give us a call."
        />
        <div className="mt-12 max-w-3xl mx-auto space-y-3">
          {FAQS.map((f, i) => (
            <Faq key={f.q} q={f.q} a={f.a} index={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-x mt-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl overflow-hidden relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white p-8 md:p-12 lg:p-16"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent-500/30 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-400/30 rounded-full blur-3xl animate-pulse-slow" />
          </div>
          
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-wider mb-4">
                  <Sparkles size={12} /> Get Started Today
                </span>
                <h2 className="section-title text-3xl md:text-4xl lg:text-5xl">Ready to find your next home?</h2>
                <p className="text-white/90 mt-4 text-sm md:text-base max-w-lg leading-relaxed">
                  Our team is just a message away. Tell us what you're looking for and we'll handle the rest — usually within 24 hours.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs md:text-sm text-white/90">
                  <span className="inline-flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/20 grid place-items-center">
                      <Phone size={12} />
                    </div>
                    +91 98765 43210
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" /> Free consultation
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" /> No spam, ever
                  </span>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-3"
            >
              <Link 
                to="/contact" 
                className="group relative overflow-hidden bg-white text-brand-600 px-8 py-4 rounded-xl font-bold text-base md:text-lg flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl"
              >
                <span className="relative z-10">Talk to an expert</span>
                <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              
              <Link 
                to="/properties" 
                className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-base md:text-lg flex items-center justify-center gap-2 hover:scale-105 transition-all"
              >
                <span>View listings</span>
                <Building2 size={20} className="group-hover:scale-110 transition-transform" />
              </Link>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="font-bold text-lg md:text-xl">24/7</div>
                  <div className="text-[10px] md:text-xs text-white/80">Support</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="font-bold text-lg md:text-xl">100%</div>
                  <div className="text-[10px] md:text-xs text-white/80">Verified</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="font-bold text-lg md:text-xl">Free</div>
                  <div className="text-[10px] md:text-xs text-white/80">Consultation</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function Faq({ q, a, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className="glass-card overflow-hidden"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
      >
        <span className="font-semibold text-base">{q}</span>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{a}</p>
        </div>
      </div>
    </motion.div>
  );
}

function SearchBar() {
  const [q, setQ] = useState('');
  return (
    <form
      action="/properties"
      onSubmit={(e) => {
        e.preventDefault();
        window.location.href = `/properties?search=${encodeURIComponent(q)}`;
      }}
      className="glass-card p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-glow"
    >
      <div className="flex-1 flex items-center gap-3 px-3">
        <Search className="text-slate-400" size={18} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by city, locality, project, builder..."
          className="flex-1 bg-transparent outline-none py-3 text-sm"
        />
      </div>
      <button className="btn-primary px-6 py-3">
        Search Properties
      </button>
    </form>
  );
}

const SAMPLE_REVIEWS = [
  { name: 'Riya Sharma', rating: 5, review: 'Telvine made buying our first home effortless. The team was professional and incredibly responsive — answered every question, no matter how small.' },
  { name: 'Arjun Mehta', rating: 5, review: 'Best investment advisory I have worked with. Found properties with strong rental yields and the legal team caught a title issue we would have missed.' },
  { name: 'Neha Kapoor', rating: 4, review: 'Found our perfect rental in under a week. Loved the curated options and the move-in coordination was a lifesaver.' },
];


// Background Carousel Component
function BackgroundCarousel() {
  const images = [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1622015663319-e97e697503ee?w=1200&auto=format&fit=crop&q=80',
    'https://media.istockphoto.com/id/1391413216/photo/rising-prices-for-real-estate.webp?a=1&b=1&s=612x612&w=0&k=20&c=R9Q0JDjZMqp5mlUQ75B3wTgsM6LiFnwBHcAZRdWMSMM=',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-black/50 z-10" />
      
      {/* Images */}
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={img}
            alt={`Property ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-white w-6'
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// Stats Counter Component
function StatsCounter() {
  const [counts, setCounts] = useState({ properties: 0, clients: 0, cities: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;

    const targets = { properties: 12000, clients: 8000, cities: 25 };
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setCounts({
        properties: Math.floor(targets.properties * progress),
        clients: Math.floor(targets.clients * progress),
        cities: Math.floor(targets.cities * progress),
      });

      if (step >= steps) {
        setCounts(targets);
        setHasAnimated(true);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [hasAnimated]);

  return (
    <div className="mt-8 grid grid-cols-3 gap-3 md:gap-4 max-w-xl mx-auto">
      <div className="backdrop-blur-sm bg-white/10 rounded-lg md:rounded-xl p-3 md:p-4">
        <div className="font-display font-extrabold text-xl md:text-2xl text-white">
          {counts.properties >= 1000 ? `${(counts.properties / 1000).toFixed(0)}k+` : `${counts.properties}+`}
        </div>
        <div className="text-[10px] md:text-xs text-white/70 uppercase tracking-wider mt-0.5">Properties</div>
      </div>
      <div className="backdrop-blur-sm bg-white/10 rounded-lg md:rounded-xl p-3 md:p-4">
        <div className="font-display font-extrabold text-xl md:text-2xl text-white">
          {counts.clients >= 1000 ? `${(counts.clients / 1000).toFixed(0)}k+` : `${counts.clients}+`}
        </div>
        <div className="text-[10px] md:text-xs text-white/70 uppercase tracking-wider mt-0.5">Happy Clients</div>
      </div>
      <div className="backdrop-blur-sm bg-white/10 rounded-lg md:rounded-xl p-3 md:p-4">
        <div className="font-display font-extrabold text-xl md:text-2xl text-white">
          {counts.cities}+
        </div>
        <div className="text-[10px] md:text-xs text-white/70 uppercase tracking-wider mt-0.5">Cities</div>
      </div>
    </div>
  );
}

// Animated Stat Component for Stats Section
function AnimatedStat({ icon: Icon, value, label, isRating = false }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible || hasAnimated) return;

    if (isRating) {
      // For rating, animate to 4.9
      const target = 4.9;
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        setCount(target * progress);

        if (step >= steps) {
          setCount(target);
          setHasAnimated(true);
          clearInterval(timer);
        }
      }, interval);

      return () => clearInterval(timer);
    } else {
      // For other stats
      const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        setCount(Math.floor(numericValue * progress));

        if (step >= steps) {
          setCount(numericValue);
          setHasAnimated(true);
          clearInterval(timer);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [isVisible, hasAnimated, value, isRating]);

  const formatValue = () => {
    if (isRating) {
      return `${count.toFixed(1)} / 5`;
    }
    if (value.includes('Cr')) {
      return `₹ ${(count / 1000).toFixed(count < 1000 ? 0 : 1)} Cr+`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k+`;
    }
    return `${count}+`;
  };

  // SVG Icons
  const renderIcon = () => {
    const iconName = Icon.name || Icon.displayName || '';
    
    if (iconName.includes('Building')) {
      return (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
        </svg>
      );
    } else if (iconName.includes('Users')) {
      return (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    } else if (iconName.includes('TrendingUp')) {
      return (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      );
    } else if (iconName.includes('Star')) {
      return (
        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }
    
    return <Icon className="w-5 h-5 md:w-6 md:h-6" />;
  };

  return (
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      onViewportEnter={() => setIsVisible(true)}
      transition={{ duration: 0.5 }}
    >
      <div className="w-12 h-12 md:w-14 md:h-14 mx-auto rounded-2xl bg-white/10 backdrop-blur grid place-items-center mb-3 md:mb-4 text-white">
        {renderIcon()}
      </div>
      <div className="font-display font-extrabold text-2xl md:text-3xl lg:text-4xl">
        {formatValue()}
      </div>
      <div className="text-xs md:text-sm opacity-80 mt-1">{label}</div>
    </motion.div>
  );
}

// SVG Star Rating Component
function SvgStarRating({ value }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className="w-4 h-4 md:w-5 md:h-5"
          viewBox="0 0 24 24"
          fill={star <= value ? '#fbbf24' : '#e5e7eb'}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}
