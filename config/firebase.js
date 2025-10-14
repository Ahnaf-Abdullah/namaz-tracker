// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyASkUFr5ZcGFxwal_18b1ah90MCxddyubM',
  authDomain: 'namaz-tracker-548e5.firebaseapp.com',
  projectId: 'namaz-tracker-548e5',
  storageBucket: 'namaz-tracker-548e5.firebasestorage.app',
  messagingSenderId: '77886231173',
  appId: '1:77886231173:web:c32fcd9bfac6ebeb4e8fec',
  measurementId: 'G-CB21RK14LN',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Firestore
export const db = getFirestore(app);

export default app;
