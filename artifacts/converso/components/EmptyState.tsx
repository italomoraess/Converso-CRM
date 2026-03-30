import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "@/constants/colors";

interface Props {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ icon, title, subtitle, ctaLabel, onCta }: Props) {
  const c = Colors.light;
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: c.borderLight }]}>
        <Feather name={icon} size={32} color={c.textMuted} />
      </View>
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: c.textSecondary }]}>{subtitle}</Text>}
      {ctaLabel && onCta && (
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: c.tint }]}
          onPress={onCta}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "600", fontFamily: "Inter_600SemiBold", textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center", fontFamily: "Inter_400Regular", lineHeight: 20 },
  cta: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ctaText: { color: "#fff", fontWeight: "600", fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
