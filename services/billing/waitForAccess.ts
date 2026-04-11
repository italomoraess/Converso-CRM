import type { AuthUser } from "@/services/auth/auth.types";

export async function waitForBillingAccess(
  refreshProfile: () => Promise<AuthUser | null>,
  maxMs = 45000,
  intervalMs = 1200
): Promise<boolean> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    const profile = await refreshProfile();
    if (profile?.hasAccess) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}
