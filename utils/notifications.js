import * as Notifications from 'expo-notifications';

// Configuration du gestionnaire de notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Fonction pour programmer la notification de rappel kilométrage
export const setupKilometersReminder = async () => {
  // Annuler les notifications existantes pour éviter les doublons
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Programmer la nouvelle notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Milesio - Rappel",
      body: "N'oubliez pas de mettre à jour vos kilomètres",
      sound: 'default',
      priority: 'high',
    },
    trigger: {
      seconds: 60 * 60 * 24 * 3, // 3 jours en secondes
      repeats: true, // Pour que ça se répète
    },
  });
};

// Version de test (30 secondes au lieu de 3 jours)
export const testKilometersReminder = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Milesio - Rappel",
      body: "N'oubliez pas de mettre à jour vos kilomètres",
      sound: 'default',
    },
    trigger: {
      seconds: 30, // Pour tester
      repeats: true,
    },
  });
}; 