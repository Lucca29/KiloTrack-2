import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import LoginScreen from './app/index';
import HomeScreen from './screens/HomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import { NavigationProvider } from './NavigationContext';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence, indexedDBLocalPersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  // Vos configurations Firebase
  apiKey: "AIzaSyD7GTlLs44FHTAZ29YNRONMs46_-FKShdw",
  authDomain: "drivetrack-ba7a4.firebaseapp.com",
  databaseURL: "https://drivetrack-ba7a4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "drivetrack-ba7a4",
  storageBucket: "drivetrack-ba7a4.firebasestorage.app",
  messagingSenderId: "1014865470427",
  appId: "1:1014865470427:web:eea854b59542f79104fdfe",
  measurementId: "G-CS5KYCV0SF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Utiliser indexedDBLocalPersistence pour mobile
if (Platform.OS !== 'web') {
  setPersistence(auth, indexedDBLocalPersistence);
}

// Composant de routage simple qui n'utilise pas de hook
function ScreenRenderer({ currentScreen }) {
  console.log('Rendu de l\'écran:', currentScreen);
  
  switch (currentScreen) {
    case 'Register':
      return <RegisterScreen />;
    case 'Home':
      return <HomeScreen />;
    default:
      return <LoginScreen />;
  }
}

// Composant principal
function AppContent() {
  return (
    <View style={styles.container}>
      <NavigationProvider>
        <ScreenRenderer currentScreen="Login" />
      </NavigationProvider>
    </View>
  );
}

// Export par défaut
export default function App() {
  console.log('Initialisation de App');
  return <AppContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9381FF'
  }
}); 