import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StatusBar, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const isExpoGo = Constants.appOwnership === 'expo';
        
        if (!isExpoGo) {
          const { auth } = await import('../firebaseConfig');
          const { setPersistence, browserLocalPersistence } = await import('firebase/auth');
          await setPersistence(auth, browserLocalPersistence);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur d\'initialisation:', error);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.rootContainer}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="#9381FF"
          translucent={Platform.OS === 'android'}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD8BE" />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaProvider style={styles.rootContainer}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#9381FF"
        translucent={Platform.OS === 'android'}
      />
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: styles.contentStyle,
            animation: 'none',
            fullScreenGestureEnabled: false,
          }}
        >
          <Stack.Screen 
            name="(auth)" 
            options={{ 
              headerShown: false,
              gestureEnabled: false,
            }} 
          />
          <Stack.Screen 
            name="(app)" 
            options={{ 
              headerShown: false,
              gestureEnabled: false,
            }} 
          />
          <Stack.Screen 
            name="index" 
            options={{ 
              headerShown: false,
              gestureEnabled: false,
            }} 
          />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#9381FF',
  },
  container: {
    flex: 1,
    backgroundColor: '#9381FF',
  },
  contentStyle: {
    flex: 1,
    backgroundColor: '#9381FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9381FF',
  },
}); 