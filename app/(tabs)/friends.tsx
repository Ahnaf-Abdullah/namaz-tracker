import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';
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
} from 'lucide-react-native';

interface Friend {
  id: string;
  name: string;
  email: string;
  dailyPoints: number;
  totalPoints: number;
  prayersCompleted: number;
  streak: number;
  isOnline?: boolean;
}

interface SearchUser {
  id: string;
  name: string;
  email: string;
  totalPoints: number;
}

interface PendingRequest {
  id: string;
  fromUser: {
    name: string;
    email: string;
    totalPoints: number;
  };
  timestamp: Date;
}

export default function FriendsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock data - in real app this would come from Firebase
  const mockFriends: Friend[] = [
    {
      id: '1',
      name: 'Ahmed Hassan',
      email: 'ahmed@example.com',
      dailyPoints: 25,
      totalPoints: 1250,
      prayersCompleted: 5,
      streak: 12,
      isOnline: true,
    },
    {
      id: '2',
      name: 'Fatima Ali',
      email: 'fatima@example.com',
      dailyPoints: 25,
      totalPoints: 1180,
      prayersCompleted: 5,
      streak: 8,
      isOnline: false,
    },
    {
      id: '3',
      name: 'Omar Abdullah',
      email: 'omar@example.com',
      dailyPoints: 20,
      totalPoints: 980,
      prayersCompleted: 4,
      streak: 5,
      isOnline: true,
    },
    {
      id: '4',
      name: 'Aisha Rahman',
      email: 'aisha@example.com',
      dailyPoints: 15,
      totalPoints: 850,
      prayersCompleted: 3,
      streak: 3,
      isOnline: false,
    },
  ];

  const mockPendingRequests: PendingRequest[] = [
    {
      id: '1',
      fromUser: {
        name: 'Muhammad Ali',
        email: 'muhammad@example.com',
        totalPoints: 1100,
      },
      timestamp: new Date(),
    },
    {
      id: '2',
      fromUser: {
        name: 'Sara Ahmed',
        email: 'sara@example.com',
        totalPoints: 950,
      },
      timestamp: new Date(),
    },
  ];

  useEffect(() => {
    // Load friends and pending requests
    setFriends(mockFriends);
    setPendingRequests(mockPendingRequests);
  }, []);

  // Add current user to leaderboard
  const currentUser: Friend = {
    id: 'current',
    name: user?.name || 'You',
    email: user?.email || '',
    dailyPoints: 25,
    totalPoints: 920,
    prayersCompleted: 5,
    streak: 15,
    isOnline: true,
  };

  const leaderboard = [currentUser, ...friends]
    .sort((a, b) => b.dailyPoints - a.dailyPoints)
    .map((friend, index) => ({ ...friend, rank: index + 1 }));

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setIsSearching(true);
      // Mock search results
      const mockResults: SearchUser[] = [
        {
          id: '5',
          name: 'Ibrahim Khan',
          email: 'ibrahim@example.com',
          totalPoints: 1050,
        },
        {
          id: '6',
          name: 'Khadija Malik',
          email: 'khadija@example.com',
          totalPoints: 800,
        },
      ].filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
      );

      setTimeout(() => {
        setSearchResults(mockResults);
        setIsSearching(false);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const sendFriendRequest = (userId: string, userName: string) => {
    Alert.alert('Friend Request', `Friend request sent to ${userName}!`);
  };

  const handlePendingRequest = (
    requestId: string,
    action: 'accept' | 'reject'
  ) => {
    const request = pendingRequests.find((r) => r.id === requestId);
    if (request) {
      if (action === 'accept') {
        Alert.alert(
          'Friend Added',
          `${request.fromUser.name} is now your friend!`
        );
        // Remove from pending requests
        setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      } else {
        Alert.alert(
          'Request Rejected',
          `Friend request from ${request.fromUser.name} was rejected.`
        );
        setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
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
      marginBottom: 20,
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
    onlineIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#2ECC71',
      position: 'absolute',
      bottom: 0,
      right: 2,
      borderWidth: 2,
      borderColor: theme.background,
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
            placeholder="Search users to add friends..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* Pending Requests Button */}
        <TouchableOpacity
          style={styles.pendingRequestsButton}
          onPress={() =>
            Alert.alert('Pending Requests', 'Feature coming soon!')
          }
        >
          <Bell size={20} color="#FFFFFF" />
          <Text style={styles.pendingRequestsText}>Pending Requests</Text>
          {pendingRequests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Results */}
        {searchResults.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {searchResults.map((result) => (
              <View key={result.id} style={styles.searchResultItem}>
                <Users size={20} color={theme.textSecondary} />
                <View style={styles.searchResultInfo}>
                  <Text style={styles.searchResultName}>{result.name}</Text>
                  <Text style={styles.searchResultEmail}>{result.email}</Text>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => sendFriendRequest(result.id, result.name)}
                >
                  <Plus size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Leaderboard */}
        <Text style={styles.sectionTitle}>Daily Leaderboard</Text>
        {leaderboard.map((friend) => (
          <View
            key={friend.id}
            style={[
              styles.leaderboardItem,
              friend.id === 'current' && styles.currentUserItem,
            ]}
          >
            <View style={styles.rankContainer}>
              {getRankIcon(friend.rank)}
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
              {friend.isOnline && <View style={styles.onlineIndicator} />}
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {friend.id === 'current' ? 'You' : friend.name}
              </Text>
              <Text style={styles.userStats}>
                {friend.prayersCompleted}/5 prayers • {friend.streak} day streak
              </Text>
            </View>

            <View style={styles.pointsContainer}>
              <Text style={styles.dailyPoints}>{friend.dailyPoints}</Text>
              <Text style={styles.totalPoints}>{friend.totalPoints} total</Text>
            </View>
          </View>
        ))}

        <View
          style={{
            height: Platform.OS === 'android' ? 20 + insets.bottom + 70 : 90,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
