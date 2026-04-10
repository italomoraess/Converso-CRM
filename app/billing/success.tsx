import { router } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { ScreenSpinner } from "@/components/Spinner";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function BillingSuccessScreen() {
  const c = useTheme();
  const { refreshProfile } = useAuth();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await refreshProfile();
      if (!cancelled) {
        router.replace("/(tabs)/home");
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
