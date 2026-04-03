import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FunnelStage } from "@/types";
import { getStageBadgeStyle } from "@/utils";

export function StageBadge({ stage }: { stage: FunnelStage }) {
  const style = getStageBadgeStyle(stage);
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.text }]}>{stage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  text: { fontSize: 12, fontWeight: "500", fontFamily: "Inter_500Medium" },
});
