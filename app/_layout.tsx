import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Feather } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router, useSegments, type Href } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScreenSpinner } from "@/components/Spinner";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme, useThemeMode } from "@/contexts/ThemeContext";

SplashScreen.preventAutoHideAsync();

WebBrowser.maybeCompleteAuthSession();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { theme } = useThemeMode();
  const c = useTheme();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (authLoading) return;
    const seg0 = segments[0] as string | undefined;
    const inAuthGroup = seg0 === "(auth)";
    const inAssinatura = seg0 === "assinatura";
    const inBilling = seg0 === "billing";
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }
    if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/home");
      return;
    }
    const needsPaywall = user?.hasAccess === false;
    if (isAuthenticated && needsPaywall && !inAssinatura && !inBilling) {
      router.replace("/assinatura" as Href);
      return;
    }
    if (isAuthenticated && user?.hasAccess === true && inAssinatura) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, authLoading, segments, user?.hasAccess]);

  if (authLoading) {
    return (
      <>
        <StatusBar style={theme === "dark" ? "light" : "dark"} />
        <ScreenSpinner backgroundColor={c.background} color={c.tint} />
      </>
    );
  }

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background } }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="lead/new"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen name="lead/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="task/new"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen name="perdidos" options={{ headerShown: false }} />
        <Stack.Screen name="perfil" options={{ headerShown: false }} />
        <Stack.Screen name="assinatura" options={{ headerShown: false }} />
        <Stack.Screen name="billing/success" options={{ headerShown: false }} />
        <Stack.Screen name="billing/cancel" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    ...Feather.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <ThemeProvider>
                <AuthProvider>
                  <AppProvider>
                    <RootLayoutNav />
                  </AppProvider>
                </AuthProvider>
              </ThemeProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
