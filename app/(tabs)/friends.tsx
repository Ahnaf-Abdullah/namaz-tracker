import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';
import {
  searchUsers,
  sendFriendRequest as sendFriendRequestDB,
  getPendingRequestsWithDetails,
  acceptFriendRequest as acceptFriendRequestDB,
  rejectFriendRequest as rejectFriendRequestDB,
  getFriendsWithDetails,
  getFriendsLeaderboard,
  checkExistingFriendRequest,
  checkFriendship,
  getUserDailyScore,
  getUserProfile,
} from '@/services/database';
import {
  Search,
  UserPlus,
  Bell,
  Trophy,
  Crown,
  Medal,
  Award,
  Users,
  Plus,
  Check,
  X,
  Loader,
} from 'lucide-react-native';

interface Friend {
  id: string;
  name: string;
  email: string;
  dailyPoints: number;
  totalPoints: number;
  prayersCompleted: number;
  streak: number;
  rank?: number;
  isCurrentUser?: boolean;
}

interface SearchUser {
  id: string;
  name: string;
  email: string;
  currentDailyScore?: number;
  highestDailyScore?: number;
}

interface PendingRequest {
  id: string;
  from: string;
  to: string;
  status: string;
  timestamp: any;
  fromUser: {
    id: string;
    name: string;
    email: string;
    currentDailyScore?: number;
    [key: string]: any;
  };
}

export default function FriendsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'friends'>(
    'leaderboard'
  );

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadPendingRequests(),
      loadFriends(),
      loadFriendsLeaderboard(),
    ]);
    setIsLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadPendingRequests = async () => {
    if (!user?.id) return;
    try {
      const result = await getPendingRequestsWithDetails(user.id);
      if (result.success && result.data) {
        setPendingRequests(result.data as PendingRequest[]);
      }
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  const loadFriends = async () => {
    if (!user?.id) return;
    try {
      const result = await getFriendsWithDetails(user.id);
      if (result.success && result.data) {
        setFriends(result.data);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadFriendsLeaderboard = async () => {
    if (!user?.id) return;
    try {
      const [leaderboardResult, userScoreResult, userProfileResult] =
        await Promise.all([
          getFriendsLeaderboard(user.id),
          getUserDailyScore(user.id),
          getUserProfile(user.id),
        ]);

      if (leaderboardResult.success && leaderboardResult.data) {
        const friendsData = leaderboardResult.data;

        // Get user's own data
        const userDailyScore = userScoreResult.success
          ? userScoreResult.data
          : null;
        const userProfile: any = userProfileResult.success
          ? userProfileResult.data
          : null;

        if (userDailyScore && userProfile) {
          // Create user's own entry
          const userData: Friend = {
            id: user.id,
            name: user.name || userProfile.name || 'You',
            email: user.email || userProfile.email || '',
            dailyPoints: userDailyScore.totalPoints || 0,
            totalPoints: userProfile.highestDailyScore || 0,
            prayersCompleted: userDailyScore.prayersCompleted?.length || 0,
            streak: userProfile.dailyStreak || 0,
            isCurrentUser: true,
          };

          // Combine user and friends data
          const allUsers = [...friendsData, userData];

          // Sort by daily points and assign ranks
          allUsers.sort((a, b) => b.dailyPoints - a.dailyPoints);
          const rankedUsers = allUsers.map((user, index) => ({
            ...user,
            rank: index + 1,
          }));

          setFriendsLeaderboard(rankedUsers);
        } else {
          setFriendsLeaderboard(friendsData);
        }
      }
    } catch (error) {
      console.error('Error loading friends leaderboard:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setIsSearching(true);
      try {
        const result = await searchUsers(query);
        if (result.success && result.data) {
          // Filter out current user and existing friends
          const filteredResults = result.data.filter(
            (searchUser: SearchUser) =>
              searchUser.id !== user?.id &&
              !friends.some((friend) => friend.id === searchUser.id)
          );
          setSearchResults(filteredResults);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSendFriendRequest = async (
    toUserId: string,
    userName: string
  ) => {
    if (!user?.id) return;

    try {
      // Check if already friends
      const areFriends = await checkFriendship(user.id, toUserId);
      if (areFriends) {
        Alert.alert(
          'Already Friends',
          `You are already friends with ${userName}`
        );
        return;
      }

      // Check if request already sent
      const requestExists = await checkExistingFriendRequest(user.id, toUserId);
      if (requestExists) {
        Alert.alert(
          'Request Pending',
          `Friend request already sent to ${userName}`
        );
        return;
      }

      const result = await sendFriendRequestDB(user.id, toUserId);
      if (result.success) {
        Alert.alert('Success', `Friend request sent to ${userName}!`);
        // Remove from search results
        setSearchResults((prev) => prev.filter((u) => u.id !== toUserId));
      } else {
        Alert.alert('Error', result.error || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (
    requestId: string,
    fromUserId: string,
    fromUserName: string
  ) => {
    if (!user?.id) return;

    try {
      const result = await acceptFriendRequestDB(
        requestId,
        fromUserId,
        user.id
      );
      if (result.success) {
        Alert.alert('Success', `${fromUserName} is now your friend!`);
        // Reload data
        await loadData();
        setShowPendingModal(false);
      } else {
        Alert.alert('Error', result.error || 'Failed to accept friend request');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (
    requestId: string,
    fromUserName: string
  ) => {
    try {
      const result = await rejectFriendRequestDB(requestId);
      if (result.success) {
        Alert.alert(
          'Request Rejected',
          `Friend request from ${fromUserName} was rejected`
        );
        // Remove from pending requests
        setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      } else {
        Alert.alert('Error', result.error || 'Failed to reject friend request');
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={20} color="#FFD700" />;
      case 2:
        return <Medal size={20} color="#C0C0C0" />;
      case 3:
        return <Award size={20} color="#CD7F32" />;
      default:
        return <Trophy size={16} color={theme.textSecondary} />;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: Platform.OS === 'android' ? insets.top : 0,
    },
    header: {
      padding: 20,
      paddingBottom: 15,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 12,
      paddingHorizontal: 15,
      paddingVertical: 12,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: theme.border,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
      paddingVertical: 0,
    },
    pendingRequestsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.secondary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      marginBottom: 10,
    },
    pendingRequestsText: {
      color: '#FFFFFF',
      fontWeight: '600',
      marginLeft: 8,
      fontSize: 16,
    },
    badge: {
      backgroundColor: '#E74C3C',
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: 5,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme.surface,
      borderRadius: 10,
      padding: 4,
      marginBottom: 10,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: theme.secondary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    activeTabText: {
      color: '#FFFFFF',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 15,
      paddingHorizontal: 20,
    },
    searchResultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      marginHorizontal: 20,
      marginBottom: 10,
      backgroundColor: theme.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    searchResultInfo: {
      flex: 1,
      marginLeft: 10,
    },
    searchResultName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    searchResultEmail: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    addButton: {
      backgroundColor: theme.secondary,
      padding: 8,
      borderRadius: 6,
    },
    leaderboardItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      marginHorizontal: 20,
      marginBottom: 10,
      backgroundColor: theme.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    currentUserItem: {
      backgroundColor: theme.secondary + '15',
      borderColor: theme.secondary,
      borderWidth: 2,
    },
    rankContainer: {
      width: 40,
      alignItems: 'center',
      marginRight: 15,
    },
    rankText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
    },
    avatar: {
      width: 45,
      height: 45,
      borderRadius: 22,
      backgroundColor: theme.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 15,
    },
    avatarText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    userStats: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    pointsContainer: {
      alignItems: 'flex-end',
    },
    dailyPoints: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.secondary,
      marginBottom: 2,
    },
    totalPoints: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.textSecondary,
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 10,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    closeButton: {
      padding: 5,
    },
    requestItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      marginHorizontal: 20,
      marginVertical: 5,
      backgroundColor: theme.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    requestInfo: {
      flex: 1,
      marginLeft: 10,
    },
    requestActions: {
      flexDirection: 'row',
      gap: 10,
    },
    acceptButton: {
      backgroundColor: '#2ECC71',
      padding: 8,
      borderRadius: 6,
    },
    rejectButton: {
      backgroundColor: '#E74C3C',
      padding: 8,
      borderRadius: 6,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search
            size={20}
            color={theme.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by name or email..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
        </View>

        {/* Pending Requests Button */}
        <TouchableOpacity
          style={styles.pendingRequestsButton}
          onPress={() => setShowPendingModal(true)}
        >
          <Bell size={20} color="#FFFFFF" />
          <Text style={styles.pendingRequestsText}>Pending Requests</Text>
          {pendingRequests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'leaderboard' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('leaderboard')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'leaderboard' && styles.activeTabText,
              ]}
            >
              Leaderboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'friends' && styles.activeTabText,
              ]}
            >
              My Friends
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search Results */}
        {searchQuery.length > 2 && (
          <>
            <Text style={styles.sectionTitle}>
              {isSearching ? 'Searching...' : 'Search Results'}
            </Text>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.secondary} />
              </View>
            ) : searchResults.length > 0 ? (
              searchResults.map((result) => (
                <View key={result.id} style={styles.searchResultItem}>
                  <Users size={20} color={theme.textSecondary} />
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultName}>{result.name}</Text>
                    <Text style={styles.searchResultEmail}>{result.email}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() =>
                      handleSendFriendRequest(result.id, result.name)
                    }
                  >
                    <Plus size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Users size={48} color={theme.textSecondary} />
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            )}
          </>
        )}

        {/* Main Content Based on Active Tab */}
        {!searchQuery && (
          <>
            {activeTab === 'leaderboard' ? (
              <>
                <Text style={styles.sectionTitle}>
                  Friends Leaderboard (Today)
                </Text>
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.secondary} />
                    <Text style={styles.loadingText}>
                      Loading leaderboard...
                    </Text>
                  </View>
                ) : friendsLeaderboard.length > 0 ? (
                  friendsLeaderboard.map((friend) => (
                    <View
                      key={friend.id}
                      style={[
                        styles.leaderboardItem,
                        friend.isCurrentUser && styles.currentUserItem,
                      ]}
                    >
                      <View style={styles.rankContainer}>
                        {getRankIcon(friend.rank || 0)}
                        <Text style={styles.rankText}>#{friend.rank}</Text>
                      </View>

                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {friend.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </Text>
                      </View>

                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>
                          {friend.name}
                          {friend.isCurrentUser ? ' (You)' : ''}
                        </Text>
                        <Text style={styles.userStats}>
                          {friend.prayersCompleted}/5 prayers • Streak:{' '}
                          {friend.streak} days
                        </Text>
                      </View>

                      <View style={styles.pointsContainer}>
                        <Text style={styles.dailyPoints}>
                          {friend.dailyPoints}
                        </Text>
                        <Text style={styles.totalPoints}>today</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Trophy size={48} color={theme.textSecondary} />
                    <Text style={styles.emptyText}>
                      Add friends to see them on the leaderboard!
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={styles.sectionTitle}>
                  My Friends ({friends.length})
                </Text>
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.secondary} />
                    <Text style={styles.loadingText}>Loading friends...</Text>
                  </View>
                ) : friends.length > 0 ? (
                  friends.map((friend) => (
                    <View key={friend.id} style={styles.leaderboardItem}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {friend.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </Text>
                      </View>

                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{friend.name}</Text>
                        <Text style={styles.userStats}>
                          {friend.prayersCompleted}/5 prayers •{' '}
                          {friend.dailyPoints} pts today
                        </Text>
                      </View>

                      <View style={styles.pointsContainer}>
                        <Text style={styles.dailyPoints}>
                          {friend.totalPoints}
                        </Text>
                        <Text style={styles.totalPoints}>best score</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Users size={48} color={theme.textSecondary} />
                    <Text style={styles.emptyText}>
                      No friends yet. Search for users above to add friends!
                    </Text>
                  </View>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Pending Requests Modal */}
      <Modal
        visible={showPendingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPendingModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Pending Requests ({pendingRequests.length})
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPendingModal(false)}
              >
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                  <View key={request.id} style={styles.requestItem}>
                    <Users size={20} color={theme.textSecondary} />
                    <View style={styles.requestInfo}>
                      <Text style={styles.searchResultName}>
                        {request.fromUser.name}
                      </Text>
                      <Text style={styles.searchResultEmail}>
                        {request.fromUser.email}
                      </Text>
                    </View>
                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() =>
                          handleAcceptRequest(
                            request.id,
                            request.from,
                            request.fromUser.name
                          )
                        }
                      >
                        <Check size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() =>
                          handleRejectRequest(request.id, request.fromUser.name)
                        }
                      >
                        <X size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Bell size={48} color={theme.textSecondary} />
                  <Text style={styles.emptyText}>No pending requests</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
