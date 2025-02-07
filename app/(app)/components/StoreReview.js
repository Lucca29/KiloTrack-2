import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking, Platform } from 'react-native';

export const requestReview = async () => {
  try {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) {
      console.log('Store review not available');
      return;
    }

    // Vérification supplémentaire pour iOS
    if (Platform.OS === 'ios') {
      const hasAction = await StoreReview.hasAction();
      if (!hasAction) {
        console.log('No review action available');
        return;
      }
    }

    const lastReviewRequest = await AsyncStorage.getItem('lastReviewRequest');
    
    if (lastReviewRequest) {
      const daysSinceLastRequest = (new Date() - new Date(lastReviewRequest)) / (1000 * 60 * 60 * 24);
      if (daysSinceLastRequest < 60) {
        return;
      }
    }

    await AsyncStorage.setItem('lastReviewRequest', new Date().toISOString());
    await StoreReview.requestReview();
  } catch (error) {
    console.log('Error requesting review:', error);
  }
};

// Fonction pour réinitialiser le statut
export const resetReviewStatus = async () => {
  try {
    await AsyncStorage.removeItem('hasRated');
    await AsyncStorage.removeItem('lastReviewRequest');
    console.log('Review status reset successfully'); // Debug log
  } catch (error) {
    console.log('Error resetting review status:', error);
  }
};

// Fonction principale pour afficher le popup
export const showReviewPrompt = async () => {
  try {
    Alert.alert(
      'Vous aimez Milesio ?',
      'Nous travaillons dur pour vous offrir une application gratuite et fonctionnelle. N\'hésitez pas à nous laisser un avis !',
      [
        {
          text: 'Plus tard',
          style: 'cancel',
          onPress: () => AsyncStorage.setItem('lastReviewRequest', new Date().toISOString())
        },
        {
          text: 'Noter',
          onPress: async () => {
            await AsyncStorage.setItem('hasRated', 'true');
            if (Platform.OS === 'ios') {
              Linking.openURL('https://apps.apple.com/fr/app/milesio-trackeur-kilom%C3%A8tres/id6740035886?action=write-review');
            }
          }
        }
      ]
    );
  } catch (error) {
    console.log('Erreur:', error);
  }
};

// Fonction pour vérifier et afficher la review dans les stats
export const checkShowReviewInStats = async () => {
  try {
    const hasRated = await AsyncStorage.getItem('hasRated');
    if (hasRated === 'true') {
      return;
    }

    const lastReviewRequest = await AsyncStorage.getItem('lastReviewRequest');
    if (lastReviewRequest) {
      const daysSinceLastRequest = (new Date() - new Date(lastReviewRequest)) / (1000 * 60 * 60 * 24);
      if (daysSinceLastRequest < 7) {
        return;
      }
    }

    const random = Math.random();
    if (random < 1/3) {
      Alert.alert(
        'Vous aimez Milesio ?',
        'Nous travaillons dur pour vous offrir une application gratuite et fonctionnelle. N\'hésitez pas à nous laisser un avis !',
        [
          {
            text: 'Plus tard',
            style: 'cancel',
            onPress: () => AsyncStorage.setItem('lastReviewRequest', new Date().toISOString())
          },
          {
            text: 'Noter',
            onPress: async () => {
              await AsyncStorage.setItem('hasRated', 'true');
              if (Platform.OS === 'ios') {
                Linking.openURL('https://apps.apple.com/fr/app/milesio-trackeur-kilom%C3%A8tres/id6740035886?action=write-review');
              }
            }
          }
        ]
      );
    }
  } catch (error) {
    console.log('Error in checkShowReviewInStats:', error);
  }
};

// Fonction pour le bouton "Donnez votre avis"
export const testReviewPrompt = async () => {
  try {
    Alert.alert(
      'Vous aimez Milesio ?',
      'Nous travaillons dur pour vous offrir une application gratuite et fonctionnelle. N\'hésitez pas à nous laisser un avis !',
      [
        {
          text: 'Plus tard',
          style: 'cancel'
        },
        {
          text: 'Noter',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('https://apps.apple.com/fr/app/milesio-trackeur-kilom%C3%A8tres/id6740035886?action=write-review');
            }
          }
        }
      ]
    );
  } catch (error) {
    console.log('Error requesting review:', error);
  }
}; 