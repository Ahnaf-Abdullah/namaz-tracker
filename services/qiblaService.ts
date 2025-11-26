/**
 * Qibla Direction Service
 * Calculates the direction to the Kaaba in Mecca from any location on Earth
 */

// Kaaba coordinates in Mecca, Saudi Arabia
const KAABA_LATITUDE = 21.4225;
const KAABA_LONGITUDE = 39.8262;

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculate the Qibla direction (bearing) from a given location to the Kaaba
 * Uses the Haversine formula for great circle bearing
 *
 * @param latitude - User's current latitude
 * @param longitude - User's current longitude
 * @returns Bearing in degrees (0-360), where 0/360 is North, 90 is East, etc.
 */
export function calculateQiblaDirection(
  latitude: number,
  longitude: number
): number {
  // Convert coordinates to radians
  const lat1 = toRadians(latitude);
  const lon1 = toRadians(longitude);
  const lat2 = toRadians(KAABA_LATITUDE);
  const lon2 = toRadians(KAABA_LONGITUDE);

  // Calculate the difference in longitudes
  const dLon = lon2 - lon1;

  // Calculate bearing using the formula:
  // θ = atan2(sin(Δlong).cos(lat2), cos(lat1).sin(lat2) − sin(lat1).cos(lat2).cos(Δlong))
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let bearing = toDegrees(Math.atan2(y, x));

  // Normalize bearing to 0-360 degrees
  bearing = (bearing + 360) % 360;

  return bearing;
}

/**
 * Calculate the distance to the Kaaba from a given location
 * Uses the Haversine formula
 *
 * @param latitude - User's current latitude
 * @param longitude - User's current longitude
 * @returns Distance in kilometers
 */
export function calculateDistanceToKaaba(
  latitude: number,
  longitude: number
): number {
  const R = 6371; // Earth's radius in kilometers

  const lat1 = toRadians(latitude);
  const lon1 = toRadians(longitude);
  const lat2 = toRadians(KAABA_LATITUDE);
  const lon2 = toRadians(KAABA_LONGITUDE);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return distance;
}

/**
 * Get a cardinal direction string from a bearing
 *
 * @param bearing - Bearing in degrees (0-360)
 * @returns Cardinal direction (N, NE, E, SE, S, SW, W, NW)
 */
export function getCardinalDirection(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

/**
 * Format distance for display
 *
 * @param distanceKm - Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  } else {
    return `${Math.round(distanceKm)} km`;
  }
}
