import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Trash2, Mail, Phone, MessageSquare, Download, Eye } from 'lucide-react';
import { inquiryService } from '@/services/inquiry.service';
import { PageHeader } from '@/components/admin/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Textarea, Select } from '@/components/ui/Input';
import { formatDate, timeAgo } from '@/lib/utils';

const STATUSES = ['new', 'contacted', 'interested', 'closed', 'spam'];

export default function Inquiries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState('');
  const [currentStatus, setCurrentStatus] = useState('new');

  const fetchData = () => {
    setLoading(true);
    inquiryService
      .list({ page, limit: 10, search, status })
      .then((res) => {
        setItems(res.data || []);
        setMeta(res.meta || { totalPages: 1, total: 0 });
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [page, search, status]);

  const openView = (i) => {
    setViewing(i);
    setNotes(i.notes || '');
    setCurrentStatus(i.status || 'new');
  };

  const updateStatus = async () => {
    if (!viewing) return;
    setBusy(true);
    try {
      await inquiryService.update(viewing._id, { status: currentStatus, notes });
      toast.success('Inquiry updated');
      setViewing(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await inquiryService.remove(deleting._id);
      toast.success('Inquiry deleted');
      setDeleting(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = async () => {
    try {
      const blob = await inquiryService.exportCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inquiries-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div>
      <PageHeader
        title="Inquiries"
        description={`${meta.total} inquiries received`}
        actions={
          <Button variant="outline" onClick={exportCsv}>
            <Download size={16} /> Export CSV
          </Button>
        }
      />

      <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-card overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-slate-200/60 dark:border-white/10">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email, message..."
              className="input pl-10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="input sm:w-48"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-16" />))}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No inquiries yet" description="Inquiries from the contact form will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-white/[0.02] text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Contact</th>
                  <th className="text-left px-4 py-3 font-semibold">Type</th>
                  <th className="text-left px-4 py-3 font-semibold">Property</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Received</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {items.map((i) => (
                  <tr key={i._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{i.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1"><Mail size={12} /> {i.email}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone size={12} /> {i.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize">{i.inquiryType}</td>
                    <td className="px-4 py-3">{i.property?.title || <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-3"><Badge status={i.status} /></td>
                    <td className="px-4 py-3 text-slate-500">
                      <div>{formatDate(i.createdAt)}</div>
                      <div className="text-xs text-slate-400">{timeAgo(i.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openView(i)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5" title="View">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => setDeleting(i)} className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" title="Delete">
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

      {/* VIEW / EDIT */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Inquiry Details"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setViewing(null)}>Close</Button>
            <Button onClick={updateStatus} loading={busy}>Update</Button>
          </>
        }
      >
        {viewing && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Name" value={viewing.name} />
              <Field label="Type" value={viewing.inquiryType} capitalize />
              <Field label="Email" value={viewing.email} />
              <Field label="Phone" value={viewing.phone} />
            </div>
            {viewing.property && (
              <Field label="Property" value={viewing.property.title} />
            )}
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">Message</div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] text-sm leading-relaxed whitespace-pre-line">
                {viewing.message}
              </div>
            </div>
            <Select label="Status" value={currentStatus} onChange={(e) => setCurrentStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </Select>
            <Textarea label="Internal notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        )}
      </Modal>

      {/* DELETE */}
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete inquiry?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="danger" onClick={onDelete} loading={busy}>Delete</Button>
          </>
        }
      >
        <p className="text-slate-600 dark:text-slate-400">
          Delete inquiry from <span className="font-semibold">{deleting?.name}</span>? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

function Field({ label, value, capitalize }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-slate-500 mb-0.5">{label}</div>
      <div className={`font-medium ${capitalize ? 'capitalize' : ''}`}>{value || '—'}</div>
    </div>
  );
}
