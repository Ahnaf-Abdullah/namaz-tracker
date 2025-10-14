import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserPrayers,
  addPrayerRecord,
  getUserFriends,
  getFriendRequests,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  updateUserProfile,
} from '@/services/database';

export const useUserData = () => {
  const { user } = useAuth();
  const [prayers, setPrayers] = useState<any[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load user prayers
  const loadPrayers = async () => {
    if (!user) return;

    setLoading(true);
    const result = await getUserPrayers(user.id);
    if (result.success && result.data) {
      setPrayers(result.data);
    }
    setLoading(false);
  };

  // Add a prayer record
  const addPrayer = async (prayerName: string, completed = true) => {
    if (!user) return false;

    const result = await addPrayerRecord(user.id, {
      prayerName,
      completed,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    });

    if (result.success) {
      await loadPrayers(); // Refresh prayers list
    }

    return result.success;
  }; // Load user friends
  const loadFriends = async () => {
    if (!user) return;

    const result = await getUserFriends(user.id);
    if (result.success && result.data) {
      setFriends(result.data);
    }
  };

  // Load friend requests
  const loadFriendRequests = async () => {
    if (!user) return;

    const result = await getFriendRequests(user.id);
    if (result.success && result.data) {
      setFriendRequests(result.data);
    }
  };

  // Send friend request
  const sendRequest = async (toUserId: string) => {
    if (!user) return false;

    const result = await sendFriendRequest(user.id, toUserId);
    return result.success;
  };

  // Accept friend request
  const acceptRequest = async (requestId: string, fromUserId: string) => {
    if (!user) return false;

    const result = await acceptFriendRequest(requestId, fromUserId, user.id);
    if (result.success) {
      await loadFriends();
      await loadFriendRequests();
    }
    return result.success;
  };

  // Search for users
  const searchForUsers = async (searchTerm: string) => {
    const result = await searchUsers(searchTerm);
    return result.success ? result.data : [];
  };

  // Update user profile
  const updateProfile = async (updateData: any) => {
    if (!user) return false;

    const result = await updateUserProfile(user.id, updateData);
    return result.success;
  }; // Load data when user changes
  useEffect(() => {
    if (user) {
      loadPrayers();
      loadFriends();
      loadFriendRequests();
    } else {
      setPrayers([]);
      setFriends([]);
      setFriendRequests([]);
    }
  }, [user]);

  return {
    // Data
    prayers,
    friends,
    friendRequests,
    loading,

    // Actions
    addPrayer,
    loadPrayers,
    loadFriends,
    loadFriendRequests,
    sendRequest,
    acceptRequest,
    searchForUsers,
    updateProfile,
  };
};
