import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { router, type Href } from "expo-router";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
  getBaseUrl,
} from "./config";
import { getApiErrorMessage } from "./errors";

type NestBody<T> = { data: T; message?: string };

function createBaseClient(): AxiosInstance {
  return axios.create({
    baseURL: getBaseUrl(),
    headers: { "Content-Type": "application/json" },
    timeout: 60_000,
  });
}

export const publicClient = createBaseClient();

export const api = createBaseClient();

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const ENVELOPE_KEYS = new Set(["data", "message", "success", "statusCode", "error"]);

function unwrapEnvelope(payload: unknown): unknown {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return payload;
  }
  const record = payload as Record<string, unknown>;
  if (!("data" in record)) {
    return payload;
  }
  const keys = Object.keys(record);
  if (keys.length === 0 || !keys.every((k) => ENVELOPE_KEYS.has(k))) {
    return payload;
  }
  return record.data;
}

api.interceptors.response.use(
  (response) => {
    response.data = unwrapEnvelope(response.data);
    return response;
  },
  async (error: AxiosError<NestBody<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 402) {
      router.replace("/assinatura" as Href);
      const data = error.response?.data;
      const msg = data && typeof data === "object" && "message" in data
        ? getApiErrorMessage(data)
        : "Assinatura necessária";
      return Promise.reject(new Error(msg));
    }

    if (error.response?.status !== 401 || originalRequest._retry || !originalRequest) {
      const data = error.response?.data;
      const msg = data && typeof data === "object" && "message" in data
        ? getApiErrorMessage(data)
        : error.message;
      return Promise.reject(new Error(msg));
    }

    originalRequest._retry = true;
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
      router.replace("/(auth)/login");
      return Promise.reject(new Error("Sessão expirada. Faça login novamente."));
    }

    try {
      const refreshRes = await publicClient.post<NestBody<{ accessToken: string; refreshToken: string }>>(
        "/auth/refresh",
        { refreshToken }
      );
      const inner = refreshRes.data.data;
      if (!inner?.accessToken || !inner?.refreshToken) {
        throw new Error("Refresh inválido");
      }
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, inner.accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, inner.refreshToken);
      originalRequest.headers.Authorization = `Bearer ${inner.accessToken}`;
      return api(originalRequest);
    } catch {
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
      router.replace("/(auth)/login");
      return Promise.reject(new Error("Sessão expirada. Faça login novamente."));
    }
  }
);
