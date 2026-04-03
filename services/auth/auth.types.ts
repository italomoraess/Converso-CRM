export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  plan?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession extends AuthTokens {
  user: AuthUser;
}
