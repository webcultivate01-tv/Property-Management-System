import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, ArrowRight, Building2, Users, Star,
  TrendingUp, Award, Shield, Key, Home as HomeIcon, Scale,
  CheckCircle2, BadgeCheck, Headphones, Lock, FileText, Sparkles,
  MapPin, ChevronDown, Building, Warehouse, Hotel, Trees,
  Briefcase, Phone, ArrowUpRight, Clock,
} from 'lucide-react';
import { propertyService } from '@/services/property.service';
import { reviewService } from '@/services/review.service';
import { PropertyCard } from '@/components/public/PropertyCard';
import { SectionHeader } from '@/components/public/SectionHeader';
import { Skeleton } from '@/components/ui/Spinner';
import { Rating } from '@/components/ui/Rating';

const CITIES = [
  { name: 'Mumbai', listings: '2,140+', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=900&q=80' },
  { name: 'Bengaluru', listings: '1,820+', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=900&q=80' },
  { name: 'Delhi NCR', listings: '1,640+', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=900&q=80' },
  { name: 'Pune', listings: '980+', img: 'https://images.unsplash.com/photo-1599661046827-dacde6976549?w=900&q=80' },
  { name: 'Hyderabad', listings: '870+', img: 'https://images.unsplash.com/photo-1572883454114-1cf0031ede2a?w=900&q=80' },
  { name: 'Chennai', listings: '720+', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=900&q=80' },
  { name: 'Kolkata', listings: '610+', img: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=900&q=80' },
  { name: 'Goa', listings: '430+', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900&q=80' },
];

const PROPERTY_TYPES = [
  { label: 'Apartments', icon: Building, query: 'apartment', count: '5,200+ listings' },
  { label: 'Villas', icon: HomeIcon, query: 'villa', count: '1,400+ listings' },
  { label: 'Plots & Land', icon: Trees, query: 'plot', count: '980+ listings' },
  { label: 'Commercial', icon: Briefcase, query: 'commercial', count: '760+ listings' },
  { label: 'Office Space', icon: Warehouse, query: 'office', count: '510+ listings' },
  { label: 'PG / Co-living', icon: Hotel, query: 'pg', count: '320+ listings' },
];

const WHY_US = [
  { icon: BadgeCheck, t: 'RERA-verified listings', d: 'Every property goes through a strict 7-point verification before going live.' },
  { icon: Headphones, t: 'Dedicated relationship manager', d: 'One advisor handles your journey end-to-end — no transfers, no repeats.' },
  { icon: Lock, t: 'Zero brokerage on select homes', d: 'Owner-direct listings save lakhs on the closing — clearly marked on each card.' },
  { icon: FileText, t: 'Legal & paperwork support', d: 'Title checks, sale deeds and registration handled by in-house legal experts.' },
  { icon: TrendingUp, t: 'Free market intelligence', d: 'Real-time price trends, locality scores and rental yields on every listing.' },
  { icon: Sparkles, t: 'Move-in support', d: 'Packers, painters, deep cleaning — all coordinated with one phone call.' },
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-20 w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute top-20 -right-20 w-[500px] h-[500px] bg-accent-500/15 rounded-full blur-3xl" />
        </div>
        <div className="container-x py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 text-xs font-semibold uppercase tracking-widest mb-6">
              <Award size={14} /> #1 Premium Real Estate Platform
            </span>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl leading-[1.05] tracking-tight">
              Find your dream
              <span className="block bg-gradient-to-r from-brand-600 via-accent-500 to-brand-600 bg-clip-text text-transparent">
                home, beautifully.
              </span>
            </h1>
            <p className="mt-6 text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-xl">
              12,000+ RERA-verified properties across 25 cities. Owner-direct listings, dedicated advisors, and zero pushy sales calls.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/properties" className="btn-primary text-base px-7 py-3">
                Browse Properties <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn-outline text-base px-7 py-3">
                Talk to an expert
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> RERA verified</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> No spam calls</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> Free legal check</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> 24/7 support</span>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                { v: '12k+', l: 'Properties' },
                { v: '8k+', l: 'Happy Clients' },
                { v: '25+', l: 'Cities' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display font-extrabold text-2xl md:text-3xl">{s.v}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">{s.l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-glow">
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80"
                alt="Premium home"
                className="w-full h-[480px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 glass-card p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-gradient grid place-items-center">
                  <Building2 size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Luxury Villas in Bandra</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Starting ₹ 4.2 Cr · Mumbai</div>
                </div>
                <Link to="/properties" className="btn-primary px-3 py-2 text-xs">View</Link>
              </div>
            </div>

            {/* Floating proof card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="hidden md:flex absolute -left-6 top-10 glass-card px-4 py-3 items-center gap-3"
            >
              <div className="flex -space-x-2">
                {[12, 47, 33].map((id) => (
                  <img
                    key={id}
                    src={`https://i.pravatar.cc/60?img=${id}`}
                    alt=""
                    className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-surface-darker"
                  />
                ))}
              </div>
              <div>
                <div className="font-semibold text-sm">2,400+ booked</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">this quarter</div>
              </div>
            </motion.div>
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
                className="glass-card p-5 flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-glow transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-gradient text-white grid place-items-center mb-3 shadow-soft">
                  <t.icon size={20} />
                </div>
                <div className="font-display font-bold text-sm">{t.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.count}</div>
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
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {[
            { i: HomeIcon, t: 'Property Buying', d: 'Curated homes that match your life.' },
            { i: TrendingUp, t: 'Property Selling', d: 'Smart pricing and faster closures.' },
            { i: Key, t: 'Property Renting', d: 'Verified rentals across cities.' },
            { i: Shield, t: 'Investment Advisory', d: 'Data-driven investment guidance.' },
            { i: Scale, t: 'Legal Assistance', d: 'Compliance, paperwork & due-diligence.' },
          ].map((s, i) => (
            <motion.div
              key={s.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-6 hover:shadow-glow hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 grid place-items-center mb-4">
                <s.i size={22} />
              </div>
              <h3 className="font-display font-bold text-lg mb-1.5">{s.t}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{s.d}</p>
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
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY_US.map((w, i) => (
            <motion.div
              key={w.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-gradient text-white grid place-items-center mb-4 shadow-soft">
                <w.icon size={20} />
              </div>
              <h3 className="font-display font-bold text-lg mb-1.5">{w.t}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{w.d}</p>
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
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          {/* connecting line */}
          <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-brand-200 dark:via-brand-500/30 to-transparent" />
          {HOW_IT_WORKS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative glass-card p-6 text-center"
            >
              <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-gradient grid place-items-center text-white font-display font-extrabold text-lg shadow-glow">
                {s.n}
              </div>
              <h3 className="font-display font-bold text-lg mt-4">{s.t}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="container-x mt-24">
        <div className="rounded-3xl bg-brand-gradient text-white overflow-hidden relative">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent-500/30 rounded-full blur-2xl" />
          <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 p-10 md:p-14">
            {[
              { i: Building2, v: '12,400+', l: 'Properties listed' },
              { i: Users, v: '8,200+', l: 'Happy clients' },
              { i: TrendingUp, v: '₹ 2,000 Cr+', l: 'Closed value' },
              { i: Star, v: '4.9 / 5', l: 'Avg. rating' },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 backdrop-blur grid place-items-center mb-4">
                  <s.i size={24} />
                </div>
                <div className="font-display font-extrabold text-3xl md:text-4xl">{s.v}</div>
                <div className="text-sm opacity-80 mt-1">{s.l}</div>
              </div>
            ))}
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
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(reviews.length ? reviews : SAMPLE_REVIEWS).map((r, i) => (
            <motion.div
              key={r._id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-6"
            >
              <Rating value={r.rating} />
              <p className="mt-4 text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-5">"{r.review}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-gradient grid place-items-center text-white font-bold">
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
        <div className="rounded-3xl overflow-hidden relative bg-surface-darker text-white p-10 md:p-16 grid lg:grid-cols-2 gap-8 items-center">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-500/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent-500/30 rounded-full blur-3xl" />
          </div>
          <div>
            <h2 className="section-title">Ready to find your next home?</h2>
            <p className="text-slate-300 mt-3 max-w-lg">
              Our team is just a message away. Tell us what you're looking for and we'll handle the rest — usually within 24 hours.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5"><Phone size={13} /> +91 98765 43210</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-400" /> Free consultation</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-400" /> No spam, ever</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-start lg:justify-end">
            <Link to="/contact" className="btn-accent text-base px-7 py-3">
              Talk to an expert <ArrowRight size={18} />
            </Link>
            <Link to="/properties" className="btn-outline text-base px-7 py-3 !bg-white/10 !text-white !border-white/20">
              View listings
            </Link>
          </div>
        </div>
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
