import React, {createContext, useContext, useState, useEffect} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {lightTheme, darkTheme} from './colors';

const THEME_STORAGE_KEY = '@app_theme_preference';

// Theme Context
const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  colors: lightTheme,
  setTheme: () => {},
  toggleTheme: () => {},
});

// Theme Provider Component
export const ThemeProvider = ({children}) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState('system'); // 'light' | 'dark' | 'system'
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setThemeState(savedTheme);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Determine if dark mode based on theme setting
  const isDark =
    theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');

  // Get current colors
  const colors = isDark ? darkTheme : lightTheme;

  // Set theme and persist
  const setTheme = async newTheme => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const value = {
    theme,
    isDark,
    colors,
    setTheme,
    toggleTheme,
  };

  // Don't render until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
