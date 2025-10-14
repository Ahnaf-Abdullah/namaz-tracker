import AsyncStorage from '@react-native-async-storage/async-storage';

interface Hadith {
  id: number;
  text: string;
  reference: string;
  narrator?: string;
  collection: string;
}

interface APIHadithResponse {
  data: {
    hadiths: Array<{
      id: number;
      hadithEnglish: string;
      hadithArabic?: string;
      englishNarrator: string;
      headingEnglish: string;
      book: {
        bookName: string;
      };
    }>;
  };
}

class HadithService {
  private readonly CACHE_KEY = 'daily_hadith';
  private readonly CACHE_TIMESTAMP_KEY = 'hadith_timestamp';
  private readonly API_CACHE_KEY = 'api_status';

  // Helper method to detect Arabic text
  private isArabicText(text: string): boolean {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
    return arabicRegex.test(text);
  }

  // Helper method to get collection name from URL
  private getCollectionName(url: string): string {
    if (url.includes('bukhari')) return 'Sahih al-Bukhari';
    if (url.includes('muslim')) return 'Sahih Muslim';
    if (url.includes('tirmidhi')) return 'Jami at-Tirmidhi';
    if (url.includes('dawud')) return 'Sunan Abu Dawud';
    if (url.includes('nasai')) return 'Sunan an-Nasai';
    return 'Islamic Collection';
  }

  // Reliable English hadith APIs
  private readonly API_ENDPOINTS = [
    'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-bukhari.json',
    'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-muslim.json',
    'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-tirmidhi.json',
  ];

  // Check if we need to fetch new hadith (every 12 hours)
  private async shouldFetchNewHadith(): Promise<boolean> {
    try {
      const lastFetch = await AsyncStorage.getItem(this.CACHE_TIMESTAMP_KEY);
      if (!lastFetch) return true;

      const twelveHours = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
      const now = Date.now();
      const timeDiff = now - parseInt(lastFetch);

      return timeDiff >= twelveHours;
    } catch (error) {
      console.error('Error checking cache timestamp:', error);
      return true;
    }
  }

  // Test API connectivity
  async testAPIConnection(): Promise<{
    working: boolean;
    api?: string;
    error?: string;
  }> {
    console.log('🧪 Testing Hadith APIs...');

    for (const apiUrl of this.API_ENDPOINTS) {
      try {
        console.log(`Testing: ${apiUrl}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ API Working: ${apiUrl}`);

          // Cache successful API
          await AsyncStorage.setItem(
            this.API_CACHE_KEY,
            JSON.stringify({
              url: apiUrl,
              working: true,
              lastChecked: Date.now(),
            })
          );

          return { working: true, api: apiUrl };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.log(`❌ API Failed: ${apiUrl} - ${errorMessage}`);
        continue;
      }
    }

    console.log('❌ All APIs failed, using local hadiths');
    return { working: false, error: 'All APIs unavailable' };
  }

  // Fetch hadith from external API
  async fetchFromAPI(): Promise<Hadith | null> {
    try {
      const apiTest = await this.testAPIConnection();

      if (!apiTest.working) {
        console.log('📱 Using local hadiths (API unavailable)');
        return null;
      }

      // Use working JSDelivr API (no URL modifications needed)
      const apiUrl = apiTest.api!;

      console.log(`🌐 Fetching from: ${apiUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📖 API Response received:', Object.keys(data));

      // Parse JSDelivr hadith API response (reliable English content)
      let hadith: Hadith | null = null;

      if (
        data.hadiths &&
        Array.isArray(data.hadiths) &&
        data.hadiths.length > 0
      ) {
        // JSDelivr format - guaranteed English hadiths
        const randomIndex = Math.floor(Math.random() * data.hadiths.length);
        const h = data.hadiths[randomIndex];

        if (h.text && !this.isArabicText(h.text)) {
          const collectionName =
            data.metadata?.name || this.getCollectionName(apiUrl);

          hadith = {
            id: h.hadithnumber || h.arabicnumber || Math.random(),
            text: h.text,
            reference: `${collectionName} ${
              h.hadithnumber || h.arabicnumber || ''
            }`.trim(),
            collection: collectionName,
          };
        }
      }

      if (hadith && hadith.text && hadith.text !== 'No text available') {
        console.log('✅ Successfully parsed hadith from API');
        return hadith;
      } else {
        console.log('❌ Could not parse hadith from API response');
        return null;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('❌ API fetch error:', errorMessage);
      return null;
    }
  }

  // Fallback local hadiths (same as before)
  private getFallbackHadith(): Hadith {
    const fallbackHadiths = [
      {
        id: 1,
        text: 'Actions are but by intention and every man shall have only that which he intended.',
        reference: 'Narrated by Umar ibn al-Khattab (RA)',
        collection: 'Sahih al-Bukhari & Muslim',
      },
      {
        id: 2,
        text: 'None of you truly believes until he loves for his brother what he loves for himself.',
        reference: 'Narrated by Anas ibn Malik (RA)',
        collection: 'Sahih al-Bukhari & Muslim',
      },
      {
        id: 3,
        text: 'The believer is not one who eats his fill while his neighbor goes hungry.',
        reference: 'Narrated by Ibn Abbas (RA)',
        collection: 'Al-Adab Al-Mufrad',
      },
      {
        id: 4,
        text: 'Whoever believes in Allah and the Last Day should speak good or remain silent.',
        reference: 'Narrated by Abu Hurairah (RA)',
        collection: 'Sahih al-Bukhari & Muslim',
      },
      {
        id: 5,
        text: 'The world is green and beautiful, and Allah has appointed you as His stewards over it.',
        reference: 'Narrated by Abdullah ibn Amr (RA)',
        collection: 'Sahih Muslim',
      },
    ];

    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const twelveHourPeriod = Math.floor(now.getHours() / 12);
    const hadithIndex =
      (dayOfYear * 2 + twelveHourPeriod) % fallbackHadiths.length;

    return fallbackHadiths[hadithIndex];
  }

  // Main method to get daily hadith
  async getDailyHadith(
    forceRefresh = false
  ): Promise<{ hadith: Hadith; source: 'api' | 'cache' | 'local' }> {
    try {
      // Check if we should fetch new hadith or force refresh
      const shouldFetch = forceRefresh || (await this.shouldFetchNewHadith());

      if (!shouldFetch) {
        // Return cached hadith
        const cachedHadith = await AsyncStorage.getItem(this.CACHE_KEY);
        if (cachedHadith) {
          console.log('📦 Using cached hadith');
          return {
            hadith: JSON.parse(cachedHadith),
            source: 'cache',
          };
        }
      }

      console.log('🔄 Fetching fresh hadith...');

      // Try to fetch from API first
      const apiHadith = await this.fetchFromAPI();

      if (apiHadith) {
        // Cache the new hadith
        await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(apiHadith));
        await AsyncStorage.setItem(
          this.CACHE_TIMESTAMP_KEY,
          Date.now().toString()
        );
        console.log('✅ Fresh API hadith cached');

        return {
          hadith: apiHadith,
          source: 'api',
        };
      } else {
        // Fallback to local hadith
        console.log('📱 Using local fallback hadith');
        const localHadith = this.getFallbackHadith();

        // Cache the fallback hadith too
        await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(localHadith));
        await AsyncStorage.setItem(
          this.CACHE_TIMESTAMP_KEY,
          Date.now().toString()
        );

        return {
          hadith: localHadith,
          source: 'local',
        };
      }
    } catch (error) {
      console.error('Error in getDailyHadith:', error);
      return {
        hadith: this.getFallbackHadith(),
        source: 'local',
      };
    }
  }

  // Clear cache method
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
      await AsyncStorage.removeItem(this.CACHE_TIMESTAMP_KEY);
      await AsyncStorage.removeItem(this.API_CACHE_KEY);
      console.log('🗑️ Hadith cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export const hadithService = new HadithService();
export type { Hadith };
