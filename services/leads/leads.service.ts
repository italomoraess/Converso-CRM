import { del, get, patch, post } from "../http/request";
import type { ApiLead } from "../types/api";

export const leadsApi = {
  list: () => get<ApiLead[]>("/leads"),

  getById: (id: string) => get<ApiLead>(`/leads/${id}`),

  create: (body: Record<string, unknown>) => post<ApiLead>("/leads", body),

  update: (id: string, body: Record<string, unknown>) =>
    patch<ApiLead>(`/leads/${id}`, body),

  remove: (id: string) => del<unknown>(`/leads/${id}`),

  updateStage: (id: string, body: Record<string, unknown>) =>
    patch<ApiLead>(`/leads/${id}/stage`, body),
};
