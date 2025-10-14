import AsyncStorage from '@react-native-async-storage/async-storage';

interface Hadith {
  id: number;
  text: string;
  reference: string;
  narrator?: string;
  collection: string;
}

interface HadithResponse {
  hadiths: {
    id: number;
    hadith: string;
    attribution: string;
    grade?: string;
  }[];
}

class HadithService {
  private readonly API_BASE = 'https://hadithapi.com/api';
  private readonly CACHE_KEY = 'daily_hadith';
  private readonly CACHE_TIMESTAMP_KEY = 'hadith_timestamp';

  // Check if we need to fetch new hadith (every 12 hours)
  private async shouldFetchNewHadith(): Promise<boolean> {
    const lastFetch = await AsyncStorage.getItem(this.CACHE_TIMESTAMP_KEY);
    if (!lastFetch) return true;

    const twelveHours = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
    const now = Date.now();
    const timeDiff = now - parseInt(lastFetch);

    return timeDiff >= twelveHours;
  }

  // Get random hadith - using local hadiths for reliability
  async fetchRandomHadith(): Promise<Hadith | null> {
    try {
      // For now, always return a random local hadith for reliability
      // This ensures the app works without depending on external APIs
      return this.getFallbackHadith();
    } catch (error) {
      console.error('Error fetching hadith:', error);
      return this.getFallbackHadith();
    }
  }

  // Fallback hadith collection - rotates daily
  private getFallbackHadith(): Hadith {
    const fallbackHadiths = [
      {
        id: 1,
        text: 'Actions are but by intention and every man shall have only that which he intended.',
        reference: 'Narrated by Umar ibn al-Khattab (RA)',
        collection: 'Bukhari & Muslim',
      },
      {
        id: 2,
        text: 'None of you truly believes until he loves for his brother what he loves for himself.',
        reference: 'Narrated by Anas ibn Malik (RA)',
        collection: 'Bukhari & Muslim',
      },
      {
        id: 3,
        text: 'Whoever believes in Allah and the Last Day should speak good or remain silent.',
        reference: 'Narrated by Abu Hurairah (RA)',
        collection: 'Bukhari & Muslim',
      },
      {
        id: 4,
        text: 'The Muslim is one from whose tongue and hand the people are safe.',
        reference: 'Narrated by Abdullah ibn Amr (RA)',
        collection: 'Bukhari & Muslim',
      },
      {
        id: 5,
        text: 'Religion is sincerity. We said: To whom? He said: To Allah, His Book, His Messenger, and to the leaders and common folk of the Muslims.',
        reference: 'Narrated by Tamim al-Dari (RA)',
        collection: 'Sahih Muslim',
      },
      {
        id: 6,
        text: 'What I have forbidden for you, avoid it. And what I have commanded you to do, do as much of it as you can.',
        reference: 'Narrated by Abu Hurairah (RA)',
        collection: 'Bukhari & Muslim',
      },
      {
        id: 7,
        text: 'Fear Allah wherever you are, and follow up a bad deed with a good one which will wipe it out, and behave well towards the people.',
        reference: 'Narrated by Abu Dharr (RA)',
        collection: 'Jami at-Tirmidhi',
      },
      {
        id: 8,
        text: 'There should be neither harming nor reciprocating harm.',
        reference: 'Narrated by Ibn Abbas (RA)',
        collection: 'Sunan Ibn Majah',
      },
      {
        id: 9,
        text: 'The best of people are those who benefit others.',
        reference: 'Narrated by Jabir ibn Abdullah (RA)',
        collection: 'Ahmad & Tabarani',
      },
      {
        id: 10,
        text: 'A believer is not one who eats his fill while his neighbor goes hungry.',
        reference: 'Narrated by Anas ibn Malik (RA)',
        collection: 'Bayhaqi & Tabarani',
      },
      {
        id: 11,
        text: 'The world is green and beautiful, and Allah has appointed you as His stewards over it.',
        reference: 'Narrated by Abdullah ibn Amr (RA)',
        collection: 'Sahih Muslim',
      },
      {
        id: 12,
        text: 'Kindness is a mark of faith, and whoever is not kind has no faith.',
        reference: 'Narrated by Abdullah ibn Amr (RA)',
        collection: 'Sahih Muslim',
      },
    ];

    // Use current date and 12-hour period to select hadith
    // This ensures the same hadith is shown for 12 hours, then changes
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const twelveHourPeriod = Math.floor(now.getHours() / 12); // 0 for AM, 1 for PM
    const hadithIndex =
      (dayOfYear * 2 + twelveHourPeriod) % fallbackHadiths.length;

    return fallbackHadiths[hadithIndex];
  }

  // Get daily hadith (cached for 12 hours)
  async getDailyHadith(): Promise<Hadith> {
    try {
      // Check cache first
      const shouldFetch = await this.shouldFetchNewHadith();
      if (!shouldFetch) {
        const cachedHadith = await AsyncStorage.getItem(this.CACHE_KEY);
        if (cachedHadith) {
          return JSON.parse(cachedHadith);
        }
      }

      // Fetch new hadith
      const hadith =
        (await this.fetchRandomHadith()) || this.getFallbackHadith();

      // Cache the hadith and timestamp
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(hadith));
      await AsyncStorage.setItem(
        this.CACHE_TIMESTAMP_KEY,
        Date.now().toString()
      );

      return hadith;
    } catch (error) {
      console.error('Error managing hadith cache:', error);
      return this.getFallbackHadith();
    }
  }

  // Clear cache (for manual refresh)
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
      await AsyncStorage.removeItem(this.CACHE_TIMESTAMP_KEY);
    } catch (error) {
      console.error('Error clearing hadith cache:', error);
    }
  }
}

export const hadithService = new HadithService();
export type { Hadith };
