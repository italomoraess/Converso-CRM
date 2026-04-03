import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SkeletonKanban } from "@/components/skeletons/PageSkeletons";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { FunnelStage, Lead, FUNNEL_STAGES } from "@/types";
import { getKanbanColumnColor, getStageBadgeStyle, getWhatsAppUrl } from "@/utils";

function KanbanCardItem({
  lead,
  stages,
  onMoveStage,
}: {
  lead: Lead;
  stages: FunnelStage[];
  onMoveStage: (lead: Lead, stage: FunnelStage) => void;
}) {
  const c = useTheme();
  const stageBadge = getStageBadgeStyle(lead.stage, c);

  return (
    <View style={[styles.kCard, { backgroundColor: c.surface, borderColor: c.border }]}>
      <TouchableOpacity onPress={() => router.push(`/lead/${lead.id}`)} activeOpacity={0.85}>
        <Text style={[styles.kName, { color: c.text }]} numberOfLines={1}>
          {lead.nome}
        </Text>
        <Text style={[styles.kPhone, { color: c.textSecondary }]} numberOfLines={1}>
          {lead.telefone}
        </Text>
        {lead.stage === "Perdido" && lead.motivoPerdido ? (
          <Text style={[styles.kMotive, { color: c.danger }]} numberOfLines={1}>
            {lead.motivoPerdido}
          </Text>
        ) : null}
      </TouchableOpacity>

      <View style={styles.kActions}>
        <TouchableOpacity
          onPress={() => Linking.openURL(getWhatsAppUrl(lead.telefone))}
          style={[styles.kActionBtn, { backgroundColor: c.whatsapp }]}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Feather name="message-circle" size={14} color="#fff" />
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moveScroll}>
          {stages
            .filter((s) => s !== lead.stage)
            .map((s) => {
              const col = getKanbanColumnColor(s);
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.movePill, { borderColor: col }]}
                  onPress={() => onMoveStage(lead, s)}
                >
                  <Text style={[styles.movePillText, { color: col }]} numberOfLines={1}>
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </View>
    </View>
  );
}

export default function KanbanScreen() {
  const { leads, updateLeadStage, loading } = useApp();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [lostModal, setLostModal] = useState<{ lead: Lead } | null>(null);
  const [motivoPerdido, setMotivoPerdido] = useState("");

  async function handleMoveStage(lead: Lead, stage: FunnelStage) {
    if (stage === "Perdido") {
      setLostModal({ lead });
      setMotivoPerdido("");
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateLeadStage(lead.id, stage);
  }

  async function confirmLost() {
    if (!lostModal) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateLeadStage(lostModal.lead.id, "Perdido", motivoPerdido);
    setLostModal(null);
  }

  if (loading) {
    return <SkeletonKanban c={c} topPad={topPad} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, backgroundColor: c.surface, borderBottomColor: c.border },
        ]}
      >
        <Text style={[styles.title, { color: c.text }]}>Funil de Vendas</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.board}>
        {FUNNEL_STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage);
          const colColor = getKanbanColumnColor(stage);
          return (
            <View key={stage} style={[styles.column, { backgroundColor: c.kanbanBg }]}>
              <View style={[styles.colHeader, { borderLeftColor: colColor }]}>
                <Text style={[styles.colTitle, { color: c.text }]}>{stage}</Text>
                <View style={[styles.countBadge, { backgroundColor: colColor }]}>
                  <Text style={styles.countText}>{stageLeads.length}</Text>
                </View>
              </View>

              <FlatList
                data={stageLeads}
                keyExtractor={(i) => i.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <KanbanCardItem
                    lead={item}
                    stages={FUNNEL_STAGES}
                    onMoveStage={handleMoveStage}
                  />
                )}
                ListEmptyComponent={
                  <View style={styles.emptyCol}>
                    <Feather name="inbox" size={24} color={c.textMuted} />
                    <Text style={[styles.emptyColText, { color: c.textMuted }]}>Vazio</Text>
                  </View>
                }
              />

              {stage === "Perdido" && stageLeads.length > 0 && (
                <TouchableOpacity
                  style={[styles.lostBtn, { borderColor: c.danger }]}
                  onPress={() => router.push("/perdidos")}
                >
                  <Text style={[styles.lostBtnText, { color: c.danger }]}>
                    Ver {stageLeads.length} perdido(s)
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={!!lostModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: c.surface }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>Marcar como Perdido</Text>
            <Text style={[styles.modalSub, { color: c.textSecondary }]}>
              Qual o motivo da perda? (opcional)
            </Text>
            <TextInput
              style={[styles.modalInput, { borderColor: c.border, color: c.text, backgroundColor: c.background }]}
              placeholder="Ex: preço, sem interesse, concorrência..."
              placeholderTextColor={c.textMuted}
              value={motivoPerdido}
              onChangeText={setMotivoPerdido}
              multiline
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: c.border }]}
                onPress={() => setLostModal(null)}
              >
                <Text style={[styles.modalBtnText, { color: c.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: c.danger, borderColor: c.danger }]}
                onPress={confirmLost}
              >
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 26, fontWeight: "700", fontFamily: "Inter_700Bold" },
  board: { flex: 1, paddingVertical: 12 },
  column: {
    width: 240,
    marginLeft: 12,
    borderRadius: 16,
    padding: 12,
    marginBottom: Platform.OS === "web" ? 100 : 90,
  },
  colHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginBottom: 10,
  },
  colTitle: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold", flex: 1 },
  countBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  kCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
    gap: 8,
  },
  kName: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  kPhone: { fontSize: 12, fontFamily: "Inter_400Regular" },
  kMotive: { fontSize: 12, fontStyle: "italic", fontFamily: "Inter_400Regular" },
  kActions: { flexDirection: "row", alignItems: "center", gap: 6 },
  kActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  moveScroll: { flex: 1 },
  movePill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 4,
    maxWidth: 120,
  },
  movePillText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  emptyCol: { alignItems: "center", paddingVertical: 24, gap: 6 },
  emptyColText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  lostBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 8,
  },
  lostBtnText: { fontSize: 12, fontWeight: "500", fontFamily: "Inter_500Medium" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  modalSub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  modalBtns: { flexDirection: "row", gap: 10 },
  modalBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalBtnText: { fontWeight: "600", fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
