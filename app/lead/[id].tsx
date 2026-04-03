import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { ColorScheme } from "@/constants/colors";
import { FunnelStage, FUNNEL_STAGES } from "@/types";
import { formatDate, formatDateTime, getKanbanColumnColor, getOriginBadgeStyle, getStageBadgeStyle, getWhatsAppUrl } from "@/utils";

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { leads, deleteLead, updateLeadStage } = useApp();
  const lead = leads.find((l) => l.id === id);
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [stageModal, setStageModal] = useState(false);

  if (!lead) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, paddingTop: topPad + 20, alignItems: "center" }]}>
        <Text style={{ color: c.text, fontSize: 16 }}>Lead não encontrado</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: c.tint, fontSize: 14 }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const l = lead;
  const stageBadge = getStageBadgeStyle(l.stage, c);
  const originBadge = getOriginBadgeStyle(l.origem, c);

  async function handleWhatsApp() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(getWhatsAppUrl(l.telefone));
  }

  async function handleCall() {
    Linking.openURL(`tel:${l.telefone.replace(/\D/g, "")}`);
  }

  function handleDelete() {
    Alert.alert("Excluir Lead", `Deseja excluir "${l.nome}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await deleteLead(l.id);
          router.back();
        },
      },
    ]);
  }

  async function handleMoveStage(stage: FunnelStage) {
    setStageModal(false);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateLeadStage(l.id, stage);
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]} numberOfLines={1}>
          {l.nome}
        </Text>
        <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="trash-2" size={20} color={c.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: Platform.OS === "web" ? 120 : 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: originBadge.bg }]}>
              <Text style={[styles.badgeText, { color: originBadge.text }]}>{l.origem}</Text>
            </View>
            <TouchableOpacity
              style={[styles.badge, { backgroundColor: stageBadge.bg }]}
              onPress={() => setStageModal(true)}
            >
              <Text style={[styles.badgeText, { color: stageBadge.text }]}>{l.stage}</Text>
              <Feather name="chevron-down" size={12} color={stageBadge.text} />
            </TouchableOpacity>
          </View>

          {l.stage === "Perdido" && l.motivoPerdido && (
            <View style={[styles.motiveWrap, { backgroundColor: c.tagLost }]}>
              <Feather name="alert-circle" size={14} color={c.danger} />
              <Text style={[styles.motiveText, { color: c.danger }]}>{l.motivoPerdido}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: c.whatsapp }]} onPress={handleWhatsApp}>
            <Feather name="message-circle" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: c.tint }]} onPress={handleCall}>
            <Feather name="phone" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Ligar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: c.secondary }]}
            onPress={() => router.push(`/task/new?leadId=${l.id}&leadName=${encodeURIComponent(l.nome)}`)}
          >
            <Feather name="plus-circle" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>Tarefa</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border, gap: 12 }]}>
          <DetailRow icon="phone" label="Telefone" value={l.telefone} c={c} />
          {l.email && <DetailRow icon="mail" label="E-mail" value={l.email} c={c} />}
          {l.cpfCnpj && <DetailRow icon="credit-card" label="CPF/CNPJ" value={l.cpfCnpj} c={c} />}
          {l.localizacao && <DetailRow icon="map-pin" label="Localização" value={l.localizacao} c={c} />}
          <DetailRow icon="calendar" label="Cadastrado em" value={formatDate(l.createdAt)} c={c} />
          <DetailRow icon="clock" label="Atualizado em" value={formatDateTime(l.updatedAt)} c={c} />
          {l.vendaRecorrente && (
            <View style={styles.detailRow}>
              <View style={[styles.detailIconWrap, { backgroundColor: c.tagWon }]}>
                <Feather name="repeat" size={14} color={c.tagWonText} />
              </View>
              <View style={styles.detailInfo}>
                <Text style={[styles.detailLabel, { color: c.textMuted }]}>Venda Recorrente</Text>
                <Text style={[styles.detailValue, { color: c.success }]}>Ativo</Text>
              </View>
            </View>
          )}
        </View>

        {l.observacoes && (
          <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={[styles.obsTitle, { color: c.textSecondary }]}>Observações</Text>
            <Text style={[styles.obsText, { color: c.text }]}>{l.observacoes}</Text>
          </View>
        )}
      </ScrollView>

      {stageModal && (
        <View style={styles.stageOverlay}>
          <TouchableOpacity style={styles.stageBackdrop} onPress={() => setStageModal(false)} />
          <View style={[styles.stageSheet, { backgroundColor: c.surface }]}>
            <Text style={[styles.stageSheetTitle, { color: c.text }]}>Mover para etapa</Text>
            {FUNNEL_STAGES.map((s) => {
              const color = getKanbanColumnColor(s);
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.stageOption,
                    { borderColor: c.border },
                    l.stage === s && { backgroundColor: c.background },
                  ]}
                  onPress={() => handleMoveStage(s)}
                >
                  <View style={[styles.stageDot, { backgroundColor: color }]} />
                  <Text style={[styles.stageOptionText, { color: c.text }]}>{s}</Text>
                  {l.stage === s && <Feather name="check" size={16} color={c.tint} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

function DetailRow({ icon, label, value, c }: { icon: keyof typeof Feather.glyphMap; label: string; value: string; c: ColorScheme }) {
  return (
    <View style={styles.detailRow}>
      <View style={[styles.detailIconWrap, { backgroundColor: c.tint + "18" }]}>
        <Feather name={icon} size={14} color={c.tint} />
      </View>
      <View style={styles.detailInfo}>
        <Text style={[styles.detailLabel, { color: c.textMuted }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: c.text }]}>{value}</Text>
      </View>
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
    gap: 12,
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "600", fontFamily: "Inter_600SemiBold", textAlign: "center" },
  card: { borderRadius: 12, borderWidth: 1, padding: 14 },
  badges: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },
  motiveWrap: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, padding: 8, marginTop: 8 },
  motiveText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionBtnText: { color: "#fff", fontWeight: "600", fontFamily: "Inter_600SemiBold", fontSize: 13 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  detailIconWrap: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  detailInfo: { flex: 1 },
  detailLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  detailValue: { fontSize: 14, fontFamily: "Inter_500Medium", marginTop: 1 },
  obsTitle: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 4, textTransform: "uppercase" },
  obsText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  stageOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end" },
  stageBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  stageSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 8 },
  stageSheetTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 8 },
  stageOption: { flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, paddingVertical: 14 },
  stageDot: { width: 10, height: 10, borderRadius: 5 },
  stageOptionText: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
});
