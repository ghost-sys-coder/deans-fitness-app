import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import {
  defaultThemeName,
  isThemeName,
  themes,
  type AppTheme,
  type ThemeName,
  type ThemeTokens,
} from './themes';

const THEME_STORAGE_KEY = 'deans-fitness:selected-theme';

type ThemeContextValue = {
  theme: AppTheme;
  themeName: ThemeName;
  tokens: ThemeTokens;
  setTheme: (themeName: ThemeName) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(defaultThemeName);

  useEffect(() => {
    let isMounted = true;

    async function loadStoredTheme() {
      const storedThemeName = await AsyncStorage.getItem(THEME_STORAGE_KEY);

      if (isMounted && storedThemeName && isThemeName(storedThemeName)) {
        setThemeName(storedThemeName);
      }
    }

    void loadStoredTheme();

    return () => {
      isMounted = false;
    };
  }, []);

  async function setTheme(nextThemeName: ThemeName) {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, nextThemeName);
    setThemeName(nextThemeName);
  }

  const theme = themes[themeName];
  const value: ThemeContextValue = {
    theme,
    themeName,
    tokens: theme.tokens,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider.');
  }

  return context;
}
