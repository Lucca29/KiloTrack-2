import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StatusBar, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeProvider } from './context/ThemeContext';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LinearGradient
          colors={['#9381FF', '#B8B8FF', '#9381FF']}
          style={[StyleSheet.absoluteFill]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <SafeAreaProvider>
          <StatusBar 
            barStyle="light-content" 
            backgroundColor="transparent"
            translucent={true}
          />
          <View style={StyleSheet.absoluteFill}>
            <SafeAreaView 
              style={[
                styles.container, 
                Platform.OS === 'android' && { paddingTop: StatusBar.currentHeight / 2 }
              ]} 
              edges={['right', 'left']}
            >
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: styles.contentStyle,
                  animation: 'none',
                }}
              >
                <Stack.Screen 
                  name="(auth)" 
                  options={{ 
                    headerShown: false,
                    gestureEnabled: false,
                  }} 
                />
                <Stack.Screen 
                  name="(app)" 
                  options={{ 
                    headerShown: false,
                    gestureEnabled: false,
                  }} 
                />
                <Stack.Screen 
                  name="index" 
                  options={{ 
                    headerShown: false,
                    gestureEnabled: false,
                  }} 
                />
              </Stack>
            </SafeAreaView>
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentStyle: {
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
}); 