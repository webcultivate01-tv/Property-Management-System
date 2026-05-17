import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, MapPin, ArrowRight, Building2, Users, Star,
  TrendingUp, Award, Shield, Key, Home as HomeIcon, Scale,
} from 'lucide-react';
import { propertyService } from '@/services/property.service';
import { reviewService } from '@/services/review.service';
import { PropertyCard } from '@/components/public/PropertyCard';
import { SectionHeader } from '@/components/public/SectionHeader';
import { Skeleton } from '@/components/ui/Spinner';
import { Rating } from '@/components/ui/Rating';

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
              Discover handpicked luxury properties, premium investments and a seamless experience —
              all backed by trusted real-estate experts.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/properties" className="btn-primary text-base px-7 py-3">
                Browse Properties <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn-outline text-base px-7 py-3">
                Get in Touch
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 max-w-md">
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
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200"
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
          </motion.div>
        </div>
      </section>

      {/* QUICK SEARCH BAR */}
      <section className="container-x -mt-6">
        <SearchBar />
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
              Our team is just a message away. Tell us what you're looking for and we'll handle the rest.
            </p>
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
  { name: 'Riya Sharma', rating: 5, review: 'Telvine made buying our first home effortless. The team was professional and incredibly responsive.' },
  { name: 'Arjun Mehta', rating: 5, review: 'Best investment advisory I have worked with. Found properties with strong rental yields.' },
  { name: 'Neha Kapoor', rating: 4, review: 'Found our perfect rental in under a week. Loved the curated options.' },
];
