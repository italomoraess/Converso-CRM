import { post } from "../http/request";

export async function createCheckoutSession(): Promise<{ url: string }> {
  return post<{ url: string }>("/billing/checkout-session");
}
