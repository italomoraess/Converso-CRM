import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonListScreen } from "@/components/skeletons/PageSkeletons";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { formatDate } from "@/utils";

export default function PerdidosScreen() {
  const { leads, loading } = useApp();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const perdidos = leads.filter((l) => l.stage === "Perdido");

  if (loading) {
    return <SkeletonListScreen c={c} topPad={topPad} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: c.text }]}>Leads Perdidos</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={perdidos}
        keyExtractor={(i) => i.id}
        contentContainerStyle={[
          styles.list,
          perdidos.length === 0 && styles.emptyList,
          { paddingBottom: Platform.OS === "web" ? 120 : 80 },
        ]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={() => router.push(`/lead/${item.id}`)}
            activeOpacity={0.8}
          >
            <View style={styles.topRow}>
              <View style={styles.nameWrap}>
                <Text style={[styles.name, { color: c.text }]}>{item.nome}</Text>
                <Text style={[styles.phone, { color: c.textSecondary }]}>{item.telefone}</Text>
              </View>
              <View style={[styles.originBadge, { backgroundColor: c.tagLost }]}>
                <Text style={[styles.originText, { color: c.danger }]}>{item.origem}</Text>
              </View>
            </View>
            {item.motivoPerdido ? (
              <View style={[styles.motiveWrap, { backgroundColor: c.tagLost, borderColor: c.border }]}>
                <Feather name="alert-circle" size={12} color={c.danger} />
                <Text style={[styles.motive, { color: c.danger }]}>{item.motivoPerdido}</Text>
              </View>
            ) : (
              <Text style={[styles.noMotive, { color: c.textMuted }]}>Sem motivo informado</Text>
            )}
            <Text style={[styles.date, { color: c.textMuted }]}>
              Atualizado em {formatDate(item.updatedAt)}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="x-circle"
            title="Nenhum lead perdido"
            subtitle="Leads marcados como perdidos aparecerão aqui"
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
  title: { fontSize: 17, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  list: { padding: 16 },
  emptyList: { flex: 1 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  nameWrap: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  phone: { fontSize: 13, fontFamily: "Inter_400Regular" },
  originBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  originText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  motiveWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
  },
  motive: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  noMotive: { fontSize: 13, fontStyle: "italic", fontFamily: "Inter_400Regular" },
  date: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
