import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  date: string;
  readable: string;
  timestamp: number;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

class PrayerTimesService {
  private CACHE_KEY = 'prayer_times_cache';
  private LOCATION_KEY = 'user_location';
  private API_BASE_URL = 'http://api.aladhan.com/v1';

  // Cache validity: 24 hours
  private CACHE_DURATION = 24 * 60 * 60 * 1000;

  /**
   * Get prayer times for today based on user's location
   * @param forceRefresh - Force fetch from API even if cache is valid
   * @returns Prayer times object with all 5 prayers
   */
  async getPrayerTimes(forceRefresh: boolean = false): Promise<{
    success: boolean;
    data?: PrayerTimes;
    error?: string;
    source?: 'cache' | 'api' | 'location_error';
  }> {
    try {
      // Check cache first
      if (!forceRefresh) {
        const cached = await this.getCachedPrayerTimes();
        if (cached) {
          return { success: true, data: cached, source: 'cache' };
        }
      }

      // Get user location
      const location = await this.getUserLocation();
      if (!location.success || !location.coords) {
        return {
          success: false,
          error: location.error || 'Unable to get location',
          source: 'location_error',
        };
      }

      // Fetch from API
      const prayerTimes = await this.fetchPrayerTimesFromAPI(location.coords);

      if (prayerTimes) {
        // Cache the result
        await this.cachePrayerTimes(prayerTimes);
        return { success: true, data: prayerTimes, source: 'api' };
      }

      return { success: false, error: 'Failed to fetch prayer times' };
    } catch (error) {
      console.error('Error getting prayer times:', error);
      return {
        success: false,
        error: (error as Error).message || 'Unknown error',
      };
    }
  }

  /**
   * Get user's current location
   * First tries to get from cache, then requests permissions and fetches
   */
  private async getUserLocation(): Promise<{
    success: boolean;
    coords?: LocationCoords;
    error?: string;
  }> {
    try {
      // Check cached location first
      const cachedLocation = await AsyncStorage.getItem(this.LOCATION_KEY);
      if (cachedLocation) {
        return { success: true, coords: JSON.parse(cachedLocation) };
      }

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return {
          success: false,
          error:
            'Location permission denied. Please enable location services in settings.',
        };
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get city/country
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const coords: LocationCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city: address?.city || address?.district || 'Unknown',
        country: address?.country || 'Unknown',
      };

      // Cache location for future use (valid for 7 days)
      await AsyncStorage.setItem(this.LOCATION_KEY, JSON.stringify(coords));

      return { success: true, coords };
    } catch (error) {
      console.error('Error getting user location:', error);
      return {
        success: false,
        error: 'Failed to get location. Please check your device settings.',
      };
    }
  }

  /**
   * Fetch prayer times from Aladhan API
   * @param coords - User's latitude and longitude
   */
  private async fetchPrayerTimesFromAPI(
    coords: LocationCoords
  ): Promise<PrayerTimes | null> {
    try {
      const today = new Date();
      const timestamp = Math.floor(today.getTime() / 1000);

      // Aladhan API endpoint with coordinates
      const url = `${this.API_BASE_URL}/timings/${timestamp}?latitude=${coords.latitude}&longitude=${coords.longitude}&method=3`;

      // method=2 uses Islamic Society of North America (ISNA) calculation method
      // You can change this based on user's preferred calculation method:
      // 1 = University of Islamic Sciences, Karachi
      // 2 = Islamic Society of North America (ISNA)
      // 3 = Muslim World League (MWL)
      // 4 = Umm al-Qura, Makkah
      // 5 = Egyptian General Authority of Survey
      // 7 = Institute of Geophysics, University of Tehran
      // 12 = Union Organization islamic de France

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.code === 200 && data.data && data.data.timings) {
        const timings = data.data.timings;

        // Extract only the 5 main prayers (exclude Sunrise, Sunset, etc.)
        const prayerTimes: PrayerTimes = {
          Fajr: this.formatTime(timings.Fajr),
          Dhuhr: this.formatTime(timings.Dhuhr),
          Asr: this.formatTime(timings.Asr),
          Maghrib: this.formatTime(timings.Maghrib),
          Isha: this.formatTime(timings.Isha),
          date: data.data.date.gregorian.date,
          readable: data.data.date.readable,
          timestamp: Date.now(),
        };

        return prayerTimes;
      }

      return null;
    } catch (error) {
      console.error('Error fetching from Aladhan API:', error);
      return null;
    }
  }

  /**
   * Format time string from API (removes timezone info)
   * Example: "05:30 (GMT+6)" -> "05:30"
   */
  private formatTime(timeString: string): string {
    // Remove timezone and extra info
    return timeString.split(' ')[0].trim();
  }

  /**
   * Convert 24-hour time to 12-hour format with AM/PM
   */
  formatTime12Hour(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Get cached prayer times if valid
   */
  private async getCachedPrayerTimes(): Promise<PrayerTimes | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const prayerTimes: PrayerTimes = JSON.parse(cached);

      // Check if cache is still valid (same day and within 24 hours)
      const today = new Date().toISOString().split('T')[0];
      const cacheDate = prayerTimes.date;
      const cacheAge = Date.now() - prayerTimes.timestamp;

      if (cacheDate === today && cacheAge < this.CACHE_DURATION) {
        return prayerTimes;
      }

      // Cache expired, remove it
      await AsyncStorage.removeItem(this.CACHE_KEY);
      return null;
    } catch (error) {
      console.error('Error reading cached prayer times:', error);
      return null;
    }
  }

  /**
   * Cache prayer times locally
   */
  private async cachePrayerTimes(prayerTimes: PrayerTimes): Promise<void> {
    try {
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(prayerTimes));
    } catch (error) {
      console.error('Error caching prayer times:', error);
    }
  }

  /**
   * Clear all cached data (prayer times and location)
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([this.CACHE_KEY, this.LOCATION_KEY]);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get cached location without fetching new one
   */
  async getCachedLocation(): Promise<LocationCoords | null> {
    try {
      const cached = await AsyncStorage.getItem(this.LOCATION_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached location:', error);
      return null;
    }
  }

  /**
   * Check if current time is within prayer window
   * @param prayerName - Name of the prayer
   * @param prayerTime - Start time of the prayer (HH:mm format)
   * @param nextPrayerTime - Start time of next prayer (optional)
   */
  isWithinPrayerWindow(
    prayerName: string,
    prayerTime: string,
    nextPrayerTime?: string
  ): boolean {
    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [prayerHours, prayerMinutes] = prayerTime.split(':').map(Number);
      const prayerStartMinutes = prayerHours * 60 + prayerMinutes;

      // If we have next prayer time, use it as the end window
      if (nextPrayerTime) {
        const [nextHours, nextMinutes] = nextPrayerTime.split(':').map(Number);
        const nextPrayerMinutes = nextHours * 60 + nextMinutes;

        return (
          currentMinutes >= prayerStartMinutes &&
          currentMinutes < nextPrayerMinutes
        );
      }

      // Default window: 2 hours after prayer time
      const prayerEndMinutes = prayerStartMinutes + 120;

      return (
        currentMinutes >= prayerStartMinutes &&
        currentMinutes < prayerEndMinutes
      );
    } catch (error) {
      console.error('Error checking prayer window:', error);
      return false;
    }
  }

  /**
   * Get next upcoming prayer
   */
  getNextPrayer(prayerTimes: PrayerTimes): {
    name: string;
    time: string;
    timeUntil: string;
  } | null {
    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const prayers = [
        { name: 'Fajr', time: prayerTimes.Fajr },
        { name: 'Dhuhr', time: prayerTimes.Dhuhr },
        { name: 'Asr', time: prayerTimes.Asr },
        { name: 'Maghrib', time: prayerTimes.Maghrib },
        { name: 'Isha', time: prayerTimes.Isha },
      ];

      for (const prayer of prayers) {
        const [hours, minutes] = prayer.time.split(':').map(Number);
        const prayerMinutes = hours * 60 + minutes;

        if (currentMinutes < prayerMinutes) {
          const minutesUntil = prayerMinutes - currentMinutes;
          const hoursUntil = Math.floor(minutesUntil / 60);
          const minsUntil = minutesUntil % 60;

          let timeUntil = '';
          if (hoursUntil > 0) {
            timeUntil = `${hoursUntil}h ${minsUntil}m`;
          } else {
            timeUntil = `${minsUntil}m`;
          }

          return {
            name: prayer.name,
            time: prayer.time,
            timeUntil,
          };
        }
      }

      // If all prayers passed, next prayer is tomorrow's Fajr
      return {
        name: 'Fajr',
        time: prayerTimes.Fajr,
        timeUntil: 'Tomorrow',
      };
    } catch (error) {
      console.error('Error getting next prayer:', error);
      return null;
    }
  }
}

export const prayerTimesService = new PrayerTimesService();
export type { PrayerTimes, LocationCoords };
