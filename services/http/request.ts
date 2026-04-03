import type { AxiosRequestConfig } from "axios";
import { api } from "./client";

export function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return api.get<T>(url, config).then((response) => response.data);
}

export function post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return api.post<T>(url, body, config).then((response) => response.data);
}

export function patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return api.patch<T>(url, body, config).then((response) => response.data);
}

export function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return api.delete<T>(url, config).then((response) => response.data);
}
