import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface ButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  color?: string;
  icon?: keyof typeof Feather.glyphMap;
  style?: ViewStyle;
}

export function Button({ label, onPress, loading = false, disabled = false, color, icon, style }: ButtonProps) {
  const c = useTheme();
  const bg = color ?? c.tint;
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg, opacity: isDisabled ? 0.7 : 1 }, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <Text style={styles.btnText}>{label}</Text>
          {icon ? <Feather name={icon} size={18} color="#fff" /> : null}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    minHeight: 52,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});
