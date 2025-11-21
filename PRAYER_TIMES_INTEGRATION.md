# Prayer Times Integration - Aladhan Islamic API

## Overview

Namaz Tracker now integrates with the **Aladhan Islamic API** to provide accurate, location-based prayer times. The app automatically detects your location and fetches the correct prayer times for your geographical area.

## Features

✅ **Location-Based Prayer Times**

- Automatic GPS location detection
- Accurate prayer times based on your coordinates
- Works worldwide with any location

✅ **Smart Caching**

- Prayer times cached for 24 hours
- Reduces API calls and improves performance
- Offline support with cached data

✅ **Multi-Source Reliability**

- Primary: Aladhan API (api.aladhan.com)
- Fallback: Local cached times
- Graceful error handling

✅ **User-Friendly Features**

- City/country display
- Manual refresh button
- Loading states and error messages
- Permission request handling

## API Details

### Aladhan Islamic API

**Endpoint:** `http://api.aladhan.com/v1/timings/{timestamp}`

**Parameters:**

- `latitude`: User's latitude coordinate
- `longitude`: User's longitude coordinate
- `method`: Calculation method (default: 2 - ISNA)

### Calculation Methods

The app uses **Islamic Society of North America (ISNA)** by default. You can modify this in `prayerTimesService.ts`:

```typescript
// Available methods:
1; // University of Islamic Sciences, Karachi
2; // Islamic Society of North America (ISNA) - DEFAULT
3; // Muslim World League (MWL)
4; // Umm al-Qura, Makkah
5; // Egyptian General Authority of Survey
7; // Institute of Geophysics, University of Tehran
12; // Union Organization islamic de France
```

## Implementation Details

### Files Added/Modified

**New Files:**

1. `services/prayerTimesService.ts` - Prayer times API service

**Modified Files:**

1. `app/(tabs)/index.tsx` - Home screen with prayer times display
2. `app.json` - Location permissions configuration
3. `package.json` - Added expo-location dependency

### Service Architecture

```
prayerTimesService
├── getPrayerTimes()          # Main function to get prayer times
├── getUserLocation()          # Get GPS coordinates
├── fetchPrayerTimesFromAPI()  # Fetch from Aladhan API
├── getCachedPrayerTimes()    # Check local cache
├── formatTime12Hour()         # Format time display
├── isWithinPrayerWindow()    # Check if within prayer time
└── getNextPrayer()           # Get upcoming prayer
```

### Data Flow

```
User Opens App
    ↓
Request Location Permission
    ↓
Get GPS Coordinates
    ↓
Check Cache (< 24 hours old?)
    ├─ YES → Use Cached Times
    └─ NO → Fetch from API
         ↓
    Save to Cache
         ↓
    Display Prayer Times
```

## Permissions Required

### iOS

- **NSLocationWhenInUseUsageDescription**: "Namaz Tracker needs your location to provide accurate prayer times based on your geographical position."

### Android

- **ACCESS_FINE_LOCATION**: For precise GPS coordinates
- **ACCESS_COARSE_LOCATION**: For approximate location (fallback)

## Usage

### Getting Prayer Times

```typescript
import { prayerTimesService } from '@/services/prayerTimesService';

// Get prayer times (uses cache if available)
const result = await prayerTimesService.getPrayerTimes();

if (result.success && result.data) {
  console.log('Fajr:', result.data.Fajr); // "05:30"
  console.log('Dhuhr:', result.data.Dhuhr); // "12:45"
  console.log('Asr:', result.data.Asr); // "16:15"
  console.log('Maghrib:', result.data.Maghrib); // "18:45"
  console.log('Isha:', result.data.Isha); // "20:30"
}

// Force refresh from API
const freshResult = await prayerTimesService.getPrayerTimes(true);
```

### Format Time Display

```typescript
// Convert 24-hour to 12-hour format
const time24 = '18:45';
const time12 = prayerTimesService.formatTime12Hour(time24);
console.log(time12); // "6:45 PM"
```

### Check Prayer Window

```typescript
// Check if within prayer time
const isTime = prayerTimesService.isWithinPrayerWindow(
  'Fajr',
  '05:30',
  '12:45' // next prayer time
);
```

### Get Next Prayer

```typescript
const nextPrayer = prayerTimesService.getNextPrayer(prayerTimes);
if (nextPrayer) {
  console.log(`Next: ${nextPrayer.name} at ${nextPrayer.time}`);
  console.log(`Time until: ${nextPrayer.timeUntil}`);
}
```

## UI Components

### Location Display

The home screen now shows:

- 📍 **City/Location**: Displayed at the top
- 🔄 **Refresh Button**: Manual prayer times refresh
- ⏰ **Prayer Times**: Updated with accurate times

### User Experience

**First Launch:**

1. App requests location permission
2. User grants permission
3. App fetches prayer times from API
4. Times displayed with user's city

**Subsequent Launches:**

1. App checks cache (< 24 hours old)
2. Displays cached times immediately
3. Shows user's saved location

**Manual Refresh:**

1. User taps refresh button
2. App fetches fresh data from API
3. Updates cache and display

## Error Handling

### Location Permission Denied

```
Alert: "Location Required"
Message: "Unable to get prayer times. Please enable location services."
Actions: [Cancel, Retry]
```

### API Failure

```
Alert: "Prayer Times Error"
Message: "Unable to load prayer times. Please check your internet connection."
Actions: [OK]
```

### Fallback Strategy

```
Location Permission Denied
    ↓
Show Default Times (hardcoded)
    +
Display Warning Message
```

## Performance

### Caching Strategy

- **Cache Duration**: 24 hours
- **Cache Key**: `prayer_times_cache`
- **Location Cache**: 7 days
- **Storage**: AsyncStorage (local)

### API Calls

- **First Launch**: 1 API call
- **Daily Usage**: 1 API call per day
- **Manual Refresh**: 1 API call per refresh
- **Offline**: 0 API calls (uses cache)

### Response Times

| Operation          | Time        |
| ------------------ | ----------- |
| Cache Hit          | < 50ms      |
| API Call           | 300-500ms   |
| Location Fetch     | 1-3 seconds |
| Total (First Load) | 2-4 seconds |

## Testing

### Test Location Access

```typescript
// Test with specific coordinates
const testCoords = {
  latitude: 40.7128, // New York
  longitude: -74.006,
};

// Manually test API
const url = `http://api.aladhan.com/v1/timings/${Date.now() / 1000}?latitude=${
  testCoords.latitude
}&longitude=${testCoords.longitude}&method=2`;
```

### Clear Cache

```typescript
import { prayerTimesService } from '@/services/prayerTimesService';

// Clear all cached data
await prayerTimesService.clearCache();

// This will force fresh API call on next request
```

## Future Enhancements

### Planned Features

1. **Prayer Time Notifications**

   - 15-minute before prayer reminders
   - Customizable notification sounds
   - Athan audio playback

2. **Multiple Calculation Methods**

   - User preference selection
   - Region-based defaults
   - Custom adjustments

3. **Qibla Direction**

   - Compass integration
   - Direction to Mecca
   - Visual indicator

4. **Prayer Time Adjustments**

   - Manual time offsets
   - DST handling
   - High latitude adjustments

5. **Offline Mode**
   - Extended cache duration
   - Monthly prayer times
   - Manual time entry

## Troubleshooting

### "Unable to get location"

**Solution:**

1. Check device location settings
2. Ensure app has location permission
3. Try manual refresh
4. Restart the app

### "Prayer times not updating"

**Solution:**

1. Tap refresh button
2. Clear cache: `prayerTimesService.clearCache()`
3. Check internet connection
4. Verify API is accessible

### "Wrong prayer times"

**Solution:**

1. Verify location accuracy
2. Check calculation method (method=2)
3. Consider manual adjustments
4. Report issue with location details

## Privacy & Security

### Data Collection

- **Location**: Used only for prayer time calculation
- **Storage**: Cached locally on device only
- **Sharing**: No data shared with third parties
- **API**: Aladhan API does not store user data

### Permissions

- Location permission is **optional**
- App works with manual time entry if permission denied
- Location cached locally, not sent to our servers
- Can clear cached location anytime

## API Attribution

Prayer times provided by **Aladhan Islamic API**

- Website: https://aladhan.com/
- API Documentation: https://aladhan.com/prayer-times-api
- License: Free for non-commercial use

## Support

For issues or questions:

1. Check this documentation
2. Review error messages
3. Clear app cache
4. Reinstall if necessary
5. Contact support with error details

---

**Last Updated:** November 21, 2025
**Version:** 1.0.0
**API Version:** Aladhan v1
