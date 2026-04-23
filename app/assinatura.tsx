import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

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
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refreshProfile();
    }, [refreshProfile])
  );

  const trialEnds = formatTrialEnd(user?.trialEndsAt);
  const inTrial =
    user?.trialEndsAt && new Date(user.trialEndsAt) > new Date();

  async function onRefresh() {
    setRefreshing(true);
    try {
      await refreshProfile();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: c.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
          tintColor={c.tint}
        />
      }
    >
      <View style={[styles.iconWrap, { backgroundColor: c.tint + "18" }]}>
        <Feather name="user-x" size={40} color={c.tint} />
      </View>
      <Text style={[styles.title, { color: c.text }]}>Conta sem acesso ativo</Text>
      <Text style={[styles.sub, { color: c.textMuted }]}>
        {inTrial
          ? `Seu teste gratuito vai até ${trialEnds}. Use uma conta com plano ativo ou ative a assinatura no site do Converso com o mesmo e-mail.`
          : "O período de teste encerrou ou esta conta ainda não tem plano ativo. No site do Converso, ative ou renove a assinatura com o mesmo e-mail e volte aqui."}
      </Text>
      <Text style={[styles.hint, { color: c.textSecondary }]}>
        Depois de ativar no site, puxe a tela para baixo ou use Atualizar para validar o acesso.
      </Text>
      <Button
        label="Atualizar"
        onPress={() => void onRefresh()}
        loading={refreshing}
      />
      <View style={{ height: 12 }} />
      <Button label="Sair da conta" onPress={() => void logout()} color={c.textMuted} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    flexGrow: 1,
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
    marginBottom: 12,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 28,
  },
});
