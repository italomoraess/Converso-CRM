import React, { useEffect, useRef } from "react";
import { Animated, type DimensionValue, type ViewStyle } from "react-native";

export function SkeletonBlock({
  width,
  height,
  radius = 8,
  color,
  style,
}: {
  width: DimensionValue;
  height: number;
  radius?: number;
  color: string;
  style?: ViewStyle;
}) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.95,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: color,
          opacity,
        },
        style,
      ]}
    />
  );
}
