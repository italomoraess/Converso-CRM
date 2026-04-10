import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import * as billingService from "@/services/billing/billing.service";

function formatTrialEnd(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AssinaturaScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const { user, refreshProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void refreshProfile();
    }, [refreshProfile])
  );

  const trialEnds = formatTrialEnd(user?.trialEndsAt);
  const inTrial =
    user?.trialEndsAt && new Date(user.trialEndsAt) > new Date();

  async function openCheckout() {
    setLoading(true);
    setError(null);
    try {
      const { url } = await billingService.createCheckoutSession();
      const result = await WebBrowser.openAuthSessionAsync(
        url,
        "converso://billing/success"
      );
      await refreshProfile();
      if (result.type === "success") {
        router.replace("/(tabs)/home");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível abrir o pagamento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, backgroundColor: c.background }]}>
      <View style={[styles.iconWrap, { backgroundColor: c.tint + "18" }]}>
        <Feather name="credit-card" size={40} color={c.tint} />
      </View>
      <Text style={[styles.title, { color: c.text }]}>Assinatura Converso</Text>
      <Text style={[styles.sub, { color: c.textMuted }]}>
        {inTrial
          ? `Seu teste gratuito vai até ${trialEnds}. Assine agora para não perder o acesso quando o período acabar.`
          : "Seu período de teste de 3 dias terminou. Assine para continuar usando o CRM."}
      </Text>
      {error ? (
        <Text style={[styles.err, { color: "#ef4444" }]}>{error}</Text>
      ) : null}
      <Button label="Assinar com cartão" onPress={openCheckout} loading={loading} />
      <View style={{ height: 12 }} />
      <Button label="Sair da conta" onPress={() => void logout()} color={c.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    alignSelf: "center",
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 12,
  },
  sub: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 28,
  },
  err: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
});
