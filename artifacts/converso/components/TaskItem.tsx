import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { Task } from "@/types";
import { formatDateTime } from "@/utils";

const TYPE_ICONS: Record<string, string> = {
  Ligação: "phone",
  Visita: "map-pin",
  Reunião: "users",
  "Retornar proposta": "file-text",
  Outro: "check-square",
};

interface Props {
  task: Task;
}

export function TaskItem({ task }: Props) {
  const { toggleTaskComplete, deleteTask } = useApp();
  const c = Colors.light;
  const iconName = (TYPE_ICONS[task.type] ?? "check-square") as keyof typeof Feather.glyphMap;

  async function onToggle() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleTaskComplete(task.id);
  }

  function onDelete() {
    Alert.alert("Excluir tarefa", "Deseja excluir esta tarefa?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => deleteTask(task.id),
      },
    ]);
  }

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: c.surface, borderColor: c.border },
        task.completed && styles.completedCard,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.checkbox,
          { borderColor: task.completed ? c.success : c.border },
          task.completed && { backgroundColor: c.success },
        ]}
        onPress={onToggle}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {task.completed && <Feather name="check" size={14} color="#fff" />}
      </TouchableOpacity>

      <View style={styles.iconWrap}>
        <Feather name={iconName} size={16} color={task.completed ? c.textMuted : c.tint} />
      </View>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: c.text },
            task.completed && { color: c.textMuted, textDecorationLine: "line-through" },
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        <View style={styles.meta}>
          {task.leadName && (
            <Text style={[styles.lead, { color: c.tint }]} numberOfLines={1}>
              {task.leadName}
            </Text>
          )}
          <Text style={[styles.date, { color: c.textMuted }]}>
            {formatDateTime(task.date)}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Feather name="trash-2" size={16} color={c.danger} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  completedCard: { opacity: 0.6 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: "500", fontFamily: "Inter_500Medium" },
  meta: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  lead: { fontSize: 12, fontFamily: "Inter_400Regular" },
  date: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
