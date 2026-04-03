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

export type ButtonSize = "default" | "compact" | "icon";

export interface ButtonProps {
  onPress: () => void;
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  color?: string;
  icon?: keyof typeof Feather.glyphMap;
  style?: ViewStyle;
  size?: ButtonSize;
  testID?: string;
  accessibilityLabel?: string;
}

export function Button({
  onPress,
  label,
  loading = false,
  disabled = false,
  color,
  icon,
  style,
  size = "default",
  testID,
  accessibilityLabel,
}: ButtonProps) {
  const themeColors = useTheme();
  const bg = color ?? themeColors.tint;
  const isDisabled = loading || disabled;
  const isIcon = size === "icon";

  const touchStyle =
    size === "compact"
      ? styles.compactTouchable
      : isIcon
        ? styles.iconTouchable
        : styles.defaultTouchable;
  const textStyle =
    size === "compact" ? styles.compactText : styles.defaultText;
  const iconSize = isIcon ? 16 : 18;

  const opacity = disabled && !loading ? 0.55 : 1;

  return (
    <TouchableOpacity
      style={[styles.row, touchStyle, { backgroundColor: bg, opacity }, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : isIcon ? (
        icon ? (
          <Feather name={icon} size={iconSize} color="#fff" />
        ) : null
      ) : (
        <>
          {label ? <Text style={textStyle}>{label}</Text> : null}
          {icon ? <Feather name={icon} size={iconSize} color="#fff" /> : null}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  defaultTouchable: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 14,
    minHeight: 52,
  },
  compactTouchable: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
    minHeight: 34,
    minWidth: 70,
  },
  iconTouchable: {
    width: 32,
    height: 32,
    borderRadius: 8,
    gap: 0,
  },
  defaultText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  compactText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});
