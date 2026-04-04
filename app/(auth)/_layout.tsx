import { useTheme } from "@/contexts/ThemeContext";
import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  const c = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade", contentStyle: { backgroundColor: c.background } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
