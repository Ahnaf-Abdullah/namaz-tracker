// Quick test for the updated hadith service
import { hadithService } from './services/hadithService.js';

async function testHadithService() {
  console.log('🧪 Testing Updated Hadith Service...\n');

  try {
    // Test API connection
    console.log('1️⃣ Testing API connection...');
    const apiStatus = await hadithService.testAPIConnection();
    console.log('API Status:', apiStatus);

    // Test fetching from API
    console.log('\n2️⃣ Testing direct API fetch...');
    const apiHadith = await hadithService.fetchFromAPI();
    if (apiHadith) {
      console.log('✅ API Hadith received:');
      console.log('  Text:', apiHadith.text.substring(0, 150) + '...');
      console.log('  Reference:', apiHadith.reference);
      console.log('  Collection:', apiHadith.collection);
      console.log('  Is Arabic?', /[\u0600-\u06FF]/.test(apiHadith.text));
    } else {
      console.log('❌ No hadith received from API');
    }

    // Test main service method
    console.log('\n3️⃣ Testing main getDailyHadith method...');
    const result = await hadithService.getDailyHadith(true); // Force refresh
    console.log('✅ Daily Hadith received:');
    console.log('  Text:', result.hadith.text.substring(0, 150) + '...');
    console.log('  Reference:', result.hadith.reference);
    console.log('  Collection:', result.hadith.collection);
    console.log('  Source:', result.source);
    console.log('  Is Arabic?', /[\u0600-\u06FF]/.test(result.hadith.text));
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test
testHadithService();
