import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, useThemeMode } from "@/contexts/ThemeContext";
import { getAxiosErrorMessage } from "@/services/http/errors";
import * as billingService from "@/services/billing/billing.service";

function Row({
  icon,
  label,
  value,
  onPress,
  danger,
  c,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
  c: ReturnType<typeof useTheme>;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: c.borderLight }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.rowIconWrap, { backgroundColor: (danger ? "#ef4444" : c.tint) + "15" }]}>
        <Feather name={icon} size={18} color={danger ? "#ef4444" : c.tint} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: danger ? "#ef4444" : c.text }]}>{label}</Text>
        {value ? <Text style={[styles.rowValue, { color: c.textMuted }]}>{value}</Text> : null}
      </View>
      <Feather name="chevron-right" size={16} color={c.textMuted} />
    </TouchableOpacity>
  );
}

export default function PerfilScreen() {
  const c = useTheme();
  const { theme, toggleTheme } = useThemeMode();
  const insets = useSafeAreaInsets();
  const { user, logout, refreshProfile } = useAuth();

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [billingBusy, setBillingBusy] = useState(false);

  const initials = (user?.name ?? user?.email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSaveName() {
    if (!name.trim()) {
      setNameError("Nome não pode ser vazio.");
      return;
    }
    setSavingName(true);
    setNameError(null);
    try {
      await new Promise((r) => setTimeout(r, 400));
      setEditingName(false);
    } catch {
      setNameError("Erro ao salvar. Tente novamente.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleLogout() {
    await logout();
  }

  const stripeActive =
    user?.stripeSubscriptionStatus === "active" ||
    user?.stripeSubscriptionStatus === "trialing";
  const showProBilling = user?.plan === "pro" && stripeActive;
  const cancelScheduled = Boolean(user?.subscriptionCancelAtPeriodEnd);

  function formatPeriodEnd(iso?: string | null) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }

  function confirmCancelSubscription() {
    Alert.alert(
      "Cancelar assinatura",
      "Seu acesso ao Converso Pro continua até o fim do período já pago. Depois disso a conta volta ao plano gratuito.",
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Confirmar cancelamento",
          style: "destructive",
          onPress: () => void runCancelSubscription(),
        },
      ]
    );
  }

  async function runCancelSubscription() {
    setBillingBusy(true);
    try {
      const res = await billingService.cancelSubscriptionAtPeriodEnd();
      await refreshProfile();
      Alert.alert(
        "Cancelamento agendado",
        `Você mantém o Pro até ${formatPeriodEnd(res.currentPeriodEnd) || "a data indicada na fatura"}.`
      );
    } catch (e) {
      Alert.alert("Não foi possível cancelar", getAxiosErrorMessage(e));
    } finally {
      setBillingBusy(false);
    }
  }

  async function runReactivateSubscription() {
    setBillingBusy(true);
    try {
      await billingService.reactivateSubscription();
      await refreshProfile();
      Alert.alert("Assinatura mantida", "A renovação automática continua ativa.");
    } catch (e) {
      Alert.alert("Não foi possível reativar", getAxiosErrorMessage(e));
    } finally {
      setBillingBusy(false);
    }
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.headerWrap, { paddingTop: topPad, backgroundColor: c.tint }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Minha Conta</Text>
          <View style={{ width: 34 }} />
        </View>
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.scroll, { paddingBottom: 48 }]}
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        {/* Avatar + info */}
        <View style={[styles.profileCard, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: c.tint }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            {editingName ? (
              <View style={styles.editRow}>
                <TextInput
                  style={[
                    styles.nameInput,
                    { color: c.text, borderColor: c.border, backgroundColor: c.background },
                    Platform.OS === "web" && ({ outlineStyle: "none" } as any),
                  ]}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  autoCapitalize="words"
                  placeholder="Seu nome"
                  placeholderTextColor={c.textMuted}
                />
                <Button
                  size="icon"
                  icon="check"
                  onPress={handleSaveName}
                  loading={savingName}
                  accessibilityLabel="Salvar nome"
                />
                <TouchableOpacity
                  style={[styles.cancelBtn, { backgroundColor: c.border }]}
                  onPress={() => { setEditingName(false); setName(user?.name ?? ""); setNameError(null); }}
                >
                  <Feather name="x" size={16} color={c.textSecondary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.nameRow} onPress={() => setEditingName(true)}>
                <Text style={[styles.profileName, { color: c.text }]}>
                  {user?.name ?? "Sem nome"}
                </Text>
                {/* <Feather name="edit-2" size={13} color={c.textMuted} style={{ marginTop: 2 }} /> */}
              </TouchableOpacity>
            )}
            {nameError ? (
              <Text style={[styles.errorText, { color: c.danger }]}>{nameError}</Text>
            ) : null}
            <Text style={[styles.profileEmail, { color: c.textSecondary }]}>{user?.email}</Text>
            {user?.plan ? (
              <View style={[styles.planBadge, { backgroundColor: c.tint + "18" }]}>
                <Feather name="star" size={11} color={c.tint} />
                <Text style={[styles.planText, { color: c.tint }]}>{user.plan}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Preferências */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>PREFERÊNCIAS</Text>
          <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: "transparent" }]}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              <View style={[styles.rowIconWrap, { backgroundColor: c.tint + "15" }]}>
                <Feather name={theme === "dark" ? "sun" : "moon"} size={18} color={c.tint} />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, { color: c.text }]}>Tema</Text>
                <Text style={[styles.rowValue, { color: c.textMuted }]}>
                  {theme === "dark" ? "Escuro" : "Claro"}
                </Text>
              </View>
              <View style={[styles.toggleTrack, { backgroundColor: theme === "dark" ? c.tint : c.border }]}>
                <View style={[styles.toggleThumb, { transform: [{ translateX: theme === "dark" ? 18 : 0 }] }]} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {showProBilling ? (
          <View style={styles.sectionWrap}>
            <Text style={[styles.sectionLabel, { color: c.textMuted }]}>ASSINATURA</Text>
            <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
              {cancelScheduled ? (
                <>
                  <View style={[styles.row, { borderBottomColor: c.borderLight }]}>
                    <View style={[styles.rowIconWrap, { backgroundColor: c.tint + "15" }]}>
                      <Feather name="calendar" size={18} color={c.tint} />
                    </View>
                    <View style={styles.rowContent}>
                      <Text style={[styles.rowLabel, { color: c.text }]}>Cancelamento agendado</Text>
                      <Text style={[styles.rowValue, { color: c.textMuted }]}>
                        Acesso Pro até{" "}
                        {formatPeriodEnd(user?.subscriptionPeriodEnd ?? null) || "—"}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.row, { borderBottomColor: "transparent" }]}
                    onPress={() => void runReactivateSubscription()}
                    disabled={billingBusy}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.rowIconWrap, { backgroundColor: c.tint + "15" }]}>
                      <Feather name="refresh-ccw" size={18} color={c.tint} />
                    </View>
                    <View style={styles.rowContent}>
                      <Text style={[styles.rowLabel, { color: c.text }]}>
                        {billingBusy ? "Aguarde…" : "Manter assinatura"}
                      </Text>
                      <Text style={[styles.rowValue, { color: c.textMuted }]}>
                        Volta a renovar automaticamente
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={c.textMuted} />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.row, { borderBottomColor: "transparent" }]}
                  onPress={confirmCancelSubscription}
                  disabled={billingBusy}
                  activeOpacity={0.7}
                >
                  <View style={[styles.rowIconWrap, { backgroundColor: "#ef444418" }]}>
                    <Feather name="x-circle" size={18} color="#ef4444" />
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowLabel, { color: "#ef4444" }]}>
                      {billingBusy ? "Aguarde…" : "Cancelar assinatura"}
                    </Text>
                    <Text style={[styles.rowValue, { color: c.textMuted }]}>
                      Ao fim do período pago, volta ao plano gratuito
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : null}

        {/* Conta */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionLabel, { color: c.textMuted }]}>CONTA</Text>
          <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Row
              icon="lock"
              label="Alterar senha"
              value="••••••••"
              onPress={() => {}}
              c={c}
            />
            <Row
              icon="shield"
              label="Privacidade"
              onPress={() => {}}
              c={c}
            />
            <Row
              icon="help-circle"
              label="Suporte"
              onPress={() => {}}
              c={c}
            />
          </View>
        </View>

        {/* Sair */}
        <View style={styles.sectionWrap}>
          <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: "transparent" }]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={[styles.rowIconWrap, { backgroundColor: "#ef444418" }]}>
                <Feather name="log-out" size={18} color="#ef4444" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, { color: "#ef4444" }]}>Sair da conta</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {user?.plan && (
          <Text style={[styles.version, { color: c.textMuted }]}>
            Converso · Plano {user.plan}
          </Text>
        )}
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  headerWrap: { paddingBottom: 16 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backBtn: { padding: 6 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },

  scroll: { padding: 16, gap: 20 },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  profileInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  profileName: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  profileEmail: { fontSize: 13, fontFamily: "Inter_400Regular" },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 2,
  },
  planText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  editRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  nameInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cancelBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: { fontSize: 12, fontFamily: "Inter_400Regular" },

  sectionWrap: { gap: 6 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  rowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowContent: { flex: 1, gap: 1 },
  rowLabel: { fontSize: 15, fontWeight: "500", fontFamily: "Inter_500Medium" },
  rowValue: { fontSize: 12, fontFamily: "Inter_400Regular" },

  toggleTrack: {
    width: 40,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
  },

  version: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 4,
  },
});
