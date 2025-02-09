import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import { auth } from '../firebaseConfig';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import { useTheme } from '../app/context/ThemeContext';

export default function Layout() {
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const initAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        
        const unsubscribe = auth.onAuthStateChanged((user) => {
          setIsLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Erreur d\'initialisation:', error);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.rootContainer, { 
        backgroundColor: theme?.isDarkMode ? '#1A1A1A' : '#9381FF' 
      }]}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor={theme?.isDarkMode ? '#1A1A1A' : '#9381FF'} 
        />
        <View style={[styles.loadingContainer, { 
          backgroundColor: theme?.isDarkMode ? '#1A1A1A' : '#9381FF' 
        }]}>
          <ActivityIndicator size="large" color="#FFD8BE" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.rootContainer, { 
      backgroundColor: theme?.isDarkMode ? '#1A1A1A' : '#9381FF' 
    }]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={theme?.isDarkMode ? '#1A1A1A' : '#9381FF'} 
      />
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          contentStyle: [styles.contentStyle, { 
            backgroundColor: theme?.isDarkMode ? '#1A1A1A' : '#9381FF' 
          }],
          animation: 'fade',
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
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  contentStyle: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 