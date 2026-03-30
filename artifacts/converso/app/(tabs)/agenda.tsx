import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
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
import { FAB } from "@/components/FAB";
import { TaskItem } from "@/components/TaskItem";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { formatDate, todayISO } from "@/utils";

type Filter = "hoje" | "proximos" | "concluidos";

export default function AgendaScreen() {
  const { tasks } = useApp();
  const [filter, setFilter] = useState<Filter>("hoje");
  const insets = useSafeAreaInsets();
  const c = useTheme();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const today = todayISO();

  const filtered = useMemo(() => {
    const sorted = [...tasks].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    if (filter === "hoje") {
      return sorted.filter((t) => !t.completed && t.date.slice(0, 10) === today);
    }
    if (filter === "proximos") {
      return sorted.filter((t) => !t.completed && t.date.slice(0, 10) > today);
    }
    return sorted.filter((t) => t.completed);
  }, [tasks, filter, today]);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "hoje", label: "Hoje" },
    { key: "proximos", label: "Próximos" },
    { key: "concluidos", label: "Concluídos" },
  ];

  const todayCount = tasks.filter((t) => !t.completed && t.date.slice(0, 10) === today).length;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.title, { color: c.text }]}>Agenda</Text>
        <Text style={[styles.sub, { color: c.textSecondary }]}>
          {todayCount > 0 ? `${todayCount} tarefa(s) para hoje` : formatDate(new Date().toISOString())}
        </Text>
      </View>

      <View style={[styles.filterRow, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterBtn,
              filter === f.key && { backgroundColor: c.tint },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f.key ? "#fff" : c.textSecondary },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskItem task={item} />}
        contentContainerStyle={[
          styles.list,
          filtered.length === 0 && styles.emptyList,
          { paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="calendar"
            title={filter === "hoje" ? "Nenhuma tarefa para hoje" : filter === "proximos" ? "Nenhuma tarefa futura" : "Nenhuma tarefa concluída"}
            subtitle="Adicione uma tarefa para organizar seu dia"
            ctaLabel={filter !== "concluidos" ? "Nova Tarefa" : undefined}
            onCta={filter !== "concluidos" ? () => router.push("/task/new") : undefined}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB onPress={() => router.push("/task/new")} testID="fab-add-task" />
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
  sub: { fontSize: 13, marginTop: 2, fontFamily: "Inter_400Regular" },
  filterRow: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  filterText: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },
  list: { padding: 16 },
  emptyList: { flex: 1 },
});
