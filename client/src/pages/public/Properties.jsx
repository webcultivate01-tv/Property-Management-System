import { useEffect, useState, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, SlidersHorizontal, X, LayoutGrid, List, MapPin,
  Bed, Bath, Square, Star, BadgeCheck, Bookmark, BookmarkPlus,
  ArrowRight, Sparkles, Building, Home as HomeIcon, Trees,
  Briefcase, Warehouse, Hotel, Phone, ChevronDown, Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { propertyService } from '@/services/property.service';
import { PropertyCard } from '@/components/public/PropertyCard';
import { Skeleton } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, propertyTypeLabels } from '@/lib/utils';

const POPULAR_CITIES = ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Goa'];

const TYPE_CHIPS = [
  { key: '',           label: 'All Types',   icon: LayoutGrid },
  { key: 'apartment',  label: 'Apartments',  icon: Building },
  { key: 'house',      label: 'Houses',      icon: HomeIcon },
  { key: 'villa',      label: 'Villas',      icon: HomeIcon },
  { key: 'plot',       label: 'Plots',       icon: Trees },
  { key: 'commercial', label: 'Commercial',  icon: Briefcase },
  { key: 'office',     label: 'Office',      icon: Warehouse },
  { key: 'pg',         label: 'PG',          icon: Hotel },
];

const SAVED_KEY = 'tlv-saved-searches';

export default function Properties() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('properties-public-view') || 'grid');
  const [saved, setSaved] = useState([]);
  const [savedOpen, setSavedOpen] = useState(false);
  const savedRef = useRef(null);

  useEffect(() => { localStorage.setItem('properties-public-view', viewMode); }, [viewMode]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      setSaved(raw ? JSON.parse(raw) : []);
    } catch { setSaved([]); }
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (savedRef.current && !savedRef.current.contains(e.target)) setSavedOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const filters = useMemo(
    () => ({
      search:       params.get('search')       || '',
      propertyType: params.get('propertyType') || '',
      listingType:  params.get('listingType')  || '',
      city:         params.get('city')         || '',
      minPrice:     params.get('minPrice')     || '',
      maxPrice:     params.get('maxPrice')     || '',
      bedrooms:     params.get('bedrooms')     || '',
      featured:     params.get('featured')     || '',
      sort:         params.get('sort')         || 'newest',
      page:         parseInt(params.get('page')) || 1,
    }),
    [params]
  );

  useEffect(() => {
    setLoading(true);
    propertyService
      .list({ ...filters, limit: 12 })
      .then((res) => {
        setItems(res.data || []);
        setMeta(res.meta || { page: 1, totalPages: 1, total: 0 });
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [filters]);

  const setFilter = (key, val) => {
    const next = new URLSearchParams(params);
    if (val) next.set(key, val);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const clearAll = () => setParams(new URLSearchParams());

  const activeChips = useMemo(() => {
    const out = [];
    if (filters.search)       out.push({ key: 'search',       label: `"${filters.search}"` });
    if (filters.listingType)  out.push({ key: 'listingType',  label: filters.listingType === 'sale' ? 'For Sale' : 'For Rent' });
    if (filters.propertyType) out.push({ key: 'propertyType', label: propertyTypeLabels[filters.propertyType] || filters.propertyType });
    if (filters.city)         out.push({ key: 'city',         label: filters.city });
    if (filters.bedrooms)     out.push({ key: 'bedrooms',     label: `${filters.bedrooms}+ BHK` });
    if (filters.featured)     out.push({ key: 'featured',     label: 'Featured only' });
    if (filters.minPrice || filters.maxPrice) {
      out.push({
        key: 'price',
        label: `₹${filters.minPrice || '0'} – ₹${filters.maxPrice || '∞'}`,
        clear: () => { setFilter('minPrice', ''); setTimeout(() => setFilter('maxPrice', ''), 0); },
      });
    }
    return out;
  }, [filters]);

  const hasAnyFilter = activeChips.length > 0;

  const persistSaved = (next) => {
    setSaved(next);
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const saveSearch = () => {
    if (!hasAnyFilter) {
      toast.error('Apply some filters first.');
      return;
    }
    const label = window.prompt('Name this search:', activeChips.map((c) => c.label).join(' · ').slice(0, 50));
    if (!label) return;
    const snapshot = Object.fromEntries(
      Object.entries(filters).filter(([k, v]) => v && k !== 'page' && k !== 'sort')
    );
    const next = [
      ...saved.filter((s) => s.label !== label),
      { id: Date.now(), label: label.slice(0, 60), filters: snapshot },
    ];
    persistSaved(next);
    toast.success('Search saved');
  };

  const removeSaved = (id) => {
    persistSaved(saved.filter((s) => s.id !== id));
  };

  const applySaved = (s) => {
    const next = new URLSearchParams();
    Object.entries(s.filters).forEach(([k, v]) => v && next.set(k, v));
    setParams(next);
    setSavedOpen(false);
    toast.success(`Loaded "${s.label}"`);
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-20 w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-3xl" />
          <div className="absolute top-20 -right-20 w-[500px] h-[500px] bg-accent-500/15 rounded-full blur-3xl" />
        </div>

        <div className="container-x pt-14 md:pt-20 pb-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300">
              All listings · {meta.total.toLocaleString()} properties
            </span>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl mt-4 leading-tight">
              Find a home that <br />
              <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">feels right.</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto mt-4">
              Filter by city, budget, size and lifestyle. Every listing is RERA-verified by our team.
            </p>
          </motion.div>

          {/* HERO SEARCH */}
          <form
            onSubmit={(e) => { e.preventDefault(); }}
            className="mt-8 max-w-2xl mx-auto glass-card p-2 flex items-center gap-2 shadow-glow"
          >
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="text-slate-400" size={18} />
              <input
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
                placeholder="Search by city, locality, project, builder..."
                className="flex-1 bg-transparent outline-none py-3 text-sm"
              />
              {filters.search && (
                <button type="button" onClick={() => setFilter('search', '')} className="text-slate-400 hover:text-slate-600">
                  <X size={15} />
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary px-5 py-2.5 text-sm">Search</button>
          </form>

          {/* QUICK CITIES */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5 text-sm">
            <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mr-1">
              Popular
            </span>
            {POPULAR_CITIES.map((c) => {
              const active = filters.city.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  onClick={() => setFilter('city', active ? '' : c)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    active
                      ? 'bg-brand-gradient text-white shadow-soft'
                      : 'bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-brand-300 dark:hover:border-brand-400/30'
                  }`}
                >
                  <MapPin size={11} className="inline-block -mt-0.5 mr-0.5" /> {c}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* TYPE TABS */}
      <section className="container-x">
        <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/10 shadow-card overflow-hidden">
          <div className="flex items-center gap-2 p-3 overflow-x-auto">
            {/* listing type segment */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/5 p-1 shrink-0 mr-2">
              {[
                { v: '',     l: 'All' },
                { v: 'sale', l: 'Buy' },
                { v: 'rent', l: 'Rent' },
              ].map((o) => (
                <button
                  key={o.l}
                  onClick={() => setFilter('listingType', o.v)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                    filters.listingType === o.v
                      ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-200 shadow'
                      : 'text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>

            <span className="text-slate-300 dark:text-white/20 hidden md:inline">|</span>

            {/* type chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {TYPE_CHIPS.map((t) => {
                const Icon = t.icon;
                const active = filters.propertyType === t.key;
                return (
                  <button
                    key={t.key || 'all'}
                    onClick={() => setFilter('propertyType', t.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                      active
                        ? 'bg-brand-gradient text-white shadow-soft'
                        : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <Icon size={13} /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS HEADER */}
      <section className="container-x mt-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-sm">
              <span className="font-display font-extrabold text-lg">{meta.total.toLocaleString()}</span>{' '}
              <span className="text-slate-500 dark:text-slate-400">properties found</span>
              {filters.city && <span className="text-slate-500 dark:text-slate-400"> in <span className="font-semibold text-slate-700 dark:text-slate-200">{filters.city}</span></span>}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Saved searches */}
            <div ref={savedRef} className="relative">
              <button
                onClick={() => setSavedOpen((s) => !s)}
                className="btn-outline gap-2 text-sm"
                title="Saved searches"
              >
                <Bookmark size={15} /> Saved
                {saved.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-100 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300">
                    {saved.length}
                  </span>
                )}
              </button>
              {savedOpen && (
                <div className="absolute right-0 mt-2 w-72 z-30 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-glow overflow-hidden">
                  <button
                    onClick={() => { saveSearch(); setSavedOpen(false); }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/[0.04] text-left border-b border-slate-100 dark:border-white/10"
                  >
                    <BookmarkPlus size={16} className="text-brand-600" />
                    <span className="text-sm font-semibold">Save current search</span>
                  </button>
                  {saved.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-slate-400">
                      No saved searches yet.
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto py-1">
                      {saved.map((s) => (
                        <div key={s.id} className="group flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/[0.04]">
                          <button onClick={() => applySaved(s)} className="flex-1 text-left text-sm font-medium truncate dark:text-slate-100">
                            {s.label}
                          </button>
                          <button
                            onClick={() => removeSaved(s.id)}
                            className="p-1.5 rounded-md text-rose-500 opacity-0 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <select
              value={filters.sort}
              onChange={(e) => setFilter('sort', e.target.value)}
              className="input w-auto text-sm py-2"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/5 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-200 shadow' : 'text-slate-500 dark:text-slate-300'}`}
                title="Grid view"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-200 shadow' : 'text-slate-500 dark:text-slate-300'}`}
                title="List view"
              >
                <List size={15} />
              </button>
            </div>

            <button
              onClick={() => setShowFilters((s) => !s)}
              className="btn-outline lg:hidden text-sm"
            >
              <SlidersHorizontal size={15} /> Filters
            </button>
          </div>
        </div>

        {/* ACTIVE FILTER CHIPS */}
        {hasAnyFilter && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
              <Filter size={12} /> Active:
            </span>
            {activeChips.map((c) => (
              <button
                key={c.key}
                onClick={() => (c.clear ? c.clear() : setFilter(c.key, ''))}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-500/15 transition"
              >
                {c.label}
                <X size={11} />
              </button>
            ))}
            <button
              onClick={clearAll}
              className="ml-1 text-xs font-semibold text-rose-600 dark:text-rose-300 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </section>

      {/* RESULTS */}
      <section className="container-x mt-6 pb-16">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* FILTERS SIDEBAR */}
          <aside className={`${showFilters ? 'block' : 'hidden lg:block'} glass-card p-5 h-fit lg:sticky lg:top-24`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg inline-flex items-center gap-2">
                <SlidersHorizontal size={16} /> Filters
              </h3>
              <button onClick={clearAll} className="text-xs text-brand-600 dark:text-brand-300 hover:underline">
                Clear all
              </button>
            </div>

            <div className="space-y-5">
              <Group label="Search">
                <div className="relative w-full">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Keyword..."
                    className="input pl-9"
                    value={filters.search}
                    onChange={(e) => setFilter('search', e.target.value)}
                  />
                </div>
              </Group>

              <Group label="Listing Type">
                <Pill active={!filters.listingType} onClick={() => setFilter('listingType', '')}>All</Pill>
                <Pill active={filters.listingType === 'sale'} onClick={() => setFilter('listingType', 'sale')}>For Sale</Pill>
                <Pill active={filters.listingType === 'rent'} onClick={() => setFilter('listingType', 'rent')}>For Rent</Pill>
              </Group>

              <Group label="Property Type">
                <select className="input w-full" value={filters.propertyType} onChange={(e) => setFilter('propertyType', e.target.value)}>
                  <option value="">All Types</option>
                  {Object.entries(propertyTypeLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </Group>

              <Group label="City">
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  className="input w-full"
                  value={filters.city}
                  onChange={(e) => setFilter('city', e.target.value)}
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  {POPULAR_CITIES.slice(0, 5).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFilter('city', filters.city === c ? '' : c)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        filters.city === c
                          ? 'bg-brand-gradient text-white border-transparent'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-brand-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </Group>

              <Group label="Price Range (₹)">
                <div className="grid grid-cols-2 gap-2 w-full">
                  <input
                    type="number"
                    placeholder="Min"
                    className="input"
                    value={filters.minPrice}
                    onChange={(e) => setFilter('minPrice', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="input"
                    value={filters.maxPrice}
                    onChange={(e) => setFilter('maxPrice', e.target.value)}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {[
                    { l: '< 50L',  min: '',         max: '5000000' },
                    { l: '50L–1Cr', min: '5000000',  max: '10000000' },
                    { l: '1–3Cr',  min: '10000000', max: '30000000' },
                    { l: '3Cr+',   min: '30000000', max: '' },
                  ].map((p) => (
                    <button
                      key={p.l}
                      type="button"
                      onClick={() => {
                        const next = new URLSearchParams(params);
                        if (p.min) next.set('minPrice', p.min); else next.delete('minPrice');
                        if (p.max) next.set('maxPrice', p.max); else next.delete('maxPrice');
                        next.delete('page');
                        setParams(next);
                      }}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-brand-300 hover:text-brand-600 dark:hover:text-brand-300"
                    >
                      {p.l}
                    </button>
                  ))}
                </div>
              </Group>

              <Group label="Bedrooms">
                <div className="flex flex-wrap gap-1.5">
                  {['', '1', '2', '3', '4', '5'].map((n) => (
                    <Pill key={n || 'any'} active={filters.bedrooms === n} onClick={() => setFilter('bedrooms', n)}>
                      {n ? `${n}+` : 'Any'}
                    </Pill>
                  ))}
                </div>
              </Group>

              <Group label="Only Show">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-brand-600"
                    checked={filters.featured === 'true'}
                    onChange={(e) => setFilter('featured', e.target.checked ? 'true' : '')}
                  />
                  <Star size={14} className="text-amber-500" /> Featured listings
                </label>
              </Group>
            </div>
          </aside>

          {/* RESULTS GRID/LIST */}
          <div>
            {loading ? (
              <div className={viewMode === 'list' ? 'space-y-4' : 'grid sm:grid-cols-2 xl:grid-cols-3 gap-6'}>
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className={viewMode === 'list' ? 'h-44' : 'h-[420px]'} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="glass-card p-10 text-center">
                <Search size={28} className="mx-auto text-slate-300 mb-3" />
                <div className="font-display font-bold text-xl">No properties match your filters</div>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2">
                  Try a different city, broaden the price range, or clear filters and start fresh.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button onClick={clearAll} className="btn-outline">Reset filters</button>
                  <Link to="/contact" className="btn-primary">
                    Tell us what you want <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {items.map((p, i) => (<PropertyCard key={p._id} property={p} index={i} />))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((p, i) => (<PropertyListItem key={p._id} property={p} index={i} />))}
                  </div>
                )}
                <div className="mt-8">
                  <Pagination
                    page={meta.page}
                    totalPages={meta.totalPages}
                    onChange={(p) => setFilter('page', String(p))}
                  />
                </div>
              </>
            )}

            {/* Why Telvine — mini strip */}
            <div className="mt-12 grid sm:grid-cols-3 gap-4">
              {[
                { i: BadgeCheck, t: 'RERA verified',      d: 'Every listing screened' },
                { i: Sparkles,   t: 'Zero brokerage',     d: 'On owner-direct homes' },
                { i: Phone,      t: 'Free expert advice', d: '24/7 advisor on call' },
              ].map((b) => {
                const I = b.i;
                return (
                  <div key={b.t} className="glass-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 grid place-items-center">
                      <I size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{b.t}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{b.d}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-8 rounded-3xl bg-brand-gradient text-white p-8 md:p-10 grid md:grid-cols-[1fr_auto] items-center gap-5">
              <div>
                <h3 className="font-display font-extrabold text-xl md:text-2xl">
                  Can't find the right property?
                </h3>
                <p className="opacity-90 mt-1 text-sm md:text-base">
                  Tell us your wishlist — budget, location, layout — and our advisor will source it within 48 hours.
                </p>
              </div>
              <Link to="/contact" className="btn-accent inline-flex w-fit">
                Talk to expert <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Group({ label, children }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 mb-2 block">
        {label}
      </label>
      <div className="flex flex-wrap items-start gap-1.5">{children}</div>
    </div>
  );
}

function Pill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${
        active
          ? 'bg-brand-gradient text-white border-transparent shadow-soft'
          : 'border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  );
}

function PropertyListItem({ property, index }) {
  const img = property.images?.[0]?.url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800';
  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className="group relative overflow-hidden rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 shadow-card hover:shadow-glow transition-all"
    >
      <Link
        to={`/properties/${property.slug || property._id}`}
        className="grid sm:grid-cols-[280px_1fr]"
      >
        <div className="relative aspect-[4/3] sm:aspect-auto sm:h-full overflow-hidden">
          <img
            src={img}
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-x-3 top-3 flex gap-2">
            {property.featured && (
              <span className="chip bg-accent-gradient text-white text-[10px] uppercase tracking-wider">
                Featured
              </span>
            )}
            <Badge status={property.status} />
          </div>
        </div>

        <div className="p-5 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs font-medium uppercase tracking-wider text-brand-600 dark:text-brand-300">
                {propertyTypeLabels[property.propertyType] || property.propertyType} ·{' '}
                {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
              </span>
              <h3 className="font-display font-bold text-lg md:text-xl leading-tight line-clamp-1 mt-1">
                {property.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                <MapPin size={14} /> <span className="line-clamp-1">{[property.address, property.city, property.state].filter(Boolean).join(', ')}</span>
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-display font-extrabold text-xl md:text-2xl text-brand-700 dark:text-brand-300 leading-none">
                {formatPrice(property.price, property.pricePeriod)}
              </div>
              {property.area > 0 && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  ₹{Math.round(property.price / property.area).toLocaleString('en-IN')} / {property.areaUnit || 'sqft'}
                </div>
              )}
            </div>
          </div>

          <p className="hidden md:block text-sm text-slate-600 dark:text-slate-300 mt-3 line-clamp-2">
            {property.description}
          </p>

          <div className="mt-auto pt-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5"><Bed size={15} /> {property.bedrooms || 0} Beds</span>
              <span className="flex items-center gap-1.5"><Bath size={15} /> {property.bathrooms || 0} Baths</span>
              <span className="flex items-center gap-1.5"><Square size={15} /> {property.area || 0} {property.areaUnit}</span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-300 group-hover:translate-x-0.5 transition">
              View details <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
