import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
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
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { TaskType, TASK_TYPES } from "@/types";

export default function NewTaskScreen() {
  const { addTask, leads } = useApp();
  const params = useLocalSearchParams<{ leadId?: string; leadName?: string }>();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const now = new Date();
  const defaultDate = new Date(now.getTime() + 60 * 60 * 1000);
  const defaultDateStr = defaultDate.toISOString().slice(0, 16).replace("T", " ");

  const [form, setForm] = useState({
    title: "",
    type: "Ligação" as TaskType,
    date: defaultDateStr,
    notes: "",
    leadId: params.leadId ?? "",
    leadName: params.leadName ? decodeURIComponent(params.leadName) : "",
  });
  const [leadSearch, setLeadSearch] = useState(params.leadName ? decodeURIComponent(params.leadName) : "");
  const [showLeadResults, setShowLeadResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredLeads = useMemo(() => {
    if (!showLeadResults || !leadSearch) return [];
    const q = leadSearch.toLowerCase();
    return leads.filter((l) => l.nome.toLowerCase().includes(q)).slice(0, 5);
  }, [leads, leadSearch, showLeadResults]);

  async function handleSave() {
    if (!form.title.trim()) {
      Alert.alert("Atenção", "Título é obrigatório");
      return;
    }
    setLoading(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const dateIso = form.date.replace(" ", "T");
    await addTask({
      title: form.title.trim(),
      type: form.type,
      date: dateIso,
      notes: form.notes.trim() || undefined,
      leadId: form.leadId || undefined,
      leadName: form.leadName || undefined,
      completed: false,
    });
    setLoading(false);
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="x" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>Nova Tarefa</Text>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: loading ? c.border : c.tint }]}
          onPress={handleSave}
          disabled={loading}
          testID="save-task-btn"
        >
          <Text style={styles.saveBtnText}>{loading ? "..." : "Salvar"}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 120 : 80 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.surface }]}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Título *</Text>
          <TextInput
            style={[styles.input, { color: c.text }]}
            placeholder="Descrição da tarefa"
            placeholderTextColor={c.textMuted}
            value={form.title}
            onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
            testID="task-title"
          />
        </View>

        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Tipo de Tarefa</Text>
        <View style={styles.typesGrid}>
          {TASK_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeChip,
                { borderColor: c.border, backgroundColor: c.surface },
                form.type === t && { backgroundColor: c.tint, borderColor: c.tint },
              ]}
              onPress={() => setForm((p) => ({ ...p, type: t }))}
            >
              <Text style={[styles.typeChipText, { color: form.type === t ? "#fff" : c.text }]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.surface }]}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Data e Hora</Text>
          <TextInput
            style={[styles.input, { color: c.text }]}
            placeholder="AAAA-MM-DD HH:MM"
            placeholderTextColor={c.textMuted}
            value={form.date}
            onChangeText={(v) => setForm((p) => ({ ...p, date: v }))}
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.surface }]}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Lead Vinculado</Text>
          <TextInput
            style={[styles.input, { color: c.text }]}
            placeholder="Buscar lead..."
            placeholderTextColor={c.textMuted}
            value={leadSearch}
            onChangeText={(v) => {
              setLeadSearch(v);
              setShowLeadResults(true);
              if (!v) setForm((p) => ({ ...p, leadId: "", leadName: "" }));
            }}
          />
          {form.leadId ? (
            <View style={[styles.selectedLead, { backgroundColor: c.tagWon }]}>
              <Feather name="check-circle" size={12} color={c.tagWonText} />
              <Text style={[styles.selectedLeadText, { color: c.tagWonText }]}>{form.leadName}</Text>
              <TouchableOpacity
                onPress={() => {
                  setForm((p) => ({ ...p, leadId: "", leadName: "" }));
                  setLeadSearch("");
                }}
              >
                <Feather name="x" size={12} color={c.tagWonText} />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {filteredLeads.length > 0 && (
          <View style={[styles.leadResults, { backgroundColor: c.surface, borderColor: c.border }]}>
            {filteredLeads.map((l) => (
              <TouchableOpacity
                key={l.id}
                style={[styles.leadResultItem, { borderBottomColor: c.border }]}
                onPress={() => {
                  setForm((p) => ({ ...p, leadId: l.id, leadName: l.nome }));
                  setLeadSearch(l.nome);
                  setShowLeadResults(false);
                }}
              >
                <Text style={[styles.leadResultName, { color: c.text }]}>{l.nome}</Text>
                <Text style={[styles.leadResultPhone, { color: c.textMuted }]}>{l.telefone}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.surface }]}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Anotações</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: c.text }]}
            placeholder="Detalhes adicionais..."
            placeholderTextColor={c.textMuted}
            value={form.notes}
            onChangeText={(v) => setForm((p) => ({ ...p, notes: v }))}
            multiline
            numberOfLines={3}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { color: "#fff", fontWeight: "600", fontFamily: "Inter_600SemiBold", fontSize: 14 },
  content: { padding: 16, gap: 12 },
  sectionLabel: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase", marginTop: 4 },
  inputWrap: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  label: { fontSize: 12, fontFamily: "Inter_500Medium" },
  input: { fontSize: 15, fontFamily: "Inter_400Regular", minHeight: 28 },
  textArea: { minHeight: 70, textAlignVertical: "top" },
  typesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  typeChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  selectedLead: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginTop: 4 },
  selectedLeadText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  leadResults: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginTop: -8 },
  leadResultItem: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  leadResultName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  leadResultPhone: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
