import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { propertyService } from '@/services/property.service';
import { PropertyCard } from '@/components/public/PropertyCard';
import { Skeleton } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { propertyTypeLabels } from '@/lib/utils';

export default function Properties() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo(
    () => ({
      search: params.get('search') || '',
      propertyType: params.get('propertyType') || '',
      listingType: params.get('listingType') || '',
      city: params.get('city') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      bedrooms: params.get('bedrooms') || '',
      sort: params.get('sort') || 'newest',
      page: parseInt(params.get('page')) || 1,
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

  return (
    <div>
      <section className="container-x py-10 md:py-14">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="section-title">Browse Properties</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {meta.total} properties found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filters.sort}
              onChange={(e) => setFilter('sort', e.target.value)}
              className="input w-auto"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="btn-outline lg:hidden"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* FILTERS */}
          <aside
            className={`${
              showFilters ? 'block' : 'hidden lg:block'
            } glass-card p-5 h-fit sticky top-24`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg">Filters</h3>
              <button onClick={clearAll} className="text-xs text-brand-600 dark:text-brand-300 hover:underline">
                Clear all
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search keyword..."
                  className="input pl-10"
                  value={filters.search}
                  onChange={(e) => setFilter('search', e.target.value)}
                />
              </div>

              <Group label="Listing Type">
                <Pill active={!filters.listingType} onClick={() => setFilter('listingType', '')}>All</Pill>
                <Pill active={filters.listingType === 'sale'} onClick={() => setFilter('listingType', 'sale')}>For Sale</Pill>
                <Pill active={filters.listingType === 'rent'} onClick={() => setFilter('listingType', 'rent')}>For Rent</Pill>
              </Group>

              <Group label="Property Type">
                <select className="input" value={filters.propertyType} onChange={(e) => setFilter('propertyType', e.target.value)}>
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
                  className="input"
                  value={filters.city}
                  onChange={(e) => setFilter('city', e.target.value)}
                />
              </Group>

              <Group label="Price Range (₹)">
                <div className="grid grid-cols-2 gap-2">
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
            </div>
          </aside>

          {/* RESULTS */}
          <div>
            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (<Skeleton key={i} className="h-[420px]" />))}
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No properties match your filters"
                description="Try adjusting your search or filters to see more results."
              />
            ) : (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {items.map((p, i) => (<PropertyCard key={p._id} property={p} index={i} />))}
                </div>
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  onChange={(p) => setFilter('page', String(p))}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Group({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex flex-wrap gap-1.5">{children}</div>
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
