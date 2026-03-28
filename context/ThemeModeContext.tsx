import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";

import {
  AppTheme,
  ThemeMode,
  ThemeName,
  createTheme,
  resolveThemeName,
} from "../config/theme";

const THEME_MODE_KEY = "app_theme_mode_v1";

type ThemeModeContextValue = {
  mode: ThemeMode;
  themeName: ThemeName;
  theme: AppTheme;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    AsyncStorage.getItem(THEME_MODE_KEY)
      .then((storedMode) => {
        if (storedMode === "light" || storedMode === "dark" || storedMode === "system") {
          setMode(storedMode);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const themeName = useMemo(
    () => resolveThemeName(mode, systemScheme),
    [mode, systemScheme]
  );
  const theme = useMemo(() => createTheme(themeName), [themeName]);

  const setThemeMode = async (nextMode: ThemeMode) => {
    setMode(nextMode);
    await AsyncStorage.setItem(THEME_MODE_KEY, nextMode);
  };

  const value = useMemo(
    () => ({
      mode,
      themeName,
      theme,
      setThemeMode,
    }),
    [mode, themeName, theme]
  );

  return (
    <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used inside ThemeModeProvider");
  }

  return context;
}

export function useAppTheme() {
  return useThemeMode().theme;
}
