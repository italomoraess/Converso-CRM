import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ icon, title, subtitle, ctaLabel, onCta }: Props) {
  const c = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: c.borderLight }]}>
        <Feather name={icon} size={32} color={c.textMuted} />
      </View>
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: c.textSecondary }]}>{subtitle}</Text>}
      {ctaLabel && onCta && (
        <Button label={ctaLabel} onPress={onCta} size="compact" style={{ marginTop: 8 }} />
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
});
