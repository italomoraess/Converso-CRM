import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, useThemeMode } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { Lead, Task } from "@/types";
import {
  getOriginBadgeStyle,
  getStageBadgeStyle,
  getWhatsAppUrl,
  todayISO,
} from "@/utils";
import { ColorScheme } from "@/constants/colors";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  onPress,
  c,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  onPress?: () => void;
  c: ColorScheme;
}) {
  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: c.surface, borderColor: c.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      <View style={[styles.statIcon, { backgroundColor: color + "18" }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color: c.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: c.textSecondary }]}>{label}</Text>
      {sub && <Text style={[styles.statSub, { color: c.textMuted }]}>{sub}</Text>}
    </TouchableOpacity>
  );
}

function QuickAction({
  icon,
  label,
  color,
  onPress,
  c,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
  c: ColorScheme;
}) {
  async function handle() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }
  return (
    <TouchableOpacity style={[styles.quickBtn, { backgroundColor: c.surface, borderColor: c.border }]} onPress={handle} activeOpacity={0.8}>
      <View style={[styles.quickIcon, { backgroundColor: color + "15" }]}>
        <Feather name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.quickLabel, { color: c.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function RecentLeadRow({ lead, c }: { lead: Lead; c: ColorScheme }) {
  const badge = getStageBadgeStyle(lead.stage, c);
  const origin = getOriginBadgeStyle(lead.origem, c);

  async function onWA() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(getWhatsAppUrl(lead.telefone));
  }

  return (
    <TouchableOpacity
      style={[styles.recentRow, { borderBottomColor: c.borderLight }]}
      onPress={() => router.push(`/lead/${lead.id}`)}
      activeOpacity={0.75}
    >
      <View style={[styles.avatar, { backgroundColor: c.tint + "18" }]}>
        <Text style={[styles.avatarText, { color: c.tint }]}>
          {lead.nome.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.recentInfo}>
        <Text style={[styles.recentName, { color: c.text }]} numberOfLines={1}>
          {lead.nome}
        </Text>
        <View style={styles.recentBadges}>
          <View style={[styles.miniBadge, { backgroundColor: origin.bg }]}>
            <Text style={[styles.miniBadgeText, { color: origin.text }]}>{lead.origem}</Text>
          </View>
          <View style={[styles.miniBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.miniBadgeText, { color: badge.text }]}>{lead.stage}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.waSmall, { backgroundColor: c.whatsapp }]}
        onPress={onWA}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="message-circle" size={15} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function TodayTaskRow({ task, c }: { task: Task; c: ColorScheme }) {
  const { toggleTaskComplete } = useApp();

  const TYPE_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
    Ligação: "phone",
    Visita: "map-pin",
    Reunião: "users",
    "Retornar proposta": "file-text",
    Outro: "check-square",
  };

  const icon = TYPE_ICONS[task.type] ?? "check-square";

  return (
    <TouchableOpacity
      style={[styles.taskRow, { borderBottomColor: c.borderLight }, task.completed && { opacity: 0.5 }]}
      onPress={() => toggleTaskComplete(task.id)}
      activeOpacity={0.75}
    >
      <View
        style={[
          styles.taskCheck,
          { borderColor: task.completed ? c.success : c.border },
          task.completed && { backgroundColor: c.success },
        ]}
      >
        {task.completed && <Feather name="check" size={11} color="#fff" />}
      </View>
      <View style={[styles.taskTypeIcon, { backgroundColor: c.tint + "15" }]}>
        <Feather name={icon} size={13} color={c.tint} />
      </View>
      <View style={styles.taskInfo}>
        <Text
          style={[styles.taskTitle, { color: c.text }, task.completed && { textDecorationLine: "line-through", color: c.textMuted }]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        {task.leadName && (
          <Text style={[styles.taskLead, { color: c.tint }]} numberOfLines={1}>
            {task.leadName}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { leads, tasks } = useApp();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const { theme, toggleTheme } = useThemeMode();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const today = todayISO();

  const thisMonthLeads = useMemo(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    return leads.filter((l) => l.createdAt >= from);
  }, [leads]);

  const closedLeads = leads.filter((l) => l.stage === "Fechado");
  const convRate = leads.length > 0 ? Math.round((closedLeads.length / leads.length) * 100) : 0;

  const todayTasks = useMemo(
    () => tasks.filter((t) => !t.completed && t.date.slice(0, 10) === today),
    [tasks, today]
  );

  const recentLeads = useMemo(
    () => [...leads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5),
    [leads]
  );

  const newLeads = leads.filter((l) => l.stage === "Novo Lead").length;

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  async function handleToggleTheme() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.headerWrap, { paddingTop: topPad, backgroundColor: c.tint }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greetText}>{greeting()} 👋</Text>
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={handleToggleTheme}
            >
              <Feather name={theme === "dark" ? "sun" : "moon"} size={20} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push("/agenda")}
            >
              <Feather name="bell" size={20} color="rgba(255,255,255,0.85)" />
              {todayTasks.length > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{todayTasks.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 120 : 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="users"
            label="Total Leads"
            value={leads.length}
            sub={`+${thisMonthLeads.length} este mês`}
            color={c.tint}
            onPress={() => router.push("/leads")}
            c={c}
          />
          <StatCard
            icon="trending-up"
            label="Fechados"
            value={closedLeads.length}
            sub={`${convRate}% conversão`}
            color={c.success}
            onPress={() => router.push("/kanban")}
            c={c}
          />
          <StatCard
            icon="clock"
            label="Novos"
            value={newLeads}
            sub="aguardando contato"
            color={c.warning}
            onPress={() => router.push("/kanban")}
            c={c}
          />
          <StatCard
            icon="calendar"
            label="Tarefas Hoje"
            value={todayTasks.length}
            sub={todayTasks.length === 0 ? "nenhuma pendente" : "pendentes"}
            color={todayTasks.length > 0 ? c.danger : c.success}
            onPress={() => router.push("/agenda")}
            c={c}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Ações Rápidas</Text>
          <View style={styles.quickGrid}>
            <QuickAction icon="user-plus" label="Novo Lead" color={c.tint} onPress={() => router.push("/lead/new")} c={c} />
            <QuickAction icon="calendar" label="Nova Tarefa" color={c.secondary} onPress={() => router.push("/task/new")} c={c} />
            <QuickAction icon="trello" label="Ver Funil" color="#8b5cf6" onPress={() => router.push("/kanban")} c={c} />
            <QuickAction icon="bar-chart-2" label="Relatórios" color={c.success} onPress={() => router.push("/relatorios")} c={c} />
          </View>
        </View>

        {/* Today's Tasks */}
        {todayTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Tarefas de Hoje</Text>
              <TouchableOpacity onPress={() => router.push("/agenda")}>
                <Text style={[styles.seeAll, { color: c.tint }]}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.listCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              {todayTasks.slice(0, 4).map((t) => (
                <TodayTaskRow key={t.id} task={t} c={c} />
              ))}
              {todayTasks.length > 4 && (
                <TouchableOpacity style={styles.moreRow} onPress={() => router.push("/agenda")}>
                  <Text style={[styles.moreText, { color: c.tint }]}>+{todayTasks.length - 4} mais tarefas</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Funil Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Funil de Vendas</Text>
          <View style={[styles.funnelCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            {[
              { label: "Novo Lead", color: "#1a56db" },
              { label: "Em Contato", color: "#f59e0b" },
              { label: "Proposta Enviada", color: "#8b5cf6" },
              { label: "Em Negociação", color: "#ec4899" },
              { label: "Fechado ✓", color: "#10b981", stage: "Fechado" },
              { label: "Perdido", color: "#6b7280" },
            ].map((item) => {
              const stage = item.stage ?? item.label;
              const count = leads.filter((l) => l.stage === stage).length;
              const pct = leads.length > 0 ? (count / leads.length) * 100 : 0;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={styles.funnelRow}
                  onPress={() => router.push("/kanban")}
                  activeOpacity={0.7}
                >
                  <View style={[styles.funnelDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.funnelLabel, { color: c.text }]} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <View style={[styles.funnelBarTrack, { backgroundColor: c.border }]}>
                    <View
                      style={[
                        styles.funnelBarFill,
                        { width: `${Math.max(pct, pct > 0 ? 3 : 0)}%`, backgroundColor: item.color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.funnelCount, { color: c.textSecondary }]}>{count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Recent Leads */}
        {recentLeads.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Leads Recentes</Text>
              <TouchableOpacity onPress={() => router.push("/leads")}>
                <Text style={[styles.seeAll, { color: c.tint }]}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.listCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              {recentLeads.map((l) => (
                <RecentLeadRow key={l.id} lead={l} c={c} />
              ))}
            </View>
          </View>
        )}

        {/* Empty state */}
        {leads.length === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: c.tint + "12" }]}>
              <Feather name="users" size={32} color={c.tint} />
            </View>
            <Text style={[styles.emptyTitle, { color: c.text }]}>Comece pelo primeiro lead</Text>
            <Text style={[styles.emptyDesc, { color: c.textSecondary }]}>
              Cadastre seus contatos e acompanhe cada oportunidade de venda em um só lugar.
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: c.tint }]}
              onPress={() => router.push("/lead/new")}
            >
              <Feather name="plus" size={16} color="#fff" />
              <Text style={styles.emptyBtnText}>Adicionar primeiro lead</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerWrap: { paddingBottom: 20 },
  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  greetText: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  dateText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    textTransform: "capitalize",
  },
  headerActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  headerBtn: { position: "relative", padding: 6 },
  notifBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#ef4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  notifBadgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },

  scroll: { padding: 16, gap: 20 },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 0,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statValue: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },
  statSub: { fontSize: 11, fontFamily: "Inter_400Regular" },

  section: { gap: 10 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },

  quickGrid: { flexDirection: "row", gap: 10 },
  quickBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  quickIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 12, fontWeight: "500", fontFamily: "Inter_500Medium", textAlign: "center" },

  listCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  taskCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  taskTypeIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  taskInfo: { flex: 1, gap: 1 },
  taskTitle: { fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium" },
  taskLead: { fontSize: 12, fontFamily: "Inter_400Regular" },
  moreRow: { paddingHorizontal: 14, paddingVertical: 12, alignItems: "center" },
  moreText: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },

  funnelCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  funnelRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  funnelDot: { width: 8, height: 8, borderRadius: 4 },
  funnelLabel: { width: 130, fontSize: 13, fontFamily: "Inter_400Regular" },
  funnelBarTrack: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  funnelBarFill: { height: "100%", borderRadius: 3 },
  funnelCount: { width: 24, textAlign: "right", fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  recentInfo: { flex: 1, gap: 4 },
  recentName: { fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium" },
  recentBadges: { flexDirection: "row", gap: 4 },
  miniBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  miniBadgeText: { fontSize: 10, fontWeight: "500", fontFamily: "Inter_500Medium" },
  waSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center" },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 4,
  },
  emptyBtnText: { color: "#fff", fontWeight: "600", fontFamily: "Inter_600SemiBold", fontSize: 15 },
});