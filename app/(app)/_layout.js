import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function AppLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#9381FF' }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#9381FF' },
          animation: 'none',
        }}
      />
    </View>
  );
} 