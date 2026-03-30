import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "@/constants/colors";
import { Lead } from "@/types";
import {
  formatDate,
  getOriginBadgeStyle,
  getStageBadgeStyle,
  getWhatsAppUrl,
} from "@/utils";

interface Props {
  lead: Lead;
}

export function LeadCard({ lead }: Props) {
  const c = Colors.light;
  const stageBadge = getStageBadgeStyle(lead.stage);
  const originBadge = getOriginBadgeStyle(lead.origem);

  function onPress() {
    router.push(`/lead/${lead.id}`);
  }

  async function onWhatsApp() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(getWhatsAppUrl(lead.telefone));
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
      onPress={onPress}
      activeOpacity={0.8}
      testID={`lead-card-${lead.id}`}
    >
      <View style={styles.topRow}>
        <View style={styles.nameWrap}>
          <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
            {lead.nome}
          </Text>
          <Text style={[styles.phone, { color: c.textSecondary }]}>
            {lead.telefone}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.waBtn, { backgroundColor: c.whatsapp }]}
          onPress={onWhatsApp}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          testID={`whatsapp-btn-${lead.id}`}
        >
          <Feather name="message-circle" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.badges}>
        <View style={[styles.badge, { backgroundColor: originBadge.bg }]}>
          <Text style={[styles.badgeText, { color: originBadge.text }]}>
            {lead.origem}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: stageBadge.bg }]}>
          <Text style={[styles.badgeText, { color: stageBadge.text }]}>
            {lead.stage}
          </Text>
        </View>
      </View>

      <Text style={[styles.date, { color: c.textMuted }]}>
        Atualizado em {formatDate(lead.updatedAt)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nameWrap: { flex: 1, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  phone: { fontSize: 13, marginTop: 2, fontFamily: "Inter_400Regular" },
  waBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  badges: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 12, fontWeight: "500", fontFamily: "Inter_500Medium" },
  date: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
