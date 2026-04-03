import axios from "axios";
import { getApiErrorMessage } from "../http/errors";
import { publicGet, publicPost } from "../http/public-request";
import type { AuthSession, AuthUser } from "./auth.types";

type NestBody<T> = { data: T; message?: string };

export async function login(email: string, password: string): Promise<AuthSession> {
  try {
    const wrapper = await publicPost<NestBody<AuthSession>>("/auth/login", {
      email,
      password,
    });
    return wrapper.data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data) {
      throw new Error(getApiErrorMessage(e.response.data) || "Email ou senha incorretos");
    }
    throw e instanceof Error ? e : new Error("Email ou senha incorretos");
  }
}

export async function register(
  email: string,
  password: string,
  name?: string
): Promise<AuthSession> {
  const body: Record<string, string> = { email, password };
  if (name?.trim()) body.name = name.trim();
  try {
    const wrapper = await publicPost<NestBody<AuthSession>>("/auth/register", body);
    return wrapper.data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data) {
      throw new Error(getApiErrorMessage(e.response.data) || "Erro ao criar conta");
    }
    throw e instanceof Error ? e : new Error("Erro ao criar conta");
  }
}

export async function logout(accessToken: string, refreshToken: string): Promise<void> {
  try {
    await publicPost<unknown>(
      "/auth/logout",
      { refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  } catch {
    /* ignore */
  }
}

export async function getProfile(accessToken: string): Promise<AuthUser> {
  const wrapper = await publicGet<NestBody<AuthUser>>("/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return wrapper.data;
}
