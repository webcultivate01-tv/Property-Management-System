import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geocodeCity, jitter } from '@/lib/geocode';
import { formatPrice, propertyTypeLabels } from '@/lib/utils';

// Brand-coloured SVG marker icon — avoids the default Webpack marker-url issue.
const ICON = (color = '#6366f1') =>
  L.divIcon({
    className: 'tlv-marker',
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="36">
        <path d="M12 0C5.4 0 0 5.2 0 11.6 0 19 12 32 12 32s12-13 12-20.4C24 5.2 18.6 0 12 0z" fill="${color}"/>
        <circle cx="12" cy="11.5" r="4.5" fill="white"/>
      </svg>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -32],
  });

const STATUS_COLOR = {
  available: '#10b981',
  sold: '#64748b',
  rented: '#8b5cf6',
  pending: '#f97316',
  draft: '#94a3b8',
};

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }, [points, map]);
  return null;
}

export function PropertiesMap({ properties }) {
  const [located, setLocated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const seeded = (properties || []).filter(
      (p) => typeof p.latitude === 'number' && typeof p.longitude === 'number'
    );
    setLocated(
      seeded.map((p) => ({ ...p, _lat: p.latitude, _lng: p.longitude }))
    );

    (async () => {
      const out = [];
      for (const p of properties || []) {
        if (typeof p.latitude === 'number' && typeof p.longitude === 'number') {
          out.push({ ...p, _lat: p.latitude, _lng: p.longitude });
          continue;
        }
        if (!p.city) continue;
        const coord = await geocodeCity(p.city, p.state);
        if (cancelled) return;
        if (coord) {
          const j = jitter(coord.lat, coord.lng, p._id);
          out.push({ ...p, _lat: j.lat, _lng: j.lng });
          setLocated([...out]);
        }
      }
      if (!cancelled) {
        setLocated(out);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [properties]);

  const fallbackCenter = [20.5937, 78.9629]; // India centre
  const points = located.map((p) => ({ lat: p._lat, lng: p._lng }));

  return (
    <div className="relative h-[560px]">
      <MapContainer
        center={fallbackCenter}
        zoom={5}
        scrollWheelZoom
        className="w-full h-full"
        style={{ minHeight: 560 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {located.map((p) => (
          <Marker
            key={p._id}
            position={[p._lat, p._lng]}
            icon={ICON(STATUS_COLOR[p.status] || '#6366f1')}
          >
            <Popup>
              <div className="text-sm" style={{ minWidth: 180 }}>
                <div className="font-bold mb-1">{p.title}</div>
                <div className="text-xs text-slate-600 mb-1">{p.city}, {p.state}</div>
                <div className="text-xs">
                  <span className="font-semibold">{formatPrice(p.price, p.pricePeriod)}</span> ·{' '}
                  {propertyTypeLabels[p.propertyType] || p.propertyType} · {p.status}
                </div>
                <Link
                  to={`/admin/properties/${p._id}/edit`}
                  className="text-brand-600 hover:underline text-xs mt-1 inline-block"
                >
                  Open in editor →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {loading && (
        <div className="absolute top-3 right-3 z-[400] text-xs bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 rounded-lg shadow border border-slate-200 dark:border-white/10">
          Locating {properties.length - located.length} more…
        </div>
      )}
      {!loading && located.length === 0 && (
        <div className="absolute inset-0 grid place-items-center bg-white/80 dark:bg-slate-900/70 z-[400] text-sm text-slate-500">
          No properties could be located on the map.
        </div>
      )}
    </div>
  );
}
