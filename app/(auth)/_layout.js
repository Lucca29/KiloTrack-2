import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useTheme } from '../../app/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function AuthLayout() {
  const { theme } = useTheme();
  
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={theme?.isDarkMode ? 
          ['#1A1A1A', '#2A2A2A'] : 
          ['#9381FF', '#B8B8FF', '#9381FF']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { 
            backgroundColor: 'transparent'
          },
          animation: 'none',
        }}
      />
    </View>
  );
} 