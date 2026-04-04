import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  onPress: () => void;
  testID?: string;
}

export function FAB({ onPress, testID }: Props) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  
  async function handlePress() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }

  const bottomSpace = Platform.OS === "web" 
    ? 104 
    : 74 + Math.max(insets.bottom, 16);


  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: c.tint, bottom: bottomSpace }]}
      onPress={handlePress}
      activeOpacity={0.85}
      testID={testID}
    >
      <Feather name="plus" size={26} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1a56db",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 99,
  },
});

