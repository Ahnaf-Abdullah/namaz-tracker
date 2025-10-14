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
