import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { propertyService } from '@/services/property.service';
import { PageHeader } from '@/components/admin/PageHeader';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Spinner';
import { propertyTypeLabels } from '@/lib/utils';

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

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: defaults });

  useEffect(() => {
    if (!isEdit) return;
    propertyService
      .get(id)
      .then((res) => {
        const p = res.data;
        reset({
          ...defaults,
          ...p,
          amenities: (p.amenities || []).join(', '),
          yearBuilt: p.yearBuilt || '',
        });
        setExistingImages(p.images || []);
      })
      .catch(() => toast.error('Property not found'))
      .finally(() => setLoading(false));
  }, [id, isEdit, reset]);

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

      <PageHeader
        title={isEdit ? 'Edit Property' : 'Add Property'}
        description={isEdit ? 'Update the property details and images' : 'Create a new property listing'}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
