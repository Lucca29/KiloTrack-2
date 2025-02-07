import { auth } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const signOut = async () => {
  try {
    // Déconnexion de Firebase
    await auth.signOut();
    
    // Effacer les identifiants stockés
    await AsyncStorage.multiRemove([
      'userEmail',
      'userPassword',
      'rememberMe'
    ]);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return false;
  }
}; 