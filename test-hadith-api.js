const API_ENDPOINTS = [
  'https://hadithapi.com/api/hadiths?apiKey=$2y$10$dK2dKlSSBvf1bF8ln2Wb0uUe79xD2bf7dc7cgo3fAk7AD7HVl51C&paginate=10&hadithEnglish=',
  'https://hadith-api-id.vercel.app/hadith/abu-dawud?page=1&limit=1',
  'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-bukhari.json',
];

// Helper function to detect Arabic text
function isArabicText(text) {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
  return arabicRegex.test(text);
}

// Helper function to get collection name from URL
function getCollectionName(url) {
  if (url.includes('bukhari')) return 'Sahih al-Bukhari';
  if (url.includes('muslim')) return 'Sahih Muslim';
  if (url.includes('tirmidhi')) return 'Jami at-Tirmidhi';
  return 'Islamic Collection';
}

// Test API endpoints
async function testHadithAPIs() {
  console.log('Testing Hadith API Endpoints for English content...\n');

  for (const url of API_ENDPOINTS) {
    try {
      console.log(`\n🔍 Testing: ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      console.log(`📊 Response structure:`, Object.keys(data));

      if (data.data && data.data.hadiths && data.data.hadiths.length > 0) {
        const hadith = data.data.hadiths[0]; // Get first hadith for testing
        console.log(`📖 Sample hadith keys:`, Object.keys(hadith));

        // Check all available text fields
        console.log(`📝 Available fields:`, {
          text: !!hadith.text,
          arab: !!hadith.arab,
          english: !!hadith.english,
          contents: !!hadith.contents,
        });

        // Show actual content
        if (hadith.arab) {
          const isArabic = isArabicText(hadith.arab);
          console.log(
            `� Arab field (${
              isArabic ? 'Arabic' : 'Non-Arabic'
            }): "${hadith.arab.substring(0, 100)}..."`
          );
        }

        if (hadith.text) {
          const isArabic = isArabicText(hadith.text);
          console.log(
            `📖 Text field (${
              isArabic ? 'Arabic' : 'Non-Arabic'
            }): "${hadith.text.substring(0, 100)}..."`
          );
        }

        console.log(`📚 Collection: ${getCollectionName(url)}`);
        console.log(
          `🔢 Reference: ${hadith.number || hadith.hadithnumber || 'N/A'}`
        );

        // Print full hadith object for analysis (first hadith only)
        if (hadith.number === 1) {
          console.log(
            `🔍 Full sample hadith object:`,
            JSON.stringify(hadith, null, 2)
          );
        }
      } else {
        console.log(`❌ Unexpected response format`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

// Run the test
testHadithAPIs()
  .then(() => {
    console.log('\n✅ API testing completed');
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
  });
