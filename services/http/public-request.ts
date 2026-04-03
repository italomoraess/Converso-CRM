import type { AxiosRequestConfig } from "axios";
import { publicClient } from "./client";

export function publicGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return publicClient.get<T>(url, config).then((response) => response.data);
}

export function publicPost<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return publicClient.post<T>(url, body, config).then((response) => response.data);
}
