/**
 * Hand-curated shipping destinations for the storefront's shipping-reach
 * sections (homepage map, about page city grid, contact page reach panel).
 *
 * Not derived from real order data — purely a visual representation of
 * "we ship across the Americas, the UK and the EU". `tier: 'major'`
 * cities render larger/pulsing on the map; `'secondary'` cities render
 * smaller/static. Edit the array to add/remove destinations.
 *
 * @typedef {'NA' | 'SA' | 'UK' | 'EU'} ShippingRegion
 * @typedef {{city: string, country: string, lat: number, lng: number, region: ShippingRegion, tier: 'major' | 'secondary'}} ShippingDestination
 */

/** @type {ShippingDestination[]} */
export const SHIPPING_DESTINATIONS = [
  // North America
  {city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, region: 'NA', tier: 'major'},
  {city: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207, region: 'NA', tier: 'major'},
  {city: 'Montreal', country: 'Canada', lat: 45.5019, lng: -73.5674, region: 'NA', tier: 'secondary'},
  {city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, region: 'NA', tier: 'major'},
  {city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437, region: 'NA', tier: 'major'},
  {city: 'Chicago', country: 'USA', lat: 41.8781, lng: -87.6298, region: 'NA', tier: 'secondary'},
  {city: 'Austin', country: 'USA', lat: 30.2672, lng: -97.7431, region: 'NA', tier: 'secondary'},
  {city: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918, region: 'NA', tier: 'secondary'},
  {city: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, region: 'NA', tier: 'major'},
  {city: 'Guadalajara', country: 'Mexico', lat: 20.6597, lng: -103.3496, region: 'NA', tier: 'secondary'},

  // South America
  {city: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, region: 'SA', tier: 'major'},
  {city: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729, region: 'SA', tier: 'secondary'},
  {city: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816, region: 'SA', tier: 'major'},
  {city: 'Bogotá', country: 'Colombia', lat: 4.7110, lng: -74.0721, region: 'SA', tier: 'secondary'},
  {city: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693, region: 'SA', tier: 'secondary'},
  {city: 'Lima', country: 'Peru', lat: -12.0464, lng: -77.0428, region: 'SA', tier: 'secondary'},

  // UK & EU
  {city: 'London', country: 'UK', lat: 51.5072, lng: -0.1276, region: 'UK', tier: 'major'},
  {city: 'Manchester', country: 'UK', lat: 53.4808, lng: -2.2426, region: 'UK', tier: 'secondary'},
  {city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, region: 'EU', tier: 'major'},
  {city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, region: 'EU', tier: 'major'},
  {city: 'Munich', country: 'Germany', lat: 48.1351, lng: 11.5820, region: 'EU', tier: 'secondary'},
  {city: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, region: 'EU', tier: 'secondary'},
  {city: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041, region: 'EU', tier: 'secondary'},
  {city: 'Dublin', country: 'Ireland', lat: 53.3498, lng: -6.2603, region: 'EU', tier: 'secondary'},
];

/**
 * Region label keys for grouping in lists — matches the
 * ship_region_na/sa/uk/eu dictionary keys. Used by ShippingReach
 * for region headings.
 */
export const REGION_KEYS = {
  NA: 'ship_region_na',
  SA: 'ship_region_sa',
  UK: 'ship_region_uk',
  EU: 'ship_region_eu',
};

/**
 * Order to render regions in (and which order to display in lists).
 * Keeps NA → SA → UK → EU consistent across map tooltips, about grid,
 * and contact panel.
 */
export const REGION_ORDER = ['NA', 'SA', 'UK', 'EU'];

// World atlas TopoJSON, hosted on jsDelivr. ~120KB gzipped; fetched on
// the server and parsed once per process. Same URL the original
// react-simple-maps-based version used.
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Module-level cache so the TopoJSON is fetched + parsed once per
// server process, not once per request. Keyed by URL so a future
// swap to a different TopoJSON won't poison the cache.
let _worldPromise = null;

/**
 * Server-side: fetch + parse the world TopoJSON into a GeoJSON
 * FeatureCollection of countries. Returns a cached promise.
 *
 * Used by the homepage loader to ship country paths in the SSR HTML
 * (so the map background renders on first paint, not after hydration).
 * Returns `null` on failure so callers can fall back to a dots-only
 * view — the destinations are still useful on their own.
 */
export function getWorld() {
  if (_worldPromise) return _worldPromise;
  if (typeof fetch !== 'function') return Promise.resolve(null);
  _worldPromise = fetch(GEO_URL)
    .then((res) => (res.ok ? res.json() : null))
    .then(async (topo) => {
      if (!topo || !topo.objects?.countries) return null;
      // Dynamic import keeps the destinations-only consumers (about,
      // contact) from paying the topojson-client parse cost.
      const {feature} = await import('topojson-client');
      const fc = feature(topo, topo.objects.countries);
      // Round each coordinate to 1 decimal place (~11 km precision at
      // the equator). Visually identical at our viewport scale but
      // cuts the inlined path payload from ~670KB to ~250KB.
      roundCoords(fc, 1);
      return fc;
    })
    .catch(() => null);
  return _worldPromise;
}

/**
 * Recursively round every numeric value in a GeoJSON object to `dp`
 * decimal places. Coordinates are read in-place; this mutates the
 * FeatureCollection that `topojson-client.feature()` returned.
 */
function roundCoords(node, dp) {
  const factor = 10 ** dp;
  if (Array.isArray(node)) {
    // Coordinate pair: [lng, lat] or [lng, lat, ...] — but for
    // GeoJSON, only the first two are positions. Round them in place
    // so we don't accidentally rewrite non-coordinate arrays deeper
    // in the tree.
    if (node.length >= 2 && typeof node[0] === 'number' && typeof node[1] === 'number') {
      node[0] = Math.round(node[0] * factor) / factor;
      node[1] = Math.round(node[1] * factor) / factor;
      return;
    }
    for (const child of node) roundCoords(child, dp);
    return;
  }
  if (node && typeof node === 'object') {
    if (Array.isArray(node.coordinates)) {
      roundCoords(node.coordinates, dp);
    }
    if (Array.isArray(node.geometries)) {
      for (const g of node.geometries) roundCoords(g, dp);
    }
  }
}
