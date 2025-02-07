import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const [currentScreen, setCurrentScreen] = useState('Login');

  const navigate = (screenName) => {
    console.log('Navigation vers:', screenName);
    setCurrentScreen(screenName);
  };

  const value = {
    currentScreen,
    navigate
  };

  return (
    <NavigationContext.Provider value={value}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { currentScreen });
        }
        return child;
      })}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation doit être utilisé dans un NavigationProvider');
  }
  return context;
} 