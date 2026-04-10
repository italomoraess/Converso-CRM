import { router, type Href } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { ScreenSpinner } from "@/components/Spinner";
import { useTheme } from "@/contexts/ThemeContext";

export default function BillingCancelScreen() {
  const c = useTheme();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/assinatura" as Href), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScreenSpinner backgroundColor={c.background} color={c.tint} />
    </View>
  );
}
