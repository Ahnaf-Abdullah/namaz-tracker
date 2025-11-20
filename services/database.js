import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  writeBatch,
  increment,
  limit,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

// User Profile Operations
export const createUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { success: true, data: { id: userSnap.id, ...userSnap.data() } };
    } else {
      return { success: false, error: 'User profile not found' };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (userId, updateData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};

// Prayer Tracking Operations
export const addPrayerRecord = async (userId, prayerData) => {
  try {
    const prayersRef = collection(db, 'prayers');
    await addDoc(prayersRef, {
      userId,
      ...prayerData,
      timestamp: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding prayer record:', error);
    return { success: false, error: error.message };
  }
};

export const getUserPrayers = async (userId, limit = 50) => {
  try {
    const prayersRef = collection(db, 'prayers');
    const q = query(
      prayersRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const prayers = [];
    querySnapshot.forEach((doc) => {
      prayers.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: prayers };
  } catch (error) {
    console.error('Error getting user prayers:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get today's completed prayers for a user
 * @param {string} userId - The user's ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of completed prayer objects
 */
export const getTodaysPrayers = async (userId, date) => {
  try {
    const prayersRef = collection(db, 'prayers');
    const q = query(
      prayersRef,
      where('userId', '==', userId),
      where('date', '==', date),
      where('completed', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const prayers = [];

    querySnapshot.forEach((doc) => {
      prayers.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return prayers;
  } catch (error) {
    console.error('Error fetching today prayers:', error);
    return [];
  }
};

// Friends/Social Features
export const sendFriendRequest = async (fromUserId, toUserId) => {
  try {
    const friendRequestsRef = collection(db, 'friendRequests');
    await addDoc(friendRequestsRef, {
      from: fromUserId,
      to: toUserId,
      status: 'pending',
      timestamp: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending friend request:', error);
    return { success: false, error: error.message };
  }
};

export const getFriendRequests = async (userId) => {
  try {
    const friendRequestsRef = collection(db, 'friendRequests');
    const q = query(
      friendRequestsRef,
      where('to', '==', userId),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: requests };
  } catch (error) {
    console.error('Error getting friend requests:', error);
    return { success: false, error: error.message };
  }
};

export const acceptFriendRequest = async (requestId, fromUserId, toUserId) => {
  try {
    // Update friend request status
    const requestRef = doc(db, 'friendRequests', requestId);
    await updateDoc(requestRef, {
      status: 'accepted',
      updatedAt: serverTimestamp(),
    });

    // Add friendship records for both users
    const friendshipsRef = collection(db, 'friendships');
    await addDoc(friendshipsRef, {
      user1: fromUserId,
      user2: toUserId,
      timestamp: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return { success: false, error: error.message };
  }
};

export const getUserFriends = async (userId) => {
  try {
    const friendshipsRef = collection(db, 'friendships');
    const q1 = query(friendshipsRef, where('user1', '==', userId));
    const q2 = query(friendshipsRef, where('user2', '==', userId));

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
    ]);

    const friendIds = new Set();
    snapshot1.forEach((doc) => {
      friendIds.add(doc.data().user2);
    });
    snapshot2.forEach((doc) => {
      friendIds.add(doc.data().user1);
    });

    return { success: true, data: Array.from(friendIds) };
  } catch (error) {
    console.error('Error getting user friends:', error);
    return { success: false, error: error.message };
  }
};

// Search Users
export const searchUsers = async (searchTerm) => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);

    const users = [];
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (
        userData.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userData.email?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        users.push({ id: doc.id, ...userData });
      }
    });

    return { success: true, data: users };
  } catch (error) {
    console.error('Error searching users:', error);
    return { success: false, error: error.message };
  }
};

// Points and Scoring Operations
export const updateUserDailyScore = async (userId, points, prayerName) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const userRef = doc(db, 'users', userId);
    const dailyScoreRef = doc(db, 'dailyScores', `${userId}_${today}`);

    // Get current daily score
    const dailyScoreDoc = await getDoc(dailyScoreRef);
    const currentData = dailyScoreDoc.exists()
      ? dailyScoreDoc.data()
      : {
          userId,
          date: today,
          totalPoints: 0,
          prayersCompleted: [],
          completionTimes: {},
          fastestCompletions: {},
          rank: 0,
        };

    // Check if prayer already completed today
    if (
      currentData.prayersCompleted &&
      currentData.prayersCompleted.includes(prayerName)
    ) {
      return {
        success: false,
        error: `${prayerName} prayer already completed today`,
      };
    }

    // Calculate bonus for fast completion (if prayer completed within first hour)
    const now = new Date();
    const bonus = calculateSpeedBonus(prayerName, now);
    const totalPointsForPrayer = points + bonus;

    // Update daily score
    const updatedData = {
      ...currentData,
      totalPoints: (currentData.totalPoints || 0) + totalPointsForPrayer,
      prayersCompleted: [...(currentData.prayersCompleted || []), prayerName],
      completionTimes: {
        ...currentData.completionTimes,
        [prayerName]: now.toISOString(),
      },
      lastUpdated: now.toISOString(),
    };

    // Save daily score
    await setDoc(dailyScoreRef, updatedData, { merge: true });

    // Create prayer record in prayers collection
    const prayersRef = collection(db, 'prayers');
    await addDoc(prayersRef, {
      userId,
      prayerName,
      completed: true,
      date: today,
      completedAt: now.toISOString(),
      pointsAwarded: totalPointsForPrayer,
      timestamp: serverTimestamp(),
    });

    // Update user's highest score if needed
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() || {};
    const currentHighest = userData.highestDailyScore || 0;

    if (updatedData.totalPoints > currentHighest) {
      await updateDoc(userRef, {
        highestDailyScore: updatedData.totalPoints,
        highestScoreDate: today,
        lastUpdated: now.toISOString(),
      });
    }

    // Update current daily score in user profile
    await updateDoc(userRef, {
      currentDailyScore: updatedData.totalPoints,
      lastPrayerCompleted: prayerName,
      lastPrayerTime: now.toISOString(),
    });

    return {
      success: true,
      data: {
        points: totalPointsForPrayer,
        totalDaily: updatedData.totalPoints,
      },
    };
  } catch (error) {
    console.error('Error updating daily score:', error);
    return { success: false, error: error.message };
  }
};

// Calculate speed bonus for fast prayer completion
const calculateSpeedBonus = (prayerName, completionTime) => {
  const now = new Date();
  const hour = now.getHours();

  // Define prayer time windows (approximate)
  const prayerTimes = {
    Fajr: { start: 4, end: 6 },
    Dhuhr: { start: 12, end: 14 },
    Asr: { start: 15, end: 17 },
    Maghrib: { start: 18, end: 19 },
    Isha: { start: 20, end: 22 },
  };

  const prayerWindow = prayerTimes[prayerName];
  if (!prayerWindow) return 0;

  // Bonus for completing within the first 30 minutes of prayer time
  if (hour >= prayerWindow.start && hour < prayerWindow.start + 0.5) {
    return 10; // Fast completion bonus
  } else if (hour >= prayerWindow.start && hour <= prayerWindow.end) {
    return 5; // On-time completion bonus
  }

  return 0; // No bonus for late completion
};

// Get user's daily score
export const getUserDailyScore = async (userId, date) => {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const dailyScoreRef = doc(db, 'dailyScores', `${userId}_${targetDate}`);
    const dailyScoreDoc = await getDoc(dailyScoreRef);

    if (dailyScoreDoc.exists()) {
      return { success: true, data: dailyScoreDoc.data() };
    } else {
      return {
        success: true,
        data: {
          userId,
          date: targetDate,
          totalPoints: 0,
          prayersCompleted: [],
          completionTimes: {},
          rank: 0,
        },
      };
    }
  } catch (error) {
    console.error('Error getting daily score:', error);
    // Return default data if permission error
    if (error.code === 'permission-denied') {
      const targetDate = date || new Date().toISOString().split('T')[0];
      return {
        success: true,
        data: {
          userId,
          date: targetDate,
          totalPoints: 0,
          prayersCompleted: [],
          completionTimes: {},
          rank: 0,
        },
      };
    }
    return { success: false, error: error.message };
  }
};

// Get daily leaderboard
export const getDailyLeaderboard = async (limitCount = 50) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dailyScoresRef = collection(db, 'dailyScores');

    // Try compound query, fallback to simple query if index not ready
    let querySnapshot;
    try {
      const q = query(
        dailyScoresRef,
        where('date', '==', today),
        orderBy('totalPoints', 'desc'),
        limit(limitCount)
      );
      querySnapshot = await getDocs(q);
    } catch (indexError) {
      console.log(
        'Leaderboard index not ready, using simple query:',
        indexError.message
      );
      // Fallback to simple query without orderBy
      const q = query(
        dailyScoresRef,
        where('date', '==', today),
        limit(limitCount)
      );
      querySnapshot = await getDocs(q);
    }

    const leaderboard = [];

    for (const docSnap of querySnapshot.docs) {
      const scoreData = docSnap.data();

      // Get user profile for name and avatar
      const userDoc = await getDoc(doc(db, 'users', scoreData.userId));
      const userData = userDoc.data() || {};

      leaderboard.push({
        ...scoreData,
        userName: userData.name || 'Unknown User',
        userEmail: userData.email || '',
        rank: leaderboard.length + 1,
      });
    }

    // Sort manually if we used fallback query
    leaderboard.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

    // Update ranks after sorting
    leaderboard.forEach((user, index) => {
      user.rank = index + 1;
    });

    return { success: true, data: leaderboard };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    // Return empty leaderboard if permission error
    if (error.code === 'permission-denied') {
      return { success: true, data: [] };
    }
    return { success: false, error: error.message };
  }
};

// Reset daily scores at Fajr time (called by scheduler)
export const resetDailyScores = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Archive yesterday's scores before reset
    const dailyScoresRef = collection(db, 'dailyScores');
    const q = query(dailyScoresRef, where('date', '==', yesterdayStr));
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(db);

    // Archive scores and reset user current scores
    for (const docSnap of querySnapshot.docs) {
      const scoreData = docSnap.data();

      // Archive to historical scores
      const archiveRef = doc(db, 'historicalScores', docSnap.id);
      batch.set(archiveRef, {
        ...scoreData,
        archived: true,
        archivedAt: new Date().toISOString(),
      });

      // Reset user's current daily score
      const userRef = doc(db, 'users', scoreData.userId);
      batch.update(userRef, {
        currentDailyScore: 0,
        lastPrayerCompleted: null,
        lastPrayerTime: null,
        dailyStreak: increment(1), // Increment streak if user had any points yesterday
      });

      // Delete yesterday's daily score document
      batch.delete(docSnap.ref);
    }

    await batch.commit();
    console.log('Daily scores reset successfully at Fajr time');
    return { success: true };
  } catch (error) {
    console.error('Error resetting daily scores:', error);
    return { success: false, error: error.message };
  }
};

// Get user's highest score and stats
export const getUserStats = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();

    // Simplified approach - avoid complex query until index is ready
    let historicalScores = [];
    let currentStreak = 0;

    // Try to get historical scores, but handle index error gracefully
    try {
      const historicalRef = collection(db, 'historicalScores');
      const q = query(
        historicalRef,
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(30) // Last 30 days
      );

      const historicalSnapshot = await getDocs(q);
      historicalScores = historicalSnapshot.docs.map((doc) => doc.data());

      // Calculate current streak
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];

        const dayScore = historicalScores.find(
          (score) => score.date === dateStr
        );
        if (dayScore && dayScore.totalPoints > 0) {
          currentStreak++;
        } else {
          break;
        }
      }
    } catch (indexError) {
      console.log('Index not ready yet, using defaults:', indexError.message);
      // Use defaults until index is created
      historicalScores = [];
      currentStreak = 0;
    }

    return {
      success: true,
      data: {
        highestDailyScore: userData.highestDailyScore || 0,
        highestScoreDate: userData.highestScoreDate || null,
        currentDailyScore: userData.currentDailyScore || 0,
        currentStreak,
        totalPrayersCompleted: historicalScores.reduce(
          (sum, score) => sum + (score.prayersCompleted?.length || 0),
          0
        ),
        averageDailyScore:
          historicalScores.length > 0
            ? historicalScores.reduce(
                (sum, score) => sum + score.totalPoints,
                0
              ) / historicalScores.length
            : 0,
      },
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    // Return default stats if permission error
    if (error.code === 'permission-denied') {
      return {
        success: true,
        data: {
          highestDailyScore: 0,
          highestScoreDate: null,
          currentDailyScore: 0,
          currentStreak: 0,
          totalPrayersCompleted: 0,
          averageDailyScore: 0,
        },
      };
    }
    return { success: false, error: error.message };
  }
};
