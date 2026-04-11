export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  plan?: string;
  trialEndsAt?: string;
  stripeSubscriptionStatus?: string | null;
  hasAccess?: boolean;
  subscriptionCancelAtPeriodEnd?: boolean;
  subscriptionPeriodEnd?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession extends AuthTokens {
  user: AuthUser;
}
