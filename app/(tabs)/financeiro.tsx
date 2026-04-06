import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SkeletonFinance } from "@/components/skeletons/PageSkeletons";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { useAppRefreshControl } from "@/hooks/useRefreshControl";
import { Transaction, TransactionType } from "@/types";
import { formatCurrency } from "@/utils";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

const MONTHS_FULL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

interface FormState {
  type: TransactionType;
  value: string;
  description: string;
  category: string;
  date: string;
}

export default function FinanceiroScreen() {
  const { transactions, addTransaction, deleteTransaction, loading } = useApp();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const refreshProps = useAppRefreshControl(c);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<FormState>({
    type: "entrada",
    value: "",
    description: "",
    category: "Serviço",
    date: todayStr(),
  });
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const resetDate = new Date();
      setViewYear(resetDate.getFullYear());
      setViewMonth(resetDate.getMonth());
      setModalVisible(false);
      setForm({
        type: "entrada",
        value: "",
        description: "",
        category: "Serviço",
        date: todayStr(),
      });
    }, [])
  );

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const filtered = useMemo(() => {
    const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
    return transactions
      .filter(t => t.date.startsWith(prefix))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, viewYear, viewMonth]);

  const totalEntradas = filtered.filter(t => t.type === "entrada").reduce((s, t) => s + t.value, 0);
  const totalSaidas = filtered.filter(t => t.type === "saida").reduce((s, t) => s + t.value, 0);
  const saldo = totalEntradas - totalSaidas;

  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    filtered.forEach(t => {
      const key = t.date.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  function openModal(type: TransactionType) {
    setForm({
      type,
      value: "",
      description: "",
      category: type === "entrada" ? "Serviço" : "Aluguel",
      date: todayStr(),
    });
    setModalVisible(true);
  }

  async function handleSave() {
    const numVal = parseFloat(form.value.replace(",", "."));
    if (!form.description.trim()) {
      Alert.alert("Atenção", "Descrição é obrigatória");
      return;
    }
    if (!numVal || numVal <= 0) {
      Alert.alert("Atenção", "Informe um valor válido");
      return;
    }
    setSaving(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await addTransaction({
        type: form.type,
        value: numVal,
        description: form.description.trim(),
        category: form.category,
        date: form.date,
      });
      setModalVisible(false);
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(tx: Transaction) {
    Alert.alert(
      "Excluir lançamento",
      `Excluir "${tx.description}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => deleteTransaction(tx.id) },
      ]
    );
  }

  if (loading) {
    return <SkeletonFinance c={c} topPad={topPad} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => router.navigate("/(tabs)/home")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: c.text, flex: 1, marginLeft: 12 }]}>Financeiro</Text>
        <View style={styles.headerBtns}>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: c.success }]}
            onPress={() => openModal("entrada")}
          >
            <Feather name="arrow-up" size={14} color="#fff" />
            <Text style={styles.headerBtnText}>Entrada</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: c.danger }]}
            onPress={() => openModal("saida")}
          >
            <Feather name="arrow-down" size={14} color="#fff" />
            <Text style={styles.headerBtnText}>Saída</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl {...refreshProps} />}
      >
        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: saldo >= 0 ? c.tint : c.danger }]}>
          <Text style={styles.balanceLabel}>Saldo do mês</Text>
          <Text style={styles.balanceValue}>{formatCurrency(saldo)}</Text>

          {/* Month Nav */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="chevron-left" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>
              {MONTHS_FULL[viewMonth].toUpperCase()} {viewYear}
            </Text>
            <TouchableOpacity onPress={nextMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Row */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={[styles.summaryIcon, { backgroundColor: c.success + "18" }]}>
              <Feather name="arrow-up-circle" size={20} color={c.success} />
            </View>
            <Text style={[styles.summaryLabel, { color: c.textSecondary }]}>Entradas</Text>
            <Text style={[styles.summaryValue, { color: c.success }]}>{formatCurrency(totalEntradas)}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={[styles.summaryIcon, { backgroundColor: c.danger + "18" }]}>
              <Feather name="arrow-down-circle" size={20} color={c.danger} />
            </View>
            <Text style={[styles.summaryLabel, { color: c.textSecondary }]}>Saídas</Text>
            <Text style={[styles.summaryValue, { color: c.danger }]}>{formatCurrency(totalSaidas)}</Text>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.txSection}>
          {grouped.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Feather name="dollar-sign" size={36} color={c.textMuted} />
              <Text style={[styles.emptyTitle, { color: c.text }]}>Nenhum lançamento</Text>
              <Text style={[styles.emptySub, { color: c.textSecondary }]}>
                Registre entradas e saídas para acompanhar suas finanças
              </Text>
              <View style={styles.emptyBtns}>
                <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: c.success }]} onPress={() => openModal("entrada")}>
                  <Text style={styles.emptyBtnText}>+ Entrada</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: c.danger }]} onPress={() => openModal("saida")}>
                  <Text style={styles.emptyBtnText}>+ Saída</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            grouped.map(([dateKey, txList]) => (
              <View key={dateKey}>
                {/* Day separator */}
                <View style={styles.dayHeader}>
                  <Text style={[styles.dayLabel, { color: c.textMuted }]}>
                    {formatDateLabel(dateKey)}
                  </Text>
                  <View style={[styles.dayLine, { backgroundColor: c.border }]} />
                  <Text style={[styles.dayTotal, {
                    color: txList.reduce((s, t) => s + (t.type === "entrada" ? t.value : -t.value), 0) >= 0 ? c.success : c.danger
                  }]}>
                    {formatCurrency(txList.reduce((s, t) => s + (t.type === "entrada" ? t.value : -t.value), 0))}
                  </Text>
                </View>

                {/* Transactions for this day */}
                {txList.map(tx => (
                  <TouchableOpacity
                    key={tx.id}
                    style={[styles.txCard, { backgroundColor: c.surface, borderColor: c.border }]}
                    onLongPress={() => handleDelete(tx)}
                    activeOpacity={0.8}
                  >
                    <View style={[
                      styles.txBar,
                      { backgroundColor: tx.type === "entrada" ? c.success : c.danger }
                    ]} />
                    <View style={[
                      styles.txIconWrap,
                      { backgroundColor: (tx.type === "entrada" ? c.success : c.danger) + "18" }
                    ]}>
                      <Feather
                        name={tx.type === "entrada" ? "arrow-up" : "arrow-down"}
                        size={16}
                        color={tx.type === "entrada" ? c.success : c.danger}
                      />
                    </View>
                    <View style={styles.txContent}>
                      <Text style={[styles.txDesc, { color: c.text }]} numberOfLines={1}>
                        {tx.description}
                      </Text>
                      <View style={[styles.txCatPill, { backgroundColor: (tx.type === "entrada" ? c.success : c.danger) + "15" }]}>
                        <Text style={[styles.txCat, { color: tx.type === "entrada" ? c.success : c.danger }]}>
                          {tx.category}
                        </Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.txValue,
                      { color: tx.type === "entrada" ? c.success : c.danger }
                    ]}>
                      {tx.type === "entrada" ? "+" : "-"}{formatCurrency(tx.value)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          )}
        </View>

        <View style={{ height: Platform.OS === "web" ? 120 : 100 }} />
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior="height"
          keyboardVerticalOffset={30}
        >
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
          <View style={[styles.modalCard, { backgroundColor: c.surface }]}>
            {/* Type toggle */}
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[styles.typeBtn, form.type === "entrada" && { backgroundColor: c.success }]}
                onPress={() => setForm(f => ({ ...f, type: "entrada", category: "Serviço" }))}
              >
                <Feather name="arrow-up" size={14} color={form.type === "entrada" ? "#fff" : c.textSecondary} />
                <Text style={[styles.typeBtnText, { color: form.type === "entrada" ? "#fff" : c.textSecondary }]}>
                  Entrada
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, form.type === "saida" && { backgroundColor: c.danger }]}
                onPress={() => setForm(f => ({ ...f, type: "saida", category: "Aluguel" }))}
              >
                <Feather name="arrow-down" size={14} color={form.type === "saida" ? "#fff" : c.textSecondary} />
                <Text style={[styles.typeBtnText, { color: form.type === "saida" ? "#fff" : c.textSecondary }]}>
                  Saída
                </Text>
              </TouchableOpacity>
            </View>

            {/* Value */}
            <View style={[styles.valueWrap, { borderColor: form.type === "entrada" ? c.success : c.danger }]}>
              <Text style={[styles.valueCurrency, { color: form.type === "entrada" ? c.success : c.danger }]}>R$</Text>
              <TextInput
                style={[styles.valueInput, { color: form.type === "entrada" ? c.success : c.danger }, Platform.OS === "web" && ({ outlineStyle: "none" } as any)]}
                placeholder="0,00"
                placeholderTextColor={c.textMuted}
                value={form.value}
                onChangeText={v => setForm(f => ({ ...f, value: v }))}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>

            {/* Description */}
            <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.background }]}>
              <Text style={[styles.inputLabel, { color: c.textSecondary }]}>Descrição *</Text>
              <TextInput
                style={[styles.inputField, { color: c.text }, Platform.OS === "web" && ({ outlineStyle: "none" } as any)]}
                placeholder="Ex: Pagamento cliente, Aluguel..."
                placeholderTextColor={c.textMuted}
                value={form.description}
                onChangeText={v => setForm(f => ({ ...f, description: v }))}
              />
            </View>

            {/* Category */}
            <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.background }]}>
              <Text style={[styles.inputLabel, { color: c.textSecondary }]}>Categoria</Text>
              <TextInput
                style={[styles.inputField, { color: c.text }, Platform.OS === "web" && ({ outlineStyle: "none" } as any)]}
                placeholder="Ex: Serviço, Aluguel, Material..."
                placeholderTextColor={c.textMuted}
                value={form.category}
                onChangeText={v => setForm(f => ({ ...f, category: v }))}
              />
            </View>

            {/* Date */}
            <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.background }]}>
              <Text style={[styles.inputLabel, { color: c.textSecondary }]}>Data</Text>
              <TextInput
                style={[styles.inputField, { color: c.text }, Platform.OS === "web" && ({ outlineStyle: "none" } as any)]}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={c.textMuted}
                value={form.date}
                onChangeText={v => setForm(f => ({ ...f, date: v }))}
                keyboardType="numbers-and-punctuation"
              />
            </View>

            {/* Actions */}
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: c.border, borderWidth: 1 }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: c.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: form.type === "entrada" ? c.success : c.danger, opacity: saving ? 0.7 : 1 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: "#fff" }]}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 26, fontWeight: "700", fontFamily: "Inter_700Bold" },
  headerBtns: { flexDirection: "row", gap: 8 },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  headerBtnText: { color: "#fff", fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  balanceCard: {
    margin: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  balanceValue: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
  },
  monthLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },

  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  summaryValue: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },

  txSection: { paddingHorizontal: 16, gap: 0 },

  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  emptyBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  emptyBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  emptyBtnText: { color: "#fff", fontWeight: "600", fontFamily: "Inter_600SemiBold", fontSize: 14 },

  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 10,
  },
  dayLabel: { fontSize: 12, fontFamily: "Inter_500Medium", minWidth: 85 },
  dayLine: { flex: 1, height: 1 },
  dayTotal: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  txCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    overflow: "hidden",
    paddingRight: 14,
    paddingVertical: 12,
  },
  txBar: { width: 4, alignSelf: "stretch" },
  txIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  txContent: { flex: 1, gap: 4 },
  txDesc: { fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium" },
  txCatPill: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  txCat: { fontSize: 11, fontFamily: "Inter_500Medium" },
  txValue: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },

  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 14,
  },

  typeToggle: {
    flexDirection: "row",
    borderRadius: 12,
    overflow: "hidden",
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  typeBtnText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  valueWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  valueCurrency: { fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  valueInput: { flex: 1, fontSize: 28, fontWeight: "700", fontFamily: "Inter_700Bold" },

  inputWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 2,
  },
  inputLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  inputField: { fontSize: 15, fontFamily: "Inter_400Regular", minHeight: 28 },

  modalBtns: { flexDirection: "row", gap: 10 },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalBtnText: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
});
