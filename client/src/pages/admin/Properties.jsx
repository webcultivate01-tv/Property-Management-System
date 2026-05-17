import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Plus, Search, Pencil, Trash2, Star, StarOff, ImageIcon, Building2,
  FileDown, QrCode, Clock, GitCompare, X as XIcon, Map as MapIcon, List,
  Upload,
} from 'lucide-react';
import { generatePropertyBrochure } from '@/lib/propertyBrochure';
import { propertyService } from '@/services/property.service';
import { PageHeader } from '@/components/admin/PageHeader';
import { ExportMenu } from '@/components/admin/ExportMenu';
import { FilterPresets } from '@/components/admin/FilterPresets';
import { PropertiesMap } from '@/components/admin/PropertiesMap';
import { CsvImportModal } from '@/components/admin/CsvImportModal';
import { fetchAllPages } from '@/lib/exportAll';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { formatPrice, formatDate, propertyTypeLabels } from '@/lib/utils';

const PROPERTY_EXPORT_COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'propertyType', label: 'Type', format: (v) => propertyTypeLabels[v] || v },
  { key: 'status', label: 'Status' },
  { key: 'price', label: 'Price', format: (v, row) => formatPrice(v, row.pricePeriod) },
  { key: 'bedrooms', label: 'Beds' },
  { key: 'bathrooms', label: 'Baths' },
  { key: 'areaSqft', label: 'Area (sqft)' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'address', label: 'Address' },
  { key: 'featured', label: 'Featured', format: (v) => (v ? 'Yes' : 'No') },
  { key: 'createdAt', label: 'Listed', format: (v) => formatDate(v) },
];

const STALE_DAYS = 90;

const ageDays = (iso) =>
  iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : 0;

export default function AdminProperties() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(() => new Map());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('properties-view') || 'list');
  const [mapData, setMapData] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => { localStorage.setItem('properties-view', viewMode); }, [viewMode]);

  // When in map mode, pull every matching record (not just the current page) once.
  useEffect(() => {
    if (viewMode !== 'map') return;
    setMapLoading(true);
    fetchAllPages(propertyService.list, { search, status })
      .then((rows) => setMapData(rows || []))
      .catch(() => toast.error('Failed to load map'))
      .finally(() => setMapLoading(false));
  }, [viewMode, search, status]);

  const fetchData = () => {
    setLoading(true);
    propertyService
      .list({ page, limit: 10, search, status })
      .then((res) => {
        setItems(res.data || []);
        setMeta(res.meta || { totalPages: 1, total: 0 });
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [page, search, status]);
  useEffect(() => { setSelected(new Map()); }, [page, search, status]);

  const onDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await propertyService.remove(deleting._id);
      toast.success('Property deleted');
      setDeleting(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  const toggleFeatured = async (p) => {
    try {
      await propertyService.toggleFeatured(p._id);
      toast.success(p.featured ? 'Unfeatured' : 'Featured');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const toggleRow = (p) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(p._id)) next.delete(p._id);
      else next.set(p._id, p);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      if (prev.size === items.length) return new Map();
      return new Map(items.map((p) => [p._id, p]));
    });
  };

  const clearSelection = () => setSelected(new Map());

  const bulkFeature = async (feature) => {
    const targets = Array.from(selected.values()).filter((p) => !!p.featured !== feature);
    if (!targets.length) {
      toast.error(`Already ${feature ? 'featured' : 'unfeatured'}.`);
      return;
    }
    setBulkBusy(true);
    try {
      await Promise.all(targets.map((p) => propertyService.toggleFeatured(p._id)));
      toast.success(`${targets.length} ${feature ? 'featured' : 'unfeatured'}`);
      clearSelection();
      fetchData();
    } catch {
      toast.error('Bulk update failed');
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkDelete = async () => {
    if (!selected.size) return;
    if (!window.confirm(`Delete ${selected.size} propert${selected.size === 1 ? 'y' : 'ies'} and all their images? This cannot be undone.`)) return;
    setBulkBusy(true);
    const ids = Array.from(selected.keys());
    try {
      await Promise.all(ids.map((id) => propertyService.remove(id)));
      toast.success(`Deleted ${ids.length}`);
      clearSelection();
      fetchData();
    } catch {
      toast.error('Bulk delete failed');
    } finally {
      setBulkBusy(false);
    }
  };

  const allChecked = items.length > 0 && selected.size === items.length;
  const someChecked = selected.size > 0 && !allChecked;
  const compareItems = Array.from(selected.values()).slice(0, 3);

  return (
    <div>
      <PageHeader
        title="Properties"
        description={`${meta.total} properties in your catalog`}
        actions={
          <>
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/5 p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-200 shadow' : 'text-slate-500 dark:text-slate-300'
                }`}
              >
                <List size={14} /> List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  viewMode === 'map' ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-200 shadow' : 'text-slate-500 dark:text-slate-300'
                }`}
              >
                <MapIcon size={14} /> Map
              </button>
            </div>
            <FilterPresets
              storageKey="properties"
              current={{ search, status }}
              onApply={(f) => {
                setSearch(f.search || '');
                setStatus(f.status || '');
                setPage(1);
              }}
            />
            <button onClick={() => setImportOpen(true)} className="btn-outline gap-2">
              <Upload size={16} /> Import CSV
            </button>
            <ExportMenu
              getData={() => fetchAllPages(propertyService.list, { search, status })}
              columns={PROPERTY_EXPORT_COLUMNS}
              filename="properties"
              title="Property Listings"
            />
            <Link to="/admin/properties/new" className="btn-primary">
              <Plus size={16} /> Add Property
            </Link>
          </>
        }
      />

      <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-card overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-slate-200/60 dark:border-white/10">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search properties by title, city, address..."
              className="input pl-10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="input sm:w-48"
          >
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {viewMode === 'map' && (
          mapLoading && mapData.length === 0 ? (
            <div className="p-4"><Skeleton className="h-[560px]" /></div>
          ) : (
            <PropertiesMap properties={mapData} />
          )
        )}

        {viewMode === 'list' && selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-brand-50 dark:bg-brand-500/10 border-b border-brand-200/60 dark:border-brand-400/20">
            <span className="text-sm font-semibold text-brand-700 dark:text-brand-200">
              {selected.size} selected
            </span>
            <span className="text-slate-300 dark:text-white/20">|</span>
            <button
              onClick={() => setComparing(true)}
              disabled={bulkBusy || selected.size < 2}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-brand-gradient text-white inline-flex items-center gap-1 disabled:opacity-40"
              title={selected.size < 2 ? 'Select 2-3 to compare' : 'Compare side-by-side'}
            >
              <GitCompare size={13} /> Compare ({Math.min(selected.size, 3)})
            </button>
            <button
              onClick={() => bulkFeature(true)}
              disabled={bulkBusy}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200"
            >
              Feature
            </button>
            <button
              onClick={() => bulkFeature(false)}
              disabled={bulkBusy}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200"
            >
              Unfeature
            </button>
            <button
              onClick={bulkDelete}
              disabled={bulkBusy}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-rose-500 text-white hover:bg-rose-600"
            >
              Delete
            </button>
            <button
              onClick={clearSelection}
              className="ml-auto text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 inline-flex items-center gap-1"
            >
              <XIcon size={13} /> Clear
            </button>
          </div>
        )}

        {viewMode === 'list' && (loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-16" />))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No properties yet"
            description="Start by adding your first property listing."
            action={
              <Link to="/admin/properties/new" className="btn-primary">
                <Plus size={16} /> Add Property
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-white/[0.02] text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-brand-600"
                      checked={allChecked}
                      ref={(el) => { if (el) el.indeterminate = someChecked; }}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">Property</th>
                  <th className="text-left px-4 py-3 font-semibold">Type</th>
                  <th className="text-left px-4 py-3 font-semibold">Price</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Listed</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {items.map((p) => {
                  const age = ageDays(p.createdAt);
                  const stale = p.status === 'available' && age >= STALE_DAYS;
                  return (
                    <tr
                      key={p._id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition ${
                        selected.has(p._id) ? 'bg-brand-50/40 dark:bg-brand-500/5' : ''
                      }`}
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-brand-600"
                          checked={selected.has(p._id)}
                          onChange={() => toggleRow(p)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-white/5 overflow-hidden shrink-0 grid place-items-center">
                            {p.images?.[0]?.url ? (
                              <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={18} className="text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold truncate flex items-center gap-2">
                              {p.title}
                              {p.featured && (
                                <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" />
                              )}
                              {stale && (
                                <span
                                  className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 ring-1 ring-amber-200"
                                  title={`Listed ${age} days ago — consider refreshing.`}
                                >
                                  <Clock size={10} /> Aged
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 truncate">{p.city}, {p.state}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize">{propertyTypeLabels[p.propertyType]}</td>
                      <td className="px-4 py-3 font-semibold">{formatPrice(p.price, p.pricePeriod)}</td>
                      <td className="px-4 py-3"><Badge status={p.status} /></td>
                      <td className="px-4 py-3 text-slate-500">
                        <div>{formatDate(p.createdAt)}</div>
                        <div className="text-xs text-slate-400">{age}d ago</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleFeatured(p)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                            title={p.featured ? 'Unfeature' : 'Feature'}
                          >
                            {p.featured ? <StarOff size={15} /> : <Star size={15} />}
                          </button>
                          <button
                            onClick={() => generatePropertyBrochure(p)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                            title="Download brochure"
                          >
                            <FileDown size={15} />
                          </button>
                          <button
                            onClick={() =>
                              window.dispatchEvent(
                                new CustomEvent('tools:open-qr', {
                                  detail: {
                                    url: `${window.location.origin}/properties/${p._id}`,
                                    title: p.title,
                                  },
                                })
                              )
                            }
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                            title="QR code"
                          >
                            <QrCode size={15} />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/properties/${p._id}/edit`)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleting(p)}
                            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

        {viewMode === 'list' && !loading && items.length > 0 && (
          <Pagination page={page} totalPages={meta.totalPages} onChange={setPage} />
        )}
      </div>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete property?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="danger" onClick={onDelete} loading={busy}>Delete</Button>
          </>
        }
      >
        <p className="text-slate-600 dark:text-slate-400">
          This will permanently delete <span className="font-semibold">{deleting?.title}</span> and all its images.
          This action cannot be undone.
        </p>
      </Modal>

      <Modal
        open={comparing}
        onClose={() => setComparing(false)}
        title="Compare properties"
        size="lg"
      >
        <ComparisonGrid items={compareItems} />
      </Modal>

      <CsvImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onDone={() => { setImportOpen(false); fetchData(); }}
      />
    </div>
  );
}

function ComparisonGrid({ items }) {
  if (!items?.length) return null;
  const rows = [
    ['Image', (p) => p.images?.[0]?.url
      ? <img src={p.images[0].url} alt="" className="w-full h-24 object-cover rounded-lg" />
      : <div className="w-full h-24 rounded-lg bg-slate-100 dark:bg-white/5 grid place-items-center text-slate-400"><ImageIcon size={20} /></div>],
    ['Status', (p) => <Badge status={p.status} />],
    ['Price', (p) => <span className="font-semibold">{formatPrice(p.price, p.pricePeriod)}</span>],
    ['Type', (p) => propertyTypeLabels[p.propertyType] || p.propertyType],
    ['Listing', (p) => p.listingType === 'rent' ? 'For Rent' : 'For Sale'],
    ['Beds / Baths', (p) => `${p.bedrooms ?? '—'} / ${p.bathrooms ?? '—'}`],
    ['Area', (p) => p.area ? `${p.area} ${p.areaUnit || 'sqft'}` : '—'],
    ['Parking', (p) => p.parking ?? '—'],
    ['Furnishing', (p) => p.furnishing || '—'],
    ['Year built', (p) => p.yearBuilt || '—'],
    ['Location', (p) => `${p.city || '—'}, ${p.state || ''}`],
    ['Amenities', (p) => p.amenities?.length ? p.amenities.join(', ') : '—'],
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left px-3 py-2 text-xs uppercase tracking-wider text-slate-500 sticky left-0 bg-white dark:bg-slate-900">
              Attribute
            </th>
            {items.map((p) => (
              <th key={p._id} className="text-left px-3 py-2 align-bottom">
                <div className="font-display font-bold text-sm truncate max-w-[14rem]">{p.title}</div>
                <div className="text-xs text-slate-500 truncate">{p.city}, {p.state}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {rows.map(([label, render]) => (
            <tr key={label} className="align-top">
              <td className="px-3 py-2 text-xs uppercase tracking-wider text-slate-500 sticky left-0 bg-white dark:bg-slate-900">
                {label}
              </td>
              {items.map((p) => (
                <td key={p._id} className="px-3 py-2 text-sm">{render(p)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
