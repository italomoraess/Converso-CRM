import { del, get, patch, post } from "../http/request";
import type { ApiAppointment } from "../types/api";

export const appointmentsApi = {
  list: (query?: Record<string, string>) =>
    get<ApiAppointment[]>("/appointments", query ? { params: query } : undefined),

  upcoming: () => get<ApiAppointment[]>("/appointments/upcoming"),

  byDate: (date: string) =>
    get<ApiAppointment[]>(`/appointments/date/${encodeURIComponent(date)}`),

  create: (body: Record<string, unknown>) =>
    post<ApiAppointment>("/appointments", body),

  update: (id: string, body: Record<string, unknown>) =>
    patch<ApiAppointment>(`/appointments/${id}`, body),

  remove: (id: string) => del<unknown>(`/appointments/${id}`),

  complete: (id: string) =>
    patch<ApiAppointment>(`/appointments/${id}/complete`),
};
