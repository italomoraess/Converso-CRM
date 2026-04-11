import { post } from "../http/request";

export async function createCheckoutSession(): Promise<{ url: string }> {
  return post<{ url: string }>("/billing/checkout-session");
}

export async function cancelSubscriptionAtPeriodEnd(): Promise<{
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string;
}> {
  return post("/billing/cancel-subscription");
}

export async function reactivateSubscription(): Promise<{
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string;
}> {
  return post("/billing/reactivate-subscription");
}
