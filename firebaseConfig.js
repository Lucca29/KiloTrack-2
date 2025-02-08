import './polyfills';
import { initializeApp, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Vérifier si l'app n'est pas déjà initialisée
let app;
try {
  app = initializeApp({
    apiKey: "AIzaSyD7GTlLs44FHTAZ29YNRONMs46_-FKShdw",
    authDomain: "drivetrack-ba7a4.firebaseapp.com",
    databaseURL: "https://drivetrack-ba7a4-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "drivetrack-ba7a4",
    storageBucket: "drivetrack-ba7a4.firebasestorage.app",
    messagingSenderId: "1014865470427",
    appId: "1:1014865470427:web:eea854b59542f79104fdfe",
    measurementId: "G-CS5KYCV0SF"
  });
} catch (error) {
  app = getApp();
}

// Initialiser Auth avec la persistance
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  auth = getAuth(app);
}

// Initialiser Firestore
const firestore = getFirestore(app);

export { auth, firestore };