/**
 * Hand-curated shipping destinations for the storefront's shipping-reach
 * sections (homepage map, about page city grid, contact page reach panel).
 *
 * Not derived from real order data — purely a visual representation of
 * "we ship around the world". `tier: 'major'` cities render
 * larger/pulsing on the map; `'secondary'` cities render smaller/static.
 * Edit the array to add/remove destinations.
 *
 * Region codes are arbitrary — they're just grouping keys for the map's
 * pulse animation phase and the (currently-unused) REGION_KEYS export.
 *
 * @typedef {'NA' | 'SA' | 'UK' | 'EU' | 'AP' | 'ME' | 'AF' | 'OC'} ShippingRegion
 * @typedef {{city: string, country: string, lat: number, lng: number, region: ShippingRegion, tier: 'major' | 'secondary'}} ShippingDestination
 */

/** @type {ShippingDestination[]} */
export const SHIPPING_DESTINATIONS = [
  // North America
  {city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, region: 'NA', tier: 'major'},
  {city: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207, region: 'NA', tier: 'major'},
  {city: 'Montreal', country: 'Canada', lat: 45.5019, lng: -73.5674, region: 'NA', tier: 'secondary'},
  {city: 'Calgary', country: 'Canada', lat: 51.0447, lng: -114.0719, region: 'NA', tier: 'secondary'},
  {city: 'Ottawa', country: 'Canada', lat: 45.4215, lng: -75.6972, region: 'NA', tier: 'secondary'},
  {city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, region: 'NA', tier: 'major'},
  {city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437, region: 'NA', tier: 'major'},
  {city: 'Chicago', country: 'USA', lat: 41.8781, lng: -87.6298, region: 'NA', tier: 'secondary'},
  {city: 'Austin', country: 'USA', lat: 30.2672, lng: -97.7431, region: 'NA', tier: 'secondary'},
  {city: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918, region: 'NA', tier: 'secondary'},
  {city: 'Seattle', country: 'USA', lat: 47.6062, lng: -122.3321, region: 'NA', tier: 'secondary'},
  {city: 'Denver', country: 'USA', lat: 39.7392, lng: -104.9903, region: 'NA', tier: 'secondary'},
  {city: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, region: 'NA', tier: 'major'},
  {city: 'Guadalajara', country: 'Mexico', lat: 20.6597, lng: -103.3496, region: 'NA', tier: 'secondary'},
  {city: 'Monterrey', country: 'Mexico', lat: 25.6866, lng: -100.3161, region: 'NA', tier: 'secondary'},
  {city: 'Boston', country: 'USA', lat: 42.3601, lng: -71.0589, region: 'NA', tier: 'secondary'},
  {city: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194, region: 'NA', tier: 'secondary'},
  {city: 'Atlanta', country: 'USA', lat: 33.7490, lng: -84.3880, region: 'NA', tier: 'secondary'},
  {city: 'Phoenix', country: 'USA', lat: 33.4484, lng: -112.0740, region: 'NA', tier: 'secondary'},
  {city: 'Edmonton', country: 'Canada', lat: 53.5461, lng: -113.4938, region: 'NA', tier: 'secondary'},
  {city: 'Halifax', country: 'Canada', lat: 44.6488, lng: -63.5752, region: 'NA', tier: 'secondary'},

  // South America
  {city: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, region: 'SA', tier: 'major'},
  {city: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729, region: 'SA', tier: 'secondary'},
  {city: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816, region: 'SA', tier: 'major'},
  {city: 'Bogotá', country: 'Colombia', lat: 4.7110, lng: -74.0721, region: 'SA', tier: 'secondary'},
  {city: 'Santiago', country: 'Chile', lat: -33.4489, lng: -70.6693, region: 'SA', tier: 'secondary'},
  {city: 'Lima', country: 'Peru', lat: -12.0464, lng: -77.0428, region: 'SA', tier: 'secondary'},
  {city: 'Caracas', country: 'Venezuela', lat: 10.4806, lng: -66.9036, region: 'SA', tier: 'secondary'},
  {city: 'Quito', country: 'Ecuador', lat: -0.1807, lng: -78.4678, region: 'SA', tier: 'secondary'},
  {city: 'Montevideo', country: 'Uruguay', lat: -34.9011, lng: -56.1645, region: 'SA', tier: 'secondary'},
  {city: 'Brasília', country: 'Brazil', lat: -15.8267, lng: -47.9218, region: 'SA', tier: 'secondary'},
  {city: 'Medellín', country: 'Colombia', lat: 6.2442, lng: -75.5812, region: 'SA', tier: 'secondary'},

  // UK & EU
  {city: 'London', country: 'UK', lat: 51.5072, lng: -0.1276, region: 'UK', tier: 'major'},
  {city: 'Manchester', country: 'UK', lat: 53.4808, lng: -2.2426, region: 'UK', tier: 'secondary'},
  {city: 'Birmingham', country: 'UK', lat: 52.4862, lng: -1.8904, region: 'UK', tier: 'secondary'},
  {city: 'Edinburgh', country: 'UK', lat: 55.9533, lng: -3.1883, region: 'UK', tier: 'secondary'},
  {city: 'Glasgow', country: 'UK', lat: 55.8642, lng: -4.2518, region: 'UK', tier: 'secondary'},
  {city: 'Bristol', country: 'UK', lat: 51.4545, lng: -2.5879, region: 'UK', tier: 'secondary'},
  {city: 'Leeds', country: 'UK', lat: 53.8008, lng: -1.5491, region: 'UK', tier: 'secondary'},
  {city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, region: 'EU', tier: 'major'},
  {city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, region: 'EU', tier: 'major'},
  {city: 'Munich', country: 'Germany', lat: 48.1351, lng: 11.5820, region: 'EU', tier: 'secondary'},
  {city: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, region: 'EU', tier: 'secondary'},
  {city: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041, region: 'EU', tier: 'secondary'},
  {city: 'Dublin', country: 'Ireland', lat: 53.3498, lng: -6.2603, region: 'EU', tier: 'secondary'},
  {city: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, region: 'EU', tier: 'major'},
  {city: 'Milan', country: 'Italy', lat: 45.4642, lng: 9.1900, region: 'EU', tier: 'secondary'},
  {city: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734, region: 'EU', tier: 'secondary'},
  {city: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738, region: 'EU', tier: 'secondary'},
  {city: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686, region: 'EU', tier: 'secondary'},
  {city: 'Copenhagen', country: 'Denmark', lat: 55.6761, lng: 12.5683, region: 'EU', tier: 'secondary'},
  {city: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393, region: 'EU', tier: 'secondary'},
  {city: 'Porto', country: 'Portugal', lat: 41.1579, lng: -8.6291, region: 'EU', tier: 'secondary'},
  {city: 'Brussels', country: 'Belgium', lat: 50.8503, lng: 4.3517, region: 'EU', tier: 'secondary'},
  {city: 'Zurich', country: 'Switzerland', lat: 47.3769, lng: 8.5417, region: 'EU', tier: 'secondary'},
  {city: 'Geneva', country: 'Switzerland', lat: 46.2044, lng: 6.1432, region: 'EU', tier: 'secondary'},
  {city: 'Athens', country: 'Greece', lat: 37.9838, lng: 23.7275, region: 'EU', tier: 'secondary'},
  {city: 'Helsinki', country: 'Finland', lat: 60.1699, lng: 24.9384, region: 'EU', tier: 'secondary'},
  {city: 'Oslo', country: 'Norway', lat: 59.9139, lng: 10.7522, region: 'EU', tier: 'secondary'},
  {city: 'Warsaw', country: 'Poland', lat: 52.2297, lng: 21.0122, region: 'EU', tier: 'secondary'},
  {city: 'Prague', country: 'Czechia', lat: 50.0755, lng: 14.4378, region: 'EU', tier: 'secondary'},
  {city: 'Budapest', country: 'Hungary', lat: 47.4979, lng: 19.0402, region: 'EU', tier: 'secondary'},
  {city: 'Bucharest', country: 'Romania', lat: 44.4268, lng: 26.1025, region: 'EU', tier: 'secondary'},

  // Asia Pacific
  {city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, region: 'AP', tier: 'major'},
  {city: 'Osaka', country: 'Japan', lat: 34.6937, lng: 135.5023, region: 'AP', tier: 'secondary'},
  {city: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780, region: 'AP', tier: 'major'},
  {city: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074, region: 'AP', tier: 'major'},
  {city: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737, region: 'AP', tier: 'major'},
  {city: 'Hong Kong', country: 'Hong Kong', lat: 22.3193, lng: 114.1694, region: 'AP', tier: 'major'},
  {city: 'Taipei', country: 'Taiwan', lat: 25.0330, lng: 121.5654, region: 'AP', tier: 'secondary'},
  {city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, region: 'AP', tier: 'major'},
  {city: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, region: 'AP', tier: 'secondary'},
  {city: 'Manila', country: 'Philippines', lat: 14.5995, lng: 120.9842, region: 'AP', tier: 'secondary'},
  {city: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lng: 101.6869, region: 'AP', tier: 'secondary'},
  {city: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456, region: 'AP', tier: 'secondary'},
  {city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, region: 'AP', tier: 'major'},
  {city: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.2090, region: 'AP', tier: 'secondary'},
  {city: 'Bangalore', country: 'India', lat: 12.9716, lng: 77.5946, region: 'AP', tier: 'secondary'},
  {city: 'Karachi', country: 'Pakistan', lat: 24.8607, lng: 67.0011, region: 'AP', tier: 'secondary'},
  {city: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lng: 90.4125, region: 'AP', tier: 'secondary'},
  {city: 'Hanoi', country: 'Vietnam', lat: 21.0285, lng: 105.8542, region: 'AP', tier: 'secondary'},
  {city: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.8231, lng: 106.6297, region: 'AP', tier: 'secondary'},
  {city: 'Colombo', country: 'Sri Lanka', lat: 6.9271, lng: 79.8612, region: 'AP', tier: 'secondary'},

  // Middle East
  {city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, region: 'ME', tier: 'major'},
  {city: 'Abu Dhabi', country: 'UAE', lat: 24.4539, lng: 54.3773, region: 'ME', tier: 'secondary'},
  {city: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753, region: 'ME', tier: 'major'},
  {city: 'Doha', country: 'Qatar', lat: 25.2854, lng: 51.5310, region: 'ME', tier: 'secondary'},
  {city: 'Tel Aviv', country: 'Israel', lat: 32.0853, lng: 34.7818, region: 'ME', tier: 'major'},
  {city: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, region: 'ME', tier: 'major'},
  {city: 'Ankara', country: 'Turkey', lat: 39.9334, lng: 32.8597, region: 'ME', tier: 'secondary'},
  {city: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, region: 'ME', tier: 'secondary'},
  {city: 'Amman', country: 'Jordan', lat: 31.9454, lng: 35.9284, region: 'ME', tier: 'secondary'},
  {city: 'Beirut', country: 'Lebanon', lat: 33.8938, lng: 35.5018, region: 'ME', tier: 'secondary'},
  {city: 'Kuwait City', country: 'Kuwait', lat: 29.3759, lng: 47.9774, region: 'ME', tier: 'secondary'},
  {city: 'Manama', country: 'Bahrain', lat: 26.2285, lng: 50.5860, region: 'ME', tier: 'secondary'},
  {city: 'Muscat', country: 'Oman', lat: 23.5880, lng: 58.3829, region: 'ME', tier: 'secondary'},

  // Africa
  {city: 'Cape Town', country: 'South Africa', lat: -33.9249, lng: 18.4241, region: 'AF', tier: 'major'},
  {city: 'Johannesburg', country: 'South Africa', lat: -26.2041, lng: 28.0473, region: 'AF', tier: 'major'},
  {city: 'Durban', country: 'South Africa', lat: -29.8587, lng: 31.0218, region: 'AF', tier: 'secondary'},
  {city: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792, region: 'AF', tier: 'secondary'},
  {city: 'Abuja', country: 'Nigeria', lat: 9.0765, lng: 7.3986, region: 'AF', tier: 'secondary'},
  {city: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219, region: 'AF', tier: 'secondary'},
  {city: 'Casablanca', country: 'Morocco', lat: 33.5731, lng: -7.5898, region: 'AF', tier: 'secondary'},
  {city: 'Accra', country: 'Ghana', lat: 5.6037, lng: -0.1870, region: 'AF', tier: 'secondary'},
  {city: 'Addis Ababa', country: 'Ethiopia', lat: 9.0250, lng: 38.7400, region: 'AF', tier: 'secondary'},
  {city: 'Tunis', country: 'Tunisia', lat: 36.8065, lng: 10.1815, region: 'AF', tier: 'secondary'},
  {city: 'Algiers', country: 'Algeria', lat: 36.7538, lng: 3.0588, region: 'AF', tier: 'secondary'},

  // Oceania
  {city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, region: 'OC', tier: 'major'},
  {city: 'Melbourne', country: 'Australia', lat: -37.8136, lng: 144.9631, region: 'OC', tier: 'major'},
  {city: 'Brisbane', country: 'Australia', lat: -27.4698, lng: 153.0251, region: 'OC', tier: 'secondary'},
  {city: 'Perth', country: 'Australia', lat: -31.9505, lng: 115.8605, region: 'OC', tier: 'secondary'},
  {city: 'Auckland', country: 'New Zealand', lat: -36.8485, lng: 174.7633, region: 'OC', tier: 'major'},
  {city: 'Wellington', country: 'New Zealand', lat: -41.2865, lng: 174.7762, region: 'OC', tier: 'secondary'},
  {city: 'Christchurch', country: 'New Zealand', lat: -43.5321, lng: 172.6362, region: 'OC', tier: 'secondary'},
  {city: 'Adelaide', country: 'Australia', lat: -34.9285, lng: 138.6007, region: 'OC', tier: 'secondary'},
];

/**
 * Region label keys for grouping in lists. Kept for any future consumer
 * that wants to render regions (a map legend, a "by region" filter, etc.)
 * — currently unused since the about/contact panels no longer enumerate
 * regions, and the homepage map uses raw region codes for animation
 * phasing.
 */
export const REGION_KEYS = {
  NA: 'ship_region_na',
  SA: 'ship_region_sa',
  UK: 'ship_region_uk',
  EU: 'ship_region_eu',
  AP: 'ship_region_ap',
  ME: 'ship_region_me',
  AF: 'ship_region_af',
  OC: 'ship_region_oc',
};

/**
 * Order to render regions in (and which order to display in lists).
 * Keeps a consistent west-to-east flow across the map and any future
 * region-grouped UI.
 */
export const REGION_ORDER = ['NA', 'SA', 'UK', 'EU', 'AF', 'ME', 'AP', 'OC'];

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
