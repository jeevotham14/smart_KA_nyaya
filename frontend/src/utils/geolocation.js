/**
 * Geolocation utility — detectDistrict()
 *
 * Uses browser Geolocation API + OpenStreetMap Nominatim reverse geocoding
 * to resolve the user's coordinates to a Karnataka district name.
 *
 * Returns a Promise<string | null>:
 *   - string: district name matching the karnatakaDistricts keys
 *   - null: permission denied or geocoding failed (caller should show manual dropdown)
 *
 * Privacy note: No coordinates are sent to our own backend.
 * Nominatim is a public OSM service; usage complies with their usage policy for
 * non-commercial, low-rate applications.
 */

// Map of Nominatim district/county strings → our internal district keys
const NOMINATIM_TO_DISTRICT = {
  'bengaluru urban': 'Bengaluru Urban',
  'bangalore urban': 'Bengaluru Urban',
  'bengaluru': 'Bengaluru Urban',
  'bangalore': 'Bengaluru Urban',
  'bengaluru rural': 'Bengaluru Rural',
  'bangalore rural': 'Bengaluru Rural',
  'mysuru': 'Mysuru',
  'mysore': 'Mysuru',
  'hubballi-dharwad': 'Dharwad',
  'dharwad': 'Dharwad',
  'belagavi': 'Belagavi',
  'belgaum': 'Belagavi',
  'kalaburagi': 'Kalaburagi',
  'gulbarga': 'Kalaburagi',
  'mangaluru': 'Dakshina Kannada',
  'dakshina kannada': 'Dakshina Kannada',
  'shivamogga': 'Shivamogga',
  'shimoga': 'Shivamogga',
  'tumakuru': 'Tumakuru',
  'tumkur': 'Tumakuru',
  'davangere': 'Davangere',
  'ballari': 'Ballari',
  'bellary': 'Ballari',
  'vijayapura': 'Vijayapura',
  'bijapur': 'Vijayapura',
  'raichur': 'Raichur',
  'bidar': 'Bidar',
  'yadgir': 'Yadgir',
  'koppal': 'Koppal',
  'gadag': 'Gadag',
  'haveri': 'Haveri',
  'uttara kannada': 'Uttara Kannada',
  'karwar': 'Uttara Kannada',
  'udupi': 'Udupi',
  'chikkamagaluru': 'Chikkamagaluru',
  'chikmagalur': 'Chikkamagaluru',
  'kodagu': 'Kodagu',
  'coorg': 'Kodagu',
  'hassan': 'Hassan',
  'mandya': 'Mandya',
  'chamarajanagara': 'Chamarajanagara',
  'chamrajanagar': 'Chamarajanagara',
  'chitradurga': 'Chitradurga',
  'davanagere': 'Davangere',
  'ramanagara': 'Ramanagara',
  'chikkaballapura': 'Chikkaballapura',
  'chikballapur': 'Chikkaballapura',
  'kolar': 'Kolar',
  'bagalkot': 'Bagalkot',
  'vijayanagara': 'Vijayanagara',
};

/**
 * Compute Haversine distance in km between two lat/lon pairs.
 */
export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Attempts to detect the user's Karnataka district via:
 * 1. navigator.geolocation
 * 2. Nominatim reverse geocoding
 *
 * @param {function} onConsentPrompt - optional callback to show a UI prompt before requesting
 * @returns {Promise<{district: string|null, lat: number|null, lon: number|null}>}
 */
export async function detectDistrict(onConsentPrompt) {
  if (!navigator.geolocation) {
    return { district: null, lat: null, lon: null };
  }

  if (onConsentPrompt) onConsentPrompt();

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
          const res = await fetch(url, {
            headers: { 'User-Agent': 'SmartKarnatakaLegalPortal/1.0' },
          });
          const data = await res.json();
          const addr = data.address || {};

          // Try county, district, state_district in order
          const rawDistrict = (
            addr.county ||
            addr.district ||
            addr.state_district ||
            addr.city ||
            ''
          )
            .toLowerCase()
            .replace(' district', '')
            .replace(' zilla', '')
            .trim();

          const mapped = NOMINATIM_TO_DISTRICT[rawDistrict] || null;
          resolve({ district: mapped, lat: latitude, lon: longitude });
        } catch {
          resolve({ district: null, lat: latitude, lon: longitude });
        }
      },
      () => {
        // Permission denied or error — silent fallback
        resolve({ district: null, lat: null, lon: null });
      },
      { timeout: 8000, maximumAge: 300000 },
    );
  });
}
