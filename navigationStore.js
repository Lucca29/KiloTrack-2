let currentScreen = 'Login';
let listeners = new Set();

export const NavigationStore = {
  getCurrentScreen: () => {
    console.log('Récupération écran actuel:', currentScreen);
    return currentScreen;
  },
  
  navigate: (screenName) => {
    console.log('Demande de navigation vers:', screenName);
    if (currentScreen === screenName) {
      console.log('Déjà sur cet écran');
      return;
    }
    
    currentScreen = screenName;
    console.log('Écran mis à jour vers:', currentScreen);
    
    // Notification synchrone des listeners
    console.log('Notification de', listeners.size, 'listeners');
    listeners.forEach(listener => {
      try {
        listener(currentScreen);
      } catch (error) {
        console.error('Erreur dans un listener:', error);
      }
    });
  },
  
  addListener: (listener) => {
    console.log('Ajout d\'un nouveau listener');
    listeners.add(listener);
    console.log('Nombre de listeners:', listeners.size);
    
    // Retourne la fonction de nettoyage
    return () => {
      console.log('Suppression d\'un listener');
      listeners.delete(listener);
      console.log('Listeners restants:', listeners.size);
    };
  }
}; 