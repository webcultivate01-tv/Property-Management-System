import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bed, Bath, Square, MapPin } from 'lucide-react';
import { formatPrice, propertyTypeLabels } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export function PropertyCard({ property, index = 0 }) {
  const img = property.images?.[0]?.url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800';
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 shadow-card hover:shadow-glow hover:-translate-y-1 transition-all"
    >
      <Link to={`/properties/${property.slug || property._id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={img}
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-x-3 top-3 flex justify-between items-start">
            <div className="flex gap-2">
              {property.featured && (
                <span className="chip bg-accent-gradient text-white text-[10px] uppercase tracking-wider">
                  Featured
                </span>
              )}
              <Badge status={property.status} />
            </div>
            <span className="chip bg-white/90 dark:bg-slate-900/80 text-xs">
              {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
            <div className="text-2xl font-bold text-white drop-shadow">
              {formatPrice(property.price, property.pricePeriod)}
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-brand-600 dark:text-brand-300">
              {propertyTypeLabels[property.propertyType] || property.propertyType}
            </span>
          </div>
          <h3 className="font-display font-bold text-lg leading-tight line-clamp-1 mb-1.5">
            {property.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-4">
            <MapPin size={14} /> <span className="line-clamp-1">{property.city}, {property.state}</span>
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-slate-200/70 dark:border-white/10 text-sm text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5"><Bed size={15}/> {property.bedrooms || 0}</span>
            <span className="flex items-center gap-1.5"><Bath size={15}/> {property.bathrooms || 0}</span>
            <span className="flex items-center gap-1.5"><Square size={15}/> {property.area || 0} {property.areaUnit}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
