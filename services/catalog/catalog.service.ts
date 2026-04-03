import { del, get, patch, post } from "../http/request";
import type { ApiCategory, ApiProduct } from "../types/api";

export const catalogApi = {
  categories: {
    list: () => get<ApiCategory[]>("/catalog/categories"),
    create: (body: { name: string }) =>
      post<ApiCategory>("/catalog/categories", body),
    update: (id: string, body: { name?: string }) =>
      patch<ApiCategory>(`/catalog/categories/${id}`, body),
    remove: (id: string) => del<unknown>(`/catalog/categories/${id}`),
  },

  products: {
    list: () => get<ApiProduct[]>("/catalog/products"),
    create: (body: Record<string, unknown>) =>
      post<ApiProduct>("/catalog/products", body),
    update: (id: string, body: Record<string, unknown>) =>
      patch<ApiProduct>(`/catalog/products/${id}`, body),
    remove: (id: string) => del<unknown>(`/catalog/products/${id}`),
  },

  leadProducts: {
    list: (leadId: string) => get<unknown[]>(`/leads/${leadId}/products`),
    link: (leadId: string, body: Record<string, unknown>) =>
      post<unknown>(`/leads/${leadId}/products`, body),
  },
};
