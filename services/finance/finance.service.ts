import type { TransactionType } from "@/types";
import { del, get, patch, post } from "../http/request";
import type { ApiFinanceCategory, ApiTransaction } from "../types/api";

export const financeApi = {
  categories: {
    list: (type?: TransactionType) =>
      get<ApiFinanceCategory[]>("/finance/categories", {
        params: type ? { type } : undefined,
      }),
    create: (body: { name: string; type: TransactionType; color?: string }) =>
      post<ApiFinanceCategory>("/finance/categories", body),
    update: (id: string, body: { name?: string; color?: string }) =>
      patch<ApiFinanceCategory>(`/finance/categories/${id}`, body),
    remove: (id: string) => del<unknown>(`/finance/categories/${id}`),
  },

  transactions: {
    list: (query?: Record<string, string>) =>
      get<ApiTransaction[]>("/finance/transactions", { params: query }),
    create: (body: Record<string, unknown>) =>
      post<ApiTransaction>("/finance/transactions", body),
    update: (id: string, body: Record<string, unknown>) =>
      patch<ApiTransaction>(`/finance/transactions/${id}`, body),
    remove: (id: string) => del<unknown>(`/finance/transactions/${id}`),
  },

  summary: (month?: number, year?: number) => {
    const params: Record<string, string> = {};
    if (month != null) params.month = String(month);
    if (year != null) params.year = String(year);
    return get<unknown>("/finance/summary", { params });
  },
};
