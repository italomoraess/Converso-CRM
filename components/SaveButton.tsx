import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface SaveButtonProps {
  label?: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  color?: string;
  style?: ViewStyle;
  testID?: string;
}

export function SaveButton({ label = "Salvar", onPress, loading = false, disabled = false, color, style, testID }: SaveButtonProps) {
  const c = useTheme();
  const bg = color ?? c.tint;
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: isDisabled && !loading ? c.border : bg }, style]}
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" style={styles.spinner} />
      ) : (
        <Text style={styles.btnText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 34,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  spinner: {
    width: 14,
    height: 14,
  },
});
