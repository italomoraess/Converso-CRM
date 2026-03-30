import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { Colors, ColorScheme } from "@/constants/colors";

type ThemeMode = "system" | "light" | "dark";

interface ThemeContextType {
  theme: "light" | "dark";
  mode: ThemeMode;
  colors: ColorScheme;
  toggleTheme: () => void;
}

const THEME_KEY = "@converso_theme_mode";

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === "light" || saved === "dark" || saved === "system") {
        setMode(saved);
      }
    });
  }, []);

  const theme: "light" | "dark" =
    mode === "system" ? (systemScheme ?? "light") : mode;

  const colors = Colors[theme];

  const toggleTheme = useCallback(() => {
    const next = theme === "light" ? "dark" : "light";
    setMode(next);
    AsyncStorage.setItem(THEME_KEY, next);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, mode, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ColorScheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx.colors;
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeProvider");
  return { theme: ctx.theme, mode: ctx.mode, toggleTheme: ctx.toggleTheme };
}
