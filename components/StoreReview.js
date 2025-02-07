import { Platform } from 'react-native';
import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const requestReview = async () => {
  try {
    // Vérifier si l'appareil peut laisser un avis
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) {
      return;
    }

    // Vérifier si on a déjà demandé un avis
    const lastReviewRequest = await AsyncStorage.getItem('lastReviewRequest');
    
    if (lastReviewRequest) {
      const daysSinceLastRequest = (new Date() - new Date(lastReviewRequest)) / (1000 * 60 * 60 * 24);
      if (daysSinceLastRequest < 60) { // Ne pas redemander avant 60 jours
        return;
      }
    }

    // Sauvegarder la date de la demande
    await AsyncStorage.setItem('lastReviewRequest', new Date().toISOString());
    
    // Demander l'avis
    await StoreReview.requestReview();
  } catch (error) {
    console.log('Error requesting review:', error);
  }
};

export const testReviewPrompt = async () => {
  try {
    const isAvailable = await StoreReview.isAvailableAsync();
    console.log('Review disponible:', isAvailable);
    
    if (isAvailable) {
      await StoreReview.requestReview();
      console.log('Review demandé avec succès');
    }
  } catch (error) {
    console.log('Erreur:', error);
  }
}; 