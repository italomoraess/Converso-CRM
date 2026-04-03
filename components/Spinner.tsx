import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export function ScreenSpinner({
  backgroundColor,
  color,
}: {
  backgroundColor: string;
  color: string;
}) {
  return (
    <View style={[styles.screen, { backgroundColor }]}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
