import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { ButtonSpinner } from "@/components/Spinner";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { FunnelStage, LeadOrigin, LEAD_ORIGINS } from "@/types";
import { formatPhone } from "@/utils";

export default function NewLeadScreen() {
  const { addLead } = useApp();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    cpfCnpj: "",
    email: "",
    origem: "Outro" as LeadOrigin,
    localizacao: "",
    observacoes: "",
    vendaRecorrente: false,
  });
  const [loading, setLoading] = useState(false);

  function updateField(key: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onPhoneChange(text: string) {
    const digits = text.replace(/\D/g, "");
    updateField("telefone", formatPhone(digits));
  }

  async function handleSave() {
    if (!form.nome.trim()) {
      Alert.alert("Atenção", "Nome é obrigatório");
      return;
    }
    if (!form.telefone.trim()) {
      Alert.alert("Atenção", "Telefone é obrigatório");
      return;
    }
    setLoading(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addLead({
      nome: form.nome.trim(),
      telefone: form.telefone.trim(),
      cpfCnpj: form.cpfCnpj.trim() || undefined,
      email: form.email.trim() || undefined,
      origem: form.origem,
      localizacao: form.localizacao.trim() || undefined,
      observacoes: form.observacoes.trim() || undefined,
      vendaRecorrente: form.vendaRecorrente,
      stage: "Novo Lead" as FunnelStage,
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
        <Text style={[styles.headerTitle, { color: c.text }]}>Novo Lead</Text>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: loading ? c.border : c.tint }]}
          onPress={handleSave}
          disabled={loading}
          testID="save-lead-btn"
        >
          {loading ? (
            <ButtonSpinner color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 120 : 80 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Informações Básicas</Text>

        <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.surface }]}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Nome *</Text>
          <TextInput
            style={[styles.input, { color: c.text }]}
            placeholder="Nome do lead"
            placeholderTextColor={c.textMuted}
            value={form.nome}
            onChangeText={(v) => updateField("nome", v)}
            testID="lead-nome"
          />
        </View>

        <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.surface }]}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Telefone / WhatsApp *</Text>
          <TextInput
            style={[styles.input, { color: c.text }]}
            placeholder="(XX) XXXXX-XXXX"
            placeholderTextColor={c.textMuted}
            value={form.telefone}
            onChangeText={onPhoneChange}
            keyboardType="phone-pad"
            testID="lead-telefone"
          />
        </View>

        <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.surface }]}>
          <Text style={[styles.label, { color: c.textSecondary }]}>E-mail</Text>
          <TextInput
            style={[styles.input, { color: c.text }]}
            placeholder="email@exemplo.com"
            placeholderTextColor={c.textMuted}
            value={form.email}
            onChangeText={(v) => updateField("email", v)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.surface }]}>
          <Text style={[styles.label, { color: c.textSecondary }]}>CPF / CNPJ</Text>
          <TextInput
            style={[styles.input, { color: c.text }]}
            placeholder="Opcional"
            placeholderTextColor={c.textMuted}
            value={form.cpfCnpj}
            onChangeText={(v) => updateField("cpfCnpj", v)}
            keyboardType="number-pad"
          />
        </View>

        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Origem do Lead</Text>

        <View style={styles.originsGrid}>
          {LEAD_ORIGINS.map((o) => (
            <TouchableOpacity
              key={o}
              style={[
                styles.originChip,
                { borderColor: c.border, backgroundColor: c.surface },
                form.origem === o && { backgroundColor: c.tint, borderColor: c.tint },
              ]}
              onPress={() => updateField("origem", o)}
            >
              <Text
                style={[
                  styles.originChipText,
                  { color: form.origem === o ? "#fff" : c.text },
                ]}
              >
                {o}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Outros Dados</Text>

        <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.surface }]}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Localização</Text>
          <TextInput
            style={[styles.input, { color: c.text }]}
            placeholder="Cidade, bairro ou endereço"
            placeholderTextColor={c.textMuted}
            value={form.localizacao}
            onChangeText={(v) => updateField("localizacao", v)}
          />
        </View>

        <View style={[styles.inputWrap, { borderColor: c.border, backgroundColor: c.surface }]}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: c.text }]}
            placeholder="Anotações sobre o lead..."
            placeholderTextColor={c.textMuted}
            value={form.observacoes}
            onChangeText={(v) => updateField("observacoes", v)}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={[styles.switchRow, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.switchInfo}>
            <Text style={[styles.switchLabel, { color: c.text }]}>Venda Recorrente</Text>
            <Text style={[styles.switchSub, { color: c.textSecondary }]}>
              Vincular este lead ao catálogo
            </Text>
          </View>
          <Switch
            value={form.vendaRecorrente}
            onValueChange={(v) => updateField("vendaRecorrente", v)}
            trackColor={{ false: c.border, true: c.tint }}
            thumbColor="#fff"
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
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: { color: "#fff", fontWeight: "600", fontFamily: "Inter_600SemiBold", fontSize: 14 },
  content: { padding: 16, gap: 12 },
  sectionLabel: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase", marginTop: 8 },
  inputWrap: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 2,
  },
  label: { fontSize: 12, fontFamily: "Inter_500Medium" },
  input: { fontSize: 15, fontFamily: "Inter_400Regular", minHeight: 28 },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  originsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  originChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  originChipText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  switchInfo: { flex: 1 },
  switchLabel: { fontSize: 15, fontWeight: "500", fontFamily: "Inter_500Medium" },
  switchSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
});
