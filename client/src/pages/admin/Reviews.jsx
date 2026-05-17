import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Trash2, Check, X, Star } from 'lucide-react';
import { reviewService } from '@/services/review.service';
import { PageHeader } from '@/components/admin/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Rating } from '@/components/ui/Rating';
import { formatDate } from '@/lib/utils';

export default function Reviews() {
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
    reviewService
      .list({ page, limit: 12, search, status })
      .then((res) => {
        setItems(res.data || []);
        setMeta(res.meta || { totalPages: 1, total: 0 });
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [page, search, status]);

  const setReviewStatus = async (id, st) => {
    try {
      await reviewService.updateStatus(id, st);
      toast.success(`Review ${st}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const onDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await reviewService.remove(deleting._id);
      toast.success('Review deleted');
      setDeleting(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Reviews"
        description={`${meta.total} reviews collected`}
      />

      <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-card overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-slate-200/60 dark:border-white/10">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or content..."
              className="input pl-10"
            />
          </div>
          <div className="flex gap-1.5">
            {['', 'pending', 'approved', 'rejected'].map((s) => (
              <button
                key={s || 'all'}
                onClick={() => { setStatus(s); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${
                  status === s
                    ? 'bg-brand-gradient text-white shadow-soft'
                    : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (<Skeleton key={i} className="h-44" />))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Star} title="No reviews yet" description="Reviews submitted by visitors will appear here." />
        ) : (
          <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((r) => (
              <div key={r._id} className="rounded-2xl border border-slate-200/70 dark:border-white/10 p-5 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <Rating value={r.rating} />
                  <Badge status={r.status} />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-brand-gradient text-white grid place-items-center font-bold">
                    {r.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{r.name}</div>
                    <div className="text-xs text-slate-500">{formatDate(r.createdAt)}</div>
                  </div>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-5 flex-1">"{r.review}"</p>
                <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                  {r.status !== 'approved' && (
                    <button onClick={() => setReviewStatus(r._id, 'approved')} className="btn-outline text-xs flex-1">
                      <Check size={14} /> Approve
                    </button>
                  )}
                  {r.status !== 'rejected' && (
                    <button onClick={() => setReviewStatus(r._id, 'rejected')} className="btn-outline text-xs flex-1">
                      <X size={14} /> Reject
                    </button>
                  )}
                  <button onClick={() => setDeleting(r)} className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && items.length > 0 && (
          <Pagination page={page} totalPages={meta.totalPages} onChange={setPage} />
        )}
      </div>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete review?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="danger" onClick={onDelete} loading={busy}>Delete</Button>
          </>
        }
      >
        <p className="text-slate-600 dark:text-slate-400">
          Permanently delete review from <span className="font-semibold">{deleting?.name}</span>?
        </p>
      </Modal>
    </div>
  );
}
