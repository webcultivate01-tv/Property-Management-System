import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Bed, Bath, Square, MapPin, Calendar, Car, Sofa, Check,
  Mail, Phone, ArrowLeft,
} from 'lucide-react';
import { propertyService } from '@/services/property.service';
import { inquiryService } from '@/services/inquiry.service';
import { Skeleton } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { PropertyCard } from '@/components/public/PropertyCard';
import { formatPrice, propertyTypeLabels, formatDate } from '@/lib/utils';

const inquirySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(8, 'Phone is required'),
  message: z.string().min(10, 'Please share a few details'),
});

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setLoading(true);
    propertyService
      .get(id)
      .then((res) => {
        setProperty(res.data);
        return propertyService.similar(res.data._id);
      })
      .then((sim) => setSimilar(sim?.data || []))
      .catch(() => toast.error('Property not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(inquirySchema) });

  const onSubmit = async (data) => {
    try {
      await inquiryService.submit({ ...data, property: property?._id, inquiryType: 'general' });
      toast.success('Inquiry sent! We will be in touch soon.');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send inquiry');
    }
  };

  if (loading) {
    return (
      <div className="container-x py-10">
        <Skeleton className="h-[500px] w-full mb-6" />
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container-x py-24 text-center">
        <h2 className="section-title">Property not found</h2>
        <Link to="/properties" className="btn-primary mt-6 inline-flex">
          Back to listings
        </Link>
      </div>
    );
  }

  const images = property.images?.length
    ? property.images
    : [{ url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200' }];

  return (
    <div>
      <section className="container-x py-6">
        <Link to="/properties" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600">
          <ArrowLeft size={14} /> Back to properties
        </Link>
      </section>

      {/* GALLERY */}
      <section className="container-x grid md:grid-cols-[1fr_140px] gap-3">
        <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 aspect-[16/10]">
          <motion.img
            key={activeImg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={images[activeImg]?.url}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="grid md:grid-rows-4 grid-cols-4 md:grid-cols-1 gap-3 overflow-x-auto">
          {images.slice(0, 4).map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={`rounded-xl overflow-hidden aspect-square md:aspect-auto md:h-full border-2 ${
                activeImg === i ? 'border-brand-500' : 'border-transparent'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </section>

      {/* MAIN */}
      <section className="container-x mt-10 grid lg:grid-cols-[1fr_380px] gap-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Badge status={property.status} />
            <span className="chip bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300">
              {propertyTypeLabels[property.propertyType]}
            </span>
            {property.featured && (
              <span className="chip bg-accent-gradient text-white text-[10px] uppercase tracking-wider">
                Featured
              </span>
            )}
          </div>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl">{property.title}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-1.5">
            <MapPin size={16} /> {property.address}, {property.city}, {property.state}
          </p>

          <div className="mt-6 flex flex-wrap items-end gap-4">
            <div className="font-display font-extrabold text-4xl bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              {formatPrice(property.price, property.pricePeriod)}
            </div>
            <span className="text-sm text-slate-500">
              {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
          </div>

          {/* QUICK STATS */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { i: Bed, l: 'Bedrooms', v: property.bedrooms },
              { i: Bath, l: 'Bathrooms', v: property.bathrooms },
              { i: Square, l: `Area (${property.areaUnit})`, v: property.area },
              { i: Car, l: 'Parking', v: property.parking },
            ].map((s) => (
              <div key={s.l} className="glass-card p-4 text-center">
                <s.i size={20} className="mx-auto text-brand-600 dark:text-brand-300 mb-2" />
                <div className="font-bold text-lg">{s.v || 0}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{s.l}</div>
              </div>
            ))}
          </div>

          {/* DESCRIPTION */}
          <div className="mt-10">
            <h3 className="font-display font-bold text-xl mb-3">Description</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* DETAILS */}
          <div className="mt-10 grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {[
              ['Type', propertyTypeLabels[property.propertyType]],
              ['Listing', property.listingType === 'rent' ? 'For Rent' : 'For Sale'],
              ['Furnishing', property.furnishing],
              ['Year Built', property.yearBuilt || '—'],
              ['City', property.city],
              ['State', property.state],
              ['Listed', formatDate(property.createdAt)],
              ['Views', property.views || 0],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-100 dark:border-white/5 py-2">
                <span className="text-slate-500 dark:text-slate-400 text-sm">{k}</span>
                <span className="font-medium capitalize">{v}</span>
              </div>
            ))}
          </div>

          {/* AMENITIES */}
          {property.amenities?.length > 0 && (
            <div className="mt-10">
              <h3 className="font-display font-bold text-xl mb-4">Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {property.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-300 grid place-items-center">
                      <Check size={12} />
                    </span>
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MAP */}
          {(property.location?.lat && property.location?.lng) ? (
            <div className="mt-10">
              <h3 className="font-display font-bold text-xl mb-4">Location</h3>
              <div className="rounded-2xl overflow-hidden">
                <iframe
                  title="map"
                  width="100%"
                  height="320"
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${property.location.lat},${property.location.lng}&z=14&output=embed`}
                />
              </div>
            </div>
          ) : (
            <div className="mt-10">
              <h3 className="font-display font-bold text-xl mb-4">Location</h3>
              <div className="rounded-2xl overflow-hidden">
                <iframe
                  title="map"
                  width="100%"
                  height="320"
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    property.address + ', ' + property.city + ', ' + property.state
                  )}&output=embed`}
                />
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="lg:sticky lg:top-24 self-start space-y-6">
          {property.agent && (
            <div className="glass-card p-6">
              <h3 className="font-display font-bold text-lg mb-4">Listing Agent</h3>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-full bg-brand-gradient text-white grid place-items-center font-bold text-lg">
                  {property.agent.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{property.agent.name}</div>
                  <div className="text-xs text-slate-500">Real Estate Advisor</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {property.agent.phone && (
                  <a href={`tel:${property.agent.phone}`} className="flex items-center gap-2 hover:text-brand-600">
                    <Phone size={14} /> {property.agent.phone}
                  </a>
                )}
                {property.agent.email && (
                  <a href={`mailto:${property.agent.email}`} className="flex items-center gap-2 hover:text-brand-600">
                    <Mail size={14} /> {property.agent.email}
                  </a>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 space-y-3">
            <h3 className="font-display font-bold text-lg">Send an Inquiry</h3>
            <Input
              placeholder="Your name"
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              type="email"
              placeholder="Email"
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              placeholder="Phone"
              {...register('phone')}
              error={errors.phone?.message}
            />
            <Textarea
              placeholder="I'm interested in this property..."
              rows={4}
              {...register('message')}
              error={errors.message?.message}
            />
            <Button type="submit" loading={isSubmitting} className="w-full">
              Submit Inquiry
            </Button>
          </form>
        </aside>
      </section>

      {/* SIMILAR */}
      {similar.length > 0 && (
        <section className="container-x mt-20">
          <h2 className="section-title mb-8">Similar Properties</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similar.map((p, i) => (<PropertyCard key={p._id} property={p} index={i} />))}
          </div>
        </section>
      )}
    </div>
  );
}
