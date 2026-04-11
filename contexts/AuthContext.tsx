import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import * as authService from "@/services/auth/auth.service";
import type { AuthUser } from "@/services/auth/auth.types";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
} from "@/services/http/config";

export type { AuthUser };

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem(ACCESS_TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);
      if (token && userStr) {
        setUser(JSON.parse(userStr));
        try {
          const profile = await authService.refreshProfile();
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(profile));
          setUser(profile);
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  async function refreshProfile() {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return null;
    try {
      const profile = await authService.refreshProfile();
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(profile));
      setUser(profile);
      return profile;
    } catch {
      return null;
    }
  }

  async function persistSession(
    tokens: { accessToken: string; refreshToken: string },
    userObj: AuthUser
  ) {
    await Promise.all([
      AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken),
      AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(userObj)),
    ]);
    setUser(userObj);
  }

  async function login(email: string, password: string) {
    const session = await authService.login(email, password);
    await persistSession(
      { accessToken: session.accessToken, refreshToken: session.refreshToken },
      session.user
    );
  }

  async function register(email: string, password: string, name?: string) {
    const session = await authService.register(email, password, name);
    await persistSession(
      { accessToken: session.accessToken, refreshToken: session.refreshToken },
      session.user
    );
  }

  async function logout() {
    try {
      const [token, refreshToken] = await Promise.all([
        AsyncStorage.getItem(ACCESS_TOKEN_KEY),
        AsyncStorage.getItem(REFRESH_TOKEN_KEY),
      ]);
      if (token && refreshToken) {
        await authService.logout(token, refreshToken);
      }
    } catch {
      /* ignore */
    } finally {
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
