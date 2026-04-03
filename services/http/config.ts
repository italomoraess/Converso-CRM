export const ACCESS_TOKEN_KEY = "@converso_access_token";
export const REFRESH_TOKEN_KEY = "@converso_refresh_token";
export const USER_KEY = "@converso_user";

export function getBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
}
