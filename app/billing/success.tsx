import { router, type Href } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { ScreenSpinner } from "@/components/Spinner";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { waitForBillingAccess } from "@/services/billing/waitForAccess";

export default function BillingSuccessScreen() {
  const c = useTheme();
  const { refreshProfile } = useAuth();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const ok = await waitForBillingAccess(refreshProfile);
      if (cancelled) return;
      if (ok) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/assinatura" as Href);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshProfile]);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScreenSpinner backgroundColor={c.background} color={c.tint} />
    </View>
  );
}
