import React from 'react';
import { View, StyleSheet } from 'react-native';
import LoginScreen from './app/index';
import HomeScreen from './screens/HomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import { NavigationProvider } from './NavigationContext';

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