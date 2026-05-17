import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Search, Trash2, Mail, Phone, MessageSquare, Eye,
  MessageCircle, PhoneCall, X as XIcon, CheckCircle2, AlarmClock,
  List, LayoutGrid,
} from 'lucide-react';
import { inquiryService } from '@/services/inquiry.service';
import { PageHeader } from '@/components/admin/PageHeader';
import { ExportMenu } from '@/components/admin/ExportMenu';
import { FilterPresets } from '@/components/admin/FilterPresets';
import { InquiryPipeline } from '@/components/admin/InquiryPipeline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Textarea, Select } from '@/components/ui/Input';
import { formatDate, timeAgo } from '@/lib/utils';
import { fetchAllPages } from '@/lib/exportAll';
import { scoreInquiry, TIER_STYLE, TIER_LABEL } from '@/lib/leadScore';

const INQUIRY_EXPORT_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'inquiryType', label: 'Type' },
  { key: 'property.title', label: 'Property' },
  { key: 'status', label: 'Status' },
  { key: 'leadTier', label: 'Lead Tier', format: (_, row) => TIER_LABEL[scoreInquiry(row).tier] },
  { key: 'leadScore', label: 'Lead Score', format: (_, row) => scoreInquiry(row).score },
  { key: 'message', label: 'Message' },
  { key: 'notes', label: 'Internal Notes' },
  { key: 'createdAt', label: 'Received', format: (v) => formatDate(v) },
];

const STATUSES = ['new', 'contacted', 'interested', 'closed', 'spam'];

const sanitizePhone = (p) => String(p || '').replace(/[^\d+]/g, '');

const followUpDays = (i) => {
  const ref = i.updatedAt || i.createdAt;
  if (!ref) return 0;
  return Math.floor((Date.now() - new Date(ref).getTime()) / 86400000);
};

const needsFollowUp = (i) => {
  if (i.status === 'closed' || i.status === 'spam') return false;
  const days = followUpDays(i);
  if (i.status === 'new' && days >= 1) return { urgency: 'urgent', days };
  if (i.status === 'contacted' && days >= 7) return { urgency: 'overdue', days };
  if (i.status === 'interested' && days >= 14) return { urgency: 'overdue', days };
  return false;
};

const whatsappTemplate = (i) =>
  `Hi ${i.name?.split(' ')[0] || 'there'}, this is Telvine Realty replying to your inquiry${
    i.property?.title ? ` about "${i.property.title}"` : ''
  }. When would be a good time to chat?`;

const emailSubject = (i) =>
  i.property?.title
    ? `Re: Your inquiry about ${i.property.title}`
    : 'Re: Your inquiry — Telvine Realty';

const emailBody = (i) =>
  `Hi ${i.name?.split(' ')[0] || ''},\n\nThank you for getting in touch with Telvine Realty${
    i.property?.title ? ` regarding ${i.property.title}` : ''
  }. I'd love to help you with the next steps — please let me know a convenient time to call.\n\nBest regards,\nTelvine Realty`;

const waLink = (i) => {
  const phone = sanitizePhone(i.phone).replace(/^\+/, '');
  if (!phone) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(whatsappTemplate(i))}`;
};

const mailLink = (i) =>
  `mailto:${encodeURIComponent(i.email)}?subject=${encodeURIComponent(emailSubject(i))}&body=${encodeURIComponent(emailBody(i))}`;

const telLink = (i) => (i.phone ? `tel:${sanitizePhone(i.phone)}` : null);

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
  const [selected, setSelected] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('inquiries-view') || 'list');

  useEffect(() => { localStorage.setItem('inquiries-view', viewMode); }, [viewMode]);

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

  // Clear selection when filters/page change so we never act on hidden rows.
  useEffect(() => { setSelected(new Set()); }, [page, search, status]);

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

  const toggleRow = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === items.length
        ? new Set()
        : new Set(items.map((i) => i._id))
    );
  };

  const bulkSetStatus = async (newStatus) => {
    if (!selected.size) return;
    setBulkBusy(true);
    const ids = Array.from(selected);
    try {
      await Promise.all(ids.map((id) => inquiryService.update(id, { status: newStatus })));
      toast.success(`Marked ${ids.length} as ${newStatus}`);
      setSelected(new Set());
      fetchData();
    } catch {
      toast.error('Bulk update failed');
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkDelete = async () => {
    if (!selected.size) return;
    if (!window.confirm(`Delete ${selected.size} inquir${selected.size === 1 ? 'y' : 'ies'}? This cannot be undone.`)) return;
    setBulkBusy(true);
    const ids = Array.from(selected);
    try {
      await Promise.all(ids.map((id) => inquiryService.remove(id)));
      toast.success(`Deleted ${ids.length}`);
      setSelected(new Set());
      fetchData();
    } catch {
      toast.error('Bulk delete failed');
    } finally {
      setBulkBusy(false);
    }
  };

  const allChecked = items.length > 0 && selected.size === items.length;
  const someChecked = selected.size > 0 && !allChecked;

  const viewingScore = useMemo(
    () => (viewing ? scoreInquiry(viewing) : null),
    [viewing]
  );

  return (
    <div>
      <PageHeader
        title="Inquiries"
        description={`${meta.total} inquiries received`}
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
                onClick={() => setViewMode('pipeline')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  viewMode === 'pipeline' ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-200 shadow' : 'text-slate-500 dark:text-slate-300'
                }`}
              >
                <LayoutGrid size={14} /> Pipeline
              </button>
            </div>
            <FilterPresets
              storageKey="inquiries"
              current={{ search, status }}
              onApply={(f) => {
                setSearch(f.search || '');
                setStatus(f.status || '');
                setPage(1);
              }}
            />
            <ExportMenu
              getData={() => fetchAllPages(inquiryService.list, { search, status })}
              columns={INQUIRY_EXPORT_COLUMNS}
              filename="inquiries"
              title="Customer Inquiries"
            />
          </>
        }
      />

      {viewMode === 'pipeline' && (
        <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-card overflow-hidden">
          <InquiryPipeline search={search} />
        </div>
      )}

      {viewMode === 'list' && (

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

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-brand-50 dark:bg-brand-500/10 border-b border-brand-200/60 dark:border-brand-400/20">
            <span className="text-sm font-semibold text-brand-700 dark:text-brand-200">
              {selected.size} selected
            </span>
            <span className="text-slate-300 dark:text-white/20">|</span>
            <button
              onClick={() => bulkSetStatus('contacted')}
              disabled={bulkBusy}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200"
            >
              Mark contacted
            </button>
            <button
              onClick={() => bulkSetStatus('interested')}
              disabled={bulkBusy}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200"
            >
              Mark interested
            </button>
            <button
              onClick={() => bulkSetStatus('closed')}
              disabled={bulkBusy}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200"
            >
              Close
            </button>
            <button
              onClick={() => bulkSetStatus('spam')}
              disabled={bulkBusy}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200"
            >
              Spam
            </button>
            <button
              onClick={bulkDelete}
              disabled={bulkBusy}
              className="text-xs font-medium px-2.5 py-1 rounded-md bg-rose-500 text-white hover:bg-rose-600"
            >
              Delete
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="ml-auto text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 inline-flex items-center gap-1"
            >
              <XIcon size={13} /> Clear
            </button>
          </div>
        )}

        {loading ? (
          <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-16" />))}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No inquiries yet" description="Inquiries from the contact form will appear here." />
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
                  <th className="text-left px-4 py-3 font-semibold">Contact</th>
                  <th className="text-left px-4 py-3 font-semibold">Lead</th>
                  <th className="text-left px-4 py-3 font-semibold">Property</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Received</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {items.map((i) => {
                  const { tier, score } = scoreInquiry(i);
                  const wa = waLink(i);
                  const tel = telLink(i);
                  const followUp = needsFollowUp(i);
                  return (
                    <tr
                      key={i._id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-white/[0.02] ${
                        selected.has(i._id) ? 'bg-brand-50/40 dark:bg-brand-500/5' : ''
                      }`}
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-brand-600"
                          checked={selected.has(i._id)}
                          onChange={() => toggleRow(i._id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{i.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1"><Mail size={12} /> {i.email}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone size={12} /> {i.phone || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`chip text-[10px] font-bold uppercase tracking-wider ${TIER_STYLE[tier]}`}>
                          {TIER_LABEL[tier]} · {score}
                        </span>
                        {followUp && (
                          <div
                            className={`mt-1 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ring-1 ${
                              followUp.urgency === 'urgent'
                                ? 'bg-rose-100 text-rose-700 ring-rose-200'
                                : 'bg-amber-100 text-amber-700 ring-amber-200'
                            }`}
                            title={`${followUp.days} day(s) since last update`}
                          >
                            <AlarmClock size={10} />
                            {followUp.urgency === 'urgent' ? 'Reply now' : 'Follow up'}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1 capitalize">{i.inquiryType}</div>
                      </td>
                      <td className="px-4 py-3">{i.property?.title || <span className="text-slate-400">—</span>}</td>
                      <td className="px-4 py-3"><Badge status={i.status} /></td>
                      <td className="px-4 py-3 text-slate-500">
                        <div>{formatDate(i.createdAt)}</div>
                        <div className="text-xs text-slate-400">{timeAgo(i.createdAt)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {wa && (
                            <a
                              href={wa}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                              title="WhatsApp"
                            >
                              <MessageCircle size={15} />
                            </a>
                          )}
                          <a
                            href={mailLink(i)}
                            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                            title="Email reply"
                          >
                            <Mail size={15} />
                          </a>
                          {tel && (
                            <a
                              href={tel}
                              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                              title="Call"
                            >
                              <PhoneCall size={15} />
                            </a>
                          )}
                          <button onClick={() => openView(i)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5" title="View">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => setDeleting(i)} className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" title="Delete">
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
        )}

        {!loading && items.length > 0 && (
          <Pagination page={page} totalPages={meta.totalPages} onChange={setPage} />
        )}
      </div>
      )}

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
            {/* Lead summary */}
            {viewingScore && (
              <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-50 to-white dark:from-white/[0.03] dark:to-transparent">
                <span className={`chip text-[10px] font-bold uppercase tracking-wider ${TIER_STYLE[viewingScore.tier]}`}>
                  {TIER_LABEL[viewingScore.tier]} lead · {viewingScore.score}/100
                </span>
                {viewingScore.reasons.slice(0, 3).map((r, idx) => (
                  <span key={idx} className="text-xs text-slate-500 inline-flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-brand-500" /> {r}
                  </span>
                ))}
              </div>
            )}

            {/* Quick reply */}
            <div className="flex flex-wrap gap-2">
              {waLink(viewing) && (
                <a
                  href={waLink(viewing)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600"
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
              )}
              <a
                href={mailLink(viewing)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-gradient text-white text-sm font-medium"
              >
                <Mail size={15} /> Email reply
              </a>
              {telLink(viewing) && (
                <a
                  href={telLink(viewing)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-900"
                >
                  <PhoneCall size={15} /> Call
                </a>
              )}
            </div>

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
