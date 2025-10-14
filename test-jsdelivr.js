// Test the JSDelivr hadith API specifically
async function testJSDelivrAPI() {
  console.log('Testing JSDelivr English Hadith API...\n');

  try {
    const url =
      'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-bukhari.json';
    console.log(`🔍 Testing: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
      return;
    }

    const data = await response.json();
    console.log(`📊 Response structure:`, Object.keys(data));

    if (data.hadiths && Array.isArray(data.hadiths)) {
      console.log(`📚 Total hadiths available: ${data.hadiths.length}`);
      console.log(`📊 Metadata:`, JSON.stringify(data.metadata, null, 2));

      // Get a few random hadiths to examine structure
      for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(
          Math.random() * Math.min(50, data.hadiths.length)
        );
        const hadith = data.hadiths[randomIndex];

        console.log(`\n📖 Sample hadith ${i + 1} (index ${randomIndex}):`);
        console.log(`Keys:`, Object.keys(hadith));
        console.log(`Content:`, JSON.stringify(hadith, null, 2));

        // Check for English content
        const possibleText =
          hadith.text || hadith.body || hadith.hadith || hadith.textEn || '';
        if (possibleText) {
          console.log(`✅ Text found: "${possibleText.substring(0, 150)}..."`);
        } else {
          console.log(`❌ No text content found`);
        }
      }
    } else {
      console.log(`❌ Unexpected format - no hadiths array found`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testJSDelivrAPI();
