import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SkeletonAgenda } from "@/components/skeletons/PageSkeletons";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { useAppRefreshControl } from "@/hooks/useRefreshControl";
import { Task } from "@/types";
import { todayISO } from "@/utils";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const TYPE_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  Ligação: "phone",
  Visita: "map-pin",
  Reunião: "users",
  "Retornar proposta": "file-text",
  Outro: "check-square",
};

const TYPE_COLORS: Record<string, string> = {
  Ligação: "#1a56db",
  Visita: "#10b981",
  Reunião: "#8b5cf6",
  "Retornar proposta": "#f59e0b",
  Outro: "#6b7280",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isoDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function AgendaScreen() {
  const { tasks, toggleTaskComplete, deleteTask, loading } = useApp();
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const refreshProps = useAppRefreshControl(c);
  const today = todayISO();

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(today);

  useFocusEffect(
    useCallback(() => {
      const resetDate = new Date();
      setViewYear(resetDate.getFullYear());
      setViewMonth(resetDate.getMonth());
      setSelectedDay(todayISO());
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

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth);

  const tasksByDay = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((t) => {
      const key = t.date.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  const selectedTasks = useMemo(() => {
    const list = tasksByDay[selectedDay] ?? [];
    return [...list].sort((a, b) => a.date.localeCompare(b.date));
  }, [tasksByDay, selectedDay]);

  const pendingCount = selectedTasks.filter(t => !t.completed).length;

  async function handleToggle(id: string) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleTaskComplete(id);
  }

  function handleDelete(task: Task) {
    Alert.alert("Excluir compromisso", `Excluir "${task.title}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => deleteTask(task.id) },
    ]);
  }

  function handleAddTask() {
    router.push(`/task/new?date=${selectedDay}`);
  }

  const selectedDateLabel = useMemo(() => {
    const [y, m, d] = selectedDay.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  }, [selectedDay]);

  if (loading) {
    return <SkeletonAgenda c={c} topPad={topPad} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => router.navigate("/(tabs)/home")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={24} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: c.text, flex: 1, marginLeft: 12 }]}>Compromissos</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: c.tint }]}
          onPress={handleAddTask}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.addBtnText}>Novo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        refreshControl={<RefreshControl {...refreshProps} />}
      >
        {/* Calendar Card */}
        <View style={[styles.calendarCard, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
          {/* Month Nav */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="chevron-left" size={22} color={c.text} />
            </TouchableOpacity>
            <Text style={[styles.monthLabel, { color: c.text }]}>
              {MONTHS[viewMonth].toUpperCase()} {viewYear}
            </Text>
            <TouchableOpacity onPress={nextMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="chevron-right" size={22} color={c.text} />
            </TouchableOpacity>
          </View>

          {/* Weekday headers */}
          <View style={styles.weekRow}>
            {WEEKDAYS.map((d) => (
              <Text key={d} style={[styles.weekday, { color: c.textMuted }]}>{d}</Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {/* Empty cells before first day */}
            {Array.from({ length: firstDow }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCell} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dateStr = isoDateStr(viewYear, viewMonth, day);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDay;
              const dayTasks = tasksByDay[dateStr] ?? [];
              const hasPending = dayTasks.some(t => !t.completed);
              const hasDone = dayTasks.some(t => t.completed);

              return (
                <TouchableOpacity
                  key={day}
                  style={styles.dayCell}
                  onPress={async () => {
                    await Haptics.selectionAsync();
                    setSelectedDay(dateStr);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.dayCircle,
                    isSelected && { backgroundColor: c.tint },
                    isToday && !isSelected && { borderWidth: 1.5, borderColor: c.tint },
                  ]}>
                    <Text style={[
                      styles.dayNumber,
                      { color: isSelected ? "#fff" : isToday ? c.tint : c.text },
                    ]}>
                      {day}
                    </Text>
                  </View>

                  {/* Dot indicators */}
                  <View style={styles.dotsRow}>
                    {hasPending && (
                      <View style={[styles.dot, { backgroundColor: c.tint }]} />
                    )}
                    {hasDone && (
                      <View style={[styles.dot, { backgroundColor: c.success }]} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Day Events */}
        <View style={styles.eventsSection}>
          <View style={styles.eventsHeader}>
            <View>
              <Text style={[styles.eventsDate, { color: c.text }]} numberOfLines={1}>
                {selectedDateLabel.charAt(0).toUpperCase() + selectedDateLabel.slice(1)}
              </Text>
              <Text style={[styles.eventsCount, { color: c.textSecondary }]}>
                {selectedTasks.length === 0
                  ? "Nenhum compromisso"
                  : `${pendingCount} pendente${pendingCount !== 1 ? "s" : ""} · ${selectedTasks.length - pendingCount} concluído${selectedTasks.length - pendingCount !== 1 ? "s" : ""}`}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.smallAddBtn, { backgroundColor: c.tint }]}
              onPress={handleAddTask}
            >
              <Feather name="plus" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {selectedTasks.length === 0 ? (
            <View style={[styles.emptyDay, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Feather name="calendar" size={32} color={c.textMuted} />
              <Text style={[styles.emptyDayText, { color: c.textSecondary }]}>
                Nenhum compromisso neste dia
              </Text>
              <TouchableOpacity
                style={[styles.emptyAddBtn, { backgroundColor: c.tint }]}
                onPress={handleAddTask}
              >
                <Text style={styles.emptyAddBtnText}>+ Adicionar compromisso</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.eventsList}>
              {selectedTasks.map((task) => {
                const typeColor = TYPE_COLORS[task.type] ?? "#6b7280";
                const icon = TYPE_ICONS[task.type] ?? "check-square";
                return (
                  <TouchableOpacity
                    key={task.id}
                    style={[
                      styles.eventCard,
                      { backgroundColor: c.surface, borderColor: c.border },
                      task.completed && { opacity: 0.55 },
                    ]}
                    onLongPress={() => handleDelete(task)}
                    activeOpacity={0.8}
                  >
                    {/* Left color bar */}
                    <View style={[styles.eventBar, { backgroundColor: typeColor }]} />

                    <View style={[styles.eventIconWrap, { backgroundColor: typeColor + "18" }]}>
                      <Feather name={icon} size={16} color={task.completed ? c.textMuted : typeColor} />
                    </View>

                    <View style={styles.eventContent}>
                      <Text
                        style={[
                          styles.eventTitle,
                          { color: c.text },
                          task.completed && { textDecorationLine: "line-through", color: c.textMuted },
                        ]}
                        numberOfLines={1}
                      >
                        {task.title}
                      </Text>
                      <View style={styles.eventMeta}>
                        <View style={[styles.typePill, { backgroundColor: typeColor + "18" }]}>
                          <Text style={[styles.typeText, { color: typeColor }]}>{task.type}</Text>
                        </View>
                        <Text style={[styles.eventTime, { color: c.textMuted }]}>
                          {formatTime(task.date)}
                        </Text>
                      </View>
                      {task.leadName && (
                        <Text style={[styles.eventLead, { color: c.tint }]} numberOfLines={1}>
                          <Feather name="user" size={11} /> {task.leadName}
                        </Text>
                      )}
                      {task.notes && (
                        <Text style={[styles.eventNotes, { color: c.textSecondary }]} numberOfLines={1}>
                          {task.notes}
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.checkBtn,
                        { borderColor: task.completed ? c.success : c.border },
                        task.completed && { backgroundColor: c.success },
                      ]}
                      onPress={() => handleToggle(task.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      {task.completed && <Feather name="check" size={13} color="#fff" />}
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: Platform.OS === "web" ? 120 : 100 }} />
      </ScrollView>
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
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  calendarCard: {
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },

  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },

  weekRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    paddingBottom: 6,
  },

  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: "center",
    paddingVertical: 3,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 2,
    height: 6,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },

  eventsSection: {
    padding: 16,
    gap: 12,
  },
  eventsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  eventsDate: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    flex: 1,
  },
  eventsCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  smallAddBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyDay: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  emptyDayText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  emptyAddBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  emptyAddBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },

  eventsList: { gap: 10 },
  eventCard: {
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    gap: 10,
    paddingRight: 12,
    paddingVertical: 12,
  },
  eventBar: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 4,
    marginLeft: 0,
  },
  eventIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  eventContent: { flex: 1, gap: 4 },
  eventTitle: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  eventMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  typeText: { fontSize: 11, fontWeight: "500", fontFamily: "Inter_500Medium" },
  eventTime: { fontSize: 12, fontFamily: "Inter_500Medium" },
  eventLead: { fontSize: 12, fontFamily: "Inter_400Regular" },
  eventNotes: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic" },

  checkBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
