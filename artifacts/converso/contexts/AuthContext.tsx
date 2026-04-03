import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "@/services/api";

const BASE_URL = () => process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  plan?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
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
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
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
    const res = await fetch(`${BASE_URL()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(
        typeof json.message === "string"
          ? json.message
          : Array.isArray(json.message)
          ? json.message[0]
          : "Email ou senha incorretos"
      );
    }
    await persistSession(
      { accessToken: json.data.accessToken, refreshToken: json.data.refreshToken },
      json.data.user
    );
  }

  async function register(email: string, password: string, name?: string) {
    const body: Record<string, string> = { email, password };
    if (name?.trim()) body.name = name.trim();

    const res = await fetch(`${BASE_URL()}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(
        typeof json.message === "string"
          ? json.message
          : Array.isArray(json.message)
          ? json.message[0]
          : "Erro ao criar conta"
      );
    }
    await persistSession(
      { accessToken: json.data.accessToken, refreshToken: json.data.refreshToken },
      json.data.user
    );
  }

  async function logout() {
    try {
      const [token, refreshToken] = await Promise.all([
        AsyncStorage.getItem(ACCESS_TOKEN_KEY),
        AsyncStorage.getItem(REFRESH_TOKEN_KEY),
      ]);
      if (token && refreshToken) {
        await fetch(`${BASE_URL()}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // ignore logout api errors
    } finally {
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, login, register, logout }}
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
