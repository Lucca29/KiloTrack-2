import { ThemeProvider } from '../../app/context/ThemeContext';
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{
        headerShown: false,  // Cache le header par défaut
        contentStyle: {
          backgroundColor: 'transparent'
        }
      }}>
        <Stack.Screen 
          name="dashboard" 
          options={{
            headerShown: false,
            animation: 'fade'
          }}
        />
        {/* autres screens */}
      </Stack>
    </ThemeProvider>
  );
} 