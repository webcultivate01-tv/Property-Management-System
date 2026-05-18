// Admin Event Management.
// Full CRUD with:
//   - Optional image upload (multipart/form-data)
//   - Active toggle (drives the public popup)
//   - Search + status filters + pagination
//   - Card grid view

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  CalendarDays, Plus, Search, Pencil, Trash2, Zap,
  Power, PowerOff, ImagePlus, X as XIcon, Sparkles,
} from 'lucide-react';
import { eventService } from '@/services/event.service';
import { PageHeader } from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { formatDate, cn } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(2, 'Title required').max(160),
  description: z.string().max(2000).optional(),
  type: z.enum(['sale', 'festival', 'launch', 'open-house', 'webinar', 'holiday', 'other']),
  startDate: z.string().min(1, 'Start date required'),
  endDate: z.string().optional(),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
  showAsPopup: z.boolean().optional(),
  autoTrigger: z.boolean().optional(),
});

const TYPE_COLORS = {
  sale: '#f97316',
  festival: '#ec4899',
  launch: '#6366f1',
  'open-house': '#10b981',
  webinar: '#06b6d4',
  holiday: '#8b5cf6',
  other: '#64748b',
};

const STATUS_LABELS = {
  live: { label: 'Live', cls: 'bg-emerald-100 text-emerald-700' },
  upcoming: { label: 'Upcoming', cls: 'bg-amber-100 text-amber-700' },
  ended: { label: 'Ended', cls: 'bg-slate-200 text-slate-700' },
  inactive: { label: 'Inactive', cls: 'bg-rose-100 text-rose-700' },
};

export default function Events() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  // Local form-only state for the picked image.
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [removeImage, setRemoveImage] = useState(false);

  const fetchData = () => {
    setLoading(true);
    eventService
      .list({ page, limit: 12, search, status })
      .then((res) => {
        setItems(res.data || []);
        setMeta(res.meta || { totalPages: 1, total: 0 });
      })
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [page, search, status]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'sale',
      isActive: true,
      showAsPopup: true,
      autoTrigger: true,
      color: '#f97316',
    },
  });

  const resetImageState = () => {
    setImageFile(null);
    setImagePreview('');
    setRemoveImage(false);
  };

  const openCreate = () => {
    resetImageState();
    form.reset({
      title: '',
      description: '',
      type: 'sale',
      startDate: '',
      endDate: '',
      discountPercent: 0,
      color: '#f97316',
      isActive: true,
      showAsPopup: true,
      autoTrigger: true,
    });
    setCreating(true);
  };

  const openEdit = (ev) => {
    resetImageState();
    setImagePreview(ev.image?.url || '');
    form.reset({
      title: ev.title,
      description: ev.description || '',
      type: ev.type,
      startDate: ev.startDate ? toLocalInput(ev.startDate) : '',
      endDate: ev.endDate ? toLocalInput(ev.endDate) : '',
      discountPercent: ev.discountPercent || 0,
      color: ev.color || '#f97316',
      isActive: ev.isActive,
      showAsPopup: ev.showAsPopup ?? true,
      autoTrigger: ev.autoTrigger,
    });
    setEditing(ev);
  };

  const onPickImage = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const closeModal = () => {
    setCreating(false);
    setEditing(null);
    resetImageState();
  };

  const onSubmit = async (data) => {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('title', data.title);
      fd.append('description', data.description || '');
      fd.append('type', data.type);
      fd.append('startDate', new Date(data.startDate).toISOString());
      if (data.endDate) fd.append('endDate', new Date(data.endDate).toISOString());
      fd.append('discountPercent', data.discountPercent || 0);
      fd.append('color', data.color || '#f97316');
      fd.append('isActive', data.isActive ?? true);
      fd.append('showAsPopup', data.showAsPopup ?? true);
      fd.append('autoTrigger', data.autoTrigger ?? true);
      if (imageFile) fd.append('image', imageFile);
      if (editing && removeImage) fd.append('removeImage', 'true');

      if (editing) {
        await eventService.update(editing._id, fd);
        toast.success('Event updated');
      } else {
        await eventService.create(fd);
        toast.success('Event created');
      }
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (ev) => {
    try {
      await eventService.toggle(ev._id);
      toast.success(ev.isActive ? 'Deactivated' : 'Activated');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await eventService.remove(deleting._id);
      toast.success('Event deleted');
      setDeleting(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  const triggerToday = async () => {
    try {
      const res = await eventService.triggerToday();
      toast.success(`Triggered ${res.data?.triggered || 0} event(s)`);
      fetchData();
    } catch {
      toast.error('Trigger failed');
    }
  };

  return (
    <div>
      <PageHeader
        title="Event Management"
        description={`${meta.total} event(s) — sales, festivals, launches & more`}
        actions={
          <>
            <Button variant="outline" onClick={triggerToday}>
              <Zap size={16} /> Trigger Today
            </Button>
            <Button onClick={openCreate}>
              <Plus size={16} /> New Event
            </Button>
          </>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-slate-200/60">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search events..."
              className="input pl-10"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['', 'live', 'upcoming', 'ended', 'inactive'].map((s) => (
              <button
                key={s || 'all'}
                onClick={() => { setStatus(s); setPage(1); }}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition capitalize',
                  status === s
                    ? 'bg-brand-gradient text-white shadow-soft'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                )}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (<Skeleton key={i} className="h-44" />))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No events yet"
            description="Create promotional events like Diwali Sale, New Launch, or Open House."
            action={<Button onClick={openCreate}><Plus size={16} /> New Event</Button>}
          />
        ) : (
          <div className="p-4 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((ev) => (
              <EventCard
                key={ev._id}
                event={ev}
                onEdit={() => openEdit(ev)}
                onToggle={() => toggle(ev)}
                onDelete={() => setDeleting(ev)}
              />
            ))}
          </div>
        )}

        {!loading && items.length > 0 && (
          <Pagination page={page} totalPages={meta.totalPages} onChange={setPage} />
        )}
      </div>

      {/* CREATE / EDIT */}
      <Modal
        open={creating || !!editing}
        onClose={closeModal}
        title={editing ? 'Edit Event' : 'New Event'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button onClick={form.handleSubmit(onSubmit)} loading={busy}>
              {editing ? 'Save Changes' : 'Create Event'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <Input
            label="Title *"
            placeholder="e.g. Diwali Mega Sale"
            {...form.register('title')}
            error={form.formState.errors.title?.message}
          />
          <Textarea
            label="Description"
            rows={3}
            placeholder="Tell visitors what's happening on this day."
            {...form.register('description')}
          />

          {/* Optional image upload */}
          <ImagePicker
            preview={removeImage ? '' : imagePreview}
            onPick={onPickImage}
            onClear={() => {
              if (imageFile) {
                setImageFile(null);
                setImagePreview(editing?.image?.url || '');
              } else {
                setImagePreview('');
                setRemoveImage(!!editing?.image?.url);
              }
            }}
          />

          <div className="grid sm:grid-cols-3 gap-4">
            <Select label="Type *" {...form.register('type')} onChange={(e) => {
              form.setValue('type', e.target.value);
              form.setValue('color', TYPE_COLORS[e.target.value] || '#f97316');
            }}>
              <option value="sale">Sale</option>
              <option value="festival">Festival</option>
              <option value="launch">Launch</option>
              <option value="open-house">Open House</option>
              <option value="webinar">Webinar</option>
              <option value="holiday">Holiday</option>
              <option value="other">Other</option>
            </Select>
            <Input
              label="Discount % (optional)"
              type="number"
              min="0"
              max="100"
              placeholder="0"
              {...form.register('discountPercent')}
            />
            <div>
              <label className="label">Accent color</label>
              <input
                type="color"
                {...form.register('color')}
                className="w-full h-[42px] rounded-xl border border-slate-200 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Start date & time *"
              type="datetime-local"
              {...form.register('startDate')}
              error={form.formState.errors.startDate?.message}
            />
            <Input
              label="End date & time (optional)"
              type="datetime-local"
              {...form.register('endDate')}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-3 pt-2">
            <CheckLabel label="Active" {...form.register('isActive')} hint="Visible in lists & APIs" />
            <CheckLabel label="Show as popup" {...form.register('showAsPopup')} hint="Appears as modal on website" />
            <CheckLabel label="Auto-trigger" {...form.register('autoTrigger')} hint="Hook for scheduled side-effects" />
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM */}
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete event?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="danger" onClick={remove} loading={busy}>Delete</Button>
          </>
        }
      >
        <p className="text-slate-600">
          Permanently delete <span className="font-semibold">{deleting?.title}</span>?
        </p>
      </Modal>
    </div>
  );
}

// ---------- Sub-components ----------

function EventCard({ event, onEdit, onToggle, onDelete }) {
  const status = STATUS_LABELS[event.status] || STATUS_LABELS.inactive;
  const accent = event.color || TYPE_COLORS[event.type] || '#f97316';
  const img = event.image?.url;
  return (
    <div className="relative rounded-2xl border border-slate-200/70 overflow-hidden bg-white shadow-card">
      <div
        className="h-28 relative overflow-hidden"
        style={img ? undefined : { background: `linear-gradient(135deg, ${accent} 0%, ${shade(accent, -30)} 100%)` }}
      >
        {img && (
          <>
            <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent" />
          </>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="chip bg-white/90 text-slate-800 text-[10px] font-bold uppercase tracking-wider">
            {event.type}
          </span>
          {event.discountPercent > 0 && (
            <span className="chip bg-black/30 text-white text-[10px] font-bold">
              -{event.discountPercent}%
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 flex gap-1.5">
          {event.showAsPopup && (
            <span className="chip bg-white/90 text-slate-800 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles size={10} /> Popup
            </span>
          )}
          <span className={cn('chip text-[10px] font-bold uppercase tracking-wider', status.cls)}>
            {status.label}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-white">
          <CalendarDays size={16} className="shrink-0" />
          <span className="text-sm font-semibold truncate">{formatDate(event.startDate)}</span>
          {event.endDate && <span className="text-xs opacity-80">→ {formatDate(event.endDate)}</span>}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-bold text-base line-clamp-1">{event.title}</h3>
        {event.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{event.description}</p>
        )}
        <div className="mt-3 flex items-center gap-1.5">
          <button onClick={onToggle} className="btn-outline text-xs flex-1">
            {event.isActive ? <PowerOff size={13} /> : <Power size={13} />}
            {event.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button onClick={onEdit} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600" title="Edit">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="p-2 rounded-xl text-rose-500 hover:bg-rose-50" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ImagePicker({ preview, onPick, onClear }) {
  return (
    <div>
      <label className="label">Image (optional)</label>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <img src={preview} alt="" className="w-full max-h-56 object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 hover:bg-white shadow grid place-items-center text-slate-700"
            aria-label="Remove image"
          >
            <XIcon size={15} />
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-brand-400 hover:text-brand-600 cursor-pointer transition">
          <ImagePlus size={18} />
          <span className="text-sm">Click to upload (jpg / png / webp, max 5 MB)</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0])}
          />
        </label>
      )}
    </div>
  );
}

function CheckLabel({ label, hint, ...rest }) {
  return (
    <label className="flex items-start gap-2 cursor-pointer p-3 rounded-xl border border-slate-200 hover:border-brand-300 transition">
      <input type="checkbox" className="mt-0.5 w-4 h-4 accent-brand-600" {...rest} />
      <div className="leading-tight">
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-[11px] text-slate-500 mt-0.5">{hint}</div>}
      </div>
    </label>
  );
}

// ---------- Helpers ----------

function toLocalInput(iso) {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function shade(hex, amt) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(Math.min(((num >> 16) & 0xff) + amt, 255), 0);
  const g = Math.max(Math.min(((num >> 8) & 0xff) + amt, 255), 0);
  const b = Math.max(Math.min((num & 0xff) + amt, 255), 0);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
