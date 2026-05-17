import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Upload, X, FileDown, QrCode, Calculator,
  RotateCcw, AlertTriangle, Sparkles, CheckCircle2, Circle,
} from 'lucide-react';
import { propertyService } from '@/services/property.service';
import { PageHeader } from '@/components/admin/PageHeader';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { propertyTypeLabels } from '@/lib/utils';
import { generatePropertyBrochure } from '@/lib/propertyBrochure';
import { scoreListing, QUALITY_STYLE } from '@/lib/listingQuality';
import { draftStore } from '@/lib/draftStore';

const schema = z.object({
  title: z.string().min(3, 'Min 3 characters').max(160),
  description: z.string().min(10, 'Min 10 characters'),
  propertyType: z.enum(['apartment', 'house', 'villa', 'plot', 'commercial', 'office', 'pg']),
  listingType: z.enum(['sale', 'rent']),
  price: z.coerce.number().min(0, 'Price required'),
  pricePeriod: z.enum(['one-time', 'monthly', 'yearly']),
  address: z.string().min(3, 'Address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  bedrooms: z.coerce.number().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  area: z.coerce.number().min(0).optional(),
  areaUnit: z.enum(['sqft', 'sqm', 'acre']),
  parking: z.coerce.number().min(0).optional(),
  yearBuilt: z.coerce.number().optional(),
  furnishing: z.enum(['unfurnished', 'semi-furnished', 'furnished']),
  status: z.enum(['available', 'sold', 'rented', 'pending', 'draft']),
  featured: z.boolean().optional(),
  amenities: z.string().optional(),
});

const defaults = {
  title: '',
  description: '',
  propertyType: 'apartment',
  listingType: 'sale',
  price: '',
  pricePeriod: 'one-time',
  address: '',
  city: '',
  state: '',
  country: 'India',
  zipCode: '',
  bedrooms: 0,
  bathrooms: 0,
  area: 0,
  areaUnit: 'sqft',
  parking: 0,
  yearBuilt: '',
  furnishing: 'unfurnished',
  status: 'available',
  featured: false,
  amenities: '',
};

export default function PropertyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]); // File[]
  const [removeImages, setRemoveImages] = useState([]); // publicIds
  const [property, setProperty] = useState(null);
  const [pendingDraft, setPendingDraft] = useState(null);
  const [duplicates, setDuplicates] = useState([]);

  const draftKey = isEdit ? `property:${id}` : 'property:new';

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(schema), defaultValues: defaults });

  useEffect(() => {
    if (!isEdit) {
      const draft = draftStore.load(draftKey);
      if (draft?.data) setPendingDraft(draft);
      return;
    }
    propertyService
      .get(id)
      .then((res) => {
        const p = res.data;
        setProperty(p);
        reset({
          ...defaults,
          ...p,
          amenities: (p.amenities || []).join(', '),
          yearBuilt: p.yearBuilt || '',
        });
        setExistingImages(p.images || []);
        // Offer to restore a draft only if it's newer than the server record.
        const draft = draftStore.load(draftKey);
        if (draft?.savedAt && new Date(p.updatedAt || p.createdAt).getTime() < draft.savedAt) {
          setPendingDraft(draft);
        }
      })
      .catch(() => toast.error('Property not found'))
      .finally(() => setLoading(false));
  }, [id, isEdit, reset, draftKey]);

  // Auto-save draft on every change (debounced via 1.2s).
  const watched = watch();
  const saveTimer = useRef(null);
  useEffect(() => {
    if (loading) return;
    if (!isDirty) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      draftStore.save(draftKey, watched);
    }, 1200);
    return () => clearTimeout(saveTimer.current);
  }, [watched, isDirty, draftKey, loading]);

  // Duplicate detection — only when creating a new listing.
  const dupTimer = useRef(null);
  const watchedTitle = watch('title');
  const watchedCity = watch('city');
  useEffect(() => {
    if (isEdit) return;
    const t = String(watchedTitle || '').trim();
    if (t.length < 6) { setDuplicates([]); return; }
    clearTimeout(dupTimer.current);
    dupTimer.current = setTimeout(async () => {
      try {
        const res = await propertyService.list({ search: t, limit: 5 });
        const found = (res.data || []).filter(
          (p) => !watchedCity || p.city?.toLowerCase() === watchedCity.toLowerCase()
        );
        setDuplicates(found.slice(0, 3));
      } catch {
        setDuplicates([]);
      }
    }, 600);
    return () => clearTimeout(dupTimer.current);
  }, [watchedTitle, watchedCity, isEdit]);

  const restoreDraft = () => {
    if (!pendingDraft?.data) return;
    reset(pendingDraft.data);
    setPendingDraft(null);
    toast.success('Draft restored');
  };

  const discardDraft = () => {
    draftStore.clear(draftKey);
    setPendingDraft(null);
  };

  const quality = useMemo(
    () => scoreListing(watched, { existingImages, newImages }),
    [watched, existingImages, newImages]
  );

  const onFiles = (files) => {
    const arr = Array.from(files).slice(0, 12 - newImages.length - existingImages.length);
    setNewImages((prev) => [...prev, ...arr]);
  };

  const removeNew = (idx) => setNewImages((prev) => prev.filter((_, i) => i !== idx));

  const removeExisting = (img) => {
    setExistingImages((prev) => prev.filter((i) => i.publicId !== img.publicId));
    setRemoveImages((prev) => [...prev, img.publicId]);
  };

  const onSubmit = async (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'amenities') {
        const arr = v
          ? v.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
        fd.append('amenities', JSON.stringify(arr));
      } else if (k === 'featured') {
        fd.append(k, v ? 'true' : 'false');
      } else if (v !== undefined && v !== null && v !== '') {
        fd.append(k, v);
      }
    });
    newImages.forEach((f) => fd.append('images', f));
    if (isEdit && removeImages.length) {
      fd.append('removeImages', JSON.stringify(removeImages));
    }

    try {
      if (isEdit) {
        await propertyService.update(id, fd);
        toast.success('Property updated');
      } else {
        await propertyService.create(fd);
        toast.success('Property created');
      }
      draftStore.clear(draftKey);
      navigate('/admin/properties');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div>
      <Link to="/admin/properties" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 mb-3">
        <ArrowLeft size={14} /> Back to properties
      </Link>

      {pendingDraft && (
        <div className="mb-4 flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-brand-200/70 bg-brand-50 dark:bg-brand-500/10 dark:border-brand-400/30">
          <RotateCcw size={18} className="text-brand-600" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-brand-800 dark:text-brand-200 text-sm">
              Unsaved draft from {new Date(pendingDraft.savedAt).toLocaleString()}
            </div>
            <div className="text-xs text-brand-600 dark:text-brand-300">
              We auto-saved your last edits. Restore them or start fresh.
            </div>
          </div>
          <button onClick={discardDraft} className="text-sm font-medium text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white">
            Discard
          </button>
          <button onClick={restoreDraft} className="btn-primary text-sm py-1.5">
            Restore draft
          </button>
        </div>
      )}

      {!isEdit && duplicates.length > 0 && (
        <div className="mb-4 p-4 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-400/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <div className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Possible duplicate{duplicates.length === 1 ? '' : 's'} found
            </div>
          </div>
          <ul className="space-y-1.5 ml-6 text-sm">
            {duplicates.map((d) => (
              <li key={d._id}>
                <Link
                  to={`/admin/properties/${d._id}/edit`}
                  className="text-amber-700 dark:text-amber-200 hover:underline"
                >
                  {d.title}
                </Link>
                <span className="text-xs text-amber-600/70 dark:text-amber-300/70 ml-2">
                  {d.city}, {d.state} · {d.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <PageHeader
        title={isEdit ? 'Edit Property' : 'Add Property'}
        description={isEdit ? 'Update the property details and images' : 'Create a new property listing'}
        actions={
          isEdit && property ? (
            <>
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('tools:open-emi', {
                      detail: { principal: property.price, title: property.title },
                    })
                  )
                }
                className="btn-outline gap-2"
              >
                <Calculator size={16} /> EMI
              </button>
              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent('tools:open-qr', {
                      detail: {
                        url: `${window.location.origin}/properties/${property._id}`,
                        title: property.title,
                      },
                    })
                  )
                }
                className="btn-outline gap-2"
              >
                <QrCode size={16} /> QR Code
              </button>
              <button
                type="button"
                onClick={() => generatePropertyBrochure(property)}
                className="btn-outline gap-2"
              >
                <FileDown size={16} /> Brochure
              </button>
            </>
          ) : null
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <QualityPanel quality={quality} />

        {/* Basic */}
        <Section title="Basic Information">
          <Input label="Title *" placeholder="3BHK Luxury Apartment in Bandra" {...register('title')} error={errors.title?.message} />
          <Textarea label="Description *" rows={5} placeholder="Describe this property..." {...register('description')} error={errors.description?.message} />
          <div className="grid sm:grid-cols-3 gap-4">
            <Select label="Property Type *" {...register('propertyType')}>
              {Object.entries(propertyTypeLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
            <Select label="Listing Type *" {...register('listingType')}>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </Select>
            <Select label="Status" {...register('status')}>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
              <option value="pending">Pending</option>
              <option value="draft">Draft</option>
            </Select>
          </div>
        </Section>

        {/* Pricing */}
        <Section title="Pricing">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Price (₹) *" type="number" {...register('price')} error={errors.price?.message} />
            <Select label="Price Period" {...register('pricePeriod')}>
              <option value="one-time">One Time</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </div>
        </Section>

        {/* Location */}
        <Section title="Location">
          <Input label="Address *" {...register('address')} error={errors.address?.message} />
          <div className="grid sm:grid-cols-4 gap-4">
            <Input label="City *" {...register('city')} error={errors.city?.message} />
            <Input label="State *" {...register('state')} error={errors.state?.message} />
            <Input label="Country" {...register('country')} />
            <Input label="Zip Code" {...register('zipCode')} />
          </div>
        </Section>

        {/* Details */}
        <Section title="Property Details">
          <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Input label="Bedrooms" type="number" {...register('bedrooms')} />
            <Input label="Bathrooms" type="number" {...register('bathrooms')} />
            <Input label="Area" type="number" {...register('area')} />
            <Select label="Unit" {...register('areaUnit')}>
              <option value="sqft">sqft</option>
              <option value="sqm">sqm</option>
              <option value="acre">acre</option>
            </Select>
            <Input label="Parking" type="number" {...register('parking')} />
            <Input label="Year Built" type="number" placeholder="2022" {...register('yearBuilt')} />
          </div>
          <Select label="Furnishing" {...register('furnishing')}>
            <option value="unfurnished">Unfurnished</option>
            <option value="semi-furnished">Semi-Furnished</option>
            <option value="furnished">Furnished</option>
          </Select>
          <Input
            label="Amenities (comma separated)"
            placeholder="Swimming Pool, Gym, Parking, Garden"
            {...register('amenities')}
          />
        </Section>

        {/* Images */}
        <Section title="Images">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {existingImages.map((img) => (
              <div key={img.publicId || img.url} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeExisting(img)}
                  className="absolute inset-0 bg-black/50 grid place-items-center opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            ))}
            {newImages.map((f, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNew(i)}
                  className="absolute inset-0 bg-black/50 grid place-items-center opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-white/10 grid place-items-center cursor-pointer hover:border-brand-500 hover:bg-brand-50/30 dark:hover:bg-brand-500/5 transition">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onFiles(e.target.files)}
                className="hidden"
              />
              <div className="text-center">
                <Upload size={20} className="mx-auto text-slate-400 mb-1" />
                <span className="text-xs text-slate-500">Upload</span>
              </div>
            </label>
          </div>
          <p className="text-xs text-slate-500 mt-2">Up to 12 images. JPG, PNG, WEBP. Max 5MB each.</p>
        </Section>

        {/* Featured */}
        <Section title="Visibility">
          <Controller
            control={control}
            name="featured"
            render={({ field }) => (
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="w-5 h-5 rounded accent-brand-600"
                />
                <span className="font-medium">Mark as featured</span>
              </label>
            )}
          />
        </Section>

        <div className="flex items-center justify-end gap-2 sticky bottom-2 bg-white/80 dark:bg-surface-darker/80 backdrop-blur p-4 rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-soft">
          <Button variant="ghost" type="button" onClick={() => navigate('/admin/properties')}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Property'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-card p-5 space-y-4">
      <h3 className="font-display font-bold text-lg">{title}</h3>
      {children}
    </div>
  );
}

function QualityPanel({ quality }) {
  const style = QUALITY_STYLE[quality.tier];
  const failing = quality.checks.filter((c) => !c.ok);
  return (
    <div className="bg-white dark:bg-white/[0.03] rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-card p-5">
      <div className="flex items-start gap-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke="currentColor"
              className={style.text}
              strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${quality.score} 100`}
            />
          </svg>
          <div className={`absolute inset-0 grid place-items-center font-display font-extrabold text-lg ${style.text}`}>
            {quality.score}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-brand-500" />
            <h3 className="font-display font-bold text-lg">Listing Quality</h3>
            <span className={`chip text-[10px] font-bold uppercase tracking-wider ring-1 ${style.bg} ${style.text} ${style.ring}`}>
              {style.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Improve this score before publishing — better listings get more inquiries.
          </p>
          {failing.length > 0 && (
            <div className="mt-3 grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
              {failing.slice(0, 6).map((c) => (
                <div key={c.id} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <Circle size={12} className="text-slate-300 mt-0.5 shrink-0" />
                  <span>{c.label}</span>
                </div>
              ))}
            </div>
          )}
          {failing.length === 0 && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600">
              <CheckCircle2 size={14} /> All checks passing — ready to publish.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
