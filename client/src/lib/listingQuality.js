// Real-time quality score for a property listing form.
// Returns { score, tier, checks: [{ id, label, ok, hint? }] }.

export function scoreListing(p, opts = {}) {
  const { existingImages = [], newImages = [] } = opts;
  const imageCount = (existingImages?.length || 0) + (newImages?.length || 0);
  const description = String(p.description || '').trim();
  const amenities = String(p.amenities || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const checks = [
    {
      id: 'title',
      label: 'Descriptive title (10+ chars)',
      ok: String(p.title || '').trim().length >= 10,
      hint: 'A short, location-specific title performs best.',
      weight: 10,
    },
    {
      id: 'desc',
      label: 'Rich description (120+ chars)',
      ok: description.length >= 120,
      hint: 'Buyers skim — write at least a short paragraph.',
      weight: 15,
    },
    {
      id: 'images',
      label: '3+ images uploaded',
      ok: imageCount >= 3,
      hint: 'Listings with multiple photos get ~3× more inquiries.',
      weight: 20,
    },
    {
      id: 'price',
      label: 'Price set',
      ok: Number(p.price || 0) > 0,
      weight: 10,
    },
    {
      id: 'location',
      label: 'Full address (address + city + state)',
      ok: !!(p.address && p.city && p.state),
      weight: 10,
    },
    {
      id: 'area',
      label: 'Area specified',
      ok: Number(p.area || 0) > 0,
      weight: 7,
    },
    {
      id: 'beds-baths',
      label: 'Bedrooms & bathrooms set',
      ok:
        ['plot', 'commercial'].includes(p.propertyType)
          ? true
          : Number(p.bedrooms || 0) > 0 && Number(p.bathrooms || 0) > 0,
      weight: 8,
    },
    {
      id: 'amenities',
      label: 'At least 3 amenities listed',
      ok: amenities.length >= 3,
      hint: 'Comma-separate amenities — they show up as chips on the listing.',
      weight: 10,
    },
    {
      id: 'year',
      label: 'Year built provided',
      ok: !!p.yearBuilt && Number(p.yearBuilt) >= 1900,
      weight: 5,
    },
    {
      id: 'furnishing',
      label: 'Furnishing status set',
      ok: !!p.furnishing,
      weight: 5,
    },
  ];

  const total = checks.reduce((a, c) => a + c.weight, 0);
  const earned = checks.reduce((a, c) => a + (c.ok ? c.weight : 0), 0);
  const score = Math.round((earned / total) * 100);
  const tier = score >= 85 ? 'excellent' : score >= 60 ? 'good' : score >= 35 ? 'fair' : 'poor';

  return { score, tier, checks };
}

export const QUALITY_STYLE = {
  excellent: { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200', label: 'Excellent' },
  good:      { bg: 'bg-brand-100',   text: 'text-brand-700',   ring: 'ring-brand-200',   label: 'Good' },
  fair:      { bg: 'bg-amber-100',   text: 'text-amber-700',   ring: 'ring-amber-200',   label: 'Fair' },
  poor:      { bg: 'bg-rose-100',    text: 'text-rose-700',    ring: 'ring-rose-200',    label: 'Needs work' },
};
