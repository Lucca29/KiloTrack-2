import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await AsyncStorage.setItem('darkMode', newMode.toString());
  };

  // Couleurs pour chaque mode
  const theme = {
    isDarkMode,
    isThemeLoaded,
    colors: isDarkMode ? {
      background: '#1A1A1A',
      text: '#F8F7FF',
      primary: '#9381FF',
      secondary: '#FFD8BE',
      card: '#2A2A2A',
      border: '#333333'
    } : {
      background: '#9381FF',
      text: '#F8F7FF',
      primary: '#9381FF',
      secondary: '#FFD8BE',
      card: '#FFFFFF',
      border: '#E5E5E5'
    }
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('darkMode');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'true');
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      } finally {
        setIsThemeLoaded(true);
      }
    };
    
    loadTheme();
  }, []);

  if (!isThemeLoaded) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: isDarkMode ? '#1A1A1A' : '#9381FF' 
      }} />
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);