import type { AxiosError } from "axios";

export function getApiErrorMessage(json: unknown): string {
  if (!json || typeof json !== "object") return "Erro ao processar requisição";
  const err = json as { message?: string | string[] };
  if (typeof err.message === "string") return err.message;
  if (Array.isArray(err.message) && err.message[0]) return err.message[0];
  return "Erro ao processar requisição";
}

export function getAxiosErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "isAxiosError" in error) {
    const ax = error as AxiosError<{ message?: string | string[] }>;
    if (ax.response?.data) return getApiErrorMessage(ax.response.data);
    if (typeof ax.message === "string") return ax.message;
  }
  if (error instanceof Error) return error.message;
  return "Erro ao processar requisição";
}
