import { Feather } from "@expo/vector-icons";
import { type Href, router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";

type Item = {
  href: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
};

const ITEMS: Item[] = [
  { href: "/catalogo", label: "Catálogo", icon: "package" },
  { href: "/financeiro", label: "Financeiro", icon: "dollar-sign" },
  { href: "/relatorios", label: "Relatórios", icon: "bar-chart-2" },
];

export function TabMoreDrawer({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const drawerWidth = Math.min(Dimensions.get("window").width * 0.78, 320);
  const slideX = useRef(new Animated.Value(drawerWidth)).current;

  useEffect(() => {
    if (visible) {
      slideX.setValue(drawerWidth);
      Animated.spring(slideX, {
        toValue: 0,
        useNativeDriver: true,
        friction: 9,
        tension: 65,
      }).start();
    }
  }, [visible, drawerWidth, slideX]);

  const go = (href: string) => {
    onClose();
    router.push(href as Href);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View
          style={[
            styles.panel,
            {
              width: drawerWidth,
              maxWidth: 320,
              backgroundColor: c.surface,
              borderColor: c.border,
              paddingTop: Math.max(insets.top, 16),
              paddingBottom: Math.max(insets.bottom, 16),
              transform: [{ translateX: slideX }],
            },
          ]}
        >
          {ITEMS.map((item) => (
            <TouchableOpacity
              key={item.href}
              style={[styles.row, { borderBottomColor: c.border }]}
              onPress={() => go(item.href)}
              activeOpacity={0.7}
            >
              <Feather name={item.icon} size={22} color={c.tint} />
              <Text style={[styles.rowLabel, { color: c.text }]}>{item.label}</Text>
              <Feather name="chevron-right" size={20} color={c.textMuted} />
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  backdrop: {
    flex: 1,
  },
  panel: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 16,
  },
});
