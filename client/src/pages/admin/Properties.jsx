import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Plus, Search, Pencil, Trash2, Star, StarOff, ImageIcon, Building2,
} from 'lucide-react';
import { propertyService } from '@/services/property.service';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { formatPrice, formatDate, propertyTypeLabels } from '@/lib/utils';

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

  return (
    <div>
      <PageHeader
        title="Properties"
        description={`${meta.total} properties in your catalog`}
        actions={
          <Link to="/admin/properties/new" className="btn-primary">
            <Plus size={16} /> Add Property
          </Link>
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

        {loading ? (
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
                  <th className="text-left px-4 py-3 font-semibold">Property</th>
                  <th className="text-left px-4 py-3 font-semibold">Type</th>
                  <th className="text-left px-4 py-3 font-semibold">Price</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Listed</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {items.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
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
                          </div>
                          <div className="text-xs text-slate-500 truncate">{p.city}, {p.state}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize">{propertyTypeLabels[p.propertyType]}</td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(p.price, p.pricePeriod)}</td>
                    <td className="px-4 py-3"><Badge status={p.status} /></td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(p.createdAt)}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && items.length > 0 && (
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
    </div>
  );
}
