import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SkeletonRelatorios } from "@/components/skeletons/PageSkeletons";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { useAppRefreshControl } from "@/hooks/useRefreshControl";
import { Lead, LeadOrigin, LEAD_ORIGINS } from "@/types";
import { formatCurrency, formatDate } from "@/utils";
import { ColorScheme } from "@/constants/colors";

type Period = "semana" | "mes" | "tudo";

function getDateRange(period: Period): { from: Date; label: string } {
  const now = new Date();
  if (period === "semana") {
    const from = new Date(now);
    from.setDate(now.getDate() - 7);
    return { from, label: "Últimos 7 dias" };
  }
  if (period === "mes") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from, label: "Este mês" };
  }
  return { from: new Date(0), label: "Todo período" };
}

function StatCard({ label, value, sub, color, c }: { label: string; value: string; sub?: string; color?: string; c: ColorScheme }) {
  return (
    <View style={[styles.statCard, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Text style={[styles.statValue, { color: color ?? c.tint }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: c.text }]}>{label}</Text>
      {sub && <Text style={[styles.statSub, { color: c.textMuted }]}>{sub}</Text>}
    </View>
  );
}

function BarChart({ data, c }: { data: { label: string; value: number }[]; c: ColorScheme }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={styles.barChart}>
      {data.map((d, i) => (
        <View key={i} style={styles.barItem}>
          <View style={[styles.barTrack, { backgroundColor: c.border }]}>
            <View
              style={[
                styles.barFill,
                { height: `${Math.max((d.value / max) * 100, 4)}%`, backgroundColor: c.tint },
              ]}
            />
          </View>
          <Text style={[styles.barLabel, { color: c.textMuted }]}>{d.label}</Text>
          <Text style={[styles.barValue, { color: c.text }]}>{d.value}</Text>
        </View>
      ))}
    </View>
  );
}

function PieChart({ data, c }: { data: { label: string; value: number; color: string }[]; c: ColorScheme }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <View style={styles.pieWrap}>
      <View style={styles.pieLegend}>
        {data.map((d, i) => (
          <View key={i} style={styles.pieLegendItem}>
            <View style={[styles.pieDot, { backgroundColor: d.color }]} />
            <Text style={[styles.pieLegendLabel, { color: c.text }]}>{d.label}</Text>
            <Text style={[styles.pieLegendValue, { color: c.textSecondary }]}>
              {d.value} ({Math.round((d.value / total) * 100)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function RelatoriosScreen() {
  const { leads, loading } = useApp();
  const [period, setPeriod] = useState<Period>("mes");
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const refreshProps = useAppRefreshControl(c);

  const { from, label } = getDateRange(period);

  const filtered = useMemo(
    () => leads.filter((l) => new Date(l.createdAt) >= from),
    [leads, from]
  );

  const totalLeads = filtered.length;
  const fechados = filtered.filter((l) => l.stage === "Fechado").length;
  const perdidos = filtered.filter((l) => l.stage === "Perdido");
  const conversion = totalLeads > 0 ? Math.round((fechados / totalLeads) * 100) : 0;

  const leadsPerWeek = useMemo(() => {
    const weeks: Record<string, number> = {};
    filtered.forEach((l) => {
      const d = new Date(l.createdAt);
      const wk = `S${Math.ceil(d.getDate() / 7)}/${d.getMonth() + 1}`;
      weeks[wk] = (weeks[wk] ?? 0) + 1;
    });
    return Object.entries(weeks).map(([label, value]) => ({ label, value })).slice(-6);
  }, [filtered]);

  const ORIGIN_COLORS: Record<LeadOrigin, string> = {
    Instagram: "#ec4899",
    Indicação: "#10b981",
    Facebook: "#1877f2",
    WhatsApp: "#25d366",
    Site: "#8b5cf6",
    Telefone: "#0ea5e9",
    "Tráfego pago": "#1a56db",
    Rua: "#f59e0b",
    Outro: "#6b7280",
  };

  const byOrigin = LEAD_ORIGINS.map((o) => ({
    label: o,
    value: filtered.filter((l) => l.origem === o).length,
    color: ORIGIN_COLORS[o],
  })).filter((d) => d.value > 0);

  const PERIODS: { key: Period; label: string }[] = [
    { key: "semana", label: "Semana" },
    { key: "mes", label: "Mês" },
    { key: "tudo", label: "Tudo" },
  ];

  if (loading) {
    return <SkeletonRelatorios c={c} topPad={topPad} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.title, { color: c.text }]}>Relatórios</Text>
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.periodBtn, period === p.key && { backgroundColor: c.tint }]}
              onPress={() => setPeriod(p.key)}
            >
              <Text style={[styles.periodText, { color: period === p.key ? "#fff" : c.textSecondary }]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: Platform.OS === "web" ? 120 : 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl {...refreshProps} />}
      >
        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>{label}</Text>

        <View style={styles.statsGrid}>
          <StatCard label="Total Leads" value={String(totalLeads)} c={c} />
          <StatCard label="Fechados" value={String(fechados)} color={c.success} c={c} />
          <StatCard label="Conversão" value={`${conversion}%`} color={conversion >= 30 ? c.success : c.warning} c={c} />
          <StatCard label="Perdidos" value={String(perdidos.length)} color={c.danger} c={c} />
        </View>

        {leadsPerWeek.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={[styles.chartTitle, { color: c.text }]}>Leads por semana</Text>
            <BarChart data={leadsPerWeek} c={c} />
          </View>
        )}

        {byOrigin.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={[styles.chartTitle, { color: c.text }]}>Leads por origem</Text>
            <PieChart data={byOrigin} c={c} />
          </View>
        )}

        {perdidos.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={[styles.chartTitle, { color: c.text }]}>Leads Perdidos</Text>
            {perdidos.map((l) => (
              <View key={l.id} style={[styles.lostItem, { borderBottomColor: c.border }]}>
                <Text style={[styles.lostName, { color: c.text }]}>{l.nome}</Text>
                {l.motivoPerdido && (
                  <Text style={[styles.lostReason, { color: c.textSecondary }]}>{l.motivoPerdido}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {totalLeads === 0 && (
          <View style={styles.emptyWrap}>
            <Feather name="bar-chart-2" size={40} color={c.textMuted} />
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>
              Nenhum dado para o período selecionado
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  title: { fontSize: 26, fontWeight: "700", fontFamily: "Inter_700Bold" },
  periodRow: { flexDirection: "row", gap: 8 },
  periodBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  periodText: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_500Medium" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 2,
  },
  statValue: { fontSize: 26, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },
  statSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  chartCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  chartTitle: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  barChart: {
    flexDirection: "row",
    height: 120,
    alignItems: "flex-end",
    gap: 8,
    paddingTop: 8,
  },
  barItem: { flex: 1, alignItems: "center", height: "100%" },
  barTrack: { flex: 1, width: "100%", justifyContent: "flex-end", borderRadius: 4 },
  barFill: { borderRadius: 4, width: "100%" },
  barLabel: { fontSize: 9, marginTop: 4, fontFamily: "Inter_400Regular" },
  barValue: { fontSize: 10, fontWeight: "600" },
  pieWrap: { gap: 8 },
  pieLegend: { gap: 8 },
  pieLegendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  pieDot: { width: 10, height: 10, borderRadius: 5 },
  pieLegendLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  pieLegendValue: { fontSize: 12, fontFamily: "Inter_500Medium" },
  lostItem: { paddingVertical: 8, borderBottomWidth: 1 },
  lostName: { fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium" },
  lostReason: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  emptyWrap: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, textAlign: "center", fontFamily: "Inter_400Regular" },
});
