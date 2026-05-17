// Client-side geocoder for property locations.
// 1. Returns from in-memory + localStorage cache when possible.
// 2. Has a seed table for major Indian cities (instant pins on first load).
// 3. Falls back to OpenStreetMap Nominatim — rate-limited and lazy.

const CACHE_KEY = 'tlv-geocode-cache';
const SEED = {
  mumbai: { lat: 19.0760, lng: 72.8777 },
  pune: { lat: 18.5204, lng: 73.8567 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  'new delhi': { lat: 28.6139, lng: 77.2090 },
  gurgaon: { lat: 28.4595, lng: 77.0266 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
  noida: { lat: 28.5355, lng: 77.3910 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  surat: { lat: 21.1702, lng: 72.8311 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  ernakulam: { lat: 9.9816, lng: 76.2999 },
  thane: { lat: 19.2183, lng: 72.9781 },
  navi_mumbai: { lat: 19.0330, lng: 73.0297 },
  'navi mumbai': { lat: 19.0330, lng: 73.0297 },
  indore: { lat: 22.7196, lng: 75.8577 },
  bhopal: { lat: 23.2599, lng: 77.4126 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
};

let memCache = null;

function loadCache() {
  if (memCache) return memCache;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    memCache = raw ? JSON.parse(raw) : {};
  } catch {
    memCache = {};
  }
  return memCache;
}

function persistCache() {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(memCache || {})); } catch { /* ignore */ }
}

function keyFor(city, state) {
  return [String(city || '').trim().toLowerCase(), String(state || '').trim().toLowerCase()]
    .filter(Boolean)
    .join('|');
}

export async function geocodeCity(city, state) {
  if (!city) return null;
  const key = keyFor(city, state);
  const cache = loadCache();

  if (cache[key]) return cache[key];

  // Seed lookup (city alone).
  const seedKey = String(city).trim().toLowerCase();
  if (SEED[seedKey]) {
    cache[key] = SEED[seedKey];
    persistCache();
    return SEED[seedKey];
  }

  try {
    const q = encodeURIComponent([city, state, 'India'].filter(Boolean).join(', '));
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('geocode failed');
    const arr = await res.json();
    if (arr?.[0]) {
      const out = { lat: Number(arr[0].lat), lng: Number(arr[0].lon) };
      cache[key] = out;
      persistCache();
      return out;
    }
  } catch {
    // network / CORS — silently fall back
  }
  return null;
}

// Slightly scatter pins for properties in the same city so they don't overlap.
export function jitter(lat, lng, seed) {
  const s = (String(seed || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) || 1;
  const dx = (((s * 9301 + 49297) % 233280) / 233280 - 0.5) * 0.05;
  const dy = (((s * 49297 + 9301) % 233280) / 233280 - 0.5) * 0.05;
  return { lat: lat + dx, lng: lng + dy };
}
