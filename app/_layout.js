import { Stack } from 'expo-router';
import { View } from 'react-native';
import { ThemeProvider } from '../app/context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '../app/context/ThemeContext';

function StackLayout() {
  const { theme } = useTheme();
  
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: theme?.isDarkMode ? '#1A1A1A' : '#9381FF' 
    }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { 
            backgroundColor: theme?.isDarkMode ? '#1A1A1A' : '#9381FF' 
          },
          animation: 'none',
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <StackLayout />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
} 