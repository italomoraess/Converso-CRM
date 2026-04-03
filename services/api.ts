import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export const ACCESS_TOKEN_KEY = "@converso_access_token";
export const REFRESH_TOKEN_KEY = "@converso_refresh_token";
export const USER_KEY = "@converso_user";

function getBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
}

async function tryRefreshTokens(): Promise<string | null> {
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${getBaseUrl()}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, json.data.accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, json.data.refreshToken);
    return json.data.accessToken;
  } catch {
    return null;
  }
}

async function doRequest(path: string, options: RequestInit, token: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${getBaseUrl()}${path}`, { ...options, headers });
}

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  let token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);

  let res = await doRequest(path, options, token);

  if (res.status === 401) {
    token = await tryRefreshTokens();
    if (token) {
      res = await doRequest(path, options, token);
    } else {
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
      router.replace("/(auth)/login");
      throw new Error("Sessão expirada. Faça login novamente.");
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Erro desconhecido" }));
    const msg =
      typeof err.message === "string"
        ? err.message
        : Array.isArray(err.message)
        ? err.message[0]
        : "Erro ao processar requisição";
    throw new Error(msg);
  }

  const json = await res.json();
  return json.data as T;
}
