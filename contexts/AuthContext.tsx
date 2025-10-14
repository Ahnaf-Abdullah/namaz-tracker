import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { createUserProfile, getUserProfile } from '../services/database';

interface User {
  id: string;
  email: string;
  name: string;
  profileData?: any; // Additional profile data from Firestore
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => false,
  signUp: async () => false,
  signOut: async () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            // Get additional profile data from Firestore
            const profileResult = await getUserProfile(firebaseUser.uid);

            const userData: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name:
                firebaseUser.displayName ||
                firebaseUser.email?.split('@')[0] ||
                'User',
              profileData: profileResult.success ? profileResult.data : null,
            };
            setUser(userData);
          } catch (error: any) {
            console.log(
              'Error getting user profile (using fallback):',
              error.message
            );
            // Fallback: create user object without Firestore data
            const userData: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name:
                firebaseUser.displayName ||
                firebaseUser.email?.split('@')[0] ||
                'User',
              profileData: null,
            };
            setUser(userData);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return unsubscribe; // Cleanup subscription
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error: any) {
      console.log('Sign in error:', error.message);
      return false;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name?: string
  ): Promise<boolean> => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create user profile in Firestore
      await createUserProfile(result.user.uid, {
        email: email,
        name: name || email.split('@')[0],
        joinedAt: new Date().toISOString(),
        prayerStreak: 0,
        totalPrayers: 0,
      });

      // Sign out immediately after creating account so user has to login manually
      await firebaseSignOut(auth);
      return true;
    } catch (error: any) {
      console.log('Sign up error:', error.message);
      return false;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.log('Sign out error:', error.message);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
