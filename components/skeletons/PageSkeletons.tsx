import React from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import type { ColorScheme } from "@/constants/colors";
import { SkeletonBlock } from "@/components/Skeleton";

function bone(c: ColorScheme) {
  return c.border;
}

export function SkeletonListScreen({
  c,
  topPad,
  showSearch,
}: {
  c: ColorScheme;
  topPad: number;
  showSearch?: boolean;
}) {
  const b = bone(c);
  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: c.surface,
            borderBottomColor: c.border,
          },
        ]}
      >
        <SkeletonBlock width={140} height={22} radius={6} color={b} />
        <View style={{ height: 10 }} />
        <SkeletonBlock width={90} height={14} radius={4} color={b} />
      </View>
      {showSearch ? (
        <View
          style={[
            styles.searchPad,
            { backgroundColor: c.surface, borderBottomColor: c.border },
          ]}
        >
          <SkeletonBlock width="100%" height={44} radius={12} color={b} />
        </View>
      ) : null}
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View
          key={i}
          style={[styles.row, { borderBottomColor: c.border }]}
        >
          <SkeletonBlock width={48} height={48} radius={24} color={b} />
          <View style={styles.rowText}>
            <SkeletonBlock width="72%" height={15} radius={4} color={b} />
            <View style={{ height: 8 }} />
            <SkeletonBlock width="40%" height={12} radius={4} color={b} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function SkeletonHome({ c, topPad }: { c: ColorScheme; topPad: number }) {
  const b = bone(c);
  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <View style={[styles.homeHeader, { paddingTop: topPad, backgroundColor: c.tint }]}>
        <View style={styles.homeHeaderRow}>
          <SkeletonBlock width={44} height={44} radius={22} color="rgba(255,255,255,0.35)" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <SkeletonBlock width={160} height={18} radius={6} color="rgba(255,255,255,0.35)" />
            <View style={{ height: 8 }} />
            <SkeletonBlock width={220} height={14} radius={4} color="rgba(255,255,255,0.25)" />
          </View>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.homeScroll,
          { paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.statCard,
                { backgroundColor: c.surface, borderColor: c.border },
              ]}
            >
              <SkeletonBlock width={36} height={36} radius={10} color={b} />
              <View style={{ height: 12 }} />
              <SkeletonBlock width="50%" height={22} radius={4} color={b} />
              <View style={{ height: 6 }} />
              <SkeletonBlock width="80%" height={12} radius={4} color={b} />
            </View>
          ))}
        </View>
        <View style={{ marginTop: 20 }}>
          <SkeletonBlock width={140} height={18} radius={4} color={b} />
          <View style={{ height: 14 }} />
          <View style={styles.quickGrid}>
            {[1, 2, 3, 4].map((i) => (
              <SkeletonBlock key={i} width="48%" height={72} radius={12} color={b} style={{ marginBottom: 10 }} />
            ))}
          </View>
        </View>
        <View style={{ marginTop: 16 }}>
          <SkeletonBlock width={180} height={18} radius={4} color={b} />
          <View style={{ height: 12 }} />
          <View style={[styles.funnelCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={styles.funnelRow}>
                <SkeletonBlock width={10} height={10} radius={5} color={b} />
                <SkeletonBlock width="35%" height={14} radius={4} color={b} style={{ marginLeft: 10 }} />
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <SkeletonBlock width="100%" height={8} radius={4} color={b} />
                </View>
                <SkeletonBlock width={24} height={14} radius={4} color={b} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export function SkeletonKanban({ c, topPad }: { c: ColorScheme; topPad: number }) {
  const b = bone(c);
  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: c.surface,
            borderBottomColor: c.border,
          },
        ]}
      >
        <SkeletonBlock width={200} height={22} radius={6} color={b} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kanbanBoard}>
        {[1, 2, 3, 4].map((col) => (
          <View key={col} style={[styles.kCol, { backgroundColor: c.kanbanBg }]}>
            <SkeletonBlock width="80%" height={16} radius={4} color={b} />
            <View style={{ height: 12 }} />
            {[1, 2].map((card) => (
              <View
                key={card}
                style={[
                  styles.kCard,
                  { backgroundColor: c.surface, borderColor: c.border },
                ]}
              >
                <SkeletonBlock width="90%" height={16} radius={4} color={b} />
                <View style={{ height: 8 }} />
                <SkeletonBlock width="60%" height={12} radius={4} color={b} />
                <View style={{ height: 12 }} />
                <SkeletonBlock width="100%" height={28} radius={6} color={b} />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export function SkeletonAgenda({ c, topPad }: { c: ColorScheme; topPad: number }) {
  const b = bone(c);
  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: c.surface,
            borderBottomColor: c.border,
          },
        ]}
      >
        <SkeletonBlock width={120} height={22} radius={6} color={b} />
      </View>
      <View style={[styles.agendaMonth, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <SkeletonBlock width={36} height={36} radius={8} color={b} />
        <SkeletonBlock width={160} height={20} radius={6} color={b} />
        <SkeletonBlock width={36} height={36} radius={8} color={b} />
      </View>
      <View style={styles.calGrid}>
        {Array.from({ length: 21 }).map((_, i) => (
          <SkeletonBlock key={i} width={36} height={36} radius={8} color={b} />
        ))}
      </View>
      <View style={{ padding: 16 }}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.agendaTask, { backgroundColor: c.surface, borderColor: c.border }]}>
            <SkeletonBlock width={40} height={40} radius={10} color={b} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <SkeletonBlock width="70%" height={15} radius={4} color={b} />
              <View style={{ height: 8 }} />
              <SkeletonBlock width="40%" height={12} radius={4} color={b} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function SkeletonFinance({ c, topPad }: { c: ColorScheme; topPad: number }) {
  const b = bone(c);
  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: c.surface,
            borderBottomColor: c.border,
          },
        ]}
      >
        <SkeletonBlock width={160} height={22} radius={6} color={b} />
      </View>
      <View style={[styles.finMonth, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <SkeletonBlock width={36} height={36} radius={8} color={b} />
        <SkeletonBlock width={180} height={20} radius={6} color={b} />
        <SkeletonBlock width={36} height={36} radius={8} color={b} />
      </View>
      <View style={styles.finCards}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.finCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <SkeletonBlock width="60%" height={12} radius={4} color={b} />
            <View style={{ height: 10 }} />
            <SkeletonBlock width="80%" height={24} radius={6} color={b} />
          </View>
        ))}
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={[styles.finRow, { borderBottomColor: c.border }]}>
            <SkeletonBlock width="100%" height={56} radius={12} color={b} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function SkeletonRelatorios({ c, topPad }: { c: ColorScheme; topPad: number }) {
  const b = bone(c);
  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: c.surface,
            borderBottomColor: c.border,
          },
        ]}
      >
        <SkeletonBlock width={130} height={22} radius={6} color={b} />
        <View style={{ height: 14 }} />
        <View style={styles.periodRow}>
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} width={80} height={36} radius={20} color={b} />
          ))}
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={styles.relStats}>
          {[1, 2].map((i) => (
            <View key={i} style={[styles.relStat, { backgroundColor: c.surface, borderColor: c.border }]}>
              <SkeletonBlock width="40%" height={28} radius={6} color={b} />
              <View style={{ height: 8 }} />
              <SkeletonBlock width="70%" height={14} radius={4} color={b} />
            </View>
          ))}
        </View>
        <SkeletonBlock width={200} height={18} radius={4} color={b} style={{ marginTop: 20 }} />
        <View style={{ height: 16 }} />
        <View style={[styles.barChart, { backgroundColor: c.surface, borderColor: c.border }]}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.barCol}>
              <SkeletonBlock width={24} height={40 + i * 8} radius={4} color={b} />
              <View style={{ height: 8 }} />
              <SkeletonBlock width={32} height={10} radius={3} color={b} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export function SkeletonCatalogo({ c, topPad }: { c: ColorScheme; topPad: number }) {
  const b = bone(c);
  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <View
        style={[
          styles.catHeader,
          {
            paddingTop: topPad + 12,
            backgroundColor: c.surface,
            borderBottomColor: c.border,
          },
        ]}
      >
        <SkeletonBlock width={120} height={22} radius={6} color={b} />
        <SkeletonBlock width={100} height={36} radius={10} color={b} />
      </View>
      {[1, 2, 3].map((sec) => (
        <View key={sec} style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <SkeletonBlock width={100} height={16} radius={4} color={b} />
          <View style={{ height: 12 }} />
          {[1, 2].map((row) => (
            <View
              key={row}
              style={[
                styles.catRow,
                { backgroundColor: c.surface, borderColor: c.border },
              ]}
            >
              <SkeletonBlock width="65%" height={16} radius={4} color={b} />
              <SkeletonBlock width={70} height={16} radius={4} color={b} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export function SkeletonLeadDetail({ c, topPad }: { c: ColorScheme; topPad: number }) {
  const b = bone(c);
  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <View
        style={[
          styles.detailHeader,
          {
            paddingTop: topPad + 12,
            backgroundColor: c.surface,
            borderBottomColor: c.border,
          },
        ]}
      >
        <SkeletonBlock width={24} height={24} radius={4} color={b} />
        <SkeletonBlock width="50%" height={20} radius={6} color={b} style={{ flex: 1, marginHorizontal: 12 }} />
        <SkeletonBlock width={24} height={24} radius={4} color={b} />
      </View>
      <View style={{ padding: 16, gap: 16 }}>
        <View style={[styles.detailCard, { backgroundColor: c.surface, borderColor: c.border }]}>
          <SkeletonBlock width={80} height={28} radius={14} color={b} />
          <View style={{ height: 12 }} />
          <SkeletonBlock width="100%" height={14} radius={4} color={b} />
        </View>
        <View style={styles.detailActions}>
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} width="31%" height={48} radius={12} color={b} />
          ))}
        </View>
        <View style={[styles.detailCard, { backgroundColor: c.surface, borderColor: c.border }]}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ marginBottom: 14 }}>
              <SkeletonBlock width={90} height={11} radius={3} color={b} />
              <View style={{ height: 6 }} />
              <SkeletonBlock width="100%" height={16} radius={4} color={b} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  searchPad: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowText: { flex: 1 },
  homeHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  homeHeaderRow: { flexDirection: "row", alignItems: "center" },
  homeScroll: { paddingHorizontal: 16, paddingTop: 16 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  funnelCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  funnelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  kanbanBoard: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    flexDirection: "row",
  },
  kCol: {
    width: 280,
    borderRadius: 12,
    padding: 10,
    marginRight: 10,
  },
  kCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  agendaMonth: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  calGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 6,
    justifyContent: "flex-start",
  },
  agendaTask: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  finMonth: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  finCards: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },
  finCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  finRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  periodRow: {
    flexDirection: "row",
    gap: 8,
  },
  relStats: {
    flexDirection: "row",
    gap: 10,
  },
  relStat: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 160,
  },
  barCol: { alignItems: "center" },
  catHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  catRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  detailCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  detailActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
});
