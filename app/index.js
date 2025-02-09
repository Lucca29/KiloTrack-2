import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { auth } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useTheme } from '../app/context/ThemeContext';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const { checkAuth } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Vérifier si on est dans Expo Go
        const isExpoGo = Constants.appOwnership === 'expo';
        
        if (isExpoGo) {
          // Dans Expo Go, on se fie uniquement à AsyncStorage
          const userData = await AsyncStorage.getItem('userData');
          if (userData) {
            console.log('Utilisateur trouvé dans AsyncStorage:', userData);
            router.replace('/(app)/dashboard');
            return;
          }
        } else {
          // En dev build ou production, on utilise Firebase Auth
          const isAuthenticated = await checkAuth();
          if (isAuthenticated) {
            router.replace('/(app)/dashboard');
            return;
          }
        }

        // Si aucune authentification n'est trouvée
        router.replace('/(auth)/login');
        
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        router.replace('/(auth)/login');
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: theme.isDarkMode ? '#1A1A1A' : '#9381FF'
      }}>
        <ActivityIndicator size="large" color={theme.isDarkMode ? '#FFD8BE' : '#FFFFFF'} />
      </View>
    );
  }

  return null;
}
